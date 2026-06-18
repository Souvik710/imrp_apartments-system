import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import WelcomePage from './pages/WelcomePage';
import DashboardPage from './pages/DashboardPage';
import RoomsPage from './pages/RoomsPage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import MyRoomPage from './pages/MyRoomPage';
import ManagePage from './pages/ManagePage';
import SecurityPage from './pages/SecurityPage';
import AccessPage from './pages/AccessPage';
import GaragePage from './pages/GaragePage';
import UtilitiesPage from './pages/UtilitiesPage';
import MailboxPage from './pages/MailboxPage';
import CCTVPage from './pages/CCTVPage';
import VisitorsPage from './pages/VisitorsPage';
import RoomServicePage from './pages/RoomServicePage';
import RenewRentPage from './pages/RenewRentPage';
import TransferPage from './pages/TransferPage';
import SellRoomPage from './pages/SellRoomPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import { useNuiEvent } from './hooks/useNuiEvent';
import { closeNui, fetchNui } from './utils/nui';
import type { Page, PlayerInfo, RoomData, RoomServiceConfig } from './utils/types';

const App: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [hotelName, setHotelName] = useState('Opium Nights Hotel');
  const [serverName, setServerName] = useState('IMMORTAL ROLEPLAY');
  const [roomTypes, setRoomTypes] = useState<Record<string, { price: number; label: string }>>({});
  const [roomService, setRoomService] = useState<RoomServiceConfig | null>(null);
  const [unreadMail, setUnreadMail] = useState(0);

  useNuiEvent('open', (data: {
    playerInfo: PlayerInfo;
    rooms: RoomData[];
    hotelName: string;
    serverName: string;
    roomTypes: Record<string, { price: number; label: string }>;
    roomService: RoomServiceConfig;
  }) => {
    setVisible(true);
    setPlayerInfo(data.playerInfo);
    setRooms(data.rooms);
    setHotelName(data.hotelName);
    setServerName(data.serverName);
    setRoomTypes(data.roomTypes);
    setRoomService(data.roomService);
    setCurrentPage('welcome');

    if (data.playerInfo?.ownedRoom) {
      fetchNui<number>('getUnreadCount', { roomNumber: data.playerInfo.ownedRoom.number }).then(setUnreadMail);
    }
  });

  useNuiEvent('close', () => {
    setVisible(false);
  });

  useNuiEvent('refresh', (data: { playerInfo: PlayerInfo; rooms: RoomData[] }) => {
    setPlayerInfo(data.playerInfo);
    setRooms(data.rooms);
  });

  const handleClose = useCallback(() => {
    setVisible(false);
    closeNui();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <WelcomePage onNavigate={handleNavigate} hasRoom={!!playerInfo?.ownedRoom} />;
      case 'dashboard':
        return <DashboardPage playerInfo={playerInfo} rooms={rooms} onNavigate={handleNavigate} />;
      case 'rooms':
        return <RoomsPage rooms={rooms} onNavigate={handleNavigate} onSelectRoom={setSelectedRoom} />;
      case 'roomDetails':
        return <RoomDetailsPage roomNumber={selectedRoom} onNavigate={handleNavigate} />;
      case 'myRoom':
        return <MyRoomPage playerInfo={playerInfo} onNavigate={handleNavigate} />;
      case 'manage':
        return <ManagePage playerInfo={playerInfo} onNavigate={handleNavigate} />;
      case 'security':
        return <SecurityPage playerInfo={playerInfo} />;
      case 'access':
        return <AccessPage playerInfo={playerInfo} />;
      case 'garage':
        return <GaragePage />;
      case 'utilities':
        return <UtilitiesPage playerInfo={playerInfo} />;
      case 'mailbox':
        return <MailboxPage playerInfo={playerInfo} />;
      case 'cctv':
        return <CCTVPage />;
      case 'visitors':
        return <VisitorsPage playerInfo={playerInfo} />;
      case 'roomService':
        return <RoomServicePage roomService={roomService} />;
      case 'renewRent':
        return <RenewRentPage playerInfo={playerInfo} />;
      case 'transfer':
        return <TransferPage playerInfo={playerInfo} />;
      case 'sellRoom':
        return <SellRoomPage playerInfo={playerInfo} roomTypes={roomTypes} />;
      case 'admin':
        return <AdminPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <WelcomePage onNavigate={handleNavigate} hasRoom={!!playerInfo?.ownedRoom} />;
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-screen h-screen flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-[1100px] h-[650px] glass-dark rounded-2xl overflow-hidden flex shadow-2xl shadow-black/50"
        >
          <Sidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            playerInfo={playerInfo}
            onClose={handleClose}
            unreadMail={unreadMail}
          />

          <div className="flex-1 overflow-hidden">
            {renderPage()}
          </div>
        </motion.div>

        <div className="fixed bottom-3 right-3 text-[9px] text-white/20">
          Opium Nights Hotel &middot; Author Ragna
        </div>
        <div className="fixed top-3 left-3 text-[9px] text-white/20 uppercase tracking-widest">
          IMMORTAL ROLEPLAY
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default App;
