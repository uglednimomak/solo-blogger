import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runResearcherAgent, runJournalistAgent, runPhilosopherAgent, runImageGenerationAgent, generateTagsAndSeo } from '../services/geminiService.js';
import { dbService } from '../services/db.js';
import { Article, NewsStory } from '../types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Security check: Only allow Vercel Cron to trigger this
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('Unauthorized attempt to trigger agent-cron. Authentication failed.');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('Starting autonomous agent cycle via Cron...');

  // Helper function to delay between stories (avoid rate limits)
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  try {
    // 1. Research phase
    const stories = await runResearcherAgent();
    console.log(`Research complete. Found ${stories.length} stories.`);

    if (stories.length === 0) {
      return res.status(200).json({ success: true, message: 'No new stories found.' });
    }

    // 2. Writing phase (Sequential with delays to avoid rate limits)
    const newArticles: Article[] = [];
    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      console.log(`Processing story ${i + 1}/${stories.length}: ${story.topic}`);

      try {
        const imageUrl = await runImageGenerationAgent(story.topic);
        const { tags, seo } = await generateTagsAndSeo(story.context);

        const enrichedStory: NewsStory = {
          ...story,
          imageUrl,
          tags,
          seo,
        };

        const article = await runJournalistAgent(enrichedStory);
        newArticles.push(article);
        
        // Wait 2 minutes between stories to respect rate limits (except after last story)
        if (i < stories.length - 1) {
          console.log(`Waiting 2 minutes before processing next story...`);
          await delay(120000); // 2 minutes = 120000ms
        }
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
