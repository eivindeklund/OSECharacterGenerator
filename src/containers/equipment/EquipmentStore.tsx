import { useEffect, useState } from "react";
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
import armourData from "../../data/armourData";
import equipmentData from "../../data/equipmentData";
import weaponsData from "../../data/weaponsData";
import type {
    CharacterEquipment,
    CharacterModifiers,
    CharacterStatistics,
    ClassOptionsData,
    ScreenState,
} from "../../types";
import {
    calculatePackPrice,
    resolvePackItems,
} from "../../utilities/PackUtils";
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
  screen: ScreenState;
  setScreen: (screen: ScreenState) => void;
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
    screen,
    setScreen,
    diceEnabled,
    rollGold,
  } = props;

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

  useEffect(() => {
    // calculate base armour class

    calculateAC();

    // update default selectedWeapon to one appropriate for class

    if (characterClass.name === Cleric) {
      setWeaponSelected("Mace");
    }

    if (characterClass.name === Fighter) {
      setWeaponSelected("Sword");
    }

    if (characterClass.name === Elf) {
      setWeaponSelected("Long bow");
    }

    if (characterClass.name === Dwarf) {
      setWeaponSelected("Battle axe");
    }

    if (characterClass.name === Halfling) {
      setWeaponSelected("Sling");
    }
  }, []);

  useEffect(() => {
    calculateAC();
  }, [armour]);


  const adventuringGearList = () => {
    return equipmentData.map((item) => (
      <option value={item.name} price={item.price} key={item.name}>
        {item.name} - {item.price} gp
      </option>
    ));
  };

  const weaponsOptions = (item) => {
    return (
      <option
        value={item.name}
        price={item.price}
        damage={item.damage}
        key={item.name}
      >
        {item.name} ({item.damage}) - {item.price} gp
      </option>
    );
  };

  const weaponsList = () => {
    return weaponsData.map((item) => weaponsOptions(item));
  };

  const updateSelectedAdventuringGear = (event) => {
    setAdventuringGearSelected(event.target.value);
  };

  const updateSelectedWeapon = (event) => {
    setWeaponSelected(event.target.value);
  };

  const handleOptionChange = (event) => {
    setArmourSelected(event.target.value);
  };

  const handleShieldChange = () => {
    if (!shieldSelected === true) {
      setShieldSelected(true);
    } else {
      setShieldSelected(false);
    }
  };

  const storeHandler = (selectedItem, action, type) => {
    if (
      type !== "pack" &&
      typeof selectedItem === "string" &&
      selectedItem.includes(" (x")
    ) {
      const itemNameNonConsolidated = selectedItem.split(" (x");
      selectedItem = itemNameNonConsolidated[0];
    }

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
      case "pack":
        // No consolidation collection needed for packs as they are handled differently
        break;
    }

    if (type === "pack") {
      const pack = selectedItem;
      const price = calculatePackPrice(pack.items, characterClass.name);

      if (action === "buy") {
        if (price > (gold ?? 0)) {
          return;
        }

        const resolvedItems = resolvePackItems(pack.items, characterClass.name);

        let newGold = (gold ?? 0) - price;
        let newWeapons = [...weapons];
        let newArmour = [...armour];
        let newGear = [...adventuringGear];

        resolvedItems.forEach((item) => {
          // Add item multiple times based on quantity
          for (let i = 0; i < item.quantity; i++) {
            if (item.category === "weapon") {
              newWeapons.push(item.name);
            } else if (item.category === "armour") {
              newArmour.push(item.name);
            } else {
              newGear.push(item.name);
            }
          }
        });

        setGold(newGold);
        setWeapons(newWeapons);
        setArmour(newArmour);
        setAdventuringGear(newGear);
      }
      return;
    }

    const findItem = (object) => {
      return object.name === selectedItem;
    };

    const item = storeCollection.find(findItem);

    if (type === "weapon") {
      const index = weapons.findIndex((x) => {
        return x === item.name;
      });
      const newWeaponsArray = [...weapons];
      switch (action) {
        case "buy":
          if (item.price > (gold ?? 0)) {
            return;
          }
          setGold((gold ?? 0) - item.price);
          setWeapons((oldItems) => [...oldItems, item.name]);
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
        return x === item.name;
      });
      const newArmourArray = [...armour];
      switch (action) {
        case "buy":
          if (item.price + shieldCost > (gold ?? 0)) {
            return;
          }
          if (shieldSelected) {
            setGold((gold ?? 0) - item.price - shieldCost);
            setArmour((oldArmour) => [...oldArmour, item.name, "Shield"]);
          } else {
            setGold((gold ?? 0) - item.price);
            setArmour((oldArmour) => [...oldArmour, item.name]);
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
        return x === item.name;
      });
      const newGearArray = [...adventuringGear];

      switch (action) {
        case "buy":
          if (item.price > (gold ?? 0)) {
            return;
          }
          setGold((gold ?? 0) - item.price);
          setAdventuringGear((oldGear) => [...oldGear, item.name]);
          break;
        case "sell":
          newGearArray.splice(index, 1);
          setAdventuringGear(newGearArray);
          setGold((gold ?? 0) + item.price);
      }
    }
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
    setWeaponSelected(randomWeapon.name);
  };

  const selectRandomGear = () => {
    const randomGear = chooseRandomItem(equipmentData);
    setAdventuringGearSelected(randomGear.name);
  };

  /* Purchase Ledger Logic */
  const [purchaseLedger, setPurchaseLedger] = useState<Record<string, number>>({});

  const getItemPrice = (itemName) => {
    const allItems = [...equipmentData, ...weaponsData, ...armourData];
    const item = allItems.find((i) => i.name === itemName);
    return item ? item.price : 0;
  };

  const getItemCategory = (itemName) => {
    if (weaponsData.find((i) => i.name === itemName)) return "weapon";
    if (armourData.find((i) => i.name === itemName)) return "armour";
    return "gear";
  };

  const handleUpdateLedger = (itemName, quantity) => {
    setPurchaseLedger((prevLedger) => {
      const newLedger = { ...prevLedger };
      if (quantity <= 0) {
        delete newLedger[itemName];
      } else {
        newLedger[itemName] = quantity;
      }
      return newLedger;
    });
  };

  const handleAddToLedger = (items) => {
    setPurchaseLedger((prevLedger) => {
      const newLedger = { ...prevLedger };
      items.forEach((item) => {
        const currentQty = newLedger[item.name] || 0;
        newLedger[item.name] = currentQty + (item.quantity || 1);
      });
      return newLedger;
    });
  };

  const handleClearLedger = () => {
    setPurchaseLedger({});
  };

  const getLedgerTotal = () => {
    return Object.entries(purchaseLedger).reduce((total, [name, qty]) => {
      return total + getItemPrice(name) * qty;
    }, 0);
  };

  const handleBuyLedger = () => {
    const totalCost = getLedgerTotal();
    if (totalCost > (gold ?? 0)) return;

    const newWeapons = [...weapons];
    const newArmour = [...armour];
    const newGear = [...adventuringGear];

    Object.entries(purchaseLedger).forEach(([name, qty]) => {
      const category = getItemCategory(name);
      for (let i = 0; i < qty; i++) {
        if (category === "weapon") newWeapons.push(name);
        else if (category === "armour") newArmour.push(name);
        else newGear.push(name);
      }
    });

    setWeapons(newWeapons);
    setArmour(newArmour);
    setAdventuringGear(newGear);
    setGold((gold ?? 0) - totalCost);
    setPurchaseLedger({});
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
      </div>
      {goldRolled && (
        <div className="equipment-purchase-container">
          <div className="equipment-options">
            {
              <ArmourOptionsContainer
                characterClass={characterClass}
                purchaseLedger={purchaseLedger}
                handleUpdateLedger={handleUpdateLedger}
              ></ArmourOptionsContainer>
            }

            {
              <WeaponOptionsContainer
                characterClass={characterClass}
                purchaseLedger={purchaseLedger}
                handleUpdateLedger={handleUpdateLedger}
              ></WeaponOptionsContainer>
            }

            {
              <PackOptionsContainer
                characterClass={characterClass}
                handleAddToLedger={handleAddToLedger}
              />
            }

            {
              <GearOptionsContainer
                purchaseLedger={purchaseLedger}
                handleUpdateLedger={handleUpdateLedger}
              ></GearOptionsContainer>
            }

            {/* Purchase Ledger Summary */}
            {Object.keys(purchaseLedger).length > 0 && (
              <div
                className="purchase-ledger-summary"
                style={{
                  marginBottom: "20px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                }}
              >
                <h4>Purchase Ledger</h4>
                <ul>
                  {Object.entries(purchaseLedger).map(([name, qty]) => (
                    <li key={name} style={{ textAlign: "left" }}>
                      {name} x{qty} ({getItemPrice(name) * (qty as number)} gp)
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: "10px", fontWeight: "bold" }}>
                  Total: {getLedgerTotal()} gp
                </div>
                <div
                  style={{ marginTop: "10px", display: "flex", gap: "10px" }}
                >
                  <button
                    className="button button-primary"
                    onClick={handleBuyLedger}
                    disabled={getLedgerTotal() > (gold ?? 0)}
                  >
                    Buy Ledger
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={handleClearLedger}
                  >
                    Clear Ledger
                  </button>
                </div>
                {getLedgerTotal() > (gold ?? 0) && (
                  <div style={{ color: "red", marginTop: "5px" }}>
                    Not enough gold!
                  </div>
                )}
              </div>
            )}
          </div>

          <Inventory
            weapons={weapons}
            adventuringGear={adventuringGear}
            armour={armour}
            storeHandler={storeHandler}
          ></Inventory>
        </div>
      )}

      {/* This should be part of the button conditional, but I don't know how
      that works syntactically. */}
      {/* TODO: Make this part of the button conditional */}
      {/* TODO: Do not show this for the Magic user class, and remove "unarmoured" as a purchase option */}
      {/* TODO: Add a warning for not buying a weapon */}
      {/* TODO: Add a warning for not having purchased your ledger. Maybe make clearing or purchasing mandatory? */}
      {goldRolled && armour.length == 0 && (
        <div style={{ color: "red", marginTop: "5px" }}>
          Warning: You have no armour!
        </div>
      )}
      {/* updates parent state with all new values when moving on to next page */}
      <ScreenNavigation
        onPrev={() => {
          setScreen({
            ...screen,
            equipmentScreen: false,
            classScreen: true,
          });
        }}
        prevLabel="Class Options"
        onNext={() => {
          setScreen({
            ...screen,
            equipmentScreen: false,
            detailsScreen: true,
          });
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

