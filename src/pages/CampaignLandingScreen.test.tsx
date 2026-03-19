import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CharacterProvider } from '../contexts/CharacterContext';
import type { Campaign } from '../types';
import CampaignLandingScreen from './CampaignLandingScreen';

// ── Mock navigate ─────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── CampaignContext mock ───────────────────────────────────────────────────────

const mockSetActiveCampaign = vi.fn();
const campaignContextState = { campaigns: [] as Campaign[] };

vi.mock('../contexts/CampaignContext', () => ({
  useCampaign: () => ({
    campaigns: campaignContextState.campaigns,
    setActiveCampaign: mockSetActiveCampaign,
  }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCampaign(partial: Partial<Campaign> & { id: string; name: string }): Campaign {
  return {
    notes: '',
    allowedClassNames: null,
    allowedEquipmentIds: null,
    allowedWeaponIds: null,
    allowedSpellIds: {},
    allowAdvancedClasses: null,
    allowCarcassClasses: null,
    allowNonBxEquipment: null,
    customClasses: [],
    customSpellLists: [],
    customEquipment: [],
    customWeapons: [],
    customSpells: {},
    customSpellSlotTables: [],
    customMagicTypes: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...partial,
  };
}

const mockRollCharacter = vi.fn();
const mockSetCharacterRolled = vi.fn();

function renderAtRoute(campaignId: string) {
  const charContext = {
    rollCharacter: mockRollCharacter,
    setCharacterRolled: mockSetCharacterRolled,
  } as any;
  return render(
    <MemoryRouter initialEntries={[`/campaign/${campaignId}`]}>
      <Routes>
        <Route
          path="/campaign/:id"
          element={
            <CharacterProvider value={charContext}>
              <CampaignLandingScreen />
            </CharacterProvider>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CampaignLandingScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    campaignContextState.campaigns = [
      makeCampaign({ id: 'camp-1', name: 'Dragon Quest', notes: 'Welcome adventurer!' }),
    ];
  });

  it('shows "Campaign not found" when campaign id does not exist', () => {
    renderAtRoute('no-such-id');
    expect(screen.getByText(/campaign not found/i)).toBeInTheDocument();
  });

  it('shows a "Go Home" button when campaign is not found', () => {
    renderAtRoute('no-such-id');
    const homeBtn = screen.getByRole('button', { name: /go home/i });
    expect(homeBtn).toBeInTheDocument();
  });

  it('shows the campaign name when found', () => {
    renderAtRoute('camp-1');
    expect(screen.getByText('Dragon Quest')).toBeInTheDocument();
  });

  it('shows campaign notes when present', () => {
    renderAtRoute('camp-1');
    expect(screen.getByText('Welcome adventurer!')).toBeInTheDocument();
  });

  it('does not render a notes section when notes are empty', () => {
    campaignContextState.campaigns = [
      makeCampaign({ id: 'camp-2', name: 'Silent Keep', notes: '' }),
    ];
    renderAtRoute('camp-2');
    // The div.campaign-landing--notes should not be present
    expect(screen.queryByText('Welcome adventurer!')).not.toBeInTheDocument();
  });

  it('activates the campaign and marks character rolled on mount', () => {
    renderAtRoute('camp-1');
    expect(mockSetActiveCampaign).toHaveBeenCalledWith('camp-1');
    expect(mockSetCharacterRolled).toHaveBeenCalledWith(true);
  });

  it('Create Character button calls rollCharacter', () => {
    renderAtRoute('camp-1');
    const btn = screen.getByRole('button', { name: /create character/i });
    btn.click();
    expect(mockRollCharacter).toHaveBeenCalledTimes(1);
  });

  it('View Characters button navigates to /tavern', () => {
    renderAtRoute('camp-1');
    const btn = screen.getByRole('button', { name: /view characters/i });
    btn.click();
    expect(mockNavigate).toHaveBeenCalledWith('/tavern');
  });
});
