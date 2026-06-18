import React from 'react';
import { Settings, Info } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';

const SettingsPage: React.FC = () => {
  return (
    <PageWrapper title="Settings" subtitle="Hotel system information">
      <div className="max-w-md mx-auto space-y-4">
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Info size={16} className="text-hotel-gold" />
            <h3 className="text-sm font-medium text-hotel-gold">About</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-hotel-muted">Hotel</span>
              <span className="text-sm text-white">Opium Nights Hotel</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-hotel-muted">Server</span>
              <span className="text-sm text-white">IMMORTAL ROLEPLAY</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-hotel-muted">Author</span>
              <span className="text-sm text-white">Ragna</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-hotel-muted">Version</span>
              <span className="text-sm text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-hotel-muted">Framework</span>
              <span className="text-sm text-white">QBX Core</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Settings size={16} className="text-hotel-gold" />
            <h3 className="text-sm font-medium text-hotel-gold">Keybinds</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between p-2 rounded-lg bg-white/5">
              <span className="text-xs text-hotel-muted">Open Hotel UI</span>
              <kbd className="text-xs text-white bg-white/10 px-2 py-0.5 rounded">Visit Reception</kbd>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-white/5">
              <span className="text-xs text-hotel-muted">Close UI</span>
              <kbd className="text-xs text-white bg-white/10 px-2 py-0.5 rounded">ESC</kbd>
            </div>
          </div>
        </GlassCard>
      </div>
    </PageWrapper>
  );
};

export default SettingsPage;
