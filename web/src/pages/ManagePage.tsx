import React from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Lock, Users, Car, Zap, Mail, Camera, Shield,
  UtensilsCrossed, DollarSign, ArrowRightLeft, Tag,
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import type { Page, PlayerInfo } from '../utils/types';

interface ManagePageProps {
  playerInfo: PlayerInfo | null;
  onNavigate: (page: Page) => void;
}

const ManagePage: React.FC<ManagePageProps> = ({ playerInfo, onNavigate }) => {
  const room = playerInfo?.ownedRoom;

  if (!room) return null;

  const actions = [
    { page: 'security' as Page, label: 'Security', icon: <Shield size={20} />, desc: 'Door locks & alarms', color: 'text-red-400' },
    { page: 'access' as Page, label: 'Access', icon: <Users size={20} />, desc: 'Manage who can enter', color: 'text-blue-400' },
    { page: 'garage' as Page, label: 'Garage', icon: <Car size={20} />, desc: 'Store & retrieve vehicles', color: 'text-green-400' },
    { page: 'utilities' as Page, label: 'Utilities', icon: <Zap size={20} />, desc: 'Electricity, water, internet', color: 'text-yellow-400' },
    { page: 'mailbox' as Page, label: 'Mailbox', icon: <Mail size={20} />, desc: 'Read your messages', color: 'text-purple-400' },
    { page: 'cctv' as Page, label: 'CCTV', icon: <Camera size={20} />, desc: 'Security cameras', color: 'text-cyan-400' },
    { page: 'roomService' as Page, label: 'Room Service', icon: <UtensilsCrossed size={20} />, desc: 'Order food & drinks', color: 'text-orange-400' },
    { page: 'renewRent' as Page, label: 'Renew Rent', icon: <DollarSign size={20} />, desc: 'Extend your stay', color: 'text-hotel-gold' },
    { page: 'transfer' as Page, label: 'Transfer', icon: <ArrowRightLeft size={20} />, desc: 'Transfer ownership', color: 'text-indigo-400' },
    { page: 'sellRoom' as Page, label: 'Sell Room', icon: <Tag size={20} />, desc: 'Sell with 70% refund', color: 'text-hotel-danger' },
  ];

  return (
    <PageWrapper title="Room Management" subtitle={`Room ${room.number} - ${room.typeLabel}`}>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard hover onClick={() => onNavigate(action.page)}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${action.color}`}>
                  {action.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{action.label}</p>
                  <p className="text-xs text-hotel-muted">{action.desc}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
};

export default ManagePage;
