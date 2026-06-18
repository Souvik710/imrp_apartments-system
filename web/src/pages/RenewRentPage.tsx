import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Clock, AlertTriangle } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import type { PlayerInfo } from '../utils/types';
import { fetchNui, formatMoney, formatDate, getDaysRemaining } from '../utils/nui';

interface RenewRentPageProps {
  playerInfo: PlayerInfo | null;
}

const RenewRentPage: React.FC<RenewRentPageProps> = ({ playerInfo }) => {
  const room = playerInfo?.ownedRoom;
  const [renewing, setRenewing] = useState(false);

  if (!room) return null;

  const daysRemaining = getDaysRemaining(room.expireDate);
  const isExpired = daysRemaining <= 0;
  const isExpiring = daysRemaining <= 2;

  const handleRenew = async () => {
    setRenewing(true);
    await fetchNui('renewRent');
    setRenewing(false);
  };

  return (
    <PageWrapper title="Renew Rent" subtitle={`Room ${room.number} - Rent Management`}>
      <div className="max-w-md mx-auto">
        {(isExpired || isExpiring) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <GlassCard className={isExpired ? 'border-hotel-danger/30' : 'border-hotel-warning/30'}>
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className={isExpired ? 'text-hotel-danger' : 'text-hotel-warning'} />
                <div>
                  <p className={`text-sm font-medium ${isExpired ? 'text-hotel-danger' : 'text-hotel-warning'}`}>
                    {isExpired ? 'Rent Expired!' : 'Rent Expiring Soon!'}
                  </p>
                  <p className="text-xs text-hotel-muted">
                    {isExpired
                      ? 'Renew immediately to avoid losing your room'
                      : `Only ${daysRemaining} day(s) remaining`}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        <GlassCard>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-hotel-gold/10 flex items-center justify-center mx-auto mb-4">
              <DollarSign size={32} className="text-hotel-gold" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-1">Renew Room {room.number}</h3>
            <p className="text-sm text-hotel-muted">{room.typeLabel}</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm text-hotel-muted">Weekly Rent</span>
              <span className="text-sm font-bold text-hotel-gold">{formatMoney(room.weeklyRent)}</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm text-hotel-muted">Current Expiry</span>
              <span className="text-sm text-white">{formatDate(room.expireDate)}</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm text-hotel-muted">Days Remaining</span>
              <span className={`text-sm font-medium ${
                isExpired ? 'text-hotel-danger' : isExpiring ? 'text-hotel-warning' : 'text-hotel-success'
              }`}>
                {daysRemaining} days
              </span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm text-hotel-muted">Renewal Period</span>
              <span className="text-sm text-white flex items-center gap-1">
                <Clock size={14} />
                7 days
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRenew}
            disabled={renewing}
            className="w-full btn-gold py-3 rounded-xl text-sm disabled:opacity-50"
          >
            {renewing ? 'Processing...' : `Renew for ${formatMoney(room.weeklyRent)}`}
          </motion.button>
        </GlassCard>
      </div>
    </PageWrapper>
  );
};

export default RenewRentPage;
