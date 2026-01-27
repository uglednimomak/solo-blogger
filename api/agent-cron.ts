import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runResearcherAgent, runJournalistAgent, runPhilosopherAgent, runImageGenerationAgent, generateTags, generateSeoMetadata } from '../services/geminiService';
import { dbService } from '../services/db';
import { Article, NewsStory } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Security check: Only allow Vercel Cron to trigger this
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('Unauthorized attempt to trigger agent-cron. Authentication failed.');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('Starting autonomous agent cycle via Cron...');

  try {
    // 1. Research phase
    const stories = await runResearcherAgent();
    console.log(`Research complete. Found ${stories.length} stories.`);

    if (stories.length === 0) {
      return res.status(200).json({ success: true, message: 'No new stories found.' });
    }

    // 2. Writing phase (Sequential to avoid rate limits in serverless environment)
    const newArticles: Article[] = [];
    for (const story of stories) {
      console.log(`Processing story: ${story.topic}`);

      try {
        const imageUrl = await runImageGenerationAgent(story.topic);
        const tags = await generateTags(story.context);
        const seo = await generateSeoMetadata(story.context);

        const enrichedStory: NewsStory = {
          ...story,
          imageUrl,
          tags,
          seo,
        };

        const article = await runJournalistAgent(enrichedStory);
        newArticles.push(article);
      } catch (articleError) {
        console.error(`Failed to process story "${story.topic}":`, articleError);
        // Continue with other stories even if one fails
      }
    }

    if (newArticles.length === 0) {
      return res.status(500).json({ success: false, error: 'Failed to generate any articles.' });
    }

    // 3. Persistence phase
    await dbService.saveArticles(newArticles);

    const now = Date.now();
    await dbService.setLastUpdated(now);

    // 4. Philosophical synthesis check
    const articlesSinceLastSummary = await dbService.getArticlesSinceLastSummary();
    const newCount = articlesSinceLastSummary + newArticles.length;
    await dbService.setArticlesSinceLastSummary(newCount);

    let summaryGenerated = false;
    if (newCount >= 6) {
      console.log('Threshold met. Triggering philosophical synthesis...');
      try {
        const allArticles = await dbService.getAllArticles();
        const last6Articles = allArticles.slice(0, 6);
        const summary = await runPhilosopherAgent(last6Articles);
        await dbService.saveSummary(summary);
        await dbService.setArticlesSinceLastSummary(0);
        summaryGenerated = true;
      } catch (synthError) {
        console.error('Philosophical synthesis failed:', synthError);
      }
    }

    return res.status(200).json({
      success: true,
      articlesAdded: newArticles.length,
      philosophicalSummary: summaryGenerated,
      timestamp: now
    });
  } catch (error: any) {
    console.error('Agent Cycle Failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
