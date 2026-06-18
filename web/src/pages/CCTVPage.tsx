import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, ZoomIn, ZoomOut, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import { fetchNui } from '../utils/nui';

const cameras = [
  'Lobby', 'Reception', 'Elevator', 'Garage', 'Entrance', 'Hallway 1', 'Penthouse Entrance',
];

const CCTVPage: React.FC = () => {
  const [activeCam, setActiveCam] = useState<number | null>(null);
  const [nightVision, setNightVision] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStartCamera = async (index: number) => {
    setLoading(true);
    const result = await fetchNui<{ success: boolean }>('startCCTV', { cameraIndex: index + 1 });
    if (result.success) {
      setActiveCam(index);
    }
    setLoading(false);
  };

  const handleSwitchCamera = async (index: number) => {
    setLoading(true);
    await fetchNui('switchCCTV', { cameraIndex: index + 1 });
    setActiveCam(index);
    setLoading(false);
  };

  const handleStopCamera = async () => {
    await fetchNui('stopCCTV');
    setActiveCam(null);
    setNightVision(false);
  };

  const handleZoom = async (direction: 'in' | 'out') => {
    await fetchNui('cctvZoom', { direction });
  };

  const handleNightVision = async () => {
    const newState = !nightVision;
    setNightVision(newState);
    await fetchNui('cctvNightVision', { enabled: newState });
  };

  const handlePrevCamera = () => {
    if (activeCam === null) return;
    const prev = activeCam === 0 ? cameras.length - 1 : activeCam - 1;
    handleSwitchCamera(prev);
  };

  const handleNextCamera = () => {
    if (activeCam === null) return;
    const next = (activeCam + 1) % cameras.length;
    handleSwitchCamera(next);
  };

  return (
    <PageWrapper title="CCTV System" subtitle="Hotel security camera system">
      {activeCam !== null ? (
        <div>
          <GlassCard className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-hotel-danger animate-pulse" />
                <p className="text-sm font-medium text-white">
                  LIVE - {cameras[activeCam]}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStopCamera}
                className="btn-danger px-4 py-1.5 rounded-lg text-xs"
              >
                Exit CCTV
              </motion.button>
            </div>

            <div className="aspect-video bg-black/50 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
              <div className="absolute inset-0 border border-white/10 rounded-xl" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-white/50 font-mono">REC</span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="text-[10px] text-white/50 font-mono">{cameras[activeCam]}</span>
              </div>
              <Camera size={48} className="text-white/20" />
              {nightVision && (
                <div className="absolute inset-0 bg-green-500/10 rounded-xl" />
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrevCamera}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10"
              >
                <ChevronLeft size={18} className="text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleZoom('in')}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10"
              >
                <ZoomIn size={18} className="text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleZoom('out')}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10"
              >
                <ZoomOut size={18} className="text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNightVision}
                className={`w-10 h-10 rounded-xl glass flex items-center justify-center ${
                  nightVision ? 'bg-green-500/20 border-green-500/30' : 'hover:bg-white/10'
                }`}
              >
                {nightVision ? (
                  <Eye size={18} className="text-green-400" />
                ) : (
                  <EyeOff size={18} className="text-white" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNextCamera}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10"
              >
                <ChevronRight size={18} className="text-white" />
              </motion.button>
            </div>
          </GlassCard>

          <div className="grid grid-cols-7 gap-2">
            {cameras.map((cam, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSwitchCamera(i)}
                className={`p-2 rounded-lg text-[10px] text-center transition-all ${
                  activeCam === i
                    ? 'bg-hotel-gold/20 text-hotel-gold border border-hotel-gold/30'
                    : 'glass text-white/60 hover:text-white'
                }`}
              >
                {cam}
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-3 gap-4">
            {cameras.map((cam, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard hover onClick={() => handleStartCamera(i)}>
                  <div className="aspect-video bg-black/30 rounded-lg flex items-center justify-center mb-3">
                    <Camera size={24} className="text-hotel-muted" />
                  </div>
                  <p className="text-sm text-white font-medium">{cam}</p>
                  <p className="text-[10px] text-hotel-success flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-hotel-success" />
                    Online
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default CCTVPage;
