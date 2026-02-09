import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Forward the entire request body to Pixazo
  const body = req.body;

  if (!body || !body.prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.PIXAZO_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Pixazo API key not configured' });
  }

  try {
    const response = await fetch('https://api.pixazo.ai/v1/generate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `Pixazo API error: ${response.statusText}`,
        details: errorText,
      });
    }

    // Pixazo returns image as binary (png or jpeg)
    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length.toString());
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('Error in Pixazo proxy:', error);
    return res.status(500).json({
      error: 'Failed to generate image',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
