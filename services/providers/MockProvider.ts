import { AIProvider } from "./BaseProvider.js";
import { NewsStory, Article, PhilosophicalSummary } from "../../types.js";

export class MockProvider implements AIProvider {
  name = "Mock";

  async research(): Promise<NewsStory[]> {
    console.log("🤖 Mock Provider: Generating research data");
    
    return [
      {
        topic: "Global Climate Summit Reaches Historic Agreement",
        context: "World leaders at the International Climate Summit have agreed to accelerate renewable energy adoption, with commitments to reduce carbon emissions by 50% by 2030. The agreement includes unprecedented funding for developing nations."
      },
      {
        topic: "Breakthrough in Quantum Computing Technology",
        context: "Scientists have achieved a major milestone in quantum computing, demonstrating a stable 1000-qubit processor that maintains coherence for extended periods. This advancement could revolutionize fields from cryptography to drug discovery."
      },
      {
        topic: "Economic Tensions Rise in Global Trade Relations",
        context: "Major economic powers are navigating complex trade negotiations as tariffs and supply chain disruptions continue to impact global markets. New frameworks for digital commerce and technology transfers are being debated."
      }
    ];
  }

  async writeArticle(story: NewsStory): Promise<Article> {
    console.log(`🤖 Mock Provider: Writing article for "${story.topic}"`);
    
    return {
      id: `article-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      title: story.topic,
      summary: `This is a comprehensive analysis of ${story.topic.toLowerCase()}. ${story.context.substring(0, 150)}...`,
      sections: [
        {
          heading: "Overview",
          content: `The recent developments regarding ${story.topic.toLowerCase()} represent a significant moment in current affairs. ${story.context}`
        },
        {
          heading: "Key Implications",
          content: "This event has far-reaching implications across multiple sectors including economics, technology, and international relations. Experts predict substantial changes in the coming months."
        },
        {
          heading: "Analysis",
          content: "When examining the broader context, it becomes clear that this development is part of a larger trend. Historical precedents suggest that similar situations have led to transformative outcomes."
        },
        {
          heading: "Future Outlook",
          content: "Looking ahead, stakeholders will need to adapt to this evolving landscape. The long-term effects will depend on how various parties respond to these emerging challenges and opportunities."
        }
      ],
      tags: ["Global Affairs", "Analysis", "Current Events"],
      timestamp: Date.now(),
      sourceTopic: story.topic,
      imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`
    };
  }

  async generateText(prompt: string): Promise<string> {
    console.log(`🤖 Mock Provider: Generating text for prompt "${prompt}"`);
    if (prompt.includes('Tags:')) {
      return "Technology, AI, Future";
    }
    if (prompt.includes('Title:')) {
      return "A Mock Title";
    }
    if (prompt.includes('Description:')) {
      return "A mock meta description for an article.";
    }
    return "This is a mock generated text response.";
  }

  async synthesizePhilosophy(articles: Article[]): Promise<PhilosophicalSummary> {
    console.log(`🤖 Mock Provider: Synthesizing philosophy from ${articles.length} articles`);
    
    const timestamps = articles.map(a => a.timestamp).sort((a, b) => a - b);
    
    return {
      id: `summary-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      title: "The Paradox of Progress: A Meta-Analysis of Our Zeitgeist",
      content: `Examining these ${articles.length} narratives reveals a profound tension at the heart of contemporary civilization. We stand at a crossroads where technological advancement accelerates while social cohesion fragments. The articles collectively paint a picture of humanity grappling with the consequences of its own success - innovations that promise liberation while creating new forms of dependency, global cooperation emerging from crises of conflict, and the eternal struggle between immediate needs and long-term survival. This is not merely a collection of events, but a mirror reflecting humanity's evolutionary growing pains.`,
      articleIds: articles.map(a => a.id),
      timestamp: Date.now(),
      dateRange: {
        start: timestamps[0],
        end: timestamps[timestamps.length - 1]
      },
      tags: ["Philosophy", "Meta-Analysis", "Zeitgeist", "Human Evolution"],
      synthesis: {
        themes: [
          "The acceleration of technological change versus institutional adaptation",
          "Individual autonomy in an interconnected global system",
          "Short-term survival versus long-term existential planning"
        ],
        paradoxes: [
          "We create tools for connection that deepen isolation",
          "Knowledge expands exponentially while wisdom remains scarce",
          "Global cooperation emerges from nationalist competition"
        ],
        futureImplications: [
          "Will humanity develop the wisdom to match its technological power?",
          "Can democratic systems adapt fast enough to govern AI-driven societies?",
          "How do we balance individual freedom with collective survival?",
          "What new forms of meaning emerge as material needs are met?"
        ]
      }
    };
  }
}
