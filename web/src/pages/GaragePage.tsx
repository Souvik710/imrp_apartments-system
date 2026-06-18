import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Fuel, Wrench, Heart } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import type { GarageVehicle } from '../utils/types';
import { fetchNui } from '../utils/nui';

const GaragePage: React.FC = () => {
  const [vehicles, setVehicles] = useState<GarageVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNui<GarageVehicle[]>('getGarageVehicles').then(data => {
      setVehicles(data || []);
      setLoading(false);
    });
  }, []);

  const handleRetrieve = async (plate: string) => {
    await fetchNui('retrieveVehicle', { plate });
  };

  return (
    <PageWrapper title="Hotel Garage" subtitle="Store and retrieve your vehicles">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-hotel-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Car size={48} className="text-hotel-muted mb-4" />
          <p className="text-hotel-muted">No vehicles stored</p>
          <p className="text-xs text-hotel-muted mt-1">Drive to the garage area to store a vehicle</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {vehicles.map((vehicle, i) => (
            <motion.div
              key={vehicle.plate}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-hotel-blue/10 flex items-center justify-center">
                      <Car size={24} className="text-hotel-blue" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{vehicle.vehicle}</p>
                      <p className="text-xs text-hotel-muted">{vehicle.plate}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <Fuel size={14} className="text-hotel-gold mx-auto mb-1" />
                    <p className="text-xs text-white">{Math.round(vehicle.fuel)}%</p>
                    <p className="text-[10px] text-hotel-muted">Fuel</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <Wrench size={14} className="text-hotel-blue mx-auto mb-1" />
                    <p className="text-xs text-white">{Math.round(vehicle.engine / 10)}%</p>
                    <p className="text-[10px] text-hotel-muted">Engine</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <Heart size={14} className="text-hotel-success mx-auto mb-1" />
                    <p className="text-xs text-white">{Math.round(vehicle.body / 10)}%</p>
                    <p className="text-[10px] text-hotel-muted">Body</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRetrieve(vehicle.plate)}
                  className="w-full btn-blue py-2 rounded-lg text-xs"
                >
                  Retrieve Vehicle
                </motion.button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default GaragePage;
