"use client";

import { motion } from "framer-motion";

const AutoBlogLogo = () => {
  return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="mb-6">
      <h1 className="text-4xl font-bold text-primary">
        Auto Blog<span className="text-secondary"></span>
      </h1>
      <motion.div className="h-1 bg-primary mt-2" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.5, delay: 0.2 }} />
    </motion.div>
  );
};

export default AutoBlogLogo;
