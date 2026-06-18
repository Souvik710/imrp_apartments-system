# imrp_opiumnights

Premium Hotel Ownership System for the Opium Nights Hotel MLO.

**Author:** Ragna  
**Server:** IMMORTAL ROLEPLAY  
**Framework:** QBX Core (qbx_core)

## Features

- **75 Rooms** across 6 floors + 3 penthouses
- **5 Room Types:** Standard, Deluxe, Executive, Luxury, Penthouse
- **Room Ownership:** Purchase, sell, transfer, share access
- **Digital Key System:** ox_inventory key cards with metadata
- **Door Locks:** State bag synced lock/unlock with server validation
- **Private Stash:** Per-room ox_inventory stash
- **Wardrobe:** illenium-appearance outfit management
- **Hotel Garage:** Store/retrieve vehicles with fuel, engine, body tracking
- **Utility System:** Weekly electricity, water, internet bills
- **Mailbox:** Letters, packages, and notifications
- **CCTV:** 7 security cameras with zoom and night vision
- **Room Service:** Order food, drinks, and supplies
- **Visitor/Doorbell System:** Accept, reject, or block visitors
- **Weekly Rent:** 7-day cycle with 3-day grace period
- **Admin Panel:** React dashboard for hotel management
- **Admin Commands:** /hotelcreate, /hoteldelete, /hotelreset, /giveroom, /resetroom, /viewroom
- **Premium NUI:** React + Vite + TypeScript with luxury dark theme

## Dependencies

- ox_lib
- ox_inventory
- ox_target
- oxmysql
- qbx_core
- illenium-appearance
- Renewed-Banking
- pma-voice

## Installation

1. Place `imrp_opiumnights` in your resources folder
2. Import `sql/install.sql` into your database
3. Add the hotel_key item to ox_inventory (see `items.md`)
4. Add `ensure imrp_opiumnights` to your server.cfg
5. Update room coordinates in `config.lua` to match your MLO placement
6. Restart server

## Configuration

All coordinates in `config.lua` are set to `vector3(0.0, 0.0, 0.0)` by default.
You must update them to match your Opium Nights Hotel MLO placement:

- Reception NPC position
- Elevator position
- Garage spawn/store positions
- CCTV camera positions
- Individual room door, stash, wardrobe, and doorbell positions

## Building the NUI

```bash
cd web
npm install
npm run build
```

The built files go to `web/dist/` which is referenced by `fxmanifest.lua`.

## Room Types & Pricing

| Type | Price | Weekly Rent | Storage | Slots |
|------|-------|-------------|---------|-------|
| Standard | $50,000 | $25,000 | 75kg | 50 |
| Deluxe | $100,000 | $35,000 | 100kg | 75 |
| Executive | $250,000 | $50,000 | 150kg | 100 |
| Luxury | $500,000 | $75,000 | 200kg | 125 |
| Penthouse | $1,000,000 | $100,000 | 300kg | 200 |

## Exports (Server)

```lua
exports.imrp_opiumnights:GetRoomOwner(roomNumber)
exports.imrp_opiumnights:IsRoomOccupied(roomNumber)
exports.imrp_opiumnights:HasRoomAccess(citizenid, roomNumber)
exports.imrp_opiumnights:GetOwnedRoom(citizenid)
```
