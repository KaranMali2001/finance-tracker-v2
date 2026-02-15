'use client';

import { useSignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { OAuthStrategy } from '@clerk/types';

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

  const handleGoogleSignIn = (strategy: OAuthStrategy) => {
    return signIn!.authenticateWithRedirect({
      strategy,
      redirectUrl: '/sign-up/sso-callback',
      redirectUrlComplete: '/dashboard',
    });
  };
  return (
    <div className="flex items-center justify-center min-h-screen w-full relative bg-gradient-to-br from-stone-50 via-amber-50/40 to-stone-100">
      {/* Subtle Pattern Overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, oklch(0.30 0.015 45) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="luxury-card relative z-10 w-full max-w-md p-10 space-y-6 bg-white border border-stone-200 rounded-xl shadow-xl"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-stone-600">Sign in to your Wealth Reserve account</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={(e) => handleEmailSubmit(e)} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-2">
              Email address
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="block w-full px-4 py-3 bg-white border border-stone-300 rounded-lg shadow-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition-all duration-300"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 hover:shadow-lg hover:shadow-amber-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-all duration-300"
          >
            Sign in with Email
          </motion.button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-stone-600">Or continue with</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGoogleSignIn('oauth_google')}
          className="w-full flex items-center justify-center py-3 px-4 border border-stone-300 rounded-lg shadow-sm text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 hover:border-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-all duration-300"
        >
          <Image
            src="https://authjs.dev/img/providers/google.svg"
            alt="Google logo"
            height="20"
            width="20"
            className="mr-2"
          />
          Sign in with Google
        </motion.button>

        <motion.div whileHover={{ scale: 1.02 }} className="w-full flex justify-center pt-2">
          <Link
            href="/sign-up"
            className="text-sm font-medium text-stone-700 hover:text-amber-700 transition-colors"
          >
            Don&apos;t have an account?{' '}
            <span className="text-amber-700 font-semibold">Sign Up</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
