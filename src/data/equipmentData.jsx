const equipmentData = [
  {
    id: "backpack",
    name: "Backpack",
    price: 5,
  },
  {
    id: "barrel",
    name: "Barrel",
    price: 1,
  },
  {
    id: "bedroll",
    name: "Bedroll",
    price: 2,
  },
  {
    id: "bell_miniature",
    name: "Bell (miniature)",
    price: 1,
  },
  {
    id: "belt_pouch",
    name: "Belt pouch",
    price: 1,
  },
  {
    id: "box_iron_large",
    name: "Box (iron, large)",
    price: 30,
  },
  {
    id: "box_iron_small",
    name: "Box (iron, small)",
    price: 10,
  },
  {
    id: "caltrops",
    name: "Caltrops (bag of 20)",
    price: 1,
  },
  {
    id: "candles",
    name: "Candles",
    price: 10,
  },
  {
    id: "chain_10",
    name: "Chain (10')",
    price: 30,
  },
  {
    id: "chalk",
    name: "Chalk (10 sticks)",
    price: 5,
  },
  {
    id: "chest_wooden_large",
    name: "Chest (wooden, large)",
    price: 5,
  },
  {
    id: "chest_wooden_small",
    name: "Chest (wooden, small)",
    price: 1,
  },
  {
    id: "chisel",
    name: "Chisel",
    price: 2,
  },
  {
    id: "cooking_pots",
    name: "Cooking pots",
    price: 3,
  },
  {
    id: "crowbar",
    name: "Crowbar",
    price: 10,
  },
  {
    id: "firewood",
    name: "Firewood (bundle)",
    price: 1,
  },
  {
    id: "fishing_rod",
    name: "Fishing rod and tackle",
    price: 4,
  },
  {
    id: "garlic",
    name: "Garlic",
    price: 5,
  },
  {
    id: "grappling_hook",
    name: "Grappling hook",
    price: 25,
  },
  {
    id: "hammer_small",
    name: "Hammer (small)",
    price: 2,
  },
  {
    id: "holy_symbol_gold",
    name: "Holy symbol (gold)",
    price: 100,
  },
  {
    id: "holy_symbol_silver",
    name: "Holy symbol (silver)",
    price: 25,
  },
  {
    id: "holy_symbol_wooden",
    name: "Holy symbol (wooden)",
    price: 1,
  },
  {
    id: "holy_water",
    name: "Holy water (vial)",
    price: 25,
  },
  {
    id: "ink_vial",
    name: "Ink (vial)",
    price: 1,
  },
  {
    id: "iron_spikes",
    name: "Iron spikes (12)",
    price: 1,
  },
  {
    id: "ladder_wooden_10",
    name: "Ladder (wooden, 10')",
    price: 1,
  },
  {
    id: "lantern",
    name: "Lantern",
    price: 10,
  },
  {
    id: "lantern_bullseye",
    name: "Lantern, bullseye",
    price: 20,
  },
  {
    id: "lock",
    name: "Lock",
    price: 20,
  },
  {
    id: "magnifying_glass",
    name: "Magnifying glass",
    price: 3,
  },
  {
    id: "manacles",
    name: "Manacles",
    price: 15,
  },
  {
    id: "marbles",
    name: "Marbles (bag of 20)",
    price: 1,
  },
  {
    id: "mining_pick",
    name: "Mining pick",
    price: 3,
  },
  {
    id: "mirror_hand_steel",
    name: "Mirror (hand-sized, steel)",
    price: 5,
  },
  {
    id: "musical_instrument_string",
    name: "Musical instrument (string)",
    price: 20,
  },
  {
    id: "musical_instrument_wind",
    name: "Musical instrument (wind)",
    price: 5,
  },
  {
    id: "oil_flask",
    name: "Oil (1 flask)",
    price: 2,
  },
  {
    id: "paper",
    name: "Paper/parchment (2 sheets)",
    price: 1,
  },
  {
    id: "pole_10_wooden",
    name: "Pole (10’ long, wooden)",
    price: 1,
  },
  {
    id: "quill",
    name: "Quill",
    price: 1,
  },
  {
    id: "rations_iron",
    name: "Rations (iron, 7 days)",
    price: 15,
  },
  {
    id: "rations_standard",
    name: "Rations (standard, 7 days)",
    price: 5,
  },
  {
    id: "rope_50",
    name: "Rope (50')",
    price: 1,
  },
  {
    id: "sack_large",
    name: "Sack (large)",
    price: 2,
  },
  {
    id: "sack_small",
    name: "Sack (small)",
    price: 1,
  },
  {
    id: "saw",
    name: "Saw",
    price: 1,
  },
  {
    id: "scroll_case",
    name: "Scroll case",
    price: 1,
  },
  {
    id: "shovel",
    name: "Shovel",
    price: 2,
  },
  {
    id: "sledgehammer",
    name: "Sledgehammer",
    price: 5,
  },
  {
    id: "spade",
    name: "Spade",
    price: 2,
  },
  {
    id: "stakes_mallet",
    name: "Stakes (3) and mallet",
    price: 3,
  },
  {
    id: "tent",
    name: "Tent",
    price: 20,
  },
  {
    id: "thieves_tools",
    name: "Thieves’ tools",
    price: 25,
  },
  {
    id: "tinder_box",
    name: "Tinder box (flint & steel)",
    price: 3,
  },
  {
    id: "torches",
    name: "Torches (6)",
    price: 1,
  },
  {
    id: "twine_100",
    name: "Twine (100' ball)",
    price: 1,
  },
  {
    id: "vial_glass",
    name: "Vial (glass)",
    price: 1,
  },
  {
    id: "waterskin",
    name: "Waterskin",
    price: 1,
  },
  {
    id: "whistle",
    name: "Whistle",
    price: 1,
  },
  {
    id: "wine",
    name: "Wine (2 pints)",
    price: 1,
  },
  {
    id: "wolfsbane",
    name: "Wolfsbane (1 bunch)",
    price: 10,
  },
];

export const equipmentPacks = [
  {
    name: "Pack A",
    items: [
      { id: "backpack", quantity: 1 },
      { id: "sack_large", quantity: 1 },
      { id: "lantern", quantity: 1 },
      { id: "oil_flask", quantity: 2 },
      { id: "tinder_box", quantity: 1 },
      { id: "iron_spikes", quantity: 1 },
      { id: "hammer_small", quantity: 1 },
      { id: "waterskin", quantity: 1 },
      { id: "rations_standard", quantity: 1 },
    ],
  },
  {
    name: "Pack B",
    items: [
      { id: "backpack", quantity: 1 },
      { id: "sack_large", quantity: 2 },
      { id: "torches", quantity: 1 },
      { id: "oil_flask", quantity: 3 },
      { id: "tinder_box", quantity: 1 },
      { id: "pole_10_wooden", quantity: 1 },
      { id: "rope_50", quantity: 1 },
      { id: "waterskin", quantity: 1 },
      { id: "rations_standard", quantity: 1 },
    ],
  },
  {
    name: "Pack C",
    items: [
      { id: "backpack", quantity: 1 },
      { id: "sack_small", quantity: 4 },
      {
        id: "special_class_item",
        quantity: 1,
        options: [
          { class: "Cleric", id: "holy_symbol_wooden" },
          { class: "Thief", id: "thieves_tools" },
          { default: true, id: "holy_water" },
        ],
      },
      { id: "iron_spikes", quantity: 1 },
      { id: "rope_50", quantity: 1 },
      { id: "waterskin", quantity: 1 },
      { id: "mirror_hand_steel", quantity: 1 },
      { id: "rations_standard", quantity: 1 },
    ],
  },
];

export default equipmentData;
