import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, UserMinus, Clock } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import type { PlayerInfo, RoomDetails, NearbyPlayer, AccessEntry } from '../utils/types';
import { fetchNui, formatDate } from '../utils/nui';

interface AccessPageProps {
  playerInfo: PlayerInfo | null;
}

const AccessPage: React.FC<AccessPageProps> = ({ playerInfo }) => {
  const room = playerInfo?.ownedRoom;
  const [accessList, setAccessList] = useState<AccessEntry[]>([]);
  const [nearbyPlayers, setNearbyPlayers] = useState<NearbyPlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [accessType, setAccessType] = useState<'permanent' | 'temporary'>('permanent');
  const [duration, setDuration] = useState(24);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (room) {
      fetchNui<RoomDetails>('getRoomDetails', { roomNumber: room.number }).then(data => {
        if (data?.accessList) setAccessList(data.accessList);
      });
      fetchNui<NearbyPlayer[]>('getNearbyPlayers').then(setNearbyPlayers);
    }
  }, [room]);

  if (!room) return null;

  const handleAddAccess = async () => {
    if (!selectedPlayer) return;
    setLoading(true);
    const result = await fetchNui<{ success: boolean; message: string }>('addAccess', {
      targetId: selectedPlayer,
      accessType,
      duration: accessType === 'temporary' ? duration : null,
    });
    if (result.success) {
      const data = await fetchNui<RoomDetails>('getRoomDetails', { roomNumber: room.number });
      if (data?.accessList) setAccessList(data.accessList);
      setSelectedPlayer(null);
    }
    setLoading(false);
  };

  const handleRemoveAccess = async (citizenid: string) => {
    setLoading(true);
    const result = await fetchNui<{ success: boolean }>('removeAccess', { citizenid });
    if (result.success) {
      setAccessList(prev => prev.filter(a => a.citizenid !== citizenid));
    }
    setLoading(false);
  };

  return (
    <PageWrapper title="Access Management" subtitle={`Room ${room.number} - Manage who can enter`}>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <UserPlus size={16} className="text-hotel-gold" />
              <h3 className="text-sm font-medium text-hotel-gold">Grant Access</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-hotel-muted block mb-1">Select Player</label>
                <select
                  value={selectedPlayer || ''}
                  onChange={(e) => setSelectedPlayer(Number(e.target.value) || null)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-hotel-gold/40"
                >
                  <option value="">Choose a player...</option>
                  {nearbyPlayers.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-hotel-muted block mb-1">Access Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAccessType('permanent')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      accessType === 'permanent'
                        ? 'bg-hotel-gold/20 text-hotel-gold border border-hotel-gold/30'
                        : 'bg-white/5 text-white/60'
                    }`}
                  >
                    Permanent
                  </button>
                  <button
                    onClick={() => setAccessType('temporary')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      accessType === 'temporary'
                        ? 'bg-hotel-blue/20 text-hotel-blue border border-hotel-blue/30'
                        : 'bg-white/5 text-white/60'
                    }`}
                  >
                    Temporary
                  </button>
                </div>
              </div>

              {accessType === 'temporary' && (
                <div>
                  <label className="text-xs text-hotel-muted block mb-1">Duration (hours)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={1}
                    max={168}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-hotel-gold/40"
                  />
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddAccess}
                disabled={!selectedPlayer || loading}
                className="w-full btn-gold py-2.5 rounded-lg text-sm disabled:opacity-50"
              >
                Grant Access
              </motion.button>
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-hotel-gold" />
              <h3 className="text-sm font-medium text-hotel-gold">
                Authorized Players ({accessList.length}/5)
              </h3>
            </div>

            {accessList.length === 0 ? (
              <p className="text-sm text-hotel-muted text-center py-6">No players have access</p>
            ) : (
              <div className="space-y-2">
                {accessList.map((entry, i) => (
                  <motion.div
                    key={entry.citizenid}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <div>
                      <p className="text-sm text-white">{entry.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          entry.type === 'permanent'
                            ? 'bg-hotel-success/20 text-hotel-success'
                            : 'bg-hotel-blue/20 text-hotel-blue'
                        }`}>
                          {entry.type}
                        </span>
                        {entry.expiresAt && (
                          <span className="text-[10px] text-hotel-muted flex items-center gap-1">
                            <Clock size={10} />
                            {formatDate(entry.expiresAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveAccess(entry.citizenid)}
                      className="w-8 h-8 rounded-lg bg-hotel-danger/10 flex items-center justify-center hover:bg-hotel-danger/20 transition-colors"
                    >
                      <UserMinus size={14} className="text-hotel-danger" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AccessPage;
