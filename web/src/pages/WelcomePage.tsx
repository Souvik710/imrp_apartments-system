import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Key } from 'lucide-react';
import type { Page } from '../utils/types';

interface WelcomePageProps {
  onNavigate: (page: Page) => void;
  hasRoom: boolean;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onNavigate, hasRoom }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[11px] uppercase tracking-[6px] text-hotel-gold/60 mb-2">
            IMMORTAL ROLEPLAY presents
          </p>
          <h1 className="text-5xl font-display font-bold gold-gradient mb-3">
            Opium Nights
          </h1>
          <h2 className="text-xl font-display text-white/70 mb-2">Hotel</h2>
          <div className="h-[1px] w-32 mx-auto bg-gradient-to-r from-transparent via-hotel-gold/50 to-transparent mb-4" />
          <p className="text-sm text-hotel-muted mb-8">
            Luxury Living &middot; Premium Suites &middot; Exclusive Experience
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('rooms')}
            className="btn-gold px-8 py-3 rounded-xl flex items-center gap-2 text-sm"
          >
            <Building2 size={18} />
            Browse Rooms
          </motion.button>

          {hasRoom && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('myRoom')}
              className="btn-blue px-8 py-3 rounded-xl flex items-center gap-2 text-sm"
            >
              <Key size={18} />
              My Room
            </motion.button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-3 gap-6"
        >
          {[
            { value: '75', label: 'Rooms' },
            { value: '6', label: 'Floors' },
            { value: '5', label: 'Room Types' },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-xl p-4">
              <p className="text-2xl font-bold gold-gradient">{stat.value}</p>
              <p className="text-xs text-hotel-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
