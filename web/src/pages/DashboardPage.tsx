import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Key, DollarSign, Shield, Car } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import type { Page, PlayerInfo, RoomData } from '../utils/types';
import { formatMoney, getDaysRemaining } from '../utils/nui';

interface DashboardPageProps {
  playerInfo: PlayerInfo | null;
  rooms: RoomData[];
  onNavigate: (page: Page) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ playerInfo, rooms, onNavigate }) => {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.isOccupied).length;
  const vacantRooms = totalRooms - occupiedRooms;
  const ownedRoom = playerInfo?.ownedRoom;

  const stats = [
    { label: 'Total Rooms', value: totalRooms.toString(), icon: <Building2 size={20} />, color: 'text-hotel-blue' },
    { label: 'Occupied', value: occupiedRooms.toString(), icon: <Key size={20} />, color: 'text-hotel-gold' },
    { label: 'Available', value: vacantRooms.toString(), icon: <Building2 size={20} />, color: 'text-hotel-success' },
    { label: 'Occupancy', value: `${Math.round((occupiedRooms / totalRooms) * 100)}%`, icon: <Users size={20} />, color: 'text-hotel-accent' },
  ];

  return (
    <PageWrapper title="Hotel Dashboard" subtitle="Overview of Opium Nights Hotel">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className={`${stat.color}`}>{stat.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-hotel-muted">{stat.label}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {ownedRoom && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h3 className="text-sm font-medium text-hotel-gold mb-3">Your Room</h3>
          <GlassCard className="shimmer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-hotel-gold/10 flex items-center justify-center">
                  <Key className="text-hotel-gold" size={24} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">Room {ownedRoom.number}</p>
                  <p className="text-sm text-hotel-muted">{ownedRoom.typeLabel}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-hotel-gold">{getDaysRemaining(ownedRoom.expireDate)} days remaining</p>
                <p className="text-xs text-hotel-muted">Weekly Rent: {formatMoney(ownedRoom.weeklyRent)}</p>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('myRoom')}
                  className="btn-gold px-4 py-2 rounded-lg text-xs"
                >
                  View Room
                </motion.button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { page: 'rooms' as Page, label: 'Browse Rooms', icon: <Building2 size={20} />, desc: 'Find your perfect room' },
          { page: 'security' as Page, label: 'Security', icon: <Shield size={20} />, desc: 'Manage door locks & alarms' },
          { page: 'garage' as Page, label: 'Garage', icon: <Car size={20} />, desc: 'Store & retrieve vehicles' },
        ].map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <GlassCard hover onClick={() => onNavigate(action.page)}>
              <div className="text-hotel-gold mb-2">{action.icon}</div>
              <p className="text-sm font-medium text-white">{action.label}</p>
              <p className="text-xs text-hotel-muted mt-1">{action.desc}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;
