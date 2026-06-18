# ox_inventory Item Registration

Add the following to your `ox_inventory/data/items.lua`:

```lua
['hotel_key'] = {
    label = 'Hotel Key Card',
    weight = 50,
    stack = false,
    close = true,
    description = 'A digital key card for Opium Nights Hotel',
    client = {
        image = 'hotel_key.png',
    },
},
```

Place a `hotel_key.png` image in `ox_inventory/web/images/`.
