import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, AlertTriangle, Users } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import type { PlayerInfo, NearbyPlayer } from '../utils/types';
import { fetchNui } from '../utils/nui';

interface TransferPageProps {
  playerInfo: PlayerInfo | null;
}

const TransferPage: React.FC<TransferPageProps> = ({ playerInfo }) => {
  const room = playerInfo?.ownedRoom;
  const [players, setPlayers] = useState<NearbyPlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    fetchNui<NearbyPlayer[]>('getNearbyPlayers').then(data => setPlayers(data || []));
  }, []);

  if (!room) return null;

  const handleTransfer = async () => {
    if (!selectedPlayer) return;
    setTransferring(true);
    await fetchNui('transferRoom', { targetId: selectedPlayer });
    setTransferring(false);
    setConfirming(false);
  };

  const selectedName = players.find(p => p.id === selectedPlayer)?.name || '';

  return (
    <PageWrapper title="Transfer Ownership" subtitle={`Transfer Room ${room.number}`}>
      <div className="max-w-md mx-auto">
        <GlassCard className="mb-4 border-hotel-warning/20">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-hotel-warning" />
            <div>
              <p className="text-sm font-medium text-hotel-warning">Warning</p>
              <p className="text-xs text-hotel-muted">
                This action is irreversible. You will lose ownership of Room {room.number}.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-hotel-gold" />
            <h3 className="text-sm font-medium text-hotel-gold">Select New Owner</h3>
          </div>

          <select
            value={selectedPlayer || ''}
            onChange={(e) => {
              setSelectedPlayer(Number(e.target.value) || null);
              setConfirming(false);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-hotel-gold/40 mb-4"
          >
            <option value="">Choose a player...</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
            ))}
          </select>

          {!confirming ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setConfirming(true)}
              disabled={!selectedPlayer}
              className="w-full btn-blue py-3 rounded-xl text-sm disabled:opacity-50"
            >
              Transfer Room
            </motion.button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-hotel-warning text-center">
                Transfer Room {room.number} to {selectedName}?
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
                  onClick={handleTransfer}
                  disabled={transferring}
                  className="btn-danger py-2.5 rounded-lg text-sm disabled:opacity-50"
                >
                  {transferring ? 'Transferring...' : 'Confirm'}
                </motion.button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </PageWrapper>
  );
};

export default TransferPage;
