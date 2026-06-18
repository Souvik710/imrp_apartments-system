import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Unlock, Bell, BellOff } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import type { PlayerInfo } from '../utils/types';
import { fetchNui } from '../utils/nui';

interface SecurityPageProps {
  playerInfo: PlayerInfo | null;
}

const SecurityPage: React.FC<SecurityPageProps> = ({ playerInfo }) => {
  const room = playerInfo?.ownedRoom;
  const [isLocked, setIsLocked] = useState(room?.isLocked ?? true);
  const [alarmEnabled, setAlarmEnabled] = useState(room?.alarmEnabled ?? false);
  const [loading, setLoading] = useState(false);

  if (!room) return null;

  const handleToggleLock = async () => {
    setLoading(true);
    const result = await fetchNui<{ success: boolean; locked: boolean }>('toggleLock', { roomNumber: room.number });
    if (result.success) {
      setIsLocked(result.locked);
    }
    setLoading(false);
  };

  const handleToggleAlarm = async () => {
    setLoading(true);
    const result = await fetchNui<{ success: boolean; enabled: boolean }>('toggleAlarm', { roomNumber: room.number });
    if (result.success) {
      setAlarmEnabled(result.enabled);
    }
    setLoading(false);
  };

  return (
    <PageWrapper title="Security" subtitle={`Room ${room.number} - Security Controls`}>
      <div className="grid grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isLocked ? 'bg-hotel-danger/15' : 'bg-hotel-success/15'
            }`}>
              {isLocked ? (
                <Lock size={24} className="text-hotel-danger" />
              ) : (
                <Unlock size={24} className="text-hotel-success" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-white">Door Lock</p>
              <p className={`text-sm ${isLocked ? 'text-hotel-danger' : 'text-hotel-success'}`}>
                {isLocked ? 'Locked' : 'Unlocked'}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleToggleLock}
            disabled={loading}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
              isLocked ? 'btn-blue' : 'btn-danger'
            } disabled:opacity-50`}
          >
            {isLocked ? 'Unlock Door' : 'Lock Door'}
          </motion.button>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              alarmEnabled ? 'bg-hotel-success/15' : 'bg-hotel-muted/15'
            }`}>
              {alarmEnabled ? (
                <Bell size={24} className="text-hotel-success" />
              ) : (
                <BellOff size={24} className="text-hotel-muted" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-white">Alarm System</p>
              <p className={`text-sm ${alarmEnabled ? 'text-hotel-success' : 'text-hotel-muted'}`}>
                {alarmEnabled ? 'Active' : 'Disabled'}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleToggleAlarm}
            disabled={loading}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
              alarmEnabled ? 'btn-danger' : 'btn-blue'
            } disabled:opacity-50`}
          >
            {alarmEnabled ? 'Disable Alarm' : 'Enable Alarm'}
          </motion.button>
        </GlassCard>
      </div>

      <GlassCard className="mt-6">
        <h3 className="text-sm font-medium text-hotel-gold mb-4">Security Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-white/5">
            <Shield size={20} className="text-hotel-gold mx-auto mb-1" />
            <p className="text-xs text-white/70">Room Protected</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/5">
            <p className="text-lg font-bold text-white">{isLocked ? '1' : '0'}</p>
            <p className="text-xs text-hotel-muted">Active Locks</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/5">
            <p className="text-lg font-bold text-white">{alarmEnabled ? 'ON' : 'OFF'}</p>
            <p className="text-xs text-hotel-muted">Alarm Status</p>
          </div>
        </div>
      </GlassCard>
    </PageWrapper>
  );
};

export default SecurityPage;
