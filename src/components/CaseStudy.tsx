"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CaseStudy() {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 640px)", () => {
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 30, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 80%" },
            delay: i * 0.05,
          }
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="story-sections" className="relative max-w-6xl mx-auto px-6 py-24 space-y-20">
      {[
        {
          title: "Instant Estimates",
          copy: "Post a project and get an AI-backed price range in seconds. No more guesswork.",
          gradient: "from-blue-500/20 to-cyan-500/20"
        },
        {
          title: "Live Competition",
          copy: "Top local pros compete via reverse-bidding. You stay in control, they fight for your business.",
          gradient: "from-purple-500/20 to-pink-500/20"
        },
        {
          title: "Shield Protection",
          copy: "Escrowed payments, verified providers, transparent dispute flow. Every job guaranteed.",
          gradient: "from-green-500/20 to-emerald-500/20"
        },
      ].map((s, i) => (
        <div key={i} className={`reveal rounded-3xl p-8 border border-white/10 bg-gradient-to-br ${s.gradient} backdrop-blur-sm`}>
          <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">{s.title}</h3>
          <p className="text-neutral-300 text-lg">{s.copy}</p>
        </div>
      ))}
    </section>
  );
}
