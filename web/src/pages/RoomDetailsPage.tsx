import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Unlock, Check, X, DollarSign, Box, Layers } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import type { Page, RoomDetails } from '../utils/types';
import { fetchNui, formatMoney, formatDate, getRoomTypeColor, getDaysRemaining } from '../utils/nui';

interface RoomDetailsPageProps {
  roomNumber: string;
  onNavigate: (page: Page) => void;
}

const RoomDetailsPage: React.FC<RoomDetailsPageProps> = ({ roomNumber, onNavigate }) => {
  const [details, setDetails] = useState<RoomDetails | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchNui<RoomDetails>('getRoomDetails', { roomNumber }).then(setDetails);
  }, [roomNumber]);

  const handlePurchase = async () => {
    setPurchasing(true);
    const result = await fetchNui<{ success: boolean; message: string }>('purchaseRoom', { roomNumber });
    setPurchasing(false);
    if (result.success) {
      fetchNui<RoomDetails>('getRoomDetails', { roomNumber }).then(setDetails);
    }
  };

  if (!details) {
    return (
      <PageWrapper title="Loading..." subtitle="">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-hotel-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={`Room ${details.number}`} subtitle={details.typeLabel}>
      <motion.button
        whileHover={{ x: -4 }}
        onClick={() => onNavigate('rooms')}
        className="flex items-center gap-2 text-hotel-muted hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Rooms
      </motion.button>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <GlassCard>
            <h3 className="text-sm font-medium text-hotel-gold mb-4">Room Information</h3>
            <div className="space-y-3">
              <InfoRow label="Room Number" value={`#${details.number}`} />
              <InfoRow label="Type" value={details.typeLabel} valueClass={getRoomTypeColor(details.type)} />
              <InfoRow label="Floor" value={details.floor === 7 ? 'Penthouse' : `Floor ${details.floor}`} />
              <InfoRow label="Price" value={formatMoney(details.price)} valueClass="text-hotel-gold" />
              <InfoRow label="Weekly Rent" value={formatMoney(details.weeklyRent)} />
              <InfoRow label="Storage" value={`${details.storage / 1000}kg`} />
              <InfoRow label="Slots" value={details.slots.toString()} />
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-medium text-hotel-gold mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-hotel-muted">Availability</span>
                <span className={`text-sm font-medium flex items-center gap-1 ${
                  details.isOccupied ? 'text-hotel-danger' : 'text-hotel-success'
                }`}>
                  {details.isOccupied ? <X size={14} /> : <Check size={14} />}
                  {details.isOccupied ? 'Occupied' : 'Available'}
                </span>
              </div>
              {details.isOccupied && (
                <>
                  <InfoRow label="Owner" value={details.ownerName || 'Unknown'} />
                  {details.expireDate && (
                    <InfoRow
                      label="Days Remaining"
                      value={`${getDaysRemaining(details.expireDate)} days`}
                    />
                  )}
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-hotel-muted">Door</span>
                <span className={`text-sm font-medium flex items-center gap-1 ${
                  details.isLocked ? 'text-hotel-danger' : 'text-hotel-success'
                }`}>
                  {details.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                  {details.isLocked ? 'Locked' : 'Unlocked'}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard className="bg-gradient-to-br from-hotel-gold/5 to-hotel-gold/10">
            <div className="text-center py-4">
              <DollarSign className="text-hotel-gold mx-auto mb-2" size={32} />
              <p className="text-3xl font-bold gold-gradient mb-1">{formatMoney(details.price)}</p>
              <p className="text-sm text-hotel-muted">One-time purchase</p>
              <p className="text-xs text-hotel-muted mt-1">+ {formatMoney(details.weeklyRent)}/week rent</p>
            </div>

            {!details.isOccupied && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full btn-gold py-3 rounded-xl text-sm mt-4 disabled:opacity-50"
              >
                {purchasing ? 'Processing...' : 'Purchase This Room'}
              </motion.button>
            )}

            {details.isOwner && (
              <div className="mt-4 p-3 rounded-lg bg-hotel-success/10 border border-hotel-success/20">
                <p className="text-sm text-hotel-success font-medium text-center">You own this room</p>
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-medium text-hotel-gold mb-4">Features</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <Lock size={14} />, label: 'Digital Lock' },
                { icon: <Box size={14} />, label: 'Private Stash' },
                { icon: <Layers size={14} />, label: 'Wardrobe' },
                { icon: <DollarSign size={14} />, label: 'Room Service' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                  <span className="text-hotel-gold">{feature.icon}</span>
                  <span className="text-xs text-white/70">{feature.label}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
};

const InfoRow: React.FC<{ label: string; value: string; valueClass?: string }> = ({
  label, value, valueClass = 'text-white',
}) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-hotel-muted">{label}</span>
    <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
  </div>
);

export default RoomDetailsPage;
