Config = {}

Config.HotelName = 'Opium Nights Hotel'
Config.ServerName = 'IMMORTAL ROLEPLAY'
Config.Author = 'Ragna'

Config.Debug = false

Config.RefundPercent = 0.70
Config.RentDurationDays = 7
Config.GracePeriodDays = 3
Config.MaxSharedAccess = 5

Config.Currency = '$'

Config.Blip = {
    enabled = true,
    coords = vector3(0.0, 0.0, 0.0), -- Set to MLO location
    sprite = 475,
    color = 5,
    scale = 0.8,
    label = 'Opium Nights Hotel',
}

Config.Reception = {
    model = 'a_f_y_business_01',
    coords = vector4(0.0, 0.0, 0.0, 0.0), -- Set to MLO reception coords
    scenario = 'WORLD_HUMAN_CLIPBOARD',
    targetDistance = 2.5,
    targetLabel = 'Hotel Reception',
    targetIcon = 'fas fa-hotel',
}

Config.Elevator = {
    coords = vector3(0.0, 0.0, 0.0), -- Set to elevator coords
    targetDistance = 2.0,
    targetLabel = 'Use Elevator',
    targetIcon = 'fas fa-elevator',
    floors = {
        { label = 'Lobby', z = 0.0 },
        { label = 'Floor 1', z = 10.0 },
        { label = 'Floor 2', z = 20.0 },
        { label = 'Floor 3', z = 30.0 },
        { label = 'Floor 4', z = 40.0 },
        { label = 'Floor 5', z = 50.0 },
        { label = 'Floor 6', z = 60.0 },
        { label = 'Penthouse', z = 70.0 },
    },
}

Config.Garage = {
    spawn = vector4(0.0, 0.0, 0.0, 0.0), -- Set to garage spawn coords
    store = vector3(0.0, 0.0, 0.0), -- Set to garage store coords
    targetDistance = 3.0,
    maxVehicles = 2,
}

Config.CCTV = {
    cameras = {
        {
            label = 'Lobby',
            coords = vector3(0.0, 0.0, 0.0), -- Set to camera coords
            rotation = vector3(0.0, 0.0, 0.0),
        },
        {
            label = 'Reception',
            coords = vector3(0.0, 0.0, 0.0),
            rotation = vector3(0.0, 0.0, 0.0),
        },
        {
            label = 'Elevator',
            coords = vector3(0.0, 0.0, 0.0),
            rotation = vector3(0.0, 0.0, 0.0),
        },
        {
            label = 'Garage',
            coords = vector3(0.0, 0.0, 0.0),
            rotation = vector3(0.0, 0.0, 0.0),
        },
        {
            label = 'Entrance',
            coords = vector3(0.0, 0.0, 0.0),
            rotation = vector3(0.0, 0.0, 0.0),
        },
        {
            label = 'Hallway 1',
            coords = vector3(0.0, 0.0, 0.0),
            rotation = vector3(0.0, 0.0, 0.0),
        },
        {
            label = 'Penthouse Entrance',
            coords = vector3(0.0, 0.0, 0.0),
            rotation = vector3(0.0, 0.0, 0.0),
        },
    },
}

Config.RoomTypes = {
    standard = {
        label = 'Standard Room',
        price = 50000,
        weeklyRent = 25000,
        storageWeight = 75000,
        storageSlots = 50,
        icon = 'fas fa-bed',
    },
    deluxe = {
        label = 'Deluxe Room',
        price = 100000,
        weeklyRent = 35000,
        storageWeight = 100000,
        storageSlots = 75,
        icon = 'fas fa-star',
    },
    executive = {
        label = 'Executive Suite',
        price = 250000,
        weeklyRent = 50000,
        storageWeight = 150000,
        storageSlots = 100,
        icon = 'fas fa-crown',
    },
    luxury = {
        label = 'Luxury Suite',
        price = 500000,
        weeklyRent = 75000,
        storageWeight = 200000,
        storageSlots = 125,
        icon = 'fas fa-gem',
    },
    penthouse = {
        label = 'Penthouse',
        price = 1000000,
        weeklyRent = 100000,
        storageWeight = 300000,
        storageSlots = 200,
        icon = 'fas fa-building',
    },
}

Config.Utilities = {
    electricity = {
        label = 'Electricity',
        weeklyCharge = 500,
    },
    water = {
        label = 'Water',
        weeklyCharge = 300,
    },
    internet = {
        label = 'Internet',
        weeklyCharge = 200,
    },
}

Config.RoomService = {
    food = {
        { item = 'sandwich', label = 'Club Sandwich', price = 50, deliveryTime = 60 },
        { item = 'burger', label = 'Premium Burger', price = 75, deliveryTime = 60 },
        { item = 'steak', label = 'Wagyu Steak', price = 200, deliveryTime = 120 },
        { item = 'sushi', label = 'Sushi Platter', price = 150, deliveryTime = 90 },
    },
    drinks = {
        { item = 'water_bottle', label = 'Mineral Water', price = 10, deliveryTime = 30 },
        { item = 'coffee', label = 'Premium Coffee', price = 25, deliveryTime = 45 },
        { item = 'wine', label = 'Champagne', price = 300, deliveryTime = 60 },
        { item = 'whiskey', label = 'Aged Whiskey', price = 250, deliveryTime = 60 },
    },
    supplies = {
        { item = 'bandage', label = 'First Aid Kit', price = 100, deliveryTime = 60 },
        { item = 'phone', label = 'Burner Phone', price = 500, deliveryTime = 120 },
    },
}

Config.Rooms = {}

local floorRoomTypes = {
    [1] = 'standard',
    [2] = 'standard',
    [3] = 'deluxe',
    [4] = 'deluxe',
    [5] = 'executive',
    [6] = 'luxury',
}

for floor = 1, 6 do
    for room = 1, 12 do
        local roomNumber = tostring(floor * 100 + room)
        Config.Rooms[roomNumber] = {
            number = roomNumber,
            floor = floor,
            type = floorRoomTypes[floor],
            door = vector3(0.0, 0.0, 0.0), -- Set to actual door coords per room
            stash = vector3(0.0, 0.0, 0.0), -- Set to stash coords per room
            wardrobe = vector3(0.0, 0.0, 0.0), -- Set to wardrobe coords per room
            doorbell = vector3(0.0, 0.0, 0.0), -- Set to doorbell coords per room
        }
    end
end

local penthouseCount = 3
for i = 1, penthouseCount do
    local roomNumber = 'PH-' .. string.format('%02d', i)
    Config.Rooms[roomNumber] = {
        number = roomNumber,
        floor = 7,
        type = 'penthouse',
        door = vector3(0.0, 0.0, 0.0),
        stash = vector3(0.0, 0.0, 0.0),
        wardrobe = vector3(0.0, 0.0, 0.0),
        doorbell = vector3(0.0, 0.0, 0.0),
    }
end
