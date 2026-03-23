'use client';

import { motion } from 'framer-motion';
import { Landmark } from 'lucide-react';

const WealthReserveLogo = () => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-6 flex items-center gap-3"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 shadow-md shadow-amber-600/20 flex-shrink-0">
        <Landmark className="h-5 w-5 text-white" />
      </div>
      <div>
        <h1
          className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Wealth Reserve
        </h1>
        <motion.div
          className="h-0.5 bg-gradient-to-r from-amber-600 to-yellow-600 mt-0.5"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>
    </motion.div>
  );
};

export default WealthReserveLogo;
