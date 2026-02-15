'use client';

import { useSignUp } from '@clerk/nextjs';
import type { OAuthStrategy } from '@clerk/types';
import { motion } from 'framer-motion';
import { CheckCircle, Eye, EyeOff, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { OtpComponent } from '@/components/authComponents/otpComponent';

export default function SignUpComponent() {
  const { isLoaded, signUp } = useSignUp();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress,
        password,
      });
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });
      setVerifying(true);
    } catch (err) {
      //@ts-expect-error err.errors is not defined
      setError(err.errors?.[0]?.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = (strategy: OAuthStrategy) => {
    return signUp?.authenticateWithRedirect({
      strategy,
      redirectUrl: '/sign-up/sso-callback',
      redirectUrlComplete: '/dashboard',
    });
  };

  if (verifying) {
    return <OtpComponent strategy="password" />;
  }

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
            Create Account
          </h2>
          <p className="text-sm text-stone-600">Join Wealth Reserve today</p>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-2">
              Email address
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="email"
              id="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="Enter your email"
              required
              className="block w-full px-4 py-3 bg-white border border-stone-300 rounded-lg shadow-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition-all duration-300"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-stone-700 mb-2">
              Password
            </label>
            <div className="relative">
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                className="block w-full px-4 py-3 pr-12 bg-white border border-stone-300 rounded-lg shadow-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-stone-500 hover:text-amber-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2"
            >
              <p className="text-xs font-semibold text-stone-700">Password must contain:</p>
              <ul className="text-xs text-stone-600 space-y-1.5">
                <li className="flex items-center">
                  {password.length > 8 ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mr-2" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-600 mr-2" />
                  )}
                  At least 8 characters
                </li>
                <li className="flex items-center">
                  {password.match(/[A-Z]/) && password.match(/[a-z]/) ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mr-2" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-600 mr-2" />
                  )}
                  Upper and lowercase letters
                </li>
                <li className="flex items-center">
                  {password.match(/\d/) ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mr-2" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-600 mr-2" />
                  )}
                  At least one number
                </li>
                <li className="flex items-center">
                  {password.match(/[^a-zA-Z\d]/) ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mr-2" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-600 mr-2" />
                  )}
                  At least one special character
                </li>
              </ul>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 hover:shadow-lg hover:shadow-amber-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Sign up with Email'}
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
          onClick={() => handleGoogleSignUp('oauth_google')}
          className="w-full flex items-center justify-center py-3 px-4 border border-stone-300 rounded-lg shadow-sm text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 hover:border-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-all duration-300"
        >
          <Image
            src="https://authjs.dev/img/providers/google.svg"
            alt="Google logo"
            height="20"
            width="20"
            className="mr-2"
          />
          Sign up with Google
        </motion.button>

        <motion.div whileHover={{ scale: 1.02 }} className="w-full flex justify-center pt-2">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-stone-700 hover:text-amber-700 transition-colors"
          >
            Already have an account? <span className="text-amber-700 font-semibold">Sign In</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
