import { useState } from "react";
import equipmentData from "../../data/equipmentData";
import weaponsData from "../../data/weaponsData";
import type { Campaign, EquipmentItem, WeaponItem } from "../../types";
import { toggleAllowed } from "../../utilities/campaignFilterUtils";
import { ThreeStateToggle } from "./CampaignGeneralTab";

// ── Module-level constants ────────────────────────────────────────────────────

const ALL_EQUIPMENT = equipmentData as EquipmentItem[];
const ALL_EQUIPMENT_IDS = ALL_EQUIPMENT.map((i) => i.id);
const EQUIPMENT_CATEGORIES = [
  ...new Set(ALL_EQUIPMENT.map((i) => i.category)),
];
const EQUIPMENT_BY_CATEGORY = EQUIPMENT_CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat] = ALL_EQUIPMENT.filter((i) => i.category === cat);
    return acc;
  },
  {} as Record<string, EquipmentItem[]>,
);

const ALL_WEAPONS = weaponsData as WeaponItem[];
const ALL_WEAPON_IDS = ALL_WEAPONS.map((w) => w.id);
const WEAPON_CATEGORIES = [...new Set(ALL_WEAPONS.map((w) => w.category))];
const WEAPONS_BY_CATEGORY = WEAPON_CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat] = ALL_WEAPONS.filter((w) => w.category === cat);
    return acc;
  },
  {} as Record<string, WeaponItem[]>,
);

// ── Add-equipment form state ──────────────────────────────────────────────────

interface EquipmentFormState {
  name: string;
  price: string;
  category: string;
}

interface WeaponFormState {
  name: string;
  price: string;
  damage: string;
  category: string;
  qualities: string;
}

const EMPTY_EQUIPMENT_FORM: EquipmentFormState = {
  name: "",
  price: "",
  category: "",
};

const EMPTY_WEAPON_FORM: WeaponFormState = {
  name: "",
  price: "",
  damage: "",
  category: "Melee",
  qualities: "",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  draft: Campaign;
  patch: (partial: Partial<Campaign>) => void;
}

export default function CampaignEquipmentTab({ draft, patch }: Props) {
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [equipmentForm, setEquipmentForm] =
    useState<EquipmentFormState>(EMPTY_EQUIPMENT_FORM);

  const [showWeaponForm, setShowWeaponForm] = useState(false);
  const [weaponForm, setWeaponForm] = useState<WeaponFormState>(EMPTY_WEAPON_FORM);

  // ── Equipment filter ────────────────────────────────────────────────────────

  const allEquipAllowed = draft.allowedEquipmentIds === null;
  const allWeaponsAllowed = draft.allowedWeaponIds === null;

  const handleEquipToggle = (id: string, checked: boolean) => {
    patch({
      allowedEquipmentIds: toggleAllowed(
        draft.allowedEquipmentIds,
        ALL_EQUIPMENT_IDS,
        id,
        checked,
      ),
    });
  };

  const handleWeaponToggle = (id: string, checked: boolean) => {
    patch({
      allowedWeaponIds: toggleAllowed(
        draft.allowedWeaponIds,
        ALL_WEAPON_IDS,
        id,
        checked,
      ),
    });
  };

  // ── Custom equipment ────────────────────────────────────────────────────────

  const handleSaveEquipment = () => {
    const item: EquipmentItem = {
      id: `custom_${slugify(equipmentForm.name)}_${Date.now()}`,
      name: equipmentForm.name,
      price: Number(equipmentForm.price) || 0,
      category: equipmentForm.category || "Custom",
    };
    patch({ customEquipment: [...draft.customEquipment, item] });
    setEquipmentForm(EMPTY_EQUIPMENT_FORM);
    setShowEquipmentForm(false);
  };

  const handleRemoveEquipment = (index: number) => {
    patch({
      customEquipment: draft.customEquipment.filter((_, i) => i !== index),
    });
  };

  // ── Custom weapons ──────────────────────────────────────────────────────────

  const handleSaveWeapon = () => {
    const weapon: WeaponItem = {
      id: `custom_${slugify(weaponForm.name)}_${Date.now()}`,
      name: weaponForm.name,
      price: Number(weaponForm.price) || 0,
      damage: weaponForm.damage || "1d6",
      category: weaponForm.category,
      weight: 0,
      qualities: weaponForm.qualities
        .split(",")
        .map((q) => q.trim())
        .filter(Boolean),
    };
    patch({ customWeapons: [...draft.customWeapons, weapon] });
    setWeaponForm(EMPTY_WEAPON_FORM);
    setShowWeaponForm(false);
  };

  const handleRemoveWeapon = (index: number) => {
    patch({
      customWeapons: draft.customWeapons.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="campaign-settings-equipment">
      {/* ── NonBxEquipment toggle ─────────────────────────────────────────── */}
      <ThreeStateToggle
        legend="Non-B/X Equipment"
        value={draft.allowNonBxEquipment}
        onChange={(v) => patch({ allowNonBxEquipment: v })}
      />

      {/* ── Equipment Filter ──────────────────────────────────────────────── */}
      <h4 className="campaign-section-heading">Allowed Equipment</h4>
      <section className="campaign-checklist">
        <div className="campaign-checklist-heading">
          <label className="campaign-checklist-all">
            <input
              type="checkbox"
              aria-label="All items"
              checked={allEquipAllowed}
              onChange={(e) =>
                patch({
                  allowedEquipmentIds: e.target.checked
                    ? null
                    : [...ALL_EQUIPMENT_IDS],
                })
              }
            />
            All items
          </label>
        </div>

        {!allEquipAllowed &&
          EQUIPMENT_CATEGORIES.map((cat) => (
            <div key={cat} className="campaign-checklist-category">
              <div className="campaign-checklist-category-name">{cat}</div>
              <div className="campaign-checklist-items">
                {EQUIPMENT_BY_CATEGORY[cat].map((item) => {
                  const checked =
                    draft.allowedEquipmentIds?.includes(item.id) ?? false;
                  const id = `equip-checkbox-${item.id}`;
                  return (
                    <label
                      key={item.id}
                      className="campaign-checklist-item"
                      htmlFor={id}
                    >
                      <input
                        id={id}
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          handleEquipToggle(item.id, e.target.checked)
                        }
                      />
                      {item.name}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
      </section>

      {/* ── Weapon Filter ─────────────────────────────────────────────────── */}
      <h4 className="campaign-section-heading">Allowed Weapons</h4>
      <section className="campaign-checklist">
        <div className="campaign-checklist-heading">
          <label className="campaign-checklist-all">
            <input
              type="checkbox"
              aria-label="All weapons"
              checked={allWeaponsAllowed}
              onChange={(e) =>
                patch({
                  allowedWeaponIds: e.target.checked
                    ? null
                    : [...ALL_WEAPON_IDS],
                })
              }
            />
            All weapons
          </label>
        </div>

        {!allWeaponsAllowed &&
          WEAPON_CATEGORIES.map((cat) => (
            <div key={cat} className="campaign-checklist-category">
              <div className="campaign-checklist-category-name">{cat}</div>
              <div className="campaign-checklist-items">
                {WEAPONS_BY_CATEGORY[cat].map((weapon) => {
                  const checked =
                    draft.allowedWeaponIds?.includes(weapon.id) ?? false;
                  const id = `weapon-checkbox-${weapon.id}`;
                  return (
                    <label
                      key={weapon.id}
                      className="campaign-checklist-item"
                      htmlFor={id}
                    >
                      <input
                        id={id}
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          handleWeaponToggle(weapon.id, e.target.checked)
                        }
                      />
                      {weapon.name}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
      </section>

      {/* ── Custom Equipment ──────────────────────────────────────────────── */}
      <h4 className="campaign-section-heading">Custom Equipment</h4>

      <ul className="campaign-custom-item-list">
        {draft.customEquipment.length === 0 && !showEquipmentForm && (
          <li className="campaign-empty-note">No custom equipment defined.</li>
        )}
        {draft.customEquipment.map((item, i) => (
          <li key={i} className="campaign-custom-item-row">
            <span className="campaign-custom-item-row-label">
              {item.name} — {item.price} gp ({item.category})
            </span>
            <button
              className="button button--sm button--danger"
              onClick={() => handleRemoveEquipment(i)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {showEquipmentForm ? (
        <div className="campaign-custom-item-form">
          <div className="campaign-custom-item-form-grid">
            <div className="campaign-custom-item-form-field">
              <label
                className="campaign-custom-item-form-label"
                htmlFor="custom-equip-name"
              >
                Item Name
              </label>
              <input
                id="custom-equip-name"
                type="text"
                className="campaign-custom-item-form-input"
                value={equipmentForm.name}
                onChange={(e) =>
                  setEquipmentForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="campaign-custom-item-form-field">
              <label
                className="campaign-custom-item-form-label"
                htmlFor="custom-equip-price"
              >
                Price (gp)
              </label>
              <input
                id="custom-equip-price"
                type="number"
                className="campaign-custom-item-form-input"
                min={0}
                value={equipmentForm.price}
                onChange={(e) =>
                  setEquipmentForm((f) => ({ ...f, price: e.target.value }))
                }
              />
            </div>
            <div className="campaign-custom-item-form-field">
              <label
                className="campaign-custom-item-form-label"
                htmlFor="custom-equip-category"
              >
                Category
              </label>
              <input
                id="custom-equip-category"
                type="text"
                className="campaign-custom-item-form-input"
                placeholder="e.g. Tools & Hardware"
                value={equipmentForm.category}
                onChange={(e) =>
                  setEquipmentForm((f) => ({ ...f, category: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="campaign-override-form-actions">
            <button
              className="button button-primary button--sm"
              onClick={handleSaveEquipment}
              disabled={!equipmentForm.name}
            >
              Save Equipment
            </button>
            <button
              className="button button--sm"
              onClick={() => {
                setShowEquipmentForm(false);
                setEquipmentForm(EMPTY_EQUIPMENT_FORM);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          className="button button-primary button--sm"
          onClick={() => setShowEquipmentForm(true)}
        >
          Add Equipment
        </button>
      )}

      {/* ── Custom Weapons ────────────────────────────────────────────────── */}
      <h4 className="campaign-section-heading">Custom Weapons</h4>

      <ul className="campaign-custom-weapon-list">
        {draft.customWeapons.length === 0 && !showWeaponForm && (
          <li className="campaign-empty-note">No custom weapons defined.</li>
        )}
        {draft.customWeapons.map((weapon, i) => (
          <li key={i} className="campaign-custom-weapon-row">
            <span className="campaign-custom-item-row-label">
              {weapon.name} — {weapon.damage} — {weapon.price} gp (
              {weapon.category})
            </span>
            <button
              className="button button--sm button--danger"
              onClick={() => handleRemoveWeapon(i)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {showWeaponForm ? (
        <div className="campaign-custom-item-form">
          <div className="campaign-custom-item-form-grid">
            <div className="campaign-custom-item-form-field">
              <label
                className="campaign-custom-item-form-label"
                htmlFor="custom-weapon-name"
              >
                Weapon Name
              </label>
              <input
                id="custom-weapon-name"
                type="text"
                className="campaign-custom-item-form-input"
                value={weaponForm.name}
                onChange={(e) =>
                  setWeaponForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="campaign-custom-item-form-field">
              <label
                className="campaign-custom-item-form-label"
                htmlFor="custom-weapon-price"
              >
                Price (gp)
              </label>
              <input
                id="custom-weapon-price"
                type="number"
                className="campaign-custom-item-form-input"
                min={0}
                value={weaponForm.price}
                onChange={(e) =>
                  setWeaponForm((f) => ({ ...f, price: e.target.value }))
                }
              />
            </div>
            <div className="campaign-custom-item-form-field">
              <label
                className="campaign-custom-item-form-label"
                htmlFor="custom-weapon-damage"
              >
                Damage
              </label>
              <input
                id="custom-weapon-damage"
                type="text"
                className="campaign-custom-item-form-input"
                placeholder="e.g. 1d6"
                value={weaponForm.damage}
                onChange={(e) =>
                  setWeaponForm((f) => ({ ...f, damage: e.target.value }))
                }
              />
            </div>
            <div className="campaign-custom-item-form-field">
              <label
                className="campaign-custom-item-form-label"
                htmlFor="custom-weapon-category"
              >
                Category
              </label>
              <select
                id="custom-weapon-category"
                className="campaign-custom-item-form-input"
                value={weaponForm.category}
                onChange={(e) =>
                  setWeaponForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                {WEAPON_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div className="campaign-custom-item-form-field">
              <label
                className="campaign-custom-item-form-label"
                htmlFor="custom-weapon-qualities"
              >
                Qualities (comma-separated)
              </label>
              <input
                id="custom-weapon-qualities"
                type="text"
                className="campaign-custom-item-form-input"
                placeholder="e.g. Melee, Slow"
                value={weaponForm.qualities}
                onChange={(e) =>
                  setWeaponForm((f) => ({ ...f, qualities: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="campaign-override-form-actions">
            <button
              className="button button-primary button--sm"
              onClick={handleSaveWeapon}
              disabled={!weaponForm.name}
            >
              Save Weapon
            </button>
            <button
              className="button button--sm"
              onClick={() => {
                setShowWeaponForm(false);
                setWeaponForm(EMPTY_WEAPON_FORM);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          className="button button-primary button--sm"
          onClick={() => setShowWeaponForm(true)}
        >
          Add Weapon
        </button>
      )}
    </div>
  );
}
