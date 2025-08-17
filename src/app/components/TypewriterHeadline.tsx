"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TypewriterHeadlineProps {
  steps: string[];
  className?: string;
}

export default function TypewriterHeadline({ steps, className = "" }: TypewriterHeadlineProps) {
  const [text, setText] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (stepIndex < steps.length) {
      const currentStep = steps[stepIndex];
      
      if (!isDeleting && text === currentStep) {
        // Finished typing, wait then start deleting
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === "") {
        // Finished deleting, move to next step
        setIsDeleting(false);
        setStepIndex((prev) => (prev + 1) % steps.length);
      } else if (!isDeleting) {
        // Typing
        timeout = setTimeout(() => {
          setText(currentStep.slice(0, text.length + 1));
        }, 100);
      } else {
        // Deleting
        timeout = setTimeout(() => {
          setText(currentStep.slice(0, text.length - 1));
        }, 50);
      }
    }

    return () => clearTimeout(timeout);
  }, [text, stepIndex, isDeleting, steps]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`text-center ${className}`}
    >
      <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-300 via-green-400 to-blue-500">
        {text}
        <motion.span
          className="inline-block ml-1 w-1 bg-gradient-to-r from-sky-400 to-green-500"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          |
        </motion.span>
      </h1>
      <motion.p 
        className="text-lg md:text-xl text-neutral-400 mt-4 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        Connect with trusted local professionals and transform your space with AI-powered matching
      </motion.p>
    </motion.div>
  );
}
