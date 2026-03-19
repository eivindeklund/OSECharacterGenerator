import type { Campaign } from "../../types";

interface ThreeStateToggleProps {
  legend: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}

export function ThreeStateToggle({ legend, value, onChange }: ThreeStateToggleProps) {
  const name = `toggle-${legend.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
  return (
    <fieldset className="campaign-toggle-fieldset">
      <legend className="campaign-toggle-legend">{legend}</legend>
      {(["player", "on", "off"] as const).map((opt) => {
        const optValue = opt === "player" ? null : opt === "on";
        const checked = value === optValue;
        const id = `${name}-${opt}`;
        return (
          <label key={opt} className="campaign-toggle-option" htmlFor={id}>
            <input
              type="radio"
              id={id}
              name={name}
              checked={checked}
              onChange={() => onChange(optValue)}
            />
            {opt === "player" ? "Player chooses" : opt === "on" ? "Always enabled" : "Always disabled"}
          </label>
        );
      })}
    </fieldset>
  );
}

interface Props {
  draft: Campaign;
  patch: (partial: Partial<Campaign>) => void;
}

export default function CampaignGeneralTab({ draft, patch }: Props) {
  return (
    <div className="campaign-settings-general">
      <div className="campaign-field">
        <label className="campaign-field-label" htmlFor="campaign-name-input">
          Campaign Name
        </label>
        <input
          id="campaign-name-input"
          type="text"
          className="campaign-name-input campaign-field-input"
          value={draft.name}
          onChange={(e) => patch({ name: e.target.value })}
        />
      </div>

      <div className="campaign-field">
        <label className="campaign-field-label" htmlFor="campaign-notes-input">
          Notes (shown to players on the campaign landing page)
        </label>
        <textarea
          id="campaign-notes-input"
          className="campaign-notes-input campaign-field-textarea"
          value={draft.notes}
          onChange={(e) => patch({ notes: e.target.value })}
          rows={4}
        />
      </div>

      <h4 className="campaign-section-heading">Class Availability</h4>
      <ThreeStateToggle
        legend="Advanced Classes"
        value={draft.allowAdvancedClasses}
        onChange={(v) => patch({ allowAdvancedClasses: v })}
      />
      <ThreeStateToggle
        legend="Carcass Crawler Classes"
        value={draft.allowCarcassClasses}
        onChange={(v) => patch({ allowCarcassClasses: v })}
      />
    </div>
  );
}
