"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Dynamic import for GSAP to avoid SSR issues
let gsap: typeof import("gsap").gsap | null = null;
let ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger | null = null;

interface StorytellingSection {
  title: string;
  subtitle: string;
  image: string;
  content: string[];
}

const stories: StorytellingSection[] = [
  {
    title: "AI-Powered Matching",
    subtitle: "Find the perfect professional in seconds",
    image: "/api/placeholder/600/400",
    content: [
      "Our advanced AI analyzes your project requirements",
      "Matches you with pre-vetted local professionals",
      "Gets you 3 qualified quotes in under 24 hours"
    ]
  },
  {
    title: "3D Visualization", 
    subtitle: "See your project before you start",
    image: "/api/placeholder/600/400",
    content: [
      "Visualize materials and finishes in 3D",
      "Compare options side-by-side",
      "Make confident decisions with realistic previews"
    ]
  },
  {
    title: "Trust & Quality",
    subtitle: "Work with confidence",
    image: "/api/placeholder/600/400", 
    content: [
      "All professionals are background-checked",
      "Real-time trust scores based on performance",
      "Guaranteed satisfaction with every project"
    ]
  }
];

export default function ScrollStorytellingSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gsapLoaded, setGsapLoaded] = useState(false);

  useEffect(() => {
    const loadGSAP = async () => {
      try {
        const gsapModule = await import("gsap");
        const ScrollTriggerModule = await import("gsap/ScrollTrigger");
        
        gsap = gsapModule.gsap;
        ScrollTrigger = ScrollTriggerModule.ScrollTrigger;
        
        gsap.registerPlugin(ScrollTrigger);
        setGsapLoaded(true);
      } catch (error) {
        console.error("Failed to load GSAP:", error);
      }
    };

    loadGSAP();
  }, []);

  useEffect(() => {
    if (!gsapLoaded || !gsap || !ScrollTrigger) return;

    const container = containerRef.current;
    if (!container) return;

    // Create animations for each story section
    const sections = container.querySelectorAll('.story-section');
    
    sections.forEach((section) => {
      if (!gsap || !ScrollTrigger) return;
      
      const image = section.querySelector('.story-image');
      const content = section.querySelector('.story-content');
      const title = section.querySelector('.story-title');
      const items = section.querySelectorAll('.story-item');

      // Set initial states
      gsap.set([image, content], { opacity: 0, y: 50 });
      gsap.set(items, { opacity: 0, x: -30 });

      // Create timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });

      // Animate in sequence
      tl.to([image, title], { 
        opacity: 1, 
        y: 0, 
        duration: 0.8,
        ease: "power2.out" 
      })
      .to(content, { 
        opacity: 1, 
        y: 0, 
        duration: 0.6,
        ease: "power2.out" 
      }, "-=0.3")
      .to(items, { 
        opacity: 1, 
        x: 0, 
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out" 
      }, "-=0.2");
    });

    // Cleanup function
    return () => {
      if (ScrollTrigger) {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      }
    };
  }, [gsapLoaded]);

  return (
    <section className="py-20 bg-gradient-to-b from-neutral-950 to-neutral-900">
      <div className="max-w-6xl mx-auto px-6" ref={containerRef}>
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How BookLocal Works
          </h2>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            From concept to completion, we make home improvement simple and stress-free
          </p>
        </motion.div>

        <div className="space-y-32">
          {stories.map((story, index) => (
            <div key={index} className={`story-section grid md:grid-cols-2 gap-12 items-center ${
              index % 2 === 1 ? 'md:grid-flow-col-dense' : ''
            }`}>
              {/* Image */}
              <div className={`story-image ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-green-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-700">
                    <img 
                      src={story.image} 
                      alt={story.title}
                      className="w-full h-80 object-cover"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 to-transparent"></div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={`story-content ${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                <div className="space-y-6">
                  <div className="story-title">
                    <div className="inline-flex items-center px-3 py-1 bg-sky-500/20 text-sky-300 text-sm font-medium rounded-full mb-4">
                      Step {index + 1}
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                      {story.title}
                    </h3>
                    <p className="text-xl text-neutral-300 mb-8">
                      {story.subtitle}
                    </p>
                  </div>
                  
                  <ul className="space-y-4">
                    {story.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="story-item flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-sky-500 to-green-500 rounded-full flex items-center justify-center mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-neutral-300 text-lg leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          className="text-center mt-20 pt-16 border-t border-neutral-800"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to transform your space?
          </h3>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
            Join thousands of homeowners who trust BookLocal for their projects
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-sky-500 to-green-500 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            Get Started Today
          </button>
        </motion.div>
      </div>
    </section>
  );
}
