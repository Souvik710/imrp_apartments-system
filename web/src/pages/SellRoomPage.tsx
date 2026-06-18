import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, AlertTriangle, DollarSign } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import type { PlayerInfo } from '../utils/types';
import { fetchNui, formatMoney } from '../utils/nui';

interface SellRoomPageProps {
  playerInfo: PlayerInfo | null;
  roomTypes: Record<string, { price: number }>;
}

const SellRoomPage: React.FC<SellRoomPageProps> = ({ playerInfo, roomTypes }) => {
  const room = playerInfo?.ownedRoom;
  const [confirming, setConfirming] = useState(false);
  const [selling, setSelling] = useState(false);

  if (!room) return null;

  const roomTypeConfig = roomTypes[room.type];
  const refund = Math.floor((roomTypeConfig?.price || 0) * 0.70);

  const handleSell = async () => {
    setSelling(true);
    await fetchNui('sellRoom');
    setSelling(false);
    setConfirming(false);
  };

  return (
    <PageWrapper title="Sell Room" subtitle={`Sell Room ${room.number}`}>
      <div className="max-w-md mx-auto">
        <GlassCard className="mb-4 border-hotel-danger/20">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-hotel-danger" />
            <div>
              <p className="text-sm font-medium text-hotel-danger">Warning</p>
              <p className="text-xs text-hotel-muted">
                Selling your room is permanent. You will receive a 70% refund.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-center mb-6">
            <Tag size={32} className="text-hotel-gold mx-auto mb-3" />
            <h3 className="text-xl font-display font-bold text-white">Room {room.number}</h3>
            <p className="text-sm text-hotel-muted">{room.typeLabel}</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm text-hotel-muted">Original Price</span>
              <span className="text-sm text-white">{formatMoney(roomTypeConfig?.price || 0)}</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm text-hotel-muted">Refund Rate</span>
              <span className="text-sm text-hotel-warning">70%</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-hotel-success/5 border border-hotel-success/20">
              <span className="text-sm text-hotel-muted flex items-center gap-1">
                <DollarSign size={14} />
                Refund Amount
              </span>
              <span className="text-lg font-bold text-hotel-success">{formatMoney(refund)}</span>
            </div>
          </div>

          {!confirming ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setConfirming(true)}
              className="w-full btn-danger py-3 rounded-xl text-sm"
            >
              Sell Room
            </motion.button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-hotel-danger text-center">
                Are you sure? This cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConfirming(false)}
                  className="glass py-2.5 rounded-lg text-sm text-white/70 hover:text-white"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSell}
                  disabled={selling}
                  className="btn-danger py-2.5 rounded-lg text-sm disabled:opacity-50"
                >
                  {selling ? 'Selling...' : 'Confirm Sale'}
                </motion.button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </PageWrapper>
  );
};

export default SellRoomPage;
