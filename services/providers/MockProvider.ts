import { AIProvider } from "./BaseProvider";
import { NewsStory, Article } from "../../types";

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
}
