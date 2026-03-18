import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/general/Header'
import CharacterStorage from '../containers/storage/CharacterStorage'
import { DEFAULT_CAMPAIGN_ID } from '../constants/constants'
import { useCampaign } from '../contexts/CampaignContext'
import { useCharacter } from '../contexts/CharacterContext'

export default function CharacterStorageScreen () {
  const {
    loadCharacter,
    setCharacterRolled,
    storedCharacters,
    deleteStoredCharacter,
    partialCharacter,
    clearPartialCharacter,
  } = useCharacter()

  const { campaigns, activeCampaignId } = useCampaign()
  const navigate = useNavigate()

  // Default the filter to the currently-active campaign, or "all".
  const [campaignFilter, setCampaignFilter] = useState<string | "all">(
    activeCampaignId ?? "all"
  );

  const filteredCharacters =
    campaignFilter === "all"
      ? storedCharacters
      : storedCharacters.filter((c) => (c.campaignId ?? DEFAULT_CAMPAIGN_ID) === campaignFilter);

  const campaignName = (id: string) =>
    campaigns.find((c) => c.id === id)?.name ?? id;

  return (
    <div className='character-storage-screen'>
      <Header name='tavern' text='tavern'></Header>

      <div className="tavern-campaign-filter" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
        <label htmlFor="tavern-campaign" style={{ fontWeight: "bold" }}>Campaign:</label>
        <select
          id="tavern-campaign"
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
          className="campaign-selector"
        >
          <option value="all">All Campaigns</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {campaignFilter !== "all" && (
          <span style={{ color: "#666", fontSize: "0.9em" }}>
            {filteredCharacters.length} character{filteredCharacters.length !== 1 ? "s" : ""} in {campaignName(campaignFilter)}
          </span>
        )}
      </div>

      <CharacterStorage
        loadCharacter={loadCharacter}
        storedCharacters={filteredCharacters}
        deleteStoredCharacter={deleteStoredCharacter}
        partialCharacter={partialCharacter}
        clearPartialCharacter={clearPartialCharacter}
      ></CharacterStorage>

      <button
        className='button--new-character'
        onClick={() => {
          setCharacterRolled(false)
          navigate('/')
        }}
      >
        Back to Main
      </button>
    </div>
  )
}


