import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_CAMPAIGN_ID } from "../constants/constants";
import { useCampaign } from "../contexts/CampaignContext";
import { useCharacter } from "../contexts/CharacterContext";

export default function CampaignsScreen() {
  const navigate = useNavigate();
  const { campaigns, createCampaign, deleteCampaign, setActiveCampaign } = useCampaign();
  const { storedCharacters } = useCharacter();

  const [newName, setNewName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const characterCountByCampaign = (campaignId: string) =>
    storedCharacters.filter((c) => c.campaignId === campaignId).length;

  const handleCreate = () => {
    const name = newName.trim() || "New Campaign";
    const campaign = createCampaign(name);
    setNewName("");
    navigate(`/campaigns/${campaign.id}/settings`);
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    deleteCampaign(id);
    setConfirmDeleteId(null);
  };

  const handleActivate = (id: string) => {
    setActiveCampaign(id === DEFAULT_CAMPAIGN_ID ? null : id);
    navigate("/");
  };

  return (
    <div className="campaigns-screen container">
      <h3>Campaigns</h3>

      <ul className="campaigns-list">
        {campaigns.map((campaign) => {
          const charCount = characterCountByCampaign(campaign.id);
          const isDefault = campaign.id === DEFAULT_CAMPAIGN_ID;
          return (
            <li key={campaign.id} className="campaign-list-item">
              <div className="campaign-list-item--info">
                <strong>{campaign.name}</strong>
                {isDefault && <span className="campaign-badge campaign-badge--default"> (default)</span>}
                <span className="campaign-badge campaign-badge--count"> {charCount} character{charCount !== 1 ? "s" : ""}</span>
              </div>
              {campaign.notes && (
                <p className="campaign-list-item--notes">{campaign.notes}</p>
              )}
              <div className="campaign-list-item--actions">
                <button
                  className="button button-primary button--sm"
                  onClick={() => navigate(`/campaigns/${campaign.id}/settings`)}
                >
                  Settings
                </button>
                <button
                  className="button button-primary button--sm"
                  onClick={() => handleActivate(campaign.id)}
                >
                  Play
                </button>
                {!isDefault && (
                  <button
                    className={`button button--sm ${confirmDeleteId === campaign.id ? "button--danger" : "button-primary"}`}
                    onClick={() => handleDelete(campaign.id)}
                  >
                    {confirmDeleteId === campaign.id ? "Confirm Delete?" : "Delete"}
                  </button>
                )}
                {confirmDeleteId === campaign.id && (
                  <button
                    className="button button-primary button--sm"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="campaign-create-form">
        <h4>New Campaign</h4>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            className="campaign-name-input"
            placeholder="Campaign name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button className="button button-primary" onClick={handleCreate}>
            Create
          </button>
        </div>
      </div>

      <button
        className="button button-primary"
        style={{ marginTop: "1.5rem" }}
        onClick={() => navigate("/")}
      >
        Back to Main
      </button>
    </div>
  );
}
