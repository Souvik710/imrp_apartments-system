import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ title, subtitle, children }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="h-full flex flex-col p-6 overflow-hidden"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-white">{title}</h2>
          {subtitle && (
            <p className="text-sm text-hotel-muted mt-1">{subtitle}</p>
          )}
          <div className="h-[1px] bg-gradient-to-r from-hotel-gold/40 to-transparent mt-3" />
        </div>
        <div className="flex-1 overflow-y-auto pr-1">
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageWrapper;
