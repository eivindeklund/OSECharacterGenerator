import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CharacterProvider } from '../contexts/CharacterContext';
import type { Campaign, StoredCharacterData } from '../types';
import CampaignsScreen from './CampaignsScreen';

// ── Mock navigate ─────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── CampaignContext mock ───────────────────────────────────────────────────────

const mockCreateCampaign = vi.fn();
const mockDeleteCampaign = vi.fn();
const mockSetActiveCampaign = vi.fn();

const campaignContextState = {
  campaigns: [] as Campaign[],
};

vi.mock('../contexts/CampaignContext', () => ({
  useCampaign: () => ({
    campaigns: campaignContextState.campaigns,
    createCampaign: mockCreateCampaign,
    deleteCampaign: mockDeleteCampaign,
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
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...partial,
  };
}

const defaultCampaign = makeCampaign({ id: 'default', name: 'Default' });
const customCampaign = makeCampaign({ id: 'camp-1', name: 'My Adventure', notes: 'Dragon campaign' });

function renderScreen(storedCharacters: StoredCharacterData[] = []) {
  const charContext = {
    storedCharacters,
  } as any;
  return render(
    <MemoryRouter>
      <CharacterProvider value={charContext}>
        <CampaignsScreen />
      </CharacterProvider>
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CampaignsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    campaignContextState.campaigns = [defaultCampaign, customCampaign];
    mockCreateCampaign.mockReturnValue(makeCampaign({ id: 'new-id', name: 'New Campaign' }));
  });

  it('renders campaign names', () => {
    renderScreen();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('My Adventure')).toBeInTheDocument();
  });

  it('shows campaign notes when present', () => {
    renderScreen();
    expect(screen.getByText('Dragon campaign')).toBeInTheDocument();
  });

  it('shows character count for each campaign', () => {
    const chars = [
      { campaignId: 'camp-1' },
      { campaignId: 'camp-1' },
      { campaignId: 'default' },
    ] as StoredCharacterData[];
    renderScreen(chars);
    // My Adventure has 2 characters, Default has 1
    expect(screen.getByText(/2 characters/)).toBeInTheDocument();
    // Exactly "1 character" (singular) should appear — not "1 characters"
    const badges = screen.getAllByText(/1 character/);
    expect(badges.some((el) => el.textContent?.trim() === '1 character')).toBe(true);
  });

  it('marks the default campaign with a "(default)" badge', () => {
    renderScreen();
    expect(screen.getByText('(default)')).toBeInTheDocument();
  });

  it('does not show a Delete button for the default campaign', () => {
    renderScreen();
    // Only custom campaign has a Delete button; default does not
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons).toHaveLength(1);
  });

  it('calls createCampaign and navigates to settings on create', () => {
    renderScreen();
    const input = screen.getByPlaceholderText(/campaign name/i);
    fireEvent.change(input, { target: { value: 'New Campaign' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    expect(mockCreateCampaign).toHaveBeenCalledWith('New Campaign');
    expect(mockNavigate).toHaveBeenCalledWith('/campaigns/new-id/settings');
  });

  it('uses fallback name "New Campaign" when input is blank', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    expect(mockCreateCampaign).toHaveBeenCalledWith('New Campaign');
  });

  it('asks for confirmation before deleting', () => {
    renderScreen();
    const [deleteBtn] = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);
    expect(mockDeleteCampaign).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
  });

  it('deletes campaign after confirmation', () => {
    renderScreen();
    const [deleteBtn] = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);
    fireEvent.click(screen.getByRole('button', { name: /confirm delete/i }));
    expect(mockDeleteCampaign).toHaveBeenCalledWith('camp-1');
  });

  it('cancel button dismisses the delete confirmation', () => {
    renderScreen();
    const [deleteBtn] = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('button', { name: /confirm delete/i })).not.toBeInTheDocument();
  });

  it('Play button for a non-default campaign sets it active and navigates home', () => {
    renderScreen();
    const playButtons = screen.getAllByRole('button', { name: /play/i });
    // First is default, second is custom
    fireEvent.click(playButtons[1]);
    expect(mockSetActiveCampaign).toHaveBeenCalledWith('camp-1');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('Play button for the default campaign sets active campaign to null', () => {
    renderScreen();
    const playButtons = screen.getAllByRole('button', { name: /play/i });
    fireEvent.click(playButtons[0]);
    expect(mockSetActiveCampaign).toHaveBeenCalledWith(null);
  });

  it('Settings button navigates to campaign settings', () => {
    renderScreen();
    const settingsButtons = screen.getAllByRole('button', { name: /settings/i });
    fireEvent.click(settingsButtons[1]); // custom campaign
    expect(mockNavigate).toHaveBeenCalledWith('/campaigns/camp-1/settings');
  });
});
