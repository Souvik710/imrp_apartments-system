import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, RotateCcw, DoorOpen, Building2, Users, Check } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import type { AdminData, AdminRoom } from '../utils/types';
import { fetchNui } from '../utils/nui';

const AdminPage: React.FC = () => {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'occupied' | 'vacant'>('all');

  useEffect(() => {
    fetchNui<AdminData>('getAdminData').then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const handleReset = async (roomNumber: string) => {
    const result = await fetchNui<{ success: boolean }>('adminResetRoom', { roomNumber });
    if (result.success) {
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          rooms: prev.rooms.map(r =>
            r.number === roomNumber ? { ...r, owner: undefined, ownerCid: undefined, expireDate: undefined } : r
          ),
          occupied: prev.occupied - 1,
          vacant: prev.vacant + 1,
        };
      });
    }
  };

  const handleForceEnter = async (roomNumber: string) => {
    await fetchNui('adminForceEnter', { roomNumber });
  };

  if (loading || !data) {
    return (
      <PageWrapper title="Admin Panel" subtitle="">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-hotel-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  const filteredRooms = data.rooms.filter(r => {
    if (filter === 'occupied') return !!r.owner;
    if (filter === 'vacant') return !r.owner;
    return true;
  });

  return (
    <PageWrapper title="Admin Panel" subtitle="Hotel administration dashboard">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <GlassCard>
          <div className="flex items-center gap-3">
            <Building2 size={20} className="text-hotel-blue" />
            <div>
              <p className="text-2xl font-bold text-white">{data.total}</p>
              <p className="text-xs text-hotel-muted">Total Rooms</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <Users size={20} className="text-hotel-gold" />
            <div>
              <p className="text-2xl font-bold text-white">{data.occupied}</p>
              <p className="text-xs text-hotel-muted">Occupied</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <Check size={20} className="text-hotel-success" />
            <div>
              <p className="text-2xl font-bold text-white">{data.vacant}</p>
              <p className="text-xs text-hotel-muted">Vacant</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'occupied', 'vacant'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? 'bg-hotel-gold/20 text-hotel-gold border border-hotel-gold/30'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredRooms.map((room, i) => (
          <motion.div
            key={room.number}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.5) }}
            className="flex items-center justify-between p-3 glass rounded-lg"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-white w-16">#{room.number}</span>
              <span className="text-xs text-hotel-muted capitalize w-20">{room.type}</span>
              <span className="text-xs text-hotel-muted w-16">Floor {room.floor}</span>
              <span className={`text-xs w-32 ${room.owner ? 'text-white/70' : 'text-hotel-success'}`}>
                {room.owner || 'Vacant'}
              </span>
            </div>
            <div className="flex gap-2">
              {room.owner && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleForceEnter(room.number)}
                    className="px-3 py-1.5 rounded-lg text-[10px] bg-hotel-blue/10 text-hotel-blue hover:bg-hotel-blue/20 transition-colors"
                  >
                    <DoorOpen size={12} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReset(room.number)}
                    className="px-3 py-1.5 rounded-lg text-[10px] bg-hotel-danger/10 text-hotel-danger hover:bg-hotel-danger/20 transition-colors"
                  >
                    <RotateCcw size={12} />
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
};

export default AdminPage;
