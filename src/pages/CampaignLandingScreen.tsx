import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCampaign } from "../contexts/CampaignContext";
import { useCharacter } from "../contexts/CharacterContext";

export default function CampaignLandingScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { campaigns, setActiveCampaign } = useCampaign();
  const { setCharacterRolled, rollCharacter } = useCharacter();

  const campaign = campaigns.find((c) => c.id === id);

  // When this screen mounts from a direct URL, activate the campaign automatically.
  useEffect(() => {
    if (id) {
      setActiveCampaign(id);
      setCharacterRolled(true);
    }
  }, [id, setActiveCampaign, setCharacterRolled]);

  if (!campaign) {
    return (
      <div className="container">
        <p>Campaign not found.</p>
        <button className="button button-primary" onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  const handleStart = () => {
    rollCharacter();
  };

  return (
    <div className="campaign-landing-screen container">
      <h2 className="campaign-landing--title">{campaign.name}</h2>

      {campaign.notes && (
        <div className="campaign-landing--notes">
          <p>{campaign.notes}</p>
        </div>
      )}

      <div className="campaign-landing--actions">
        <button
          className="button button-primary button--roll"
          onClick={handleStart}
        >
          Create Character
        </button>
        <button
          className="button button-primary"
          onClick={() => navigate("/tavern")}
          style={{ marginLeft: "12px" }}
        >
          View Characters
        </button>
      </div>
    </div>
  );
}
