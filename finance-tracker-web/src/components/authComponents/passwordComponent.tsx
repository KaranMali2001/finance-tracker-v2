'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PasswordComponent({ email }: { email: string }) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive?.({ session: result.createdSessionId });
        router.push('/dashboard');
      }
    } catch (err) {
      //@ts-expect-error err.errors is not defined
      setError(err.errors?.[0]?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
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
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center text-stone-600 hover:text-amber-700 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-stone-800 mb-1">Enter Password</h2>
          <p className="text-sm text-stone-600">Sign in to {email}</p>
        </div>

        <form onSubmit={handlePasswordLogin} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-stone-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pr-12 h-11"
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

          <Button type="submit" disabled={isLoading} className="w-full h-11">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {error && (
          <div className="overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center p-3 text-red-700 bg-red-50 border border-red-200 rounded-lg"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          </div>
        )}

        <div className="text-center pt-2">
          <Button
            variant="link"
            className="text-sm text-amber-700 hover:text-amber-800 font-medium"
          >
            Forgot password?
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
