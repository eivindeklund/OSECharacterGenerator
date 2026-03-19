import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCampaign } from "../contexts/CampaignContext";
import "../css/CampaignSettings.css";
import type { Campaign } from "../types";
import CampaignClassesTab from "./campaign-settings/CampaignClassesTab";
import CampaignEquipmentTab from "./campaign-settings/CampaignEquipmentTab";
import CampaignGeneralTab from "./campaign-settings/CampaignGeneralTab";
import CampaignSpellsTab from "./campaign-settings/CampaignSpellsTab";

type Tab = "general" | "classes" | "equipment" | "spells";

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

  const tabs: { key: Tab; label: string }[] = [
    { key: "general", label: "General" },
    { key: "classes", label: "Classes" },
    { key: "equipment", label: "Equipment" },
    { key: "spells", label: "Spells" },
  ];

  return (
    <div className="campaign-settings-screen container">
      <div className="campaign-settings-header">
        <h3 className="campaign-settings-header-title">{draft.name} — Settings</h3>
        <button className="button button-primary button--sm" onClick={save}>Save</button>
        <button className="button button-primary button--sm" onClick={saveAndBack}>Save &amp; Back</button>
        <button className="button button--sm" onClick={() => navigate("/campaigns")}>Cancel</button>
      </div>

      <div className="campaign-settings-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`button button--sm campaign-settings-tab${activeTab === t.key ? " campaign-settings-tab--active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <CampaignGeneralTab draft={draft} patch={patch} />
      )}
      {activeTab === "classes" && (
        <CampaignClassesTab draft={draft} patch={patch} />
      )}
      {activeTab === "equipment" && (
        <CampaignEquipmentTab draft={draft} patch={patch} />
      )}
      {activeTab === "spells" && (
        <CampaignSpellsTab draft={draft} patch={patch} />
      )}
    </div>
  );
}

