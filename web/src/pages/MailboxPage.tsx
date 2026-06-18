import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MailOpen, Package, Bell, ChevronRight } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import GlassCard from '../components/GlassCard';
import type { PlayerInfo, MailItem } from '../utils/types';
import { fetchNui, formatDate } from '../utils/nui';

interface MailboxPageProps {
  playerInfo: PlayerInfo | null;
}

const mailTypeIcons: Record<string, React.ReactNode> = {
  letter: <Mail size={16} />,
  package: <Package size={16} />,
  notification: <Bell size={16} />,
};

const MailboxPage: React.FC<MailboxPageProps> = ({ playerInfo }) => {
  const room = playerInfo?.ownedRoom;
  const [mails, setMails] = useState<MailItem[]>([]);
  const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (room) {
      fetchNui<MailItem[]>('getMail', { roomNumber: room.number }).then(data => {
        setMails(data || []);
        setLoading(false);
      });
    }
  }, [room]);

  if (!room) return null;

  const handleReadMail = async (mail: MailItem) => {
    setSelectedMail(mail);
    if (mail.is_read === 0) {
      await fetchNui('readMail', { mailId: mail.id });
      setMails(prev => prev.map(m => m.id === mail.id ? { ...m, is_read: 1 } : m));
    }
  };

  const unreadCount = mails.filter(m => m.is_read === 0).length;

  return (
    <PageWrapper title="Mailbox" subtitle={`Room ${room.number} - ${unreadCount} unread`}>
      <div className="grid grid-cols-5 gap-4 h-[calc(100%-2rem)]">
        <div className="col-span-2 overflow-y-auto space-y-1">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-hotel-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : mails.length === 0 ? (
            <div className="text-center py-12">
              <Mail size={32} className="text-hotel-muted mx-auto mb-2" />
              <p className="text-sm text-hotel-muted">No mail</p>
            </div>
          ) : (
            mails.map((mail, i) => (
              <motion.div
                key={mail.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleReadMail(mail)}
                className={`p-3 rounded-lg cursor-pointer transition-all flex items-start gap-3 ${
                  selectedMail?.id === mail.id
                    ? 'glass border-hotel-gold/30'
                    : 'hover:bg-white/5'
                } ${mail.is_read === 0 ? 'border-l-2 border-l-hotel-gold' : ''}`}
              >
                <div className={`mt-0.5 ${mail.is_read === 0 ? 'text-hotel-gold' : 'text-hotel-muted'}`}>
                  {mail.is_read === 0 ? <Mail size={16} /> : <MailOpen size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs truncate ${mail.is_read === 0 ? 'text-white font-medium' : 'text-white/70'}`}>
                    {mail.subject}
                  </p>
                  <p className="text-[10px] text-hotel-muted truncate">{mail.sender_name}</p>
                  <p className="text-[10px] text-hotel-muted/60 mt-0.5">{formatDate(mail.created_at)}</p>
                </div>
                <ChevronRight size={14} className="text-hotel-muted mt-1" />
              </motion.div>
            ))
          )}
        </div>

        <div className="col-span-3">
          <AnimatePresence mode="wait">
            {selectedMail ? (
              <motion.div
                key={selectedMail.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GlassCard className="h-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-hotel-gold">{mailTypeIcons[selectedMail.mail_type]}</span>
                    <span className="text-[10px] text-hotel-muted capitalize px-2 py-0.5 rounded-full bg-white/5">
                      {selectedMail.mail_type}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">{selectedMail.subject}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-xs text-hotel-muted">From: {selectedMail.sender_name}</p>
                    <span className="text-hotel-muted">·</span>
                    <p className="text-xs text-hotel-muted">{formatDate(selectedMail.created_at)}</p>
                  </div>
                  <div className="h-[1px] bg-white/10 mb-4" />
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                    {selectedMail.body}
                  </p>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <MailOpen size={32} className="text-hotel-muted mx-auto mb-2" />
                  <p className="text-sm text-hotel-muted">Select a message to read</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  );
};

export default MailboxPage;
