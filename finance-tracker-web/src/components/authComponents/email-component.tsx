"use client";

import { useSignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { OAuthStrategy } from "@clerk/types";
import { useEffect } from "react";

export default function EmailComponent({
  error,
  handleEmailSubmit,
  email,
  setEmail,
}: {
  error: string;
  handleEmailSubmit: (e: React.FormEvent) => Promise<void>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { signIn } = useSignIn();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "system");
    root.classList.add("dark");
  }, []);

  const handleGoogleSignIn = (strategy: OAuthStrategy) => {
    return signIn!.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sign-up/sso-callback",
      redirectUrlComplete: "/dashboard",
    });
  };
  return (
    <div className="flex items-center justify-center min-h-screen w-full relative bg-black">
      {/* Pearl Mist Background with Top Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(226, 232, 240, 0.12), transparent 60%), #000000",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 space-y-8 bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl"
      >
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-3xl font-bold text-center text-foreground">
          Sign In
        </motion.h2>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-800/50 rounded-lg">
            {error}
          </motion.div>
        )}

        <form onSubmit={(e) => handleEmailSubmit(e)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email address
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="mt-1 block w-full px-3 py-2 bg-background/50 border border-border rounded-lg shadow-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-gradient-to-b from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Sign in with Email
          </motion.button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background/80 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleGoogleSignIn("oauth_google")}
          className="w-full flex items-center justify-center py-2 px-4 border border-border rounded-lg shadow-sm text-sm font-medium text-foreground bg-background/50 hover:bg-background/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Image src="https://authjs.dev/img/providers/google.svg" alt="Google logo" height="24" width="24" className="mr-2" />
          Sign in with Google
        </motion.button>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full flex justify-center">
          <Link href="/sign-up" className="text-sm font-medium text-foreground hover:text-primary">
            Don&apos;t have an account? Sign Up
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
