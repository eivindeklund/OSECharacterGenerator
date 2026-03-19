import { useState } from "react";
import classOptionsData, { MAGIC_TYPE_IDS } from "../../data/classOptionsData";
import { DEFAULT_SPELL_SLOT_TABLES } from "../../data/levelProgressionData";
import { SPELL_LIST_REGISTRY } from "../../data/spells";
import type {
    Campaign,
    CampaignClassOverride,
    CampaignNewClass,
} from "../../types";
import { toggleAllowed } from "../../utilities/campaignFilterUtils";

// ── Module-level constants ────────────────────────────────────────────────────

const ALL_CLASS_NAMES = classOptionsData.map((c) => c.name);
const CATEGORIES = ["basic", "advanced", "carcass"] as const;
const CLASSES_BY_CATEGORY = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat] = classOptionsData.filter((c) => c.category === cat);
    return acc;
  },
  {} as Record<string, typeof classOptionsData>,
);

const ALL_SPELL_LIST_IDS = Object.keys(SPELL_LIST_REGISTRY);
const ALL_SPELL_SLOT_TABLE_IDS = DEFAULT_SPELL_SLOT_TABLES.map((t) => t.id);

// ── Override form state ───────────────────────────────────────────────────────

interface OverrideFormState {
  baseName: string;
  name: string;
  category: string;
  description: string;
  armour: string;
  weapons: string;
  languages: string;
  requirements: string;
  hd: string;
  maxLevel: string;
  primeReqsStr: string;
  xpBonusRule: string;
  spellListId: string;
  magicTypeId: string;
  spellSlotTableId: string;
  canUseThiefTools: string;
  limitedSpellSelection: string;
}

const EMPTY_OVERRIDE_FORM: OverrideFormState = {
  baseName: ALL_CLASS_NAMES[0] ?? "",
  name: "",
  category: "",
  description: "",
  armour: "",
  weapons: "",
  languages: "",
  requirements: "",
  hd: "",
  maxLevel: "",
  primeReqsStr: "",
  xpBonusRule: "",
  spellListId: "",
  magicTypeId: "",
  spellSlotTableId: "",
  canUseThiefTools: "",
  limitedSpellSelection: "",
};

function overrideToFormState(cls: CampaignClassOverride): OverrideFormState {
  return {
    baseName: cls.baseName,
    name: cls.name ?? "",
    category: cls.category ?? "",
    description: cls.description ?? "",
    armour: cls.armour ?? "",
    weapons: cls.weapons ?? "",
    languages: cls.languages ?? "",
    requirements: cls.requirements ?? "",
    hd: cls.hd?.toString() ?? "",
    maxLevel: cls.maxLevel?.toString() ?? "",
    primeReqsStr: cls.primeReqs?.join(", ") ?? "",
    xpBonusRule: cls.xpBonusRule ?? "",
    spellListId: cls.spellListId ?? "",
    magicTypeId: cls.magicTypeId ?? "",
    spellSlotTableId: cls.spellSlotTableId ?? "",
    canUseThiefTools:
      cls.canUseThiefTools === undefined
        ? ""
        : cls.canUseThiefTools
          ? "true"
          : "false",
    limitedSpellSelection:
      cls.limitedSpellSelection === undefined
        ? ""
        : cls.limitedSpellSelection
          ? "true"
          : "false",
  };
}

function formStateToOverride(form: OverrideFormState): CampaignClassOverride {
  const override: CampaignClassOverride = { type: "override", baseName: form.baseName };
  if (form.name) override.name = form.name;
  if (form.category) override.category = form.category as CampaignClassOverride["category"];
  if (form.description) override.description = form.description;
  if (form.armour) override.armour = form.armour;
  if (form.weapons) override.weapons = form.weapons;
  if (form.languages) override.languages = form.languages;
  if (form.requirements) override.requirements = form.requirements;
  if (form.hd) override.hd = parseInt(form.hd, 10);
  if (form.maxLevel) override.maxLevel = parseInt(form.maxLevel, 10);
  if (form.primeReqsStr)
    override.primeReqs = form.primeReqsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  if (form.xpBonusRule) override.xpBonusRule = form.xpBonusRule;
  if (form.spellListId) override.spellListId = form.spellListId;
  if (form.magicTypeId) override.magicTypeId = form.magicTypeId;
  if (form.spellSlotTableId) override.spellSlotTableId = form.spellSlotTableId;
  if (form.canUseThiefTools)
    override.canUseThiefTools = form.canUseThiefTools === "true";
  if (form.limitedSpellSelection)
    override.limitedSpellSelection = form.limitedSpellSelection === "true";
  return override;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  draft: Campaign;
  patch: (partial: Partial<Campaign>) => void;
}

export default function CampaignClassesTab({ draft, patch }: Props) {
  // null = not editing; <index> = editing customClasses[index]; length = adding new
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [overrideForm, setOverrideForm] = useState<OverrideFormState>(EMPTY_OVERRIDE_FORM);

  const allAllowed = draft.allowedClassNames === null;

  const handleAllowedClassToggle = (name: string, checked: boolean) => {
    patch({
      allowedClassNames: toggleAllowed(
        draft.allowedClassNames,
        ALL_CLASS_NAMES,
        name,
        checked,
      ),
    });
  };

  const patchForm = (p: Partial<OverrideFormState>) =>
    setOverrideForm((prev) => ({ ...prev, ...p }));

  const handleAddOverride = () => {
    setOverrideForm({ ...EMPTY_OVERRIDE_FORM, baseName: ALL_CLASS_NAMES[0] ?? "" });
    setEditingIndex(draft.customClasses.length);
  };

  const handleEditOverride = (index: number) => {
    const cls = draft.customClasses[index];
    if (cls.type !== "override") return;
    setOverrideForm(overrideToFormState(cls));
    setEditingIndex(index);
  };

  const handleSaveOverride = () => {
    if (editingIndex === null) return;
    const override = formStateToOverride(overrideForm);
    const next = [...draft.customClasses];
    if (editingIndex >= next.length) {
      next.push(override);
    } else {
      next[editingIndex] = override;
    }
    patch({ customClasses: next });
    setEditingIndex(null);
  };

  const handleRemoveCustomClass = (index: number) => {
    const next = draft.customClasses.filter((_, i) => i !== index);
    if (editingIndex === index) setEditingIndex(null);
    patch({ customClasses: next });
  };

  const overrides = draft.customClasses.filter(
    (c): c is CampaignClassOverride => c.type === "override",
  );
  const newClasses = draft.customClasses.filter(
    (c): c is CampaignNewClass => c.type === "new",
  );

  return (
    <div className="campaign-settings-classes">
      {/* ── Class Filter ──────────────────────────────────────────────────── */}
      <section className="campaign-checklist">
        <div className="campaign-checklist-heading">
          Allowed Classes
          <label className="campaign-checklist-all">
            <input
              type="checkbox"
              aria-label="All classes"
              checked={allAllowed}
              onChange={(e) =>
                patch({
                  allowedClassNames: e.target.checked ? null : [],
                })
              }
            />
            All classes
          </label>
        </div>

        {CATEGORIES.map((cat) => (
          <div key={cat} className="campaign-checklist-category">
            <div className="campaign-checklist-category-name">{cat}</div>
            <div className="campaign-checklist-items">
              {CLASSES_BY_CATEGORY[cat].map((cls) => {
                const checked =
                  allAllowed ||
                  (draft.allowedClassNames?.includes(cls.name) ?? false);
                const id = `class-checkbox-${cls.name.replace(/\s+/g, "-")}`;
                return (
                  <label key={cls.name} className="campaign-checklist-item" htmlFor={id}>
                    <input
                      id={id}
                      type="checkbox"
                      aria-label={cls.name}
                      checked={checked}
                      onChange={(e) =>
                        handleAllowedClassToggle(cls.name, e.target.checked)
                      }
                    />
                    {cls.name}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* ── Class Overrides ───────────────────────────────────────────────── */}
      <h4 className="campaign-section-heading">Class Overrides</h4>

      {overrides.length === 0 && editingIndex === null ? (
        <p className="campaign-empty-note">No custom classes defined yet.</p>
      ) : (
        <ul className="campaign-override-list">
          {draft.customClasses.map((cls, i) => {
            if (cls.type !== "override") return null;
            const renamed =
              cls.name && cls.name !== cls.baseName ? ` → "${cls.name}"` : "";
            return (
              <li key={i} className="campaign-override-item">
                <span className="campaign-override-item-label">
                  {`Override: ${cls.baseName}${renamed}`}
                </span>
                <button
                  className="button button--sm"
                  onClick={() => handleEditOverride(i)}
                >
                  Edit
                </button>
                <button
                  className="button button--sm button--danger"
                  onClick={() => handleRemoveCustomClass(i)}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {editingIndex !== null && (
        <div className="campaign-override-form">
          <h5 className="campaign-override-form-title">
            {editingIndex >= draft.customClasses.length
              ? "Add Class Override"
              : "Edit Class Override"}
          </h5>

          <div className="campaign-override-form-grid">
            {/* Base class */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-baseName">
                Base Class
              </label>
              <select
                id="override-baseName"
                className="campaign-override-form-input"
                value={overrideForm.baseName}
                onChange={(e) => patchForm({ baseName: e.target.value })}
              >
                {classOptionsData.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Name override */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-name">
                Name (override)
              </label>
              <input
                id="override-name"
                type="text"
                className="campaign-override-form-input"
                placeholder="Leave empty to keep original"
                value={overrideForm.name}
                onChange={(e) => patchForm({ name: e.target.value })}
              />
            </div>

            {/* HD */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-hd">
                Hit Die (d__)
              </label>
              <input
                id="override-hd"
                type="number"
                className="campaign-override-form-input"
                min={4}
                max={12}
                placeholder="e.g. 8"
                value={overrideForm.hd}
                onChange={(e) => patchForm({ hd: e.target.value })}
              />
            </div>

            {/* Max level */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-maxLevel">
                Max Level
              </label>
              <input
                id="override-maxLevel"
                type="number"
                className="campaign-override-form-input"
                min={1}
                max={36}
                placeholder="e.g. 14"
                value={overrideForm.maxLevel}
                onChange={(e) => patchForm({ maxLevel: e.target.value })}
              />
            </div>

            {/* Category */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-category">
                Category
              </label>
              <select
                id="override-category"
                className="campaign-override-form-input"
                value={overrideForm.category}
                onChange={(e) => patchForm({ category: e.target.value })}
              >
                <option value="">— keep original —</option>
                <option value="basic">Basic</option>
                <option value="advanced">Advanced</option>
                <option value="carcass">Carcass</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Spell list */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-spellListId">
                Spell List
              </label>
              <select
                id="override-spellListId"
                className="campaign-override-form-input"
                value={overrideForm.spellListId}
                onChange={(e) => patchForm({ spellListId: e.target.value })}
              >
                <option value="">— none —</option>
                {ALL_SPELL_LIST_IDS.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>

            {/* Magic type */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-magicTypeId">
                Magic Type
              </label>
              <select
                id="override-magicTypeId"
                className="campaign-override-form-input"
                value={overrideForm.magicTypeId}
                onChange={(e) => patchForm({ magicTypeId: e.target.value })}
              >
                <option value="">— none —</option>
                {MAGIC_TYPE_IDS.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>

            {/* Spell slot table */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-spellSlotTableId">
                Spell Slot Table
              </label>
              <select
                id="override-spellSlotTableId"
                className="campaign-override-form-input"
                value={overrideForm.spellSlotTableId}
                onChange={(e) => patchForm({ spellSlotTableId: e.target.value })}
              >
                <option value="">— none —</option>
                {ALL_SPELL_SLOT_TABLE_IDS.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>

            {/* Armour */}
            <div className="campaign-override-form-field campaign-override-form-field--full">
              <label className="campaign-override-form-label" htmlFor="override-armour">
                Armour
              </label>
              <input
                id="override-armour"
                type="text"
                className="campaign-override-form-input"
                placeholder="e.g. Any armour + shield"
                value={overrideForm.armour}
                onChange={(e) => patchForm({ armour: e.target.value })}
              />
            </div>

            {/* Weapons */}
            <div className="campaign-override-form-field campaign-override-form-field--full">
              <label className="campaign-override-form-label" htmlFor="override-weapons">
                Weapons
              </label>
              <input
                id="override-weapons"
                type="text"
                className="campaign-override-form-input"
                placeholder="e.g. Any"
                value={overrideForm.weapons}
                onChange={(e) => patchForm({ weapons: e.target.value })}
              />
            </div>

            {/* Requirements */}
            <div className="campaign-override-form-field campaign-override-form-field--full">
              <label className="campaign-override-form-label" htmlFor="override-requirements">
                Requirements
              </label>
              <input
                id="override-requirements"
                type="text"
                className="campaign-override-form-input"
                placeholder="e.g. STR 9+"
                value={overrideForm.requirements}
                onChange={(e) => patchForm({ requirements: e.target.value })}
              />
            </div>

            {/* Prime requisites */}
            <div className="campaign-override-form-field campaign-override-form-field--full">
              <label className="campaign-override-form-label" htmlFor="override-primeReqs">
                Prime Requisites (comma-separated ability names)
              </label>
              <input
                id="override-primeReqs"
                type="text"
                className="campaign-override-form-input"
                placeholder="e.g. strength, dexterity"
                value={overrideForm.primeReqsStr}
                onChange={(e) => patchForm({ primeReqsStr: e.target.value })}
              />
            </div>

            {/* XP bonus rule */}
            <div className="campaign-override-form-field campaign-override-form-field--full">
              <label className="campaign-override-form-label" htmlFor="override-xpBonusRule">
                XP Bonus Rule
              </label>
              <input
                id="override-xpBonusRule"
                type="text"
                className="campaign-override-form-input"
                placeholder="e.g. str>=13: +5%, str>=16: +10%"
                value={overrideForm.xpBonusRule}
                onChange={(e) => patchForm({ xpBonusRule: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="campaign-override-form-field campaign-override-form-field--full">
              <label className="campaign-override-form-label" htmlFor="override-description">
                Description
              </label>
              <textarea
                id="override-description"
                className="campaign-override-form-input"
                rows={3}
                value={overrideForm.description}
                onChange={(e) => patchForm({ description: e.target.value })}
              />
            </div>

            {/* Boolean flags */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-canUseThiefTools">
                Can Use Thief Tools
              </label>
              <select
                id="override-canUseThiefTools"
                className="campaign-override-form-input"
                value={overrideForm.canUseThiefTools}
                onChange={(e) => patchForm({ canUseThiefTools: e.target.value })}
              >
                <option value="">— keep original —</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-limitedSpellSelection">
                Limited Spell Selection
              </label>
              <select
                id="override-limitedSpellSelection"
                className="campaign-override-form-input"
                value={overrideForm.limitedSpellSelection}
                onChange={(e) =>
                  patchForm({ limitedSpellSelection: e.target.value })
                }
              >
                <option value="">— keep original —</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <div className="campaign-override-form-actions">
            <button
              className="button button-primary button--sm"
              onClick={handleSaveOverride}
            >
              Save Override
            </button>
            <button
              className="button button--sm"
              onClick={() => setEditingIndex(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {editingIndex === null && (
        <button
          className="button button-primary button--sm"
          onClick={handleAddOverride}
        >
          Add Override
        </button>
      )}

      {/* ── New Classes (listed, creation deferred) ───────────────────────── */}
      {newClasses.length > 0 && (
        <>
          <h4 className="campaign-section-heading">Custom Classes</h4>
          <ul className="campaign-override-list">
            {newClasses.map((cls) => {
              const realIndex = draft.customClasses.indexOf(cls);
              return (
                <li key={realIndex} className="campaign-override-item">
                  <span className="campaign-override-item-label">
                    New Class: {cls.name}
                  </span>
                  <button
                    className="button button--sm button--danger"
                    onClick={() => handleRemoveCustomClass(realIndex)}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
