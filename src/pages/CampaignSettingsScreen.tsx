import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCampaign } from "../contexts/CampaignContext";
import classOptionsData from "../data/classOptionsData";
import type { Campaign } from "../types";

type Tab = "general" | "classes" | "equipment" | "spells";

/** Three-state radio group for boolean|null campaign lock fields. */
function ThreeStateToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  return (
    <div className="campaign-toggle" style={{ marginBottom: "12px" }}>
      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{label}</div>
      {(["player", "on", "off"] as const).map((opt) => {
        const optValue = opt === "player" ? null : opt === "on";
        const checked = value === optValue;
        const id = `${label}-${opt}`;
        return (
          <label key={opt} style={{ marginRight: "16px", cursor: "pointer" }}>
            <input
              type="radio"
              id={id}
              name={label}
              checked={checked}
              onChange={() => onChange(optValue)}
              style={{ marginRight: "4px" }}
            />
            {opt === "player" ? "Player chooses" : opt === "on" ? "Always enabled" : "Always disabled"}
          </label>
        );
      })}
    </div>
  );
}

export default function CampaignSettingsScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { campaigns, updateCampaign } = useCampaign();

  const campaign = campaigns.find((c) => c.id === id);

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [draft, setDraft] = useState<Campaign | null>(campaign ?? null);

  if (!campaign || !draft) {
    return (
      <div className="container">
        <p>Campaign not found.</p>
        <button className="button button-primary" onClick={() => navigate("/campaigns")}>Back to Campaigns</button>
      </div>
    );
  }

  const save = () => {
    const now = new Date().toISOString();
    updateCampaign({ ...draft, updatedAt: now });
  };

  const saveAndBack = () => {
    save();
    navigate("/campaigns");
  };

  const patch = (partial: Partial<Campaign>) =>
    setDraft((prev) => prev ? { ...prev, ...partial } : prev);

  // ── General tab ────────────────────────────────────────────────────────────

  const allClassNames = classOptionsData.map((c) => c.name);

  const handleAllowedClassToggle = (name: string, checked: boolean) => {
    if (draft.allowedClassNames === null) {
      // Switching from "all" to a filtered set: start with all checked except this one.
      const newSet = checked
        ? allClassNames
        : allClassNames.filter((n) => n !== name);
      patch({ allowedClassNames: newSet });
    } else {
      const newSet = checked
        ? [...draft.allowedClassNames, name]
        : draft.allowedClassNames.filter((n) => n !== name);
      // If all are checked, revert to null (meaning "all").
      patch({ allowedClassNames: newSet.length === allClassNames.length ? null : newSet });
    }
  };

  const allAllowed = draft.allowedClassNames === null;

  // ── Classes tab ─────────────────────────────────────────────────────────────

  const handleRemoveCustomClass = (index: number) => {
    const next = draft.customClasses.filter((_, i) => i !== index);
    patch({ customClasses: next });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const tabs: { key: Tab; label: string }[] = [
    { key: "general", label: "General" },
    { key: "classes", label: "Classes" },
    { key: "equipment", label: "Equipment" },
    { key: "spells", label: "Spells" },
  ];

  return (
    <div className="campaign-settings-screen container">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <h3 style={{ margin: 0 }}>{draft.name} — Settings</h3>
        <button className="button button-primary button--sm" onClick={save}>Save</button>
        <button className="button button-primary button--sm" onClick={saveAndBack}>Save &amp; Back</button>
        <button className="button button-primary button--sm" onClick={() => navigate("/campaigns")}>Cancel</button>
      </div>

      <div className="campaign-settings-tabs" style={{ display: "flex", gap: "4px", marginBottom: "16px", borderBottom: "2px solid #ccc" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`button button--sm ${activeTab === t.key ? "button-primary" : ""}`}
            style={{ borderBottom: activeTab === t.key ? "2px solid #333" : "none" }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="campaign-settings-general">
          <div className="campaign-field" style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Campaign Name</label>
            <input
              type="text"
              className="campaign-name-input"
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              style={{ width: "100%", maxWidth: "360px" }}
            />
          </div>

          <div className="campaign-field" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Notes (shown to players on the campaign landing page)</label>
            <textarea
              className="campaign-notes-input"
              value={draft.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              rows={4}
              style={{ width: "100%", maxWidth: "560px" }}
            />
          </div>

          <h4>Class Availability</h4>

          <ThreeStateToggle
            label="Advanced Classes"
            value={draft.allowAdvancedClasses}
            onChange={(v) => patch({ allowAdvancedClasses: v })}
          />
          <ThreeStateToggle
            label="Carcass Crawler Classes"
            value={draft.allowCarcassClasses}
            onChange={(v) => patch({ allowCarcassClasses: v })}
          />

          <div className="campaign-allowed-classes" style={{ marginTop: "16px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
              Allowed Classes
              <label style={{ marginLeft: "16px", fontWeight: "normal", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={allAllowed}
                  readOnly
                  onChange={() => {
                    if (!allAllowed) patch({ allowedClassNames: null });
                    else patch({ allowedClassNames: [] });
                  }}
                  style={{ marginRight: "4px" }}
                />
                All classes
              </label>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
              {allClassNames.map((name) => {
                const checked = allAllowed || draft.allowedClassNames!.includes(name);
                return (
                  <label key={name} style={{ cursor: "pointer", minWidth: "150px" }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => handleAllowedClassToggle(name, e.target.checked)}
                      style={{ marginRight: "4px" }}
                    />
                    {name}
                  </label>
                );
              })}
            </div>
          </div>

          <h4 style={{ marginTop: "20px" }}>Equipment Availability</h4>
          <ThreeStateToggle
            label="Non-B/X Equipment"
            value={draft.allowNonBxEquipment}
            onChange={(v) => patch({ allowNonBxEquipment: v })}
          />
        </div>
      )}

      {activeTab === "classes" && (
        <div className="campaign-settings-classes">
          <p style={{ color: "#666", marginBottom: "12px" }}>
            Custom classes (overrides and new classes) let you modify existing classes or create entirely new ones for this campaign.
            Full class editing with custom level progression tables will be available in a future update.
          </p>

          {draft.customClasses.length === 0 ? (
            <p>No custom classes defined yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {draft.customClasses.map((cls, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid #eee" }}>
                  <span>
                    <strong>{cls.type === "override" ? `Override: ${cls.baseName}` : `New Class: ${cls.name}`}</strong>
                    {cls.type === "override" && cls.name !== cls.baseName && ` → renamed to "${cls.name}"`}
                  </span>
                  <button
                    className="button button--sm"
                    onClick={() => handleRemoveCustomClass(i)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p style={{ color: "#888", marginTop: "16px", fontSize: "0.9em" }}>
            Class override editing coming soon.
          </p>
        </div>
      )}

      {activeTab === "equipment" && (
        <div className="campaign-settings-equipment">
          <p style={{ color: "#666" }}>
            Custom equipment items for this campaign. These are added to the base equipment list.
          </p>
          {draft.customEquipment.length === 0 ? (
            <p>No custom equipment defined.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {draft.customEquipment.map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "4px 0" }}>
                  <span>{item.name} — {item.price} gp</span>
                  <button
                    className="button button--sm"
                    onClick={() => patch({ customEquipment: draft.customEquipment.filter((_, j) => j !== i) })}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p style={{ color: "#888", marginTop: "16px", fontSize: "0.9em" }}>
            Custom equipment and weapon editing coming soon.
          </p>
        </div>
      )}

      {activeTab === "spells" && (
        <div className="campaign-settings-spells">
          <p style={{ color: "#666" }}>
            Custom spell lists and spell availability settings for this campaign.
          </p>
          {draft.customSpellLists.length === 0 ? (
            <p>No custom spell lists defined.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {draft.customSpellLists.map((list, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "4px 0" }}>
                  <span><strong>{list.name}</strong> — {Object.values(list.spells).flat().length} spells</span>
                  <button
                    className="button button--sm"
                    onClick={() => patch({ customSpellLists: draft.customSpellLists.filter((_, j) => j !== i) })}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p style={{ color: "#888", marginTop: "16px", fontSize: "0.9em" }}>
            Spell list editing coming soon.
          </p>
        </div>
      )}
    </div>
  );
}
