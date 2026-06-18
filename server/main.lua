local roomCache = {}
local accessCache = {}

-- ======================================================
-- INITIALIZATION
-- ======================================================

CreateThread(function()
    LoadRoomsFromDatabase()
    LoadAccessFromDatabase()
    StartRentCheckLoop()
    StartUtilityLoop()
end)

function LoadRoomsFromDatabase()
    local rooms = MySQL.query.await('SELECT * FROM imrp_hotel_rooms')
    if not rooms then return end
    for _, room in ipairs(rooms) do
        roomCache[room.room_number] = {
            number = room.room_number,
            type = room.room_type,
            floor = room.floor,
            owner = room.owner_citizenid,
            ownerName = room.owner_name,
            purchaseDate = room.purchase_date,
            expireDate = room.expire_date,
            isLocked = room.is_locked == 1,
            alarmEnabled = room.alarm_enabled == 1,
        }

        local bagKey = 'hotel:lock:' .. room.room_number
        GlobalState[bagKey] = room.is_locked == 1
    end
    if Config.Debug then
        print('^2[IMRP Hotel]^0 Loaded ' .. #rooms .. ' rooms from database')
    end
end

function LoadAccessFromDatabase()
    local access = MySQL.query.await('SELECT * FROM imrp_hotel_access')
    if not access then return end
    for _, entry in ipairs(access) do
        if not accessCache[entry.room_number] then
            accessCache[entry.room_number] = {}
        end
        accessCache[entry.room_number][entry.citizenid] = {
            name = entry.player_name,
            type = entry.access_type,
            grantedBy = entry.granted_by,
            expiresAt = entry.expires_at,
        }
    end
end

-- ======================================================
-- HELPER FUNCTIONS
-- ======================================================

---@param source number
---@return table|nil
function GetPlayerData(source)
    local player = exports.qbx_core:GetPlayer(source)
    return player
end

---@param citizenid string
---@param roomNumber string
---@return boolean
function HasRoomAccess(citizenid, roomNumber)
    local room = roomCache[roomNumber]
    if not room then return false end
    if room.owner == citizenid then return true end

    local roomAccess = accessCache[roomNumber]
    if not roomAccess then return false end
    local entry = roomAccess[citizenid]
    if not entry then return false end

    if entry.type == 'temporary' and entry.expiresAt then
        local expiry = entry.expiresAt
        if os.time() > ConvertDateToTimestamp(expiry) then
            RemoveAccess(roomNumber, citizenid)
            return false
        end
    end

    return true
end

---@param dateStr string
---@return number
function ConvertDateToTimestamp(dateStr)
    if type(dateStr) == 'number' then return dateStr end
    local pattern = '(%d+)-(%d+)-(%d+) (%d+):(%d+):(%d+)'
    local y, m, d, h, mi, s = dateStr:match(pattern)
    if not y then return 0 end
    return os.time({ year = y, month = m, day = d, hour = h, min = mi, sec = s })
end

---@param citizenid string
---@return string|nil
function GetOwnedRoom(citizenid)
    for roomNumber, room in pairs(roomCache) do
        if room.owner == citizenid then
            return roomNumber
        end
    end
    return nil
end

---@param roomNumber string
---@return table
function GetRoomData(roomNumber)
    return roomCache[roomNumber] or {}
end

---@param roomNumber string
function SyncRoomState(roomNumber)
    local room = roomCache[roomNumber]
    if not room then return end
    local bagKey = 'hotel:lock:' .. roomNumber
    GlobalState[bagKey] = room.isLocked
end

-- ======================================================
-- ROOM BROWSING
-- ======================================================

lib.callback.register('hotel:server:getRooms', function(source)
    local rooms = {}
    for roomNumber, room in pairs(roomCache) do
        local typeCfg = Config.RoomTypes[room.type]
        rooms[#rooms + 1] = {
            number = roomNumber,
            type = room.type,
            typeLabel = typeCfg and typeCfg.label or room.type,
            floor = room.floor,
            price = typeCfg and typeCfg.price or 0,
            weeklyRent = typeCfg and typeCfg.weeklyRent or 0,
            isOccupied = room.owner ~= nil,
            ownerName = room.ownerName,
            isLocked = room.isLocked,
        }
    end
    table.sort(rooms, function(a, b) return a.number < b.number end)
    return rooms
end)

lib.callback.register('hotel:server:getRoomDetails', function(source, roomNumber)
    local room = roomCache[roomNumber]
    if not room then return nil end
    local typeCfg = Config.RoomTypes[room.type]
    local player = GetPlayerData(source)
    if not player then return nil end
    local citizenid = player.PlayerData.citizenid

    local accessList = {}
    if accessCache[roomNumber] then
        for cid, entry in pairs(accessCache[roomNumber]) do
            accessList[#accessList + 1] = {
                citizenid = cid,
                name = entry.name,
                type = entry.type,
                expiresAt = entry.expiresAt,
            }
        end
    end

    return {
        number = roomNumber,
        type = room.type,
        typeLabel = typeCfg and typeCfg.label or room.type,
        floor = room.floor,
        price = typeCfg and typeCfg.price or 0,
        weeklyRent = typeCfg and typeCfg.weeklyRent or 0,
        storage = typeCfg and typeCfg.storageWeight or 0,
        slots = typeCfg and typeCfg.storageSlots or 0,
        isOccupied = room.owner ~= nil,
        owner = room.owner,
        ownerName = room.ownerName,
        purchaseDate = room.purchaseDate,
        expireDate = room.expireDate,
        isLocked = room.isLocked,
        alarmEnabled = room.alarmEnabled,
        isOwner = room.owner == citizenid,
        hasAccess = HasRoomAccess(citizenid, roomNumber),
        accessList = accessList,
    }
end)

-- ======================================================
-- ROOM PURCHASE
-- ======================================================

lib.callback.register('hotel:server:purchaseRoom', function(source, roomNumber)
    local player = GetPlayerData(source)
    if not player then return false, 'Player data not found' end

    local citizenid = player.PlayerData.citizenid
    local room = roomCache[roomNumber]
    if not room then return false, 'Room not found' end
    if room.owner then return false, 'Room is already occupied' end

    local existing = GetOwnedRoom(citizenid)
    if existing then return false, 'You already own room ' .. existing end

    local typeCfg = Config.RoomTypes[room.type]
    if not typeCfg then return false, 'Invalid room type' end

    local price = typeCfg.price
    local cash = player.PlayerData.money.cash
    local bank = player.PlayerData.money.bank

    if bank >= price then
        player.Functions.RemoveMoney('bank', price, 'hotel-purchase-' .. roomNumber)
    elseif cash >= price then
        player.Functions.RemoveMoney('cash', price, 'hotel-purchase-' .. roomNumber)
    else
        return false, 'Insufficient funds. Need ' .. FormatMoney(price)
    end

    local now = os.date('%Y-%m-%d %H:%M:%S')
    local expiry = os.date('%Y-%m-%d %H:%M:%S', os.time() + (Config.RentDurationDays * 86400))
    local charName = player.PlayerData.charinfo.firstname .. ' ' .. player.PlayerData.charinfo.lastname

    MySQL.update.await(
        'UPDATE imrp_hotel_rooms SET owner_citizenid = ?, owner_name = ?, purchase_date = ?, expire_date = ?, is_locked = 1 WHERE room_number = ?',
        { citizenid, charName, now, expiry, roomNumber }
    )

    room.owner = citizenid
    room.ownerName = charName
    room.purchaseDate = now
    room.expireDate = expiry
    room.isLocked = true
    SyncRoomState(roomNumber)

    GiveHotelKey(source, roomNumber, room.type, citizenid)

    local stashId = GetStashId(roomNumber)
    exports.ox_inventory:RegisterStash(stashId, 'Room ' .. roomNumber, typeCfg.storageSlots, typeCfg.storageWeight)

    SendMail(roomNumber, 'Hotel Management', 'notification', 'Welcome to Opium Nights!', 'Congratulations on your new room! Your key has been issued. Rent expires on ' .. expiry)

    return true, 'Room ' .. roomNumber .. ' purchased successfully!'
end)

-- ======================================================
-- ROOM SELLING
-- ======================================================

lib.callback.register('hotel:server:sellRoom', function(source)
    local player = GetPlayerData(source)
    if not player then return false, 'Player data not found' end

    local citizenid = player.PlayerData.citizenid
    local roomNumber = GetOwnedRoom(citizenid)
    if not roomNumber then return false, 'You do not own a room' end

    local room = roomCache[roomNumber]
    local typeCfg = Config.RoomTypes[room.type]
    if not typeCfg then return false, 'Invalid room type' end

    local refund = math.floor(typeCfg.price * Config.RefundPercent)

    player.Functions.AddMoney('bank', refund, 'hotel-sell-' .. roomNumber)

    ClearRoom(roomNumber)
    RemoveHotelKey(source, roomNumber)

    return true, 'Room sold! Refund: ' .. FormatMoney(refund)
end)

-- ======================================================
-- RENT RENEWAL
-- ======================================================

lib.callback.register('hotel:server:renewRent', function(source)
    local player = GetPlayerData(source)
    if not player then return false, 'Player data not found' end

    local citizenid = player.PlayerData.citizenid
    local roomNumber = GetOwnedRoom(citizenid)
    if not roomNumber then return false, 'You do not own a room' end

    local room = roomCache[roomNumber]
    local typeCfg = Config.RoomTypes[room.type]
    if not typeCfg then return false, 'Invalid room type' end

    local rent = typeCfg.weeklyRent
    local bank = player.PlayerData.money.bank

    if bank < rent then
        return false, 'Insufficient funds. Need ' .. FormatMoney(rent)
    end

    player.Functions.RemoveMoney('bank', rent, 'hotel-rent-' .. roomNumber)

    local newExpiry = os.date('%Y-%m-%d %H:%M:%S', os.time() + (Config.RentDurationDays * 86400))

    MySQL.update.await(
        'UPDATE imrp_hotel_rooms SET expire_date = ? WHERE room_number = ?',
        { newExpiry, roomNumber }
    )

    room.expireDate = newExpiry

    SendMail(roomNumber, 'Hotel Management', 'notification', 'Rent Renewed', 'Your rent has been renewed. New expiry: ' .. newExpiry)

    return true, 'Rent renewed until ' .. newExpiry
end)

-- ======================================================
-- OWNERSHIP TRANSFER
-- ======================================================

lib.callback.register('hotel:server:transferRoom', function(source, targetServerId)
    local player = GetPlayerData(source)
    if not player then return false, 'Player data not found' end

    local citizenid = player.PlayerData.citizenid
    local roomNumber = GetOwnedRoom(citizenid)
    if not roomNumber then return false, 'You do not own a room' end

    local target = GetPlayerData(targetServerId)
    if not target then return false, 'Target player not found' end

    local targetCid = target.PlayerData.citizenid
    if targetCid == citizenid then return false, 'Cannot transfer to yourself' end

    local targetRoom = GetOwnedRoom(targetCid)
    if targetRoom then return false, 'Target already owns a room' end

    local room = roomCache[roomNumber]
    local targetName = target.PlayerData.charinfo.firstname .. ' ' .. target.PlayerData.charinfo.lastname

    MySQL.update.await(
        'UPDATE imrp_hotel_rooms SET owner_citizenid = ?, owner_name = ? WHERE room_number = ?',
        { targetCid, targetName, roomNumber }
    )

    room.owner = targetCid
    room.ownerName = targetName

    RemoveHotelKey(source, roomNumber)
    GiveHotelKey(targetServerId, roomNumber, room.type, targetCid)

    accessCache[roomNumber] = {}
    MySQL.update.await('DELETE FROM imrp_hotel_access WHERE room_number = ?', { roomNumber })

    SendMail(roomNumber, 'Hotel Management', 'notification', 'Ownership Transferred', 'Room ownership has been transferred to ' .. targetName)

    return true, 'Room transferred to ' .. targetName
end)

-- ======================================================
-- DOOR LOCK SYSTEM
-- ======================================================

lib.callback.register('hotel:server:toggleLock', function(source, roomNumber)
    local player = GetPlayerData(source)
    if not player then return false end

    local citizenid = player.PlayerData.citizenid
    if not HasRoomAccess(citizenid, roomNumber) then return false end

    local room = roomCache[roomNumber]
    if not room then return false end

    room.isLocked = not room.isLocked

    MySQL.update.await(
        'UPDATE imrp_hotel_rooms SET is_locked = ? WHERE room_number = ?',
        { room.isLocked and 1 or 0, roomNumber }
    )

    SyncRoomState(roomNumber)
    return true, room.isLocked
end)

lib.callback.register('hotel:server:toggleAlarm', function(source, roomNumber)
    local player = GetPlayerData(source)
    if not player then return false end

    local citizenid = player.PlayerData.citizenid
    local room = roomCache[roomNumber]
    if not room or room.owner ~= citizenid then return false end

    room.alarmEnabled = not room.alarmEnabled

    MySQL.update.await(
        'UPDATE imrp_hotel_rooms SET alarm_enabled = ? WHERE room_number = ?',
        { room.alarmEnabled and 1 or 0, roomNumber }
    )

    return true, room.alarmEnabled
end)

-- ======================================================
-- ACCESS MANAGEMENT
-- ======================================================

lib.callback.register('hotel:server:addAccess', function(source, targetServerId, accessType, duration)
    local player = GetPlayerData(source)
    if not player then return false, 'Player data not found' end

    local citizenid = player.PlayerData.citizenid
    local roomNumber = GetOwnedRoom(citizenid)
    if not roomNumber then return false, 'You do not own a room' end

    local room = roomCache[roomNumber]
    if room.owner ~= citizenid then return false, 'Not the owner' end

    local currentAccess = accessCache[roomNumber] or {}
    local count = 0
    for _ in pairs(currentAccess) do count = count + 1 end
    if count >= Config.MaxSharedAccess then
        return false, 'Maximum shared access reached (' .. Config.MaxSharedAccess .. ')'
    end

    local target = GetPlayerData(targetServerId)
    if not target then return false, 'Target player not found' end

    local targetCid = target.PlayerData.citizenid
    if targetCid == citizenid then return false, 'Cannot add yourself' end

    local targetName = target.PlayerData.charinfo.firstname .. ' ' .. target.PlayerData.charinfo.lastname
    local expiresAt = nil

    if accessType == 'temporary' and duration then
        expiresAt = os.date('%Y-%m-%d %H:%M:%S', os.time() + (duration * 3600))
    end

    MySQL.insert.await(
        'INSERT INTO imrp_hotel_access (room_number, citizenid, player_name, access_type, granted_by, expires_at) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE access_type = VALUES(access_type), expires_at = VALUES(expires_at)',
        { roomNumber, targetCid, targetName, accessType, citizenid, expiresAt }
    )

    if not accessCache[roomNumber] then accessCache[roomNumber] = {} end
    accessCache[roomNumber][targetCid] = {
        name = targetName,
        type = accessType,
        grantedBy = citizenid,
        expiresAt = expiresAt,
    }

    return true, targetName .. ' granted ' .. accessType .. ' access'
end)

lib.callback.register('hotel:server:removeAccess', function(source, targetCitizenId)
    local player = GetPlayerData(source)
    if not player then return false, 'Player data not found' end

    local citizenid = player.PlayerData.citizenid
    local roomNumber = GetOwnedRoom(citizenid)
    if not roomNumber then return false, 'You do not own a room' end

    local room = roomCache[roomNumber]
    if room.owner ~= citizenid then return false, 'Not the owner' end

    MySQL.update.await(
        'DELETE FROM imrp_hotel_access WHERE room_number = ? AND citizenid = ?',
        { roomNumber, targetCitizenId }
    )

    if accessCache[roomNumber] then
        accessCache[roomNumber][targetCitizenId] = nil
    end

    return true, 'Access removed'
end)

function RemoveAccess(roomNumber, citizenid)
    MySQL.update.await(
        'DELETE FROM imrp_hotel_access WHERE room_number = ? AND citizenid = ?',
        { roomNumber, citizenid }
    )
    if accessCache[roomNumber] then
        accessCache[roomNumber][citizenid] = nil
    end
end

-- ======================================================
-- KEY SYSTEM
-- ======================================================

function GiveHotelKey(source, roomNumber, roomType, citizenid)
    local metadata = {
        hotel = Config.HotelName,
        room = roomNumber,
        owner = citizenid,
        description = Config.HotelName .. ' - Room ' .. roomNumber,
    }
    exports.ox_inventory:AddItem(source, 'hotel_key', 1, metadata)
end

function RemoveHotelKey(source, roomNumber)
    local items = exports.ox_inventory:GetInventoryItems(source)
    if not items then return end
    for _, item in pairs(items) do
        if item.name == 'hotel_key' and item.metadata and item.metadata.room == roomNumber then
            exports.ox_inventory:RemoveItem(source, 'hotel_key', 1, item.metadata, item.slot)
            break
        end
    end
end

lib.callback.register('hotel:server:validateKey', function(source, roomNumber)
    local items = exports.ox_inventory:GetInventoryItems(source)
    if not items then return false end
    for _, item in pairs(items) do
        if item.name == 'hotel_key' and item.metadata and item.metadata.room == roomNumber then
            return true
        end
    end
    return false
end)

-- ======================================================
-- STASH SYSTEM
-- ======================================================

lib.callback.register('hotel:server:openStash', function(source, roomNumber)
    local player = GetPlayerData(source)
    if not player then return false end

    local citizenid = player.PlayerData.citizenid
    if not HasRoomAccess(citizenid, roomNumber) then return false end

    local typeCfg = GetRoomTypeConfig(roomNumber)
    if not typeCfg then return false end

    local stashId = GetStashId(roomNumber)
    exports.ox_inventory:RegisterStash(stashId, 'Room ' .. roomNumber, typeCfg.storageSlots, typeCfg.storageWeight)

    return stashId
end)

-- ======================================================
-- VISITOR / DOORBELL SYSTEM
-- ======================================================

RegisterNetEvent('hotel:server:ringDoorbell', function(roomNumber)
    local source = source
    local player = GetPlayerData(source)
    if not player then return end

    local room = roomCache[roomNumber]
    if not room or not room.owner then
        TriggerClientEvent('ox_lib:notify', source, { type = 'error', description = 'This room has no owner' })
        return
    end

    local visitorName = player.PlayerData.charinfo.firstname .. ' ' .. player.PlayerData.charinfo.lastname
    local visitorCid = player.PlayerData.citizenid

    local blocked = MySQL.scalar.await(
        'SELECT COUNT(*) FROM imrp_hotel_visitors WHERE room_number = ? AND visitor_citizenid = ? AND status = ?',
        { roomNumber, visitorCid, 'blocked' }
    )
    if blocked and blocked > 0 then
        TriggerClientEvent('ox_lib:notify', source, { type = 'error', description = 'You have been blocked from visiting this room' })
        return
    end

    MySQL.insert.await(
        'INSERT INTO imrp_hotel_visitors (room_number, visitor_citizenid, visitor_name, status) VALUES (?, ?, ?, ?)',
        { roomNumber, visitorCid, visitorName, 'pending' }
    )

    local ownerSource = exports.qbx_core:GetPlayerByCitizenId(room.owner)
    if ownerSource then
        local ownerSrc = ownerSource.PlayerData.source
        TriggerClientEvent('hotel:client:visitorRequest', ownerSrc, {
            roomNumber = roomNumber,
            visitorName = visitorName,
            visitorId = source,
            visitorCid = visitorCid,
        })
    else
        TriggerClientEvent('ox_lib:notify', source, { type = 'info', description = 'Room owner is not online' })
    end
end)

RegisterNetEvent('hotel:server:respondVisitor', function(roomNumber, visitorCid, response)
    local source = source
    local player = GetPlayerData(source)
    if not player then return end

    local citizenid = player.PlayerData.citizenid
    local room = roomCache[roomNumber]
    if not room or room.owner ~= citizenid then return end

    MySQL.update.await(
        'UPDATE imrp_hotel_visitors SET status = ? WHERE room_number = ? AND visitor_citizenid = ? AND status = ?',
        { response, roomNumber, visitorCid, 'pending' }
    )

    local visitorPlayer = exports.qbx_core:GetPlayerByCitizenId(visitorCid)
    if visitorPlayer then
        local vSrc = visitorPlayer.PlayerData.source
        if response == 'accepted' then
            TriggerClientEvent('ox_lib:notify', vSrc, { type = 'success', description = 'Your visit request was accepted!' })
        elseif response == 'rejected' then
            TriggerClientEvent('ox_lib:notify', vSrc, { type = 'error', description = 'Your visit request was rejected' })
        elseif response == 'blocked' then
            TriggerClientEvent('ox_lib:notify', vSrc, { type = 'error', description = 'You have been blocked from this room' })
        end
    end
end)

-- ======================================================
-- MAILBOX SYSTEM
-- ======================================================

function SendMail(roomNumber, sender, mailType, subject, body)
    MySQL.insert.await(
        'INSERT INTO imrp_hotel_mailbox (room_number, sender_name, mail_type, subject, body) VALUES (?, ?, ?, ?, ?)',
        { roomNumber, sender, mailType, subject, body }
    )
end

lib.callback.register('hotel:server:getMail', function(source, roomNumber)
    local player = GetPlayerData(source)
    if not player then return {} end

    local citizenid = player.PlayerData.citizenid
    if not HasRoomAccess(citizenid, roomNumber) then return {} end

    local mail = MySQL.query.await(
        'SELECT * FROM imrp_hotel_mailbox WHERE room_number = ? ORDER BY created_at DESC LIMIT 50',
        { roomNumber }
    )
    return mail or {}
end)

lib.callback.register('hotel:server:readMail', function(source, mailId)
    MySQL.update.await('UPDATE imrp_hotel_mailbox SET is_read = 1 WHERE id = ?', { mailId })
    return true
end)

lib.callback.register('hotel:server:getUnreadCount', function(source, roomNumber)
    local count = MySQL.scalar.await(
        'SELECT COUNT(*) FROM imrp_hotel_mailbox WHERE room_number = ? AND is_read = 0',
        { roomNumber }
    )
    return count or 0
end)

-- ======================================================
-- UTILITY SYSTEM
-- ======================================================

lib.callback.register('hotel:server:getUtilities', function(source, roomNumber)
    local player = GetPlayerData(source)
    if not player then return {} end

    local citizenid = player.PlayerData.citizenid
    if not HasRoomAccess(citizenid, roomNumber) then return {} end

    local utilities = MySQL.query.await(
        'SELECT * FROM imrp_hotel_utilities WHERE room_number = ? ORDER BY due_date DESC',
        { roomNumber }
    )
    return utilities or {}
end)

lib.callback.register('hotel:server:payUtility', function(source, utilityId)
    local player = GetPlayerData(source)
    if not player then return false, 'Player data not found' end

    local utility = MySQL.single.await('SELECT * FROM imrp_hotel_utilities WHERE id = ?', { utilityId })
    if not utility then return false, 'Utility bill not found' end
    if utility.is_paid == 1 then return false, 'Already paid' end

    local citizenid = player.PlayerData.citizenid
    if not HasRoomAccess(citizenid, utility.room_number) then return false, 'No access' end

    local bank = player.PlayerData.money.bank
    if bank < utility.amount then
        return false, 'Insufficient funds. Need ' .. FormatMoney(utility.amount)
    end

    player.Functions.RemoveMoney('bank', utility.amount, 'hotel-utility-' .. utility.utility_type)

    MySQL.update.await(
        'UPDATE imrp_hotel_utilities SET is_paid = 1, is_active = 1, paid_date = NOW() WHERE id = ?',
        { utilityId }
    )

    return true, 'Utility bill paid!'
end)

function GenerateUtilityBills(roomNumber)
    for utilType, utilCfg in pairs(Config.Utilities) do
        local dueDate = os.date('%Y-%m-%d %H:%M:%S', os.time() + (7 * 86400))
        MySQL.insert.await(
            'INSERT INTO imrp_hotel_utilities (room_number, utility_type, amount, due_date) VALUES (?, ?, ?, ?)',
            { roomNumber, utilType, utilCfg.weeklyCharge, dueDate }
        )
    end

    SendMail(roomNumber, 'Hotel Management', 'notification', 'Utility Bills Generated', 'Your weekly utility bills have been generated. Please pay them to maintain services.')
end

function CheckUnpaidUtilities()
    local unpaid = MySQL.query.await(
        'SELECT * FROM imrp_hotel_utilities WHERE is_paid = 0 AND due_date < NOW()'
    )
    if not unpaid then return end

    for _, bill in ipairs(unpaid) do
        MySQL.update.await(
            'UPDATE imrp_hotel_utilities SET is_active = 0 WHERE id = ?',
            { bill.id }
        )

        SendMail(bill.room_number, 'Hotel Management', 'notification', 'Service Disabled', 'Your ' .. bill.utility_type .. ' has been disabled due to non-payment.')
    end
end

-- ======================================================
-- GARAGE SYSTEM
-- ======================================================

lib.callback.register('hotel:server:getGarageVehicles', function(source)
    local player = GetPlayerData(source)
    if not player then return {} end

    local citizenid = player.PlayerData.citizenid
    local roomNumber = GetOwnedRoom(citizenid)
    if not roomNumber then return {} end

    local vehicles = MySQL.query.await(
        'SELECT * FROM imrp_hotel_garage WHERE room_number = ? AND citizenid = ?',
        { roomNumber, citizenid }
    )
    return vehicles or {}
end)

lib.callback.register('hotel:server:storeVehicle', function(source, plate, vehicleModel, fuel, engine, body, props)
    local player = GetPlayerData(source)
    if not player then return false, 'Player data not found' end

    local citizenid = player.PlayerData.citizenid
    local roomNumber = GetOwnedRoom(citizenid)
    if not roomNumber then return false, 'You do not own a room' end

    local count = MySQL.scalar.await(
        'SELECT COUNT(*) FROM imrp_hotel_garage WHERE room_number = ? AND citizenid = ?',
        { roomNumber, citizenid }
    )
    if count and count >= Config.Garage.maxVehicles then
        return false, 'Garage is full (max ' .. Config.Garage.maxVehicles .. ' vehicles)'
    end

    local propsJson = props and json.encode(props) or nil

    MySQL.insert.await(
        'INSERT INTO imrp_hotel_garage (room_number, citizenid, plate, vehicle, fuel, engine, body, props) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE fuel = VALUES(fuel), engine = VALUES(engine), body = VALUES(body), props = VALUES(props)',
        { roomNumber, citizenid, plate, vehicleModel, fuel, engine, body, propsJson }
    )

    return true, 'Vehicle stored'
end)

lib.callback.register('hotel:server:retrieveVehicle', function(source, plate)
    local player = GetPlayerData(source)
    if not player then return nil end

    local citizenid = player.PlayerData.citizenid
    local vehicle = MySQL.single.await(
        'SELECT * FROM imrp_hotel_garage WHERE plate = ? AND citizenid = ?',
        { plate, citizenid }
    )
    if not vehicle then return nil end

    MySQL.update.await('DELETE FROM imrp_hotel_garage WHERE plate = ?', { plate })

    return {
        model = vehicle.vehicle,
        plate = vehicle.plate,
        fuel = vehicle.fuel,
        engine = vehicle.engine,
        body = vehicle.body,
        props = vehicle.props and json.decode(vehicle.props) or nil,
    }
end)

-- ======================================================
-- ROOM SERVICE
-- ======================================================

lib.callback.register('hotel:server:orderRoomService', function(source, category, itemIndex)
    local player = GetPlayerData(source)
    if not player then return false, 'Player data not found' end

    local citizenid = player.PlayerData.citizenid
    local roomNumber = GetOwnedRoom(citizenid)
    if not roomNumber then
        for rn, _ in pairs(roomCache) do
            if HasRoomAccess(citizenid, rn) then
                roomNumber = rn
                break
            end
        end
    end
    if not roomNumber then return false, 'No room access' end

    local items = Config.RoomService[category]
    if not items or not items[itemIndex] then return false, 'Invalid item' end

    local item = items[itemIndex]
    local bank = player.PlayerData.money.bank

    if bank < item.price then
        return false, 'Insufficient funds. Need ' .. FormatMoney(item.price)
    end

    player.Functions.RemoveMoney('bank', item.price, 'hotel-roomservice')

    SetTimeout(item.deliveryTime * 1000, function()
        local onlinePlayer = exports.qbx_core:GetPlayerByCitizenId(citizenid)
        if onlinePlayer then
            exports.ox_inventory:AddItem(onlinePlayer.PlayerData.source, item.item, 1)
            TriggerClientEvent('ox_lib:notify', onlinePlayer.PlayerData.source, {
                type = 'success',
                description = item.label .. ' has been delivered to your room!',
            })
        end
    end)

    return true, item.label .. ' will arrive in ' .. item.deliveryTime .. ' seconds'
end)

-- ======================================================
-- CCTV SYSTEM
-- ======================================================

lib.callback.register('hotel:server:getCCTVAccess', function(source)
    local player = GetPlayerData(source)
    if not player then return false end

    local citizenid = player.PlayerData.citizenid
    local roomNumber = GetOwnedRoom(citizenid)

    if not roomNumber then return false end

    local room = roomCache[roomNumber]
    if not room then return false end

    if room.type == 'penthouse' or room.type == 'luxury' or room.type == 'executive' then
        return true
    end
    return false
end)

-- ======================================================
-- CLEAR ROOM
-- ======================================================

function ClearRoom(roomNumber)
    MySQL.update.await(
        'UPDATE imrp_hotel_rooms SET owner_citizenid = NULL, owner_name = NULL, purchase_date = NULL, expire_date = NULL, is_locked = 1, alarm_enabled = 0 WHERE room_number = ?',
        { roomNumber }
    )
    MySQL.update.await('DELETE FROM imrp_hotel_access WHERE room_number = ?', { roomNumber })
    MySQL.update.await('DELETE FROM imrp_hotel_mailbox WHERE room_number = ?', { roomNumber })
    MySQL.update.await('DELETE FROM imrp_hotel_garage WHERE room_number = ?', { roomNumber })

    local room = roomCache[roomNumber]
    if room then
        room.owner = nil
        room.ownerName = nil
        room.purchaseDate = nil
        room.expireDate = nil
        room.isLocked = true
        room.alarmEnabled = false
    end
    accessCache[roomNumber] = {}
    SyncRoomState(roomNumber)
end

-- ======================================================
-- RENT CHECK LOOP
-- ======================================================

function StartRentCheckLoop()
    CreateThread(function()
        while true do
            Wait(60000 * 60) -- Check every hour

            for roomNumber, room in pairs(roomCache) do
                if room.owner and room.expireDate then
                    local expiry = ConvertDateToTimestamp(room.expireDate)
                    local now = os.time()

                    if now > expiry then
                        local graceDays = Config.GracePeriodDays * 86400
                        if now > expiry + graceDays then
                            ClearRoom(roomNumber)
                            if Config.Debug then
                                print('^1[IMRP Hotel]^0 Room ' .. roomNumber .. ' released (rent expired + grace period)')
                            end
                        else
                            local ownerPlayer = exports.qbx_core:GetPlayerByCitizenId(room.owner)
                            if ownerPlayer then
                                TriggerClientEvent('ox_lib:notify', ownerPlayer.PlayerData.source, {
                                    type = 'warning',
                                    description = 'Your hotel room rent has expired! Renew before losing access.',
                                    duration = 10000,
                                })
                            end
                            SendMail(roomNumber, 'Hotel Management', 'notification', 'Rent Expired!', 'Your rent has expired. You have ' .. Config.GracePeriodDays .. ' days to renew before losing the room.')
                        end
                    end
                end
            end
        end
    end)
end

-- ======================================================
-- UTILITY GENERATION LOOP
-- ======================================================

function StartUtilityLoop()
    CreateThread(function()
        while true do
            Wait(60000 * 60 * 24) -- Daily check

            for roomNumber, room in pairs(roomCache) do
                if room.owner then
                    local lastBill = MySQL.scalar.await(
                        'SELECT MAX(created_at) FROM imrp_hotel_utilities WHERE room_number = ?',
                        { roomNumber }
                    )
                    local shouldGenerate = true
                    if lastBill then
                        local lastTs = ConvertDateToTimestamp(lastBill)
                        if os.time() - lastTs < (7 * 86400) then
                            shouldGenerate = false
                        end
                    end
                    if shouldGenerate then
                        GenerateUtilityBills(roomNumber)
                    end
                end
            end

            CheckUnpaidUtilities()
        end
    end)
end

-- ======================================================
-- ADMIN COMMANDS
-- ======================================================

lib.addCommand('hotelcreate', {
    help = 'Create/initialize hotel rooms in database',
    restricted = 'group.admin',
}, function(source)
    MySQL.query.await('SOURCE sql/install.sql')
    TriggerClientEvent('ox_lib:notify', source, { type = 'success', description = 'Hotel rooms initialized' })
    LoadRoomsFromDatabase()
end)

lib.addCommand('hoteldelete', {
    help = 'Delete all hotel data',
    restricted = 'group.admin',
}, function(source)
    MySQL.update.await('DELETE FROM imrp_hotel_garage')
    MySQL.update.await('DELETE FROM imrp_hotel_visitors')
    MySQL.update.await('DELETE FROM imrp_hotel_utilities')
    MySQL.update.await('DELETE FROM imrp_hotel_mailbox')
    MySQL.update.await('DELETE FROM imrp_hotel_access')
    MySQL.update.await('DELETE FROM imrp_hotel_cctv')
    MySQL.update.await('DELETE FROM imrp_hotel_rooms')
    roomCache = {}
    accessCache = {}
    TriggerClientEvent('ox_lib:notify', source, { type = 'success', description = 'Hotel data deleted' })
end)

lib.addCommand('hotelreset', {
    help = 'Reset all room ownerships',
    restricted = 'group.admin',
}, function(source)
    MySQL.update.await('UPDATE imrp_hotel_rooms SET owner_citizenid = NULL, owner_name = NULL, purchase_date = NULL, expire_date = NULL, is_locked = 1, alarm_enabled = 0')
    MySQL.update.await('DELETE FROM imrp_hotel_access')
    MySQL.update.await('DELETE FROM imrp_hotel_garage')
    LoadRoomsFromDatabase()
    accessCache = {}
    TriggerClientEvent('ox_lib:notify', source, { type = 'success', description = 'All rooms reset' })
end)

lib.addCommand('giveroom', {
    help = 'Give a room to a player',
    params = {
        { name = 'id', type = 'number', help = 'Player server ID' },
        { name = 'room', type = 'string', help = 'Room number (e.g., 101, PH-01)' },
    },
    restricted = 'group.admin',
}, function(source, args)
    local target = GetPlayerData(args.id)
    if not target then
        TriggerClientEvent('ox_lib:notify', source, { type = 'error', description = 'Player not found' })
        return
    end

    local roomNumber = args.room
    local room = roomCache[roomNumber]
    if not room then
        TriggerClientEvent('ox_lib:notify', source, { type = 'error', description = 'Room not found' })
        return
    end

    if room.owner then
        ClearRoom(roomNumber)
    end

    local citizenid = target.PlayerData.citizenid
    local charName = target.PlayerData.charinfo.firstname .. ' ' .. target.PlayerData.charinfo.lastname
    local now = os.date('%Y-%m-%d %H:%M:%S')
    local expiry = os.date('%Y-%m-%d %H:%M:%S', os.time() + (Config.RentDurationDays * 86400))

    MySQL.update.await(
        'UPDATE imrp_hotel_rooms SET owner_citizenid = ?, owner_name = ?, purchase_date = ?, expire_date = ?, is_locked = 1 WHERE room_number = ?',
        { citizenid, charName, now, expiry, roomNumber }
    )

    room.owner = citizenid
    room.ownerName = charName
    room.purchaseDate = now
    room.expireDate = expiry
    room.isLocked = true
    SyncRoomState(roomNumber)

    GiveHotelKey(args.id, roomNumber, room.type, citizenid)

    TriggerClientEvent('ox_lib:notify', source, { type = 'success', description = 'Room ' .. roomNumber .. ' given to ' .. charName })
    TriggerClientEvent('ox_lib:notify', args.id, { type = 'success', description = 'You have been given room ' .. roomNumber })
end)

lib.addCommand('resetroom', {
    help = 'Reset a specific room',
    params = {
        { name = 'room', type = 'string', help = 'Room number' },
    },
    restricted = 'group.admin',
}, function(source, args)
    local roomNumber = args.room
    if not roomCache[roomNumber] then
        TriggerClientEvent('ox_lib:notify', source, { type = 'error', description = 'Room not found' })
        return
    end
    ClearRoom(roomNumber)
    TriggerClientEvent('ox_lib:notify', source, { type = 'success', description = 'Room ' .. roomNumber .. ' has been reset' })
end)

lib.addCommand('viewroom', {
    help = 'View room information',
    params = {
        { name = 'room', type = 'string', help = 'Room number' },
    },
    restricted = 'group.admin',
}, function(source, args)
    local roomNumber = args.room
    local room = roomCache[roomNumber]
    if not room then
        TriggerClientEvent('ox_lib:notify', source, { type = 'error', description = 'Room not found' })
        return
    end

    local info = ('Room: %s | Type: %s | Owner: %s | Locked: %s | Expires: %s'):format(
        roomNumber,
        room.type,
        room.ownerName or 'None',
        room.isLocked and 'Yes' or 'No',
        room.expireDate or 'N/A'
    )
    TriggerClientEvent('ox_lib:notify', source, { type = 'info', description = info, duration = 10000 })
end)

-- ======================================================
-- ADMIN PANEL DATA
-- ======================================================

lib.callback.register('hotel:server:getAdminData', function(source)
    local player = GetPlayerData(source)
    if not player then return nil end

    if not exports.qbx_core:HasPermission(source, 'admin') then return nil end

    local rooms = {}
    local occupied = 0
    local vacant = 0

    for roomNumber, room in pairs(roomCache) do
        if room.owner then occupied = occupied + 1 else vacant = vacant + 1 end
        rooms[#rooms + 1] = {
            number = roomNumber,
            type = room.type,
            floor = room.floor,
            owner = room.ownerName,
            ownerCid = room.owner,
            isLocked = room.isLocked,
            expireDate = room.expireDate,
        }
    end
    table.sort(rooms, function(a, b) return a.number < b.number end)

    return {
        rooms = rooms,
        occupied = occupied,
        vacant = vacant,
        total = occupied + vacant,
    }
end)

lib.callback.register('hotel:server:adminResetRoom', function(source, roomNumber)
    local player = GetPlayerData(source)
    if not player then return false end
    if not exports.qbx_core:HasPermission(source, 'admin') then return false end

    ClearRoom(roomNumber)
    return true
end)

lib.callback.register('hotel:server:adminForceEnter', function(source, roomNumber)
    local player = GetPlayerData(source)
    if not player then return false end
    if not exports.qbx_core:HasPermission(source, 'admin') then return false end

    local room = roomCache[roomNumber]
    if not room then return false end

    room.isLocked = false
    SyncRoomState(roomNumber)
    return true
end)

-- ======================================================
-- PLAYER DATA (for NUI)
-- ======================================================

lib.callback.register('hotel:server:getPlayerInfo', function(source)
    local player = GetPlayerData(source)
    if not player then return nil end

    local citizenid = player.PlayerData.citizenid
    local ownedRoom = GetOwnedRoom(citizenid)

    local roomData = nil
    if ownedRoom then
        local room = roomCache[ownedRoom]
        local typeCfg = Config.RoomTypes[room.type]
        roomData = {
            number = ownedRoom,
            type = room.type,
            typeLabel = typeCfg and typeCfg.label or room.type,
            floor = room.floor,
            ownerName = room.ownerName,
            purchaseDate = room.purchaseDate,
            expireDate = room.expireDate,
            isLocked = room.isLocked,
            alarmEnabled = room.alarmEnabled,
            weeklyRent = typeCfg and typeCfg.weeklyRent or 0,
        }
    end

    local isAdmin = exports.qbx_core:HasPermission(source, 'admin')

    return {
        citizenid = citizenid,
        name = player.PlayerData.charinfo.firstname .. ' ' .. player.PlayerData.charinfo.lastname,
        ownedRoom = roomData,
        isAdmin = isAdmin,
    }
end)

-- ======================================================
-- NEARBY PLAYERS (for transfer/share)
-- ======================================================

lib.callback.register('hotel:server:getNearbyPlayers', function(source)
    local players = exports.qbx_core:GetQBPlayers()
    local list = {}
    for _, p in pairs(players) do
        if p.PlayerData.source ~= source then
            list[#list + 1] = {
                id = p.PlayerData.source,
                name = p.PlayerData.charinfo.firstname .. ' ' .. p.PlayerData.charinfo.lastname,
                citizenid = p.PlayerData.citizenid,
            }
        end
    end
    return list
end)

-- ======================================================
-- EXPORTS
-- ======================================================

exports('GetRoomOwner', function(roomNumber)
    local room = roomCache[roomNumber]
    return room and room.owner or nil
end)

exports('IsRoomOccupied', function(roomNumber)
    local room = roomCache[roomNumber]
    return room and room.owner ~= nil or false
end)

exports('HasRoomAccess', function(citizenid, roomNumber)
    return HasRoomAccess(citizenid, roomNumber)
end)

exports('GetOwnedRoom', function(citizenid)
    return GetOwnedRoom(citizenid)
end)
