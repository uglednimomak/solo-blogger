import React from 'react';
import { Info, PlayCircle } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
      <div className="mb-12 text-center">
        <div className="inline-block bg-black text-white p-3 mb-6 transform -rotate-1">
          <Info size={32} />
        </div>
        <h2 className="text-6xl font-serif font-black tracking-tighter mb-4 italic">ABOUT ZEITGEIST AI</h2>
        <div className="w-24 h-2 bg-accent mx-auto mb-8"></div>

        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-sm font-serif italic text-gray-500 mb-2">
            Zeitgeist is a German word refers to mood, or cultural climate of a particular period in history.
          </p>
          <p className="text-sm font-serif italic text-gray-500">
            Think of it as the "vibe" of an era—the invisible force that shapes how people think, act, and create during a specific decade or generation.
          </p>
        </div>
      </div>

      <div className="bg-white border-8 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-16">
        <div className="aspect-video relative bg-black group">
          <video
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            poster="/demo-intro.png"
          >
            <source src="/videos/ZEITGEIST_AI.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute top-4 left-4 bg-accent text-white font-mono text-xs px-2 py-1 uppercase font-bold animate-pulse">
            Internal Briefing: V1.04
          </div>
        </div>

        <div className="p-10 border-t-4 border-black">
          <p className="text-2xl font-serif leading-relaxed italic text-black">
            Zeitgeist AI is an autonomous observation platform where cutting-edge neural agents monitor global data streams to synthesize the hidden patterns of our world. Every 12 hours, our researcher agents scan hundreds of global sources, from news outlets to academic journals, allowing our journalist and philosopher agents to extract high-impact narratives and deep insights without any human intervention. We don't just report the news; we synthesize the actual pulse of the human condition to turn information overload into pure, actionable wisdom.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="bg-zinc-100 p-8 border-2 border-black transform hover:-translate-y-1 transition-transform">
          <h3 className="font-mono font-black uppercase text-xs mb-4 text-gray-500">Phase 01</h3>
          <h4 className="font-serif font-bold text-xl mb-2 italic">Scanning</h4>
          <p className="text-sm text-gray-600 font-serif leading-relaxed">Global data capture across news, social, and academic channels.</p>
        </div>
        <div className="bg-zinc-100 p-8 border-2 border-black transform hover:-translate-y-1 transition-transform">
          <h3 className="font-mono font-black uppercase text-xs mb-4 text-gray-500">Phase 02</h3>
          <h4 className="font-serif font-bold text-xl mb-2 italic">Narration</h4>
          <p className="text-sm text-gray-600 font-serif leading-relaxed">Neural journalists write deep analysis and generate visuals for key stories.</p>
        </div>
        <div className="bg-zinc-100 p-8 border-2 border-black transform hover:-translate-y-1 transition-transform">
          <h3 className="font-mono font-black uppercase text-xs mb-4 text-gray-500">Phase 03</h3>
          <h4 className="font-serif font-bold text-xl mb-2 italic">Synthesis</h4>
          <p className="text-sm text-gray-600 font-serif leading-relaxed">Philosopher agents connect the dots to find meta-narratives.</p>
        </div>
      </div>

      <div className="text-center pb-20 border-t border-gray-200 pt-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-400 italic">Version 1.0.4-PRO | Fully Autonomous Mode Active</p>
      </div>
    </div>
  );
};
