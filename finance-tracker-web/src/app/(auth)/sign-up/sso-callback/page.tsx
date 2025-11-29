'use client';

import LoadingSpinner from '@/components/authComponents/loading-spinner';
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

const loadingPhrases = ['Finalizing authentication...'];

export default function SSOCallback() {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'system');
    root.classList.add('dark');
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full relative bg-black">
      {/* Pearl Mist Background with Top Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 35% at 50% 0%, rgba(226, 232, 240, 0.12), transparent 60%), #000000',
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center justify-center p-4 text-center"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
          className="bg-background/80 backdrop-blur-sm border border-border/50 p-8 rounded-lg shadow-lg max-w-md w-full"
        >
          <motion.h2
            className="text-3xl font-bold mb-6 text-primary"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Welcome To Auto Blog
          </motion.h2>
          <div className="flex justify-center mb-6">
            <LoadingSpinner />
          </div>
          <motion.p
            className="text-lg text-muted-foreground mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {loadingPhrases}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/10 rounded-lg animate-pulse" />
            <div id="clerk-captcha" className="relative z-10"></div>
            <AuthenticateWithRedirectCallback />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
