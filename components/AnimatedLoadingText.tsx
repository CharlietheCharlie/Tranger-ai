import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface AnimatedLoadingTextProps {
  isGenerating: boolean;
}

// Component to handle the infinite dot animation
const AnimatedDots = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400); // Speed of dot cycling
    return () => clearInterval(interval);
  }, []);

  // Fixed width container prevents text layout shift as dots appear
  return <span className="inline-block w-4 text-left">{dots}</span>;
};

export const AnimatedLoadingText: React.FC<AnimatedLoadingTextProps> = ({
  isGenerating,
}) => {
  const t = useTranslations("AnimatedLoadingText");
  // Definition of the messages to show at specific times
  const messages = [
    t("PlanningYourTrip"), // Initial message
    t("FindingTheBestSpots"), // After 2 seconds
    t("OptimizingRouteDetails"), // After 5 seconds
    t("AlmostReady"), // After 8 seconds
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentIndex(0);
      return;
    }

    // Timer for 2 seconds
    const timer1 = setTimeout(() => {
      setCurrentIndex(1);
    }, 2000);

    // Timer for 5 seconds
    const timer2 = setTimeout(() => {
      setCurrentIndex(2);
    }, 5000);

    // Optional: Timer for 8 seconds if it takes really long
    const timer3 = setTimeout(() => {
      setCurrentIndex(3);
    }, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isGenerating]);

  return (
    <div className="flex flex-col items-center justify-center h-6 overflow-hidden relative min-w-[140px]">
      <AnimatePresence mode="wait">
        <motion.span
          key={messages[currentIndex]}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -15, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute text-sm font-semibold whitespace-nowrap"
        >
          {messages[currentIndex]}
          <span className="dots" />
          <AnimatedDots />
        </motion.span>
      </AnimatePresence>
    </div>
  );
};
