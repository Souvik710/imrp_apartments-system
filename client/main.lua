local isNuiOpen = false
local receptionPed = nil
local currentRoom = nil
local cctvActive = false
local cctvCam = nil

-- ======================================================
-- INITIALIZATION
-- ======================================================

CreateThread(function()
    SpawnReceptionNPC()
    CreateBlip()
    SetupRoomTargets()
    SetupElevator()
    SetupGarageTargets()
end)

-- ======================================================
-- BLIP
-- ======================================================

function CreateBlip()
    if not Config.Blip.enabled then return end

    local blip = AddBlipForCoord(Config.Blip.coords.x, Config.Blip.coords.y, Config.Blip.coords.z)
    SetBlipSprite(blip, Config.Blip.sprite)
    SetBlipDisplay(blip, 4)
    SetBlipScale(blip, Config.Blip.scale)
    SetBlipColour(blip, Config.Blip.color)
    SetBlipAsShortRange(blip, true)
    BeginTextCommandSetBlipName('STRING')
    AddTextComponentSubstringPlayerName(Config.Blip.label)
    EndTextCommandSetBlipName(blip)
end

-- ======================================================
-- RECEPTION NPC
-- ======================================================

function SpawnReceptionNPC()
    local cfg = Config.Reception
    if cfg.coords.x == 0.0 and cfg.coords.y == 0.0 then return end

    lib.requestModel(cfg.model)
    receptionPed = CreatePed(0, joaat(cfg.model), cfg.coords.x, cfg.coords.y, cfg.coords.z, cfg.coords.w, false, true)
    SetEntityAsMissionEntity(receptionPed, true, true)
    SetBlockingOfNonTemporaryEvents(receptionPed, true)
    SetPedDiesWhenInjured(receptionPed, false)
    SetPedCanBeTargetted(receptionPed, false)
    SetEntityInvincible(receptionPed, true)
    FreezeEntityPosition(receptionPed, true)
    TaskStartScenarioInPlace(receptionPed, cfg.scenario, 0, true)

    exports.ox_target:addLocalEntity(receptionPed, {
        {
            name = 'hotel_reception',
            label = cfg.targetLabel,
            icon = cfg.targetIcon,
            distance = cfg.targetDistance,
            onSelect = function()
                OpenHotelUI()
            end,
        },
    })
end

-- ======================================================
-- NUI MANAGEMENT
-- ======================================================

function OpenHotelUI()
    if isNuiOpen then return end
    isNuiOpen = true

    local playerInfo = lib.callback.await('hotel:server:getPlayerInfo', false)
    local rooms = lib.callback.await('hotel:server:getRooms', false)

    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'open',
        data = {
            playerInfo = playerInfo,
            rooms = rooms,
            hotelName = Config.HotelName,
            serverName = Config.ServerName,
            author = Config.Author,
            roomTypes = Config.RoomTypes,
            roomService = Config.RoomService,
        },
    })
end

function CloseHotelUI()
    if not isNuiOpen then return end
    isNuiOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'close' })
end

RegisterNUICallback('close', function(_, cb)
    CloseHotelUI()
    cb('ok')
end)

RegisterNUICallback('purchaseRoom', function(data, cb)
    local success, msg = lib.callback.await('hotel:server:purchaseRoom', false, data.roomNumber)
    cb({ success = success, message = msg })
    if success then
        lib.notify({ type = 'success', description = msg })
        RefreshNUIData()
    else
        lib.notify({ type = 'error', description = msg })
    end
end)

RegisterNUICallback('sellRoom', function(_, cb)
    local success, msg = lib.callback.await('hotel:server:sellRoom', false)
    cb({ success = success, message = msg })
    if success then
        lib.notify({ type = 'success', description = msg })
        RefreshNUIData()
    else
        lib.notify({ type = 'error', description = msg })
    end
end)

RegisterNUICallback('renewRent', function(_, cb)
    local success, msg = lib.callback.await('hotel:server:renewRent', false)
    cb({ success = success, message = msg })
    if success then
        lib.notify({ type = 'success', description = msg })
        RefreshNUIData()
    else
        lib.notify({ type = 'error', description = msg })
    end
end)

RegisterNUICallback('transferRoom', function(data, cb)
    local success, msg = lib.callback.await('hotel:server:transferRoom', false, data.targetId)
    cb({ success = success, message = msg })
    if success then
        lib.notify({ type = 'success', description = msg })
        RefreshNUIData()
    else
        lib.notify({ type = 'error', description = msg })
    end
end)

RegisterNUICallback('toggleLock', function(data, cb)
    local success, locked = lib.callback.await('hotel:server:toggleLock', false, data.roomNumber)
    cb({ success = success, locked = locked })
    if success then
        lib.notify({
            type = 'info',
            description = locked and 'Room locked' or 'Room unlocked',
        })
    end
end)

RegisterNUICallback('toggleAlarm', function(data, cb)
    local success, enabled = lib.callback.await('hotel:server:toggleAlarm', false, data.roomNumber)
    cb({ success = success, enabled = enabled })
    if success then
        lib.notify({
            type = 'info',
            description = enabled and 'Alarm enabled' or 'Alarm disabled',
        })
    end
end)

RegisterNUICallback('addAccess', function(data, cb)
    local success, msg = lib.callback.await('hotel:server:addAccess', false, data.targetId, data.accessType, data.duration)
    cb({ success = success, message = msg })
    if success then
        lib.notify({ type = 'success', description = msg })
        RefreshNUIData()
    else
        lib.notify({ type = 'error', description = msg })
    end
end)

RegisterNUICallback('removeAccess', function(data, cb)
    local success, msg = lib.callback.await('hotel:server:removeAccess', false, data.citizenid)
    cb({ success = success, message = msg })
    if success then
        lib.notify({ type = 'success', description = msg })
        RefreshNUIData()
    else
        lib.notify({ type = 'error', description = msg })
    end
end)

RegisterNUICallback('getRoomDetails', function(data, cb)
    local details = lib.callback.await('hotel:server:getRoomDetails', false, data.roomNumber)
    cb(details)
end)

RegisterNUICallback('getMail', function(data, cb)
    local mail = lib.callback.await('hotel:server:getMail', false, data.roomNumber)
    cb(mail or {})
end)

RegisterNUICallback('readMail', function(data, cb)
    lib.callback.await('hotel:server:readMail', false, data.mailId)
    cb('ok')
end)

RegisterNUICallback('getUnreadCount', function(data, cb)
    local count = lib.callback.await('hotel:server:getUnreadCount', false, data.roomNumber)
    cb(count or 0)
end)

RegisterNUICallback('getUtilities', function(data, cb)
    local utilities = lib.callback.await('hotel:server:getUtilities', false, data.roomNumber)
    cb(utilities or {})
end)

RegisterNUICallback('payUtility', function(data, cb)
    local success, msg = lib.callback.await('hotel:server:payUtility', false, data.utilityId)
    cb({ success = success, message = msg })
    if success then
        lib.notify({ type = 'success', description = msg })
    else
        lib.notify({ type = 'error', description = msg })
    end
end)

RegisterNUICallback('getGarageVehicles', function(_, cb)
    local vehicles = lib.callback.await('hotel:server:getGarageVehicles', false)
    cb(vehicles or {})
end)

RegisterNUICallback('retrieveVehicle', function(data, cb)
    local vehicle = lib.callback.await('hotel:server:retrieveVehicle', false, data.plate)
    if vehicle then
        CloseHotelUI()
        SpawnRetrievedVehicle(vehicle)
        cb({ success = true })
    else
        cb({ success = false, message = 'Vehicle not found' })
    end
end)

RegisterNUICallback('orderRoomService', function(data, cb)
    local success, msg = lib.callback.await('hotel:server:orderRoomService', false, data.category, data.itemIndex)
    cb({ success = success, message = msg })
    if success then
        lib.notify({ type = 'success', description = msg })
    else
        lib.notify({ type = 'error', description = msg })
    end
end)

RegisterNUICallback('getNearbyPlayers', function(_, cb)
    local players = lib.callback.await('hotel:server:getNearbyPlayers', false)
    cb(players or {})
end)

RegisterNUICallback('getAdminData', function(_, cb)
    local data = lib.callback.await('hotel:server:getAdminData', false)
    cb(data)
end)

RegisterNUICallback('adminResetRoom', function(data, cb)
    local success = lib.callback.await('hotel:server:adminResetRoom', false, data.roomNumber)
    cb({ success = success })
    if success then
        lib.notify({ type = 'success', description = 'Room reset' })
        RefreshNUIData()
    end
end)

RegisterNUICallback('adminForceEnter', function(data, cb)
    local success = lib.callback.await('hotel:server:adminForceEnter', false, data.roomNumber)
    cb({ success = success })
    if success then
        lib.notify({ type = 'success', description = 'Room unlocked' })
    end
end)

function RefreshNUIData()
    local playerInfo = lib.callback.await('hotel:server:getPlayerInfo', false)
    local rooms = lib.callback.await('hotel:server:getRooms', false)
    SendNUIMessage({
        action = 'refresh',
        data = {
            playerInfo = playerInfo,
            rooms = rooms,
        },
    })
end

-- ======================================================
-- ROOM INTERACTION TARGETS
-- ======================================================

function SetupRoomTargets()
    for roomNumber, roomCfg in pairs(Config.Rooms) do
        if roomCfg.door.x ~= 0.0 or roomCfg.door.y ~= 0.0 then
            -- Door target
            exports.ox_target:addSphereZone({
                coords = roomCfg.door,
                radius = 1.0,
                debug = Config.Debug,
                options = {
                    {
                        name = 'hotel_door_' .. roomNumber,
                        label = 'Room ' .. roomNumber,
                        icon = 'fas fa-door-open',
                        distance = 2.0,
                        onSelect = function()
                            InteractWithDoor(roomNumber)
                        end,
                    },
                    {
                        name = 'hotel_doorbell_' .. roomNumber,
                        label = 'Ring Doorbell',
                        icon = 'fas fa-bell',
                        distance = 2.0,
                        onSelect = function()
                            RingDoorbell(roomNumber)
                        end,
                    },
                },
            })

            -- Stash target
            if roomCfg.stash.x ~= 0.0 or roomCfg.stash.y ~= 0.0 then
                exports.ox_target:addSphereZone({
                    coords = roomCfg.stash,
                    radius = 0.5,
                    debug = Config.Debug,
                    options = {
                        {
                            name = 'hotel_stash_' .. roomNumber,
                            label = 'Room Stash',
                            icon = 'fas fa-box',
                            distance = 1.5,
                            onSelect = function()
                                OpenRoomStash(roomNumber)
                            end,
                        },
                    },
                })
            end

            -- Wardrobe target
            if roomCfg.wardrobe.x ~= 0.0 or roomCfg.wardrobe.y ~= 0.0 then
                exports.ox_target:addSphereZone({
                    coords = roomCfg.wardrobe,
                    radius = 0.5,
                    debug = Config.Debug,
                    options = {
                        {
                            name = 'hotel_wardrobe_' .. roomNumber,
                            label = 'Wardrobe',
                            icon = 'fas fa-shirt',
                            distance = 1.5,
                            onSelect = function()
                                OpenWardrobe(roomNumber)
                            end,
                        },
                    },
                })
            end
        end
    end
end

-- ======================================================
-- DOOR INTERACTION
-- ======================================================

function InteractWithDoor(roomNumber)
    local hasKey = lib.callback.await('hotel:server:validateKey', false, roomNumber)
    local bagKey = 'hotel:lock:' .. roomNumber
    local isLocked = GlobalState[bagKey]

    if hasKey then
        local success, newState = lib.callback.await('hotel:server:toggleLock', false, roomNumber)
        if success then
            lib.notify({
                type = 'info',
                description = newState and 'Room ' .. roomNumber .. ' locked' or 'Room ' .. roomNumber .. ' unlocked',
            })
        end
    elseif not isLocked then
        lib.notify({ type = 'info', description = 'The door is unlocked' })
    else
        lib.notify({ type = 'error', description = 'Room is locked. You need a key.' })
    end
end

-- ======================================================
-- DOORBELL
-- ======================================================

function RingDoorbell(roomNumber)
    lib.notify({ type = 'info', description = 'Ringing doorbell...' })

    local ped = PlayerPedId()
    lib.requestAnimDict('anim@heists@keycard@')
    TaskPlayAnim(ped, 'anim@heists@keycard@', 'exit', 8.0, -8.0, 1500, 0, 0, false, false, false)

    TriggerServerEvent('hotel:server:ringDoorbell', roomNumber)
end

RegisterNetEvent('hotel:client:visitorRequest', function(data)
    local alert = lib.alertDialog({
        header = 'Visitor at Room ' .. data.roomNumber,
        content = data.visitorName .. ' is at your door.',
        centered = true,
        cancel = true,
        labels = {
            confirm = 'Accept',
            cancel = 'Reject',
        },
    })

    if alert == 'confirm' then
        TriggerServerEvent('hotel:server:respondVisitor', data.roomNumber, data.visitorCid, 'accepted')
    else
        local blockChoice = lib.alertDialog({
            header = 'Block Visitor?',
            content = 'Do you want to block ' .. data.visitorName .. ' from visiting?',
            centered = true,
            cancel = true,
            labels = {
                confirm = 'Block',
                cancel = 'Just Reject',
            },
        })

        if blockChoice == 'confirm' then
            TriggerServerEvent('hotel:server:respondVisitor', data.roomNumber, data.visitorCid, 'blocked')
        else
            TriggerServerEvent('hotel:server:respondVisitor', data.roomNumber, data.visitorCid, 'rejected')
        end
    end
end)

-- ======================================================
-- STASH
-- ======================================================

function OpenRoomStash(roomNumber)
    local stashId = lib.callback.await('hotel:server:openStash', false, roomNumber)
    if stashId then
        exports.ox_inventory:openInventory('stash', stashId)
    else
        lib.notify({ type = 'error', description = 'No access to this stash' })
    end
end

-- ======================================================
-- WARDROBE
-- ======================================================

function OpenWardrobe(roomNumber)
    local player = exports.qbx_core:GetPlayerData()
    if not player then return end

    local citizenid = player.citizenid
    local hasAccess = lib.callback.await('hotel:server:validateKey', false, roomNumber)

    if not hasAccess then
        lib.notify({ type = 'error', description = 'No access to this wardrobe' })
        return
    end

    TriggerEvent('illenium-appearance:client:openOutfitMenu')
end

-- ======================================================
-- ELEVATOR
-- ======================================================

function SetupElevator()
    local cfg = Config.Elevator
    if cfg.coords.x == 0.0 and cfg.coords.y == 0.0 then return end

    exports.ox_target:addSphereZone({
        coords = cfg.coords,
        radius = 1.5,
        debug = Config.Debug,
        options = {
            {
                name = 'hotel_elevator',
                label = cfg.targetLabel,
                icon = cfg.targetIcon,
                distance = cfg.targetDistance,
                onSelect = function()
                    OpenElevatorMenu()
                end,
            },
        },
    })
end

function OpenElevatorMenu()
    local options = {}
    for i, floor in ipairs(Config.Elevator.floors) do
        options[#options + 1] = {
            title = floor.label,
            icon = 'fas fa-arrow-up',
            onSelect = function()
                UseElevator(floor)
            end,
        }
    end

    lib.registerContext({
        id = 'hotel_elevator',
        title = 'Hotel Elevator',
        options = options,
    })
    lib.showContext('hotel_elevator')
end

function UseElevator(floor)
    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)

    DoScreenFadeOut(500)
    Wait(600)
    SetEntityCoords(ped, coords.x, coords.y, floor.z, false, false, false, true)
    Wait(500)
    DoScreenFadeIn(500)

    lib.notify({ type = 'info', description = 'Arrived at ' .. floor.label })
end

-- ======================================================
-- GARAGE
-- ======================================================

function SetupGarageTargets()
    local cfg = Config.Garage
    if cfg.store.x == 0.0 and cfg.store.y == 0.0 then return end

    exports.ox_target:addSphereZone({
        coords = cfg.store,
        radius = 3.0,
        debug = Config.Debug,
        options = {
            {
                name = 'hotel_garage_store',
                label = 'Store Vehicle',
                icon = 'fas fa-parking',
                distance = cfg.targetDistance,
                onSelect = function()
                    StoreVehicle()
                end,
            },
            {
                name = 'hotel_garage_list',
                label = 'Retrieve Vehicle',
                icon = 'fas fa-car',
                distance = cfg.targetDistance,
                onSelect = function()
                    OpenHotelUI()
                end,
            },
        },
    })
end

function StoreVehicle()
    local ped = PlayerPedId()
    local vehicle = GetVehiclePedIsIn(ped, false)

    if vehicle == 0 then
        lib.notify({ type = 'error', description = 'You are not in a vehicle' })
        return
    end

    local plate = GetVehicleNumberPlateText(vehicle)
    local model = GetEntityModel(vehicle)
    local fuel = exports.ox_fuel and exports.ox_fuel:GetFuel(vehicle) or GetVehicleFuelLevel(vehicle)
    local engine = GetVehicleEngineHealth(vehicle)
    local body = GetVehicleBodyHealth(vehicle)
    local props = lib.getVehicleProperties(vehicle)

    local success, msg = lib.callback.await('hotel:server:storeVehicle', false, plate, GetDisplayNameFromVehicleModel(model), fuel, engine, body, props)
    if success then
        TaskLeaveVehicle(ped, vehicle, 0)
        Wait(1500)
        DeleteEntity(vehicle)
        lib.notify({ type = 'success', description = msg })
    else
        lib.notify({ type = 'error', description = msg })
    end
end

function SpawnRetrievedVehicle(data)
    local cfg = Config.Garage
    local modelHash = joaat(data.model)

    lib.requestModel(modelHash)
    local vehicle = CreateVehicle(modelHash, cfg.spawn.x, cfg.spawn.y, cfg.spawn.z, cfg.spawn.w, true, false)

    if data.props then
        lib.setVehicleProperties(vehicle, data.props)
    end

    SetVehicleNumberPlateText(vehicle, data.plate)
    SetVehicleEngineHealth(vehicle, data.engine or 1000.0)
    SetVehicleBodyHealth(vehicle, data.body or 1000.0)

    if exports.ox_fuel then
        exports.ox_fuel:SetFuel(vehicle, data.fuel or 100.0)
    else
        SetVehicleFuelLevel(vehicle, data.fuel or 100.0)
    end

    TaskWarpPedIntoVehicle(PlayerPedId(), vehicle, -1)
    lib.notify({ type = 'success', description = 'Vehicle retrieved' })
end

-- ======================================================
-- CCTV SYSTEM
-- ======================================================

RegisterNUICallback('startCCTV', function(data, cb)
    local hasAccess = lib.callback.await('hotel:server:getCCTVAccess', false)
    if not hasAccess then
        cb({ success = false })
        lib.notify({ type = 'error', description = 'No CCTV access. Requires Executive+ room.' })
        return
    end

    local camIndex = data.cameraIndex or 1
    local cameras = Config.CCTV.cameras

    if not cameras[camIndex] then
        cb({ success = false })
        return
    end

    StartCCTVCamera(cameras[camIndex])
    cb({ success = true })
end)

RegisterNUICallback('switchCCTV', function(data, cb)
    local cameras = Config.CCTV.cameras
    local camIndex = data.cameraIndex or 1
    if not cameras[camIndex] then
        cb({ success = false })
        return
    end

    DestroyCCTVCamera()
    StartCCTVCamera(cameras[camIndex])
    cb({ success = true })
end)

RegisterNUICallback('stopCCTV', function(_, cb)
    DestroyCCTVCamera()
    cb('ok')
end)

RegisterNUICallback('cctvZoom', function(data, cb)
    if cctvCam then
        local fov = GetCamFov(cctvCam)
        local newFov = fov + (data.direction == 'in' and -5.0 or 5.0)
        newFov = math.max(15.0, math.min(90.0, newFov))
        SetCamFov(cctvCam, newFov)
    end
    cb('ok')
end)

RegisterNUICallback('cctvNightVision', function(data, cb)
    SetNightvision(data.enabled)
    cb('ok')
end)

function StartCCTVCamera(camera)
    cctvActive = true
    local cam = CreateCam('DEFAULT_SCRIPTED_CAMERA', true)
    SetCamCoord(cam, camera.coords.x, camera.coords.y, camera.coords.z)
    SetCamRot(cam, camera.rotation.x, camera.rotation.y, camera.rotation.z, 2)
    SetCamFov(cam, 60.0)
    SetCamActive(cam, true)
    RenderScriptCams(true, true, 500, true, true)
    cctvCam = cam
end

function DestroyCCTVCamera()
    if cctvCam then
        RenderScriptCams(false, true, 500, true, true)
        DestroyCam(cctvCam, true)
        cctvCam = nil
        cctvActive = false
        SetNightvision(false)
    end
end

-- ======================================================
-- KEY BINDS
-- ======================================================

RegisterKeyMapping('hotelui', 'Open Hotel UI', 'keyboard', '')

RegisterCommand('hotelui', function()
    OpenHotelUI()
end, false)

-- ======================================================
-- RESOURCE CLEANUP
-- ======================================================

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end

    CloseHotelUI()
    DestroyCCTVCamera()

    if receptionPed and DoesEntityExist(receptionPed) then
        DeleteEntity(receptionPed)
    end
end)
