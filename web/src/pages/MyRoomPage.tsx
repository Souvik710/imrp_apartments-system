import React from 'react';
import { motion } from 'framer-motion';
import { Key, Lock, Unlock, Clock, DollarSign, Building2 } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import type { Page, PlayerInfo } from '../utils/types';
import { formatMoney, formatDate, getDaysRemaining, getRoomTypeColor } from '../utils/nui';

interface MyRoomPageProps {
  playerInfo: PlayerInfo | null;
  onNavigate: (page: Page) => void;
}

const MyRoomPage: React.FC<MyRoomPageProps> = ({ playerInfo, onNavigate }) => {
  const room = playerInfo?.ownedRoom;

  if (!room) {
    return (
      <PageWrapper title="My Room" subtitle="You don't own a room yet">
        <div className="flex flex-col items-center justify-center h-64">
          <Building2 size={48} className="text-hotel-muted mb-4" />
          <p className="text-hotel-muted mb-4">You haven't purchased a room yet.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('rooms')}
            className="btn-gold px-6 py-2 rounded-xl text-sm"
          >
            Browse Available Rooms
          </motion.button>
        </div>
      </PageWrapper>
    );
  }

  const daysRemaining = getDaysRemaining(room.expireDate);
  const isExpiring = daysRemaining <= 2;

  return (
    <PageWrapper title={`Room ${room.number}`} subtitle={room.typeLabel}>
      <div className="grid grid-cols-2 gap-6">
        <GlassCard className="shimmer col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-hotel-gold/10 flex items-center justify-center">
                <Key className="text-hotel-gold" size={28} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">Room {room.number}</p>
                <p className={`text-sm ${getRoomTypeColor(room.type)}`}>{room.typeLabel}</p>
                <p className="text-xs text-hotel-muted mt-1">Floor {room.floor === 7 ? 'Penthouse' : room.floor}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                {room.isLocked ? (
                  <Lock size={16} className="text-hotel-danger" />
                ) : (
                  <Unlock size={16} className="text-hotel-success" />
                )}
                <span className="text-sm text-white/70">{room.isLocked ? 'Locked' : 'Unlocked'}</span>
              </div>
              <p className="text-xs text-hotel-muted mt-1">Owner: {room.ownerName}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-hotel-gold" />
            <h3 className="text-sm font-medium text-hotel-gold">Rent Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-hotel-muted">Days Remaining</span>
              <span className={`text-sm font-bold ${isExpiring ? 'text-hotel-danger' : 'text-hotel-success'}`}>
                {daysRemaining} days
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (daysRemaining / 7) * 100)}%` }}
                className={`h-full rounded-full ${isExpiring ? 'bg-hotel-danger' : 'bg-hotel-success'}`}
              />
            </div>
            <div className="flex justify-between text-xs text-hotel-muted">
              <span>Purchased: {formatDate(room.purchaseDate)}</span>
              <span>Expires: {formatDate(room.expireDate)}</span>
            </div>
            {isExpiring && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('renewRent')}
                className="w-full btn-gold py-2 rounded-lg text-xs mt-2"
              >
                Renew Now - {formatMoney(room.weeklyRent)}
              </motion.button>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={16} className="text-hotel-gold" />
            <h3 className="text-sm font-medium text-hotel-gold">Financial</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-hotel-muted">Weekly Rent</span>
              <span className="text-sm font-medium text-hotel-gold">{formatMoney(room.weeklyRent)}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-6">
        {[
          { page: 'manage' as Page, label: 'Manage', icon: '🏨' },
          { page: 'security' as Page, label: 'Security', icon: '🔒' },
          { page: 'access' as Page, label: 'Access', icon: '👥' },
          { page: 'garage' as Page, label: 'Garage', icon: '🚗' },
          { page: 'utilities' as Page, label: 'Utilities', icon: '⚡' },
          { page: 'mailbox' as Page, label: 'Mailbox', icon: '📬' },
          { page: 'roomService' as Page, label: 'Room Service', icon: '🍽️' },
          { page: 'cctv' as Page, label: 'CCTV', icon: '📹' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          >
            <GlassCard hover onClick={() => onNavigate(item.page)}>
              <div className="text-center">
                <p className="text-xl mb-1">{item.icon}</p>
                <p className="text-xs text-white/70">{item.label}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
};

export default MyRoomPage;
