import React from 'react';
import { motion } from 'framer-motion';
import {
  Home, Building2, Key, Shield, Car, Zap, Mail, Camera,
  Users, UtensilsCrossed, DollarSign, ArrowRightLeft, Tag,
  Settings, LayoutDashboard, LogOut,
} from 'lucide-react';
import type { Page, PlayerInfo } from '../utils/types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  playerInfo: PlayerInfo | null;
  onClose: () => void;
  unreadMail: number;
}

interface NavItem {
  page: Page;
  label: string;
  icon: React.ReactNode;
  requiresRoom?: boolean;
  adminOnly?: boolean;
  badge?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, playerInfo, onClose, unreadMail }) => {
  const hasRoom = !!playerInfo?.ownedRoom;
  const isAdmin = playerInfo?.isAdmin ?? false;

  const navItems: NavItem[] = [
    { page: 'welcome', label: 'Welcome', icon: <Home size={18} /> },
    { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { page: 'rooms', label: 'Browse Rooms', icon: <Building2 size={18} /> },
    { page: 'myRoom', label: 'My Room', icon: <Key size={18} />, requiresRoom: true },
    { page: 'manage', label: 'Room Management', icon: <Settings size={18} />, requiresRoom: true },
    { page: 'access', label: 'Access Management', icon: <Users size={18} />, requiresRoom: true },
    { page: 'security', label: 'Security', icon: <Shield size={18} />, requiresRoom: true },
    { page: 'garage', label: 'Garage', icon: <Car size={18} />, requiresRoom: true },
    { page: 'utilities', label: 'Utilities', icon: <Zap size={18} />, requiresRoom: true },
    { page: 'mailbox', label: 'Mailbox', icon: <Mail size={18} />, requiresRoom: true, badge: unreadMail },
    { page: 'cctv', label: 'CCTV', icon: <Camera size={18} />, requiresRoom: true },
    { page: 'visitors', label: 'Visitors', icon: <Users size={18} />, requiresRoom: true },
    { page: 'roomService', label: 'Room Service', icon: <UtensilsCrossed size={18} />, requiresRoom: true },
    { page: 'renewRent', label: 'Renew Rent', icon: <DollarSign size={18} />, requiresRoom: true },
    { page: 'transfer', label: 'Transfer Ownership', icon: <ArrowRightLeft size={18} />, requiresRoom: true },
    { page: 'sellRoom', label: 'Sell Room', icon: <Tag size={18} />, requiresRoom: true },
    { page: 'admin', label: 'Admin Panel', icon: <LayoutDashboard size={18} />, adminOnly: true },
  ];

  const filteredItems = navItems.filter(item => {
    if (item.requiresRoom && !hasRoom) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-[260px] h-full glass-dark flex flex-col"
    >
      <div className="p-4 border-b border-hotel-gold/20">
        <p className="text-[10px] uppercase tracking-[3px] text-hotel-gold/60">
          IMMORTAL ROLEPLAY
        </p>
        <h1 className="text-lg font-display font-bold gold-gradient mt-1">
          Opium Nights
        </h1>
        <p className="text-[10px] text-hotel-muted mt-0.5">Premium Hotel</p>
      </div>

      {playerInfo && (
        <div className="px-4 py-3 border-b border-hotel-gold/10">
          <p className="text-xs text-hotel-muted">Welcome,</p>
          <p className="text-sm font-medium text-white/90">{playerInfo.name}</p>
          {hasRoom && (
            <p className="text-[10px] text-hotel-gold mt-0.5">
              Room {playerInfo.ownedRoom!.number}
            </p>
          )}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {filteredItems.map((item) => (
          <motion.button
            key={item.page}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(item.page)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all mb-0.5 relative ${
              currentPage === item.page
                ? 'bg-hotel-gold/15 text-hotel-gold border border-hotel-gold/20'
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute right-3 bg-hotel-danger text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </motion.button>
        ))}
      </nav>

      <div className="p-3 border-t border-hotel-gold/10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-hotel-danger/70 hover:text-hotel-danger hover:bg-hotel-danger/10 transition-all"
        >
          <LogOut size={16} />
          <span>Close</span>
        </motion.button>
      </div>

      <div className="px-4 py-2 border-t border-hotel-gold/10">
        <p className="text-[9px] text-hotel-muted/50 text-right">
          Opium Nights Hotel &middot; Author Ragna
        </p>
      </div>
    </motion.div>
  );
};

export default Sidebar;
