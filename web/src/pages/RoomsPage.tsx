import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Check, X, ChevronDown } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import type { Page, RoomData } from '../utils/types';
import { formatMoney, getRoomTypeColor, getRoomTypeBg } from '../utils/nui';

interface RoomsPageProps {
  rooms: RoomData[];
  onNavigate: (page: Page) => void;
  onSelectRoom: (roomNumber: string) => void;
}

const RoomsPage: React.FC<RoomsPageProps> = ({ rooms, onNavigate, onSelectRoom }) => {
  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const floors = useMemo(() => {
    const unique = [...new Set(rooms.map(r => r.floor))].sort();
    return unique;
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    let result = rooms;
    if (selectedFloor > 0) {
      result = result.filter(r => r.floor === selectedFloor);
    }
    if (typeFilter !== 'all') {
      result = result.filter(r => r.type === typeFilter);
    }
    return result.sort((a, b) => a.number.localeCompare(b.number));
  }, [rooms, selectedFloor, typeFilter]);

  const available = filteredRooms.filter(r => !r.isOccupied).length;

  return (
    <PageWrapper title="Available Rooms" subtitle={`${available} rooms available`}>
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedFloor(0)}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            selectedFloor === 0
              ? 'bg-hotel-gold/20 text-hotel-gold border border-hotel-gold/30'
              : 'glass text-white/60 hover:text-white'
          }`}
        >
          All Floors
        </button>
        {floors.map(floor => (
          <button
            key={floor}
            onClick={() => setSelectedFloor(floor)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              selectedFloor === floor
                ? 'bg-hotel-gold/20 text-hotel-gold border border-hotel-gold/30'
                : 'glass text-white/60 hover:text-white'
            }`}
          >
            {floor === 7 ? 'Penthouse' : `Floor ${floor}`}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        {['all', 'standard', 'deluxe', 'executive', 'luxury', 'penthouse'].map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              typeFilter === type
                ? 'bg-hotel-blue/20 text-hotel-blue border border-hotel-blue/30'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <AnimatePresence>
          {filteredRooms.map((room, i) => (
            <motion.div
              key={room.number}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
            >
              <GlassCard
                hover
                onClick={() => {
                  onSelectRoom(room.number);
                  onNavigate('roomDetails');
                }}
                className={`bg-gradient-to-br ${getRoomTypeBg(room.type)} relative overflow-hidden`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-white">#{room.number}</p>
                    <p className={`text-xs ${getRoomTypeColor(room.type)}`}>{room.typeLabel}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    room.isOccupied ? 'bg-hotel-danger/20' : 'bg-hotel-success/20'
                  }`}>
                    {room.isOccupied ? (
                      <X size={14} className="text-hotel-danger" />
                    ) : (
                      <Check size={14} className="text-hotel-success" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-hotel-muted">Price</p>
                    <p className="text-sm font-bold text-hotel-gold">{formatMoney(room.price)}</p>
                  </div>
                  <p className="text-[10px] text-hotel-muted">
                    Floor {room.floor}
                  </p>
                </div>
                {!room.isOccupied && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-hotel-success animate-pulse" />
                )}
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
};

export default RoomsPage;
