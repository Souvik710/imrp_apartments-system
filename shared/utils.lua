---@param amount number
---@return string
function FormatMoney(amount)
    local formatted = tostring(math.floor(amount))
    local k
    while true do
        formatted, k = string.gsub(formatted, '^(-?%d+)(%d%d%d)', '%1,%2')
        if k == 0 then break end
    end
    return Config.Currency .. formatted
end

---@param roomNumber string
---@return string
function GetStashId(roomNumber)
    return 'hotel_' .. string.gsub(roomNumber, '-', '')
end

---@param roomNumber string
---@return table|nil
function GetRoomConfig(roomNumber)
    return Config.Rooms[roomNumber]
end

---@param roomNumber string
---@return table|nil
function GetRoomTypeConfig(roomNumber)
    local roomCfg = Config.Rooms[roomNumber]
    if not roomCfg then return nil end
    return Config.RoomTypes[roomCfg.type]
end

---@param floor number
---@return string
function GetFloorLabel(floor)
    if floor == 7 then return 'Penthouse' end
    return 'Floor ' .. floor
end
