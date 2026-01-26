import { Plugin } from 'vite';

export function huggingFaceProxyPlugin(apiKey: string): Plugin {
  return {
    name: 'huggingface-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/huggingface-proxy' && req.method === 'POST') {
          let body = '';
          
          req.on('data', chunk => {
            body += chunk.toString();
          });
          
          req.on('end', async () => {
            try {
              const { prompt, model = 'runwayml/stable-diffusion-v1-5' } = JSON.parse(body);
              
              if (!prompt) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Prompt is required' }));
                return;
              }

              if (!apiKey) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Hugging Face API key not configured' }));
                return;
              }

              const response = await fetch(`https://router.huggingface.co/models/${model}`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ inputs: prompt })
              });

              if (!response.ok) {
                const errorText = await response.text();
                res.writeHead(response.status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  error: `Hugging Face API error: ${response.statusText}`,
                  details: errorText
                }));
                return;
              }

              const arrayBuffer = await response.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);

              res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': buffer.length.toString()
              });
              res.end(buffer);
            } catch (error) {
              console.error('Error in Hugging Face proxy:', error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                error: 'Failed to generate image',
                details: error instanceof Error ? error.message : 'Unknown error'
              }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}
