import React, { useEffect, useRef, useState } from 'react';
import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/serif.css';
import { X, Volume2, VolumeX } from 'lucide-react';

interface DemoPresentationProps {
  onClose: () => void;
}

export const DemoPresentation: React.FC<DemoPresentationProps> = ({ onClose }) => {
  const deckRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<Reveal.Api | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isMounted = useRef(true);
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const speak = (text: string) => {
    if (isMutedRef.current || !isMounted.current) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Try to find a high-quality, calm female English voice
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v =>
      (v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Serenity') ||
        v.name.includes('Ava') ||
        v.name.includes('Zoe') ||
        v.name.includes('Female') ||
        v.name.includes('Natural') ||
        v.name.includes('Google') ||
        v.name.includes('Premium')) &&
      v.lang.startsWith('en') &&
      !v.name.includes('Daniel') &&
      !v.name.includes('Guy')
    );

    if (premiumVoice) utterance.voice = premiumVoice;
    // Increased rate and pitch for a more exciting and dynamic "real demo" feel
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    isMounted.current = true;
    let revealInstance: Reveal.Api | null = null;

    if (deckRef.current) {
      revealInstance = new Reveal(deckRef.current, {
        embedded: false,
        hash: false,
        mouseWheel: true,
        controls: true,
        progress: true,
        center: true,
        transition: 'slide',
        backgroundTransition: 'fade',
      });

      revealInstance.initialize().then(() => {
        if (!isMounted.current || !revealInstance) return;

        // Initial narration
        const firstSlide = revealInstance.getCurrentSlide();
        if (firstSlide) {
          const narration = firstSlide.getAttribute('data-narration');
          if (narration) speak(narration);
        }
      });

      revealInstance.on('slidechanged', (event: any) => {
        if (!isMounted.current) return;
        const narration = event.currentSlide.getAttribute('data-narration');
        if (narration) speak(narration);
      });

      revealRef.current = revealInstance;
    }

    // Load voices
    window.speechSynthesis.getVoices();

    return () => {
      isMounted.current = false;
      window.speechSynthesis.cancel();
      if (revealInstance) {
        try {
          // Unbind events first to be safe
          revealInstance.off('slidechanged', () => { });
          revealInstance.destroy();
          revealRef.current = null;
        } catch (e) {
          console.error('Error destroying Reveal instance:', e);
        }
      }
    };
  }, []);

  // Handle mute toggle
  useEffect(() => {
    if (isMuted) {
      window.speechSynthesis.cancel();
    } else if (isMounted.current) {
      const currentSlide = revealRef.current?.getCurrentSlide();
      const narration = currentSlide?.getAttribute('data-narration');
      if (narration) speak(narration);
    }
  }, [isMuted]);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div className="fixed top-8 right-8 z-[110] flex gap-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 bg-black text-white hover:bg-zinc-800 transition-all duration-300 shadow-2xl border-2 border-white/20 rounded-full"
          aria-label={isMuted ? "Unmute Narration" : "Mute Narration"}
        >
          {isMuted ? <VolumeX size={32} /> : <Volume2 size={32} />}
        </button>
        <button
          onClick={onClose}
          className="p-3 bg-black text-white hover:bg-accent hover:scale-110 transition-all duration-300 shadow-2xl border-2 border-white/20 rounded-full"
          aria-label="Close Demo"
        >
          <X size={32} />
        </button>
      </div>

      <div className="reveal" ref={deckRef}>
        <div className="slides">
          {/* Slide 1: Welcome */}
          <section
            data-background-image="/demo-intro.png"
            className="text-center"
            data-narration="Welcome to the future! This is Zeitgeist A.I. Witness the incredible power of information synthesis where our cutting-edge autonomous agents monitor the world's pulse in real time! Get ready to see the world like never before."
          >
            <div className="bg-black/80 backdrop-blur-md p-12 border-t-8 border-accent inline-block shadow-2xl max-w-4xl mx-auto">
              <h1 className="text-accent !text-8xl font-black mb-6 tracking-tighter drop-shadow-[0_5px_15px_rgba(192,57,43,0.4)]">ZEITGEIST AI</h1>
              <h3 className="text-white font-mono uppercase tracking-[0.4em] mb-10 border-b border-white/20 pb-4 inline-block font-bold">The Autonomous Observer</h3>
              <p className="text-3xl text-white leading-relaxed font-serif">
                Experience the future of information synthesis where <span className="text-accent font-black">AI monitors the world's pulse.</span>
              </p>
            </div>
          </section>

          {/* Slide 2: Real-time Observation */}
          <section
            data-background-color="#ffffff"
            data-narration="Check this out! Every 12 hours, our researcher agents blaze through hundreds of global news sources, journals, and social signals! Out of this massive sea of data, our model identifies the top 3 high-impact narratives that are actually shaping your reality right now!"
          >
            <div className="max-w-6xl mx-auto">
              <h2 className="text-black !text-6xl font-serif mb-12 border-b-8 border-black inline-block pb-4 px-8 italic">Autonomous Observation</h2>
              <div className="grid grid-cols-2 gap-16 items-center text-left">
                <div className="bg-paper p-10 shadow-2xl border-4 border-black">
                  <p className="mb-8 text-2xl font-serif leading-snug">Our researcher agents scan global data streams every 12 hours. From hundreds of detected signals, the model selects the <span className="text-accent font-black">top 3 narratives</span> that carry the highest global significance.</p>
                  <ul className="list-none space-y-6 text-xl text-black">
                    <li className="flex items-center gap-4 group"><span className="w-4 h-4 bg-accent group-hover:scale-150 transition-transform"></span> <span className="font-bold uppercase tracking-widest text-black">Global News Outlets</span></li>
                    <li className="flex items-center gap-4 group"><span className="w-4 h-4 bg-accent group-hover:scale-150 transition-transform"></span> <span className="font-bold uppercase tracking-widest text-black">Academic Journals</span></li>
                    <li className="flex items-center gap-4 group"><span className="w-4 h-4 bg-accent group-hover:scale-150 transition-transform"></span> <span className="font-bold uppercase tracking-widest text-black">Social Signals</span></li>
                    <li className="flex items-center gap-4 group"><span className="w-4 h-4 bg-accent group-hover:scale-150 transition-transform"></span> <span className="font-bold uppercase tracking-widest text-black">Emerging Trends</span></li>
                  </ul>
                </div>
                <div className="bg-black p-10 rounded-lg shadow-[0_0_50px_rgba(192,57,43,0.3)] transform -rotate-1">
                  <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-[10px] font-mono text-gray-500 ml-2 uppercase tracking-tighter">Terminal Instance: Researcher_Alpha</span>
                  </div>
                  <code className="text-lg font-mono text-green-400 block p-2">
                    <span className="text-gray-500">[17:31:58]</span> SYSTEM INITIALIZED<br />
                    <span className="text-gray-500">[17:32:01]</span> SCANNED 482 SOURCES<br />
                    <span className="text-gray-500">[17:32:05]</span> 12 NARRATIVES DETECTED<br />
                    <span className="text-gray-500">[17:32:08]</span> RANKING BY SIGNIFICANCE...<br />
                    <span className="text-gray-500">[17:32:10]</span> <span className="text-accent font-bold">PRIORITY IDENTIFIED</span>
                  </code>
                </div>
              </div>
            </div>
          </section>

          {/* Slide 3: Intelligent Journalism */}
          <section
            data-background-color="#f8f5f2"
            data-narration="But wait, it gets better! Once the topics are locked in, the Journalist Agent kicks into high gear! It creates deep analysis, smart tagging, and even generates stunning AI imagery for every single story! It's a complete, professional briefing created entirely by A.I. with zero human effort!"
          >
            <h2 className="text-black !text-6xl font-serif mb-16 border-b-8 border-black inline-block pb-4 italic">Journalist Agent</h2>
            <p className="mb-20 text-3xl font-serif max-w-4xl mx-auto italic text-black font-bold">"Automatically analyzes complex narratives to produce deep, readable analysis with zero human intervention."</p>
            <div className="flex justify-center gap-20">
              <div className="group text-center">
                <div className="w-32 h-32 bg-black text-white flex items-center justify-center mx-auto mb-6 rounded-none border-t-8 border-accent shadow-2xl group-hover:-translate-y-4 transition-all duration-500">
                  <span className="text-5xl font-black italic">W</span>
                </div>
                <p className="font-mono text-lg uppercase font-black border-b-2 border-transparent group-hover:border-accent inline-block transition-all text-black">Deep Writing</p>
              </div>
              <div className="group text-center">
                <div className="w-32 h-32 bg-black text-white flex items-center justify-center mx-auto mb-6 rounded-none border-t-8 border-accent shadow-2xl group-hover:-translate-y-4 transition-all duration-500">
                  <span className="text-5xl font-black italic">T</span>
                </div>
                <p className="font-mono text-lg uppercase font-black border-b-2 border-transparent group-hover:border-accent inline-block transition-all text-black">Smart Tagging</p>
              </div>
              <div className="group text-center">
                <div className="w-32 h-32 bg-black text-white flex items-center justify-center mx-auto mb-6 rounded-none border-t-8 border-accent shadow-2xl group-hover:-translate-y-4 transition-all duration-500">
                  <span className="text-5xl font-black italic">V</span>
                </div>
                <p className="font-mono text-lg uppercase font-black border-b-2 border-transparent group-hover:border-accent inline-block transition-all text-black">Creative Vision</p>
              </div>
            </div>
          </section>

          {/* Slide 4: Priority Override / Admin Panel */}
          <section
            data-background-color="#000000"
            data-narration="And here's the ultimate power-move! You are always in control. With our Priority Override, you can manually inject any story you care about directly into the system for immediate neural analysis! You steer the A.I. exactly where you want it to go!"
          >
            <div className="max-w-5xl mx-auto flex flex-col items-center">
              <h2 className="text-accent !text-6xl font-serif mb-12 italic">Human-in-the-loop</h2>
              <p className="text-white text-3xl mb-16 font-serif italic max-w-3xl text-center">"Total control over the zeitgeist. Manually inject priority topics that demand immediate neural analysis."</p>

              <div className="bg-zinc-900 border-2 border-white/20 p-8 rounded shadow-[0_0_100px_rgba(255,255,255,0.05)] text-left w-full max-w-2xl transform hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                  <span className="text-accent font-mono text-sm tracking-widest uppercase">Admin Priority Controller</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase font-mono tracking-tighter">Target Narrative Topic</label>
                    <div className="bg-black border border-white/10 p-3 text-white font-mono text-sm italic">"The intersection of Quantum Computing and Existentialism"</div>
                  </div>
                  <button className="w-full py-4 bg-accent text-white font-mono uppercase tracking-[0.2em] font-bold shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    Inject Priority Stream
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Slide 5: Philosophical Synthesis */}
          <section
            data-background-image="/demo-philosophy.png"
            data-narration="Finally, prepare for pure insight! Our philosopher agent looks deep beyond the headlines to find the hidden patterns. It connects the dots to reveal the true human condition. This isn't just news—it's pure wisdom!"
          >
            <div className="bg-black/85 backdrop-blur-md p-16 border-l-[12px] border-accent shadow-2xl max-w-5xl mx-auto text-left relative overflow-hidden">
              <span className="absolute -top-10 -right-10 text-[200px] text-white/10 font-serif pointer-events-none">"</span>
              <h2 className="text-white !text-6xl font-serif mb-10 italic font-black">Philosophical Synthesis</h2>
              <p className="text-3xl leading-relaxed font-serif text-white mb-8 border-b border-white/10 pb-10">
                Our Philosopher Agent looks <span className="text-accent font-black underline decoration-4 underline-offset-8">beyond the headlines</span> to synthesize meta-narratives,
                connecting disparate events into a cohesive understanding of the human condition.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-1 bg-accent"></div>
                <p className="text-accent font-mono uppercase tracking-[0.3em] font-bold underline decoration-accent decoration-2 offset-4">Where news becomes wisdom</p>
              </div>
            </div>
          </section>

          {/* Slide 6: Call to Action */}
          <section
            data-background-color="#ffffff"
            className="text-center"
            data-narration="Are you ready to join the observers? Don't miss out on the future. Stay informed, stay ahead, and stay human! Enter the Zeitgeist right now and experience the revolution!"
          >
            <div className="max-w-4xl mx-auto border-[20px] border-black p-20 shadow-2xl relative">
              <span className="absolute top-0 left-0 bg-accent text-white font-mono px-4 py-1 text-xs uppercase font-bold">- LIVE STATUS: ACTIVE -</span>
              <h2 className="text-black font-black text-8xl mb-8 tracking-tighter">JOIN THE OBSERVERS</h2>
              <p className="text-2xl mb-16 text-gray-500 font-mono tracking-widest uppercase italic font-bold">Stay Informed. Stay Ahead. Stay Human.</p>

              <button
                onClick={onClose}
                className="group relative px-16 py-8 bg-black text-white font-mono uppercase tracking-[0.4em] hover:bg-accent transition-all transform hover:scale-105 shadow-[10px_10px_0px_0px_rgba(192,57,43,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 text-3xl font-bold"
              >
                Enter the Zeitgeist
              </button>

              <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-mono uppercase tracking-[0.2em] font-bold">
                <span>Node: US-WEST-01</span>
                <span>System: v1.0.4-PRO</span>
                <span>Security: Encrypted</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
