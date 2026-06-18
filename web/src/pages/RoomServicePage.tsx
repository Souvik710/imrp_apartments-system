import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Coffee, Package, Clock, DollarSign } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import type { RoomServiceConfig, RoomServiceItem } from '../utils/types';
import { fetchNui, formatMoney } from '../utils/nui';

interface RoomServicePageProps {
  roomService: RoomServiceConfig | null;
}

const categoryIcons: Record<string, React.ReactNode> = {
  food: <UtensilsCrossed size={18} />,
  drinks: <Coffee size={18} />,
  supplies: <Package size={18} />,
};

const RoomServicePage: React.FC<RoomServicePageProps> = ({ roomService }) => {
  const [activeCategory, setActiveCategory] = useState<string>('food');
  const [ordering, setOrdering] = useState<number | null>(null);

  const categories = roomService ? Object.keys(roomService) : [];
  const items: RoomServiceItem[] = roomService && activeCategory in roomService
    ? (roomService as unknown as Record<string, RoomServiceItem[]>)[activeCategory]
    : [];

  const handleOrder = async (index: number) => {
    setOrdering(index);
    await fetchNui('orderRoomService', { category: activeCategory, itemIndex: index + 1 });
    setOrdering(null);
  };

  return (
    <PageWrapper title="Room Service" subtitle="Order food, drinks, and supplies to your room">
      <div className="flex gap-3 mb-6">
        {categories.map(cat => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeCategory === cat
                ? 'bg-hotel-gold/20 text-hotel-gold border border-hotel-gold/30'
                : 'glass text-white/60 hover:text-white'
            }`}
          >
            {categoryIcons[cat]}
            <span className="capitalize">{cat}</span>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-hotel-gold flex items-center gap-1">
                      <DollarSign size={12} />
                      {formatMoney(item.price)}
                    </span>
                    <span className="text-xs text-hotel-muted flex items-center gap-1">
                      <Clock size={12} />
                      {item.deliveryTime}s
                    </span>
                  </div>
                </div>
                <div className="text-hotel-gold">
                  {categoryIcons[activeCategory]}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOrder(i)}
                disabled={ordering === i}
                className="w-full btn-gold py-2 rounded-lg text-xs disabled:opacity-50"
              >
                {ordering === i ? 'Ordering...' : 'Order'}
              </motion.button>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
};

export default RoomServicePage;
