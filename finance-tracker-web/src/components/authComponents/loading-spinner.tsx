"use client";

import { motion } from "framer-motion";

const LoadingSpinner = () => {
  return (
    <div className="relative w-16 h-16">
      <motion.div
        className="absolute inset-0 border-4 border-primary rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-0 border-t-4 border-secondary rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

export default LoadingSpinner;
