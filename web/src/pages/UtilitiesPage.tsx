import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Droplets, Wifi, Check, X, DollarSign } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import type { PlayerInfo, UtilityBill } from '../utils/types';
import { fetchNui, formatMoney, formatDate } from '../utils/nui';

interface UtilitiesPageProps {
  playerInfo: PlayerInfo | null;
}

const utilityIcons: Record<string, React.ReactNode> = {
  electricity: <Zap size={20} />,
  water: <Droplets size={20} />,
  internet: <Wifi size={20} />,
};

const utilityColors: Record<string, string> = {
  electricity: 'text-yellow-400',
  water: 'text-blue-400',
  internet: 'text-green-400',
};

const UtilitiesPage: React.FC<UtilitiesPageProps> = ({ playerInfo }) => {
  const room = playerInfo?.ownedRoom;
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (room) {
      fetchNui<UtilityBill[]>('getUtilities', { roomNumber: room.number }).then(data => {
        setBills(data || []);
        setLoading(false);
      });
    }
  }, [room]);

  if (!room) return null;

  const handlePay = async (utilityId: number) => {
    const result = await fetchNui<{ success: boolean }>('payUtility', { utilityId });
    if (result.success) {
      setBills(prev => prev.map(b => b.id === utilityId ? { ...b, is_paid: 1, is_active: 1 } : b));
    }
  };

  const unpaidCount = bills.filter(b => b.is_paid === 0).length;
  const totalUnpaid = bills.filter(b => b.is_paid === 0).reduce((sum, b) => sum + b.amount, 0);

  return (
    <PageWrapper title="Utilities" subtitle={`Room ${room.number} - Manage your services`}>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(['electricity', 'water', 'internet'] as const).map((type, i) => {
          const latestBill = bills.find(b => b.utility_type === type);
          const isActive = latestBill ? latestBill.is_active === 1 : true;

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard>
                <div className="flex items-center gap-3 mb-3">
                  <div className={utilityColors[type]}>{utilityIcons[type]}</div>
                  <div>
                    <p className="text-sm font-medium text-white capitalize">{type}</p>
                    <p className={`text-xs ${isActive ? 'text-hotel-success' : 'text-hotel-danger'}`}>
                      {isActive ? 'Active' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-hotel-success' : 'bg-hotel-danger'} animate-pulse`} />
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {unpaidCount > 0 && (
        <GlassCard className="mb-6 border-hotel-warning/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-hotel-warning" />
              <p className="text-sm text-hotel-warning">{unpaidCount} unpaid bill(s)</p>
            </div>
            <p className="text-sm font-bold text-hotel-warning">{formatMoney(totalUnpaid)}</p>
          </div>
        </GlassCard>
      )}

      <h3 className="text-sm font-medium text-hotel-gold mb-3">Bill History</h3>
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-hotel-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bills.length === 0 ? (
        <p className="text-sm text-hotel-muted text-center py-8">No utility bills yet</p>
      ) : (
        <div className="space-y-2">
          {bills.map((bill, i) => (
            <motion.div
              key={bill.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 glass rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={utilityColors[bill.utility_type]}>
                  {utilityIcons[bill.utility_type]}
                </div>
                <div>
                  <p className="text-sm text-white capitalize">{bill.utility_type}</p>
                  <p className="text-[10px] text-hotel-muted">Due: {formatDate(bill.due_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-white">{formatMoney(bill.amount)}</p>
                {bill.is_paid === 1 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-hotel-success/20 text-hotel-success flex items-center gap-1">
                    <Check size={10} /> Paid
                  </span>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePay(bill.id)}
                    className="btn-gold px-3 py-1 rounded-lg text-[10px]"
                  >
                    Pay Now
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default UtilitiesPage;
