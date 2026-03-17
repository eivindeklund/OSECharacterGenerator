import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Inventory from "../../components/equipment/Inventory";
import ScreenNavigation from "../../components/general/ScreenNavigation";
import ArmourOptionsContainer from "../../containers/equipment/ArmourOptionsContainer";
import GearOptionsContainer from "../../containers/equipment/GearOptionsContainer";
import PackOptionsContainer from "../../containers/equipment/PackOptionsContainer";
import WeaponOptionsContainer from "../../containers/equipment/WeaponOptionsContainer";
import { useCharacter } from "../../contexts/CharacterContext";
import armourData from "../../data/armourData";
import equipmentData from "../../data/equipmentData";
import weaponsData from "../../data/weaponsData";
import type {
    CharacterEquipment,
    CharacterModifiers,
    CharacterStatistics,
    ClassOptionsData,
} from "../../types";
import {
    calculateArmourClass
} from "../../utilities/utilities";

interface EquipmentStoreProps {
  characterClass: ClassOptionsData;
  characterModifiers: CharacterModifiers;
  characterStatistics: CharacterStatistics;
  setCharacterStatistics: React.Dispatch<React.SetStateAction<CharacterStatistics>>;
  characterEquipment: CharacterEquipment;
  setCharacterEquipment: React.Dispatch<React.SetStateAction<CharacterEquipment>>;
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
    rollGold,
  } = props;

  const navigate = useNavigate();
  const { character } = useCharacter();

  const [gold, setGold] = useState<number | null>(characterEquipment.gold);
  const [rolledGold, setRolledGold] = useState<number | null>(characterEquipment.gold);
  const [goldRolled, setGoldRolled] = useState(
    characterEquipment.gold !== null,
  );
  const [showGoldInfo, setShowGoldInfo] = useState(
    characterEquipment.gold !== null,
  );
  const [adventuringGear, setAdventuringGear] = useState(
    characterEquipment.adventuringGear || [],
  );
  const [armour, setArmour] = useState(characterEquipment.armour || []);
  const [weapons, setWeapons] = useState(characterEquipment.weapons || []);
  const [armourClass, setArmourClass] = useState<number | null>(null);
  const [unarmouredAC, setUnarmouredAC] = useState<number | null>(null);
  const [bxOnly, setBxOnly] = useState(true);

  useEffect(() => {
    calculateAC();
  }, []);

  useEffect(() => {
    calculateAC();
  }, [armour]);



  const handleItemAction = (selectedItem, action, type) => {
    // selectedItem is now always an item ID (Backpack passes item.id directly)
    let storeCollection: any[];

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
    throw new Error("Invalid type in handleItemAction: " + type);
  };

  const handleResetEquipment = () => {
    setWeapons([]);
    setArmour([]);
    setAdventuringGear([]);
    setGold(rolledGold);
  };

  const calculateAC = () => {
    const [baseArmour, armourClass] = calculateArmourClass(
      characterModifiers.dexterityModAC,
      armour,
    );
    setUnarmouredAC(baseArmour);
    setArmourClass(armourClass);
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
      setRolledGold(characterEquipment.gold);
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

            {characterClass.allowedArmour.length > 0 && (
              <ArmourOptionsContainer
                characterClass={characterClass}
                purchaseLedger={inventoryCounts}
                handleUpdateLedger={handleUpdateInventory}
              ></ArmourOptionsContainer>
            )}

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

      {/* TODO: Change the formatting here to look nicer */}
      {goldRolled && weapons.length == 0 && (
        <div className="equipment-warning">
          Warning: You have no weapons!
        </div>
      )}
      {goldRolled && armour.length == 0 && characterClass.allowedArmour.length > 0 && (
        <div className="equipment-warning">
          Warning: You have no armour!
        </div>
      )}
      {/* updates parent state with all new values when moving on to next page */}
      <ScreenNavigation
        onPrev={() => {
          navigate(`/character/${character.id}/class`);
        }}
        prevLabel="Class Options"
        onNext={() => {
          navigate(`/character/${character.id}/details`);
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

