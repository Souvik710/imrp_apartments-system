import React from 'react';
import { Users, UserCheck, UserX, Ban } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import type { PlayerInfo } from '../utils/types';

interface VisitorsPageProps {
  playerInfo: PlayerInfo | null;
}

const VisitorsPage: React.FC<VisitorsPageProps> = ({ playerInfo }) => {
  const room = playerInfo?.ownedRoom;

  if (!room) return null;

  return (
    <PageWrapper title="Visitors" subtitle={`Room ${room.number} - Visitor Management`}>
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-hotel-gold" />
          <h3 className="text-sm font-medium text-hotel-gold">Visitor Requests</h3>
        </div>
        <p className="text-sm text-hotel-muted text-center py-8">
          Visitor requests appear here when someone rings your doorbell.
        </p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-lg bg-white/5 text-center">
            <UserCheck size={20} className="text-hotel-success mx-auto mb-1" />
            <p className="text-xs text-hotel-muted">Accepted</p>
            <p className="text-sm font-bold text-white">0</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 text-center">
            <UserX size={20} className="text-hotel-danger mx-auto mb-1" />
            <p className="text-xs text-hotel-muted">Rejected</p>
            <p className="text-sm font-bold text-white">0</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 text-center">
            <Ban size={20} className="text-hotel-warning mx-auto mb-1" />
            <p className="text-xs text-hotel-muted">Blocked</p>
            <p className="text-sm font-bold text-white">0</p>
          </div>
        </div>
      </GlassCard>
    </PageWrapper>
  );
};

export default VisitorsPage;
