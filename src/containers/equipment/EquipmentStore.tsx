import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Inventory from "../../components/equipment/Inventory";
import ScreenNavigation from "../../components/general/ScreenNavigation";
import {
    Cleric,
    Dwarf,
    Elf,
    Fighter,
    Halfling,
} from "../../constants/constants";
import ArmourOptionsContainer from "../../containers/equipment/ArmourOptionsContainer";
import GearOptionsContainer from "../../containers/equipment/GearOptionsContainer";
import PackOptionsContainer from "../../containers/equipment/PackOptionsContainer";
import WeaponOptionsContainer from "../../containers/equipment/WeaponOptionsContainer";
import armourData, { ARMOUR_ID } from "../../data/armourData";
import equipmentData from "../../data/equipmentData";
import weaponsData from "../../data/weaponsData";
import type {
    CharacterEquipment,
    CharacterModifiers,
    CharacterStatistics,
    ClassOptionsData,
} from "../../types";
import {
    calculateArmourClass,
    chooseRandomItem
} from "../../utilities/utilities";

interface EquipmentStoreProps {
  characterClass: ClassOptionsData;
  characterModifiers: CharacterModifiers;
  characterStatistics: CharacterStatistics;
  setCharacterStatistics: React.Dispatch<React.SetStateAction<CharacterStatistics>>;
  characterEquipment: CharacterEquipment;
  setCharacterEquipment: React.Dispatch<React.SetStateAction<CharacterEquipment>>;
  diceEnabled: boolean;
  rollGold: () => void;
}

export default function EquipmentStore(props: EquipmentStoreProps) {
  const {
    characterClass,
    characterModifiers,
    characterStatistics,
    setCharacterStatistics,
    characterEquipment,
    setCharacterEquipment,
    diceEnabled,
    rollGold,
  } = props;

  const navigate = useNavigate();

  const [gold, setGold] = useState<number | null>(characterEquipment.gold);
  const [goldRolled, setGoldRolled] = useState(
    characterEquipment.gold !== null,
  );
  const [showGoldInfo, setShowGoldInfo] = useState(
    characterEquipment.gold !== null,
  );
  const [adventuringGear, setAdventuringGear] = useState(
    characterEquipment.adventuringGear || [],
  );
  const [adventuringGearSelected, setAdventuringGearSelected] =
    useState("Backpack");
  const [armour, setArmour] = useState(characterEquipment.armour || []);
  const [armourSelected, setArmourSelected] = useState(null);
  const [shieldSelected, setShieldSelected] = useState(false);
  const [weapons, setWeapons] = useState(characterEquipment.weapons || []);
  const [weaponSelected, setWeaponSelected] = useState("Dagger");
  const [armourClass, setArmourClass] = useState<number | null>(null);
  const [unarmouredAC, setUnarmouredAC] = useState<number | null>(null);
  const [bxOnly, setBxOnly] = useState(true);

  useEffect(() => {
    // calculate base armour class

    calculateAC();

    // update default selectedWeapon to one appropriate for class

    if (characterClass.name === Cleric) {
      setWeaponSelected("mace");
    }

    if (characterClass.name === Fighter) {
      setWeaponSelected("sword");
    }

    if (characterClass.name === Elf) {
      setWeaponSelected("long_bow");
    }

    if (characterClass.name === Dwarf) {
      setWeaponSelected("battle_axe");
    }

    if (characterClass.name === Halfling) {
      setWeaponSelected("sling");
    }
  }, []);

  useEffect(() => {
    calculateAC();
  }, [armour]);


  const adventuringGearList = () => {
    return equipmentData.map((item) => (
      <option value={item.id} key={item.id}>
        {item.name} - {item.price} gp
      </option>
    ));
  };

  const renderWeaponOption = (item) => {
    return (
      <option
        value={item.id}
        key={item.id}
      >
        {item.name} ({item.damage}) - {item.price} gp
      </option>
    );
  };

  const weaponsList = () => {
    return weaponsData.map((item) => renderWeaponOption(item));
  };

  const handleAdventuringGearChange = (event) => {
    setAdventuringGearSelected(event.target.value);
  };

  const handleWeaponChange = (event) => {
    setWeaponSelected(event.target.value);
  };

  const handleArmourChange = (event) => {
    setArmourSelected(event.target.value);
  };

  const handleShieldChange = () => {
    if (!shieldSelected === true) {
      setShieldSelected(true);
    } else {
      setShieldSelected(false);
    }
  };

  const handleItemAction = (selectedItem, action, type) => {
    // selectedItem is now always an item ID (Backpack passes item.id directly)
    let storeCollection;

    switch (type) {
      case "armour":
        storeCollection = armourData;
        break;
      case "weapon":
        storeCollection = weaponsData;
        break;
      case "gear":
        storeCollection = equipmentData;
        break;
    }

    const item = storeCollection?.find((object) => object.id === selectedItem);

    if (type === "weapon") {
      const index = weapons.findIndex((x) => {
        return x === item.id;
      });
      const newWeaponsArray = [...weapons];
      switch (action) {
        case "buy":
          if (item.price > (gold ?? 0)) {
            return;
          }
          setGold((gold ?? 0) - item.price);
          setWeapons((oldItems) => [...oldItems, item.id]);
          break;
        case "sell":
          newWeaponsArray.splice(index, 1);
          setWeapons(newWeaponsArray);
          setGold((gold ?? 0) + item.price);
      }
    }

    if (type === "armour") {
      const shieldCost = shieldSelected ? 10 : 0;
      const index = armour.findIndex((x) => {
        return x === item.id;
      });
      const newArmourArray = [...armour];
      switch (action) {
        case "buy":
          if (item.price + shieldCost > (gold ?? 0)) {
            return;
          }
          if (shieldSelected) {
            setGold((gold ?? 0) - item.price - shieldCost);
            setArmour((oldArmour) => [...oldArmour, item.id, ARMOUR_ID.shield]);
          } else {
            setGold((gold ?? 0) - item.price);
            setArmour((oldArmour) => [...oldArmour, item.id]);
          }
          break;
        case "sell":
          newArmourArray.splice(index, 1);
          setArmour(newArmourArray);
          setGold((gold ?? 0) + item.price);
      }
    }

    if (type === "gear") {
      const index = adventuringGear.findIndex((x) => {
        return x === item.id;
      });
      const newGearArray = [...adventuringGear];

      switch (action) {
        case "buy":
          if (item.price > (gold ?? 0)) {
            return;
          }
          setGold((gold ?? 0) - item.price);
          setAdventuringGear((oldGear) => [...oldGear, item.id]);
          break;
        case "sell":
          newGearArray.splice(index, 1);
          setAdventuringGear(newGearArray);
          setGold((gold ?? 0) + item.price);
      }
    }
  };

  const handleResetEquipment = () => {
    setWeapons([]);
    setArmour([]);
    setAdventuringGear([]);
  };

  const calculateAC = () => {
    const [baseArmour, armourClass] = calculateArmourClass(
      characterModifiers.dexterityModAC,
      armour,
    );
    setUnarmouredAC(baseArmour);
    setArmourClass(armourClass);
  };

  const selectRandomWeapon = () => {
    const randomWeapon = chooseRandomItem(weaponsData);
    setWeaponSelected(randomWeapon.id);
  };

  const selectRandomGear = () => {
    const randomGear = chooseRandomItem(equipmentData);
    setAdventuringGearSelected(randomGear.id);
  };

  const getItemPrice = (itemId: string) => {
    const allItems = [...equipmentData, ...weaponsData, ...armourData];
    const item = allItems.find((i) => i.id === itemId);
    return item ? item.price : 0;
  };

  const getItemCategory = (itemId: string) => {
    if (weaponsData.find((i) => i.id === itemId)) return "weapon";
    if (armourData.find((i) => i.id === itemId)) return "armour";
    return "gear";
  };

  /* Derive item counts directly from inventory arrays */
  const inventoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    [...weapons, ...armour, ...adventuringGear].forEach((name) => {
      counts[name] = (counts[name] || 0) + 1;
    });
    return counts;
  }, [weapons, armour, adventuringGear]);

  const removeItemsFromArray = (arr: string[], name: string, count: number): string[] => {
    let removed = 0;
    return arr.filter((item) => {
      if (item === name && removed < count) {
        removed++;
        return false;
      }
      return true;
    });
  };

  const handleUpdateInventory = (itemId: string, newQty: number) => {
    const currentQty = inventoryCounts[itemId] || 0;
    const diff = newQty - currentQty;
    if (diff === 0) return;

    const price = getItemPrice(itemId);
    const category = getItemCategory(itemId);

    if (diff > 0) {
      if (price * diff > (gold ?? 0)) return; // not enough gold
      setGold((g) => (g ?? 0) - price * diff);
      const additions = Array(diff).fill(itemId);
      if (category === "weapon") setWeapons((w) => [...w, ...additions]);
      else if (category === "armour") setArmour((a) => [...a, ...additions]);
      else setAdventuringGear((g) => [...g, ...additions]);
    } else {
      const refundCount = Math.abs(diff);
      setGold((g) => (g ?? 0) + price * refundCount);
      if (category === "weapon") setWeapons((w) => removeItemsFromArray(w, itemId, refundCount));
      else if (category === "armour") setArmour((a) => removeItemsFromArray(a, itemId, refundCount));
      else setAdventuringGear((g) => removeItemsFromArray(g, itemId, refundCount));
    }
  };

  const handleBuyPack = (items: Array<{ id: string; name: string; price: number; quantity: number; category?: string }>) => {
    const totalCost = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    if (totalCost > (gold ?? 0)) return;

    const newWeapons = [...weapons];
    const newArmour = [...armour];
    const newGear = [...adventuringGear];

    items.forEach((item) => {
      const category = item.category ?? getItemCategory(item.id);
      const qty = item.quantity || 1;
      for (let i = 0; i < qty; i++) {
        if (category === "weapon") newWeapons.push(item.id);
        else if (category === "armour") newArmour.push(item.id);
        else newGear.push(item.id);
      }
    });

    setWeapons(newWeapons);
    setArmour(newArmour);
    setAdventuringGear(newGear);
    setGold((g) => (g ?? 0) - totalCost);
  };

  useEffect(() => {
    if (characterEquipment.gold !== null && gold === null) {
      setGold(characterEquipment.gold);
      setGoldRolled(true);
      setShowGoldInfo(true);
    }
  }, [characterEquipment.gold]);

  return (
    <>
      <div className="gold-container">
        {showGoldInfo && <h5 className="gold">{gold} gp</h5>}
        {gold === null && (
          <button
            className="button button-primary button--gold"
            onClick={() => setTimeout(() => rollGold(), 200)}
          >
            Roll Gold
          </button>
        )}
        {goldRolled && (
          <button
            className="button button-secondary button--reset-equipment"
            onClick={handleResetEquipment}
          >
            Reset Equipment
          </button>
        )}
      </div>
      {goldRolled && (
        <div className="equipment-purchase-container">
          <div className="equipment-options">
            {
              <PackOptionsContainer
                characterClass={characterClass}
                gold={gold}
                bxOnly={bxOnly}
                onBxOnlyChange={setBxOnly}
                handleAddToLedger={handleBuyPack}
                purchaseLedger={inventoryCounts}
              />
            }

            {
              <ArmourOptionsContainer
                characterClass={characterClass}
                purchaseLedger={inventoryCounts}
                handleUpdateLedger={handleUpdateInventory}
              ></ArmourOptionsContainer>
            }

            {
              <WeaponOptionsContainer
                characterClass={characterClass}
                purchaseLedger={inventoryCounts}
                handleUpdateLedger={handleUpdateInventory}
              ></WeaponOptionsContainer>
            }

            {
              <GearOptionsContainer
                purchaseLedger={inventoryCounts}
                handleUpdateLedger={handleUpdateInventory}
              ></GearOptionsContainer>
            }


          </div>

          <Inventory
            weapons={weapons}
            adventuringGear={adventuringGear}
            armour={armour}
            onItemAction={handleItemAction}
          ></Inventory>
        </div>
      )}

      {/* This should be part of the button conditional, but I don't know how
      that works syntactically. */}
      {/* TODO: Make this part of the button conditional */}
      {/* TODO: Do not show this for the Magic user class, and remove "unarmoured" as a purchase option */}
      {/* TODO: Add a warning for not buying a weapon */}
      {goldRolled && armour.length == 0 && (
        <div style={{ color: "red", marginTop: "5px" }}>
          Warning: You have no armour!
        </div>
      )}
      {/* updates parent state with all new values when moving on to next page */}
      <ScreenNavigation
        onPrev={() => {
          navigate('/class');
        }}
        prevLabel="Class Options"
        onNext={() => {
          navigate('/details');
        }}
        onNavigation={() => {
          const newCharacterEquipment = {
            armour,
            weapons,
            adventuringGear,
            gold,
            AC: armourClass,
            unarmouredAC,
          };
          setCharacterEquipment(newCharacterEquipment);
          setCharacterStatistics({
            ...characterStatistics,
            armourClass,
            unarmouredAC,
          });
        }}
        nextLabel="Character Details"
        requirements={[!goldRolled && "Roll starting gold"].filter(Boolean)}
      />
    </>
  );
}

