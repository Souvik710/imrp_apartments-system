export interface RoomData {
  number: string;
  type: string;
  typeLabel: string;
  floor: number;
  price: number;
  weeklyRent: number;
  isOccupied: boolean;
  ownerName?: string;
  isLocked: boolean;
}

export interface RoomDetails extends RoomData {
  storage: number;
  slots: number;
  owner?: string;
  purchaseDate?: string;
  expireDate?: string;
  alarmEnabled: boolean;
  isOwner: boolean;
  hasAccess: boolean;
  accessList: AccessEntry[];
}

export interface AccessEntry {
  citizenid: string;
  name: string;
  type: 'permanent' | 'temporary';
  expiresAt?: string;
}

export interface PlayerInfo {
  citizenid: string;
  name: string;
  ownedRoom: OwnedRoomData | null;
  isAdmin: boolean;
}

export interface OwnedRoomData {
  number: string;
  type: string;
  typeLabel: string;
  floor: number;
  ownerName: string;
  purchaseDate: string;
  expireDate: string;
  isLocked: boolean;
  alarmEnabled: boolean;
  weeklyRent: number;
}

export interface RoomTypeConfig {
  label: string;
  price: number;
  weeklyRent: number;
  storageWeight: number;
  storageSlots: number;
  icon: string;
}

export interface MailItem {
  id: number;
  room_number: string;
  sender_name: string;
  mail_type: 'letter' | 'package' | 'notification';
  subject: string;
  body: string;
  is_read: number;
  created_at: string;
}

export interface UtilityBill {
  id: number;
  room_number: string;
  utility_type: 'electricity' | 'water' | 'internet';
  amount: number;
  is_paid: number;
  is_active: number;
  due_date: string;
  paid_date?: string;
  created_at: string;
}

export interface GarageVehicle {
  id: number;
  room_number: string;
  plate: string;
  vehicle: string;
  fuel: number;
  engine: number;
  body: number;
}

export interface NearbyPlayer {
  id: number;
  name: string;
  citizenid: string;
}

export interface RoomServiceItem {
  item: string;
  label: string;
  price: number;
  deliveryTime: number;
}

export interface RoomServiceConfig {
  food: RoomServiceItem[];
  drinks: RoomServiceItem[];
  supplies: RoomServiceItem[];
}

export interface AdminData {
  rooms: AdminRoom[];
  occupied: number;
  vacant: number;
  total: number;
}

export interface AdminRoom {
  number: string;
  type: string;
  floor: number;
  owner?: string;
  ownerCid?: string;
  isLocked: boolean;
  expireDate?: string;
}

export interface CCTVCamera {
  label: string;
  coords: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

export type Page =
  | 'welcome'
  | 'dashboard'
  | 'rooms'
  | 'roomDetails'
  | 'myRoom'
  | 'manage'
  | 'access'
  | 'garage'
  | 'utilities'
  | 'mailbox'
  | 'cctv'
  | 'security'
  | 'visitors'
  | 'roomService'
  | 'renewRent'
  | 'transfer'
  | 'sellRoom'
  | 'admin'
  | 'settings';
