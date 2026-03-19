import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Campaign } from '../types';
import CampaignSettingsScreen from './CampaignSettingsScreen';

// ── Mock navigate ─────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── CampaignContext mock ───────────────────────────────────────────────────────

const mockUpdateCampaign = vi.fn();
const campaignContextState = { campaigns: [] as Campaign[] };

vi.mock('../contexts/CampaignContext', () => ({
  useCampaign: () => ({
    campaigns: campaignContextState.campaigns,
    updateCampaign: mockUpdateCampaign,
  }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCampaign(
  partial: Partial<Campaign> & { id: string; name: string },
): Campaign {
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

function renderAtRoute(campaignId: string) {
  return render(
    <MemoryRouter initialEntries={[`/campaigns/${campaignId}/settings`]}>
      <Routes>
        <Route path="/campaigns/:id/settings" element={<CampaignSettingsScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CampaignSettingsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    campaignContextState.campaigns = [
      makeCampaign({ id: 'camp-1', name: 'Test Campaign', notes: 'My notes' }),
    ];
  });

  it('shows "Campaign not found" when campaign id does not exist', () => {
    renderAtRoute('no-such-id');
    expect(screen.getByText(/campaign not found/i)).toBeInTheDocument();
  });

  it('renders the campaign name in the heading', () => {
    renderAtRoute('camp-1');
    expect(screen.getByText(/test campaign.*settings/i)).toBeInTheDocument();
  });

  it('renders the four tabs: General, Classes, Equipment, Spells', () => {
    renderAtRoute('camp-1');
    expect(screen.getByRole('button', { name: /^general$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^classes$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^equipment$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^spells$/i })).toBeInTheDocument();
  });

  describe('General tab', () => {
    it('shows the campaign name in the name input', () => {
      renderAtRoute('camp-1');
      const input = screen.getByDisplayValue('Test Campaign');
      expect(input).toBeInTheDocument();
    });

    it('shows campaign notes in the textarea', () => {
      renderAtRoute('camp-1');
      expect(screen.getByDisplayValue('My notes')).toBeInTheDocument();
    });

    it('Save button calls updateCampaign with updated name', () => {
      renderAtRoute('camp-1');
      const nameInput = screen.getByDisplayValue('Test Campaign');
      fireEvent.change(nameInput, { target: { value: 'Renamed Campaign' } });
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
      expect(mockUpdateCampaign).toHaveBeenCalledTimes(1);
      const [saved] = mockUpdateCampaign.mock.calls[0] as [Campaign];
      expect(saved.name).toBe('Renamed Campaign');
    });

    it('Save & Back calls updateCampaign and navigates to /campaigns', () => {
      renderAtRoute('camp-1');
      fireEvent.click(screen.getByRole('button', { name: /save.*back/i }));
      expect(mockUpdateCampaign).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/campaigns');
    });

    it('Cancel navigates to /campaigns without saving', () => {
      renderAtRoute('camp-1');
      fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
      expect(mockUpdateCampaign).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/campaigns');
    });

    it('renders ThreeStateToggle for Advanced Classes lock', () => {
      renderAtRoute('camp-1');
      expect(screen.getByText('Advanced Classes')).toBeInTheDocument();
    });

    it('renders ThreeStateToggle for Carcass Crawler Classes lock', () => {
      renderAtRoute('camp-1');
      expect(screen.getByText('Carcass Crawler Classes')).toBeInTheDocument();
    });
  });

  describe('Classes tab', () => {
    it('switching to Classes tab shows classes tab content', () => {
      renderAtRoute('camp-1');
      fireEvent.click(screen.getByRole('button', { name: /^classes$/i }));
      // The General tab "Allowed Classes" section should no longer be visible,
      // and the Classes tab content is rendered (currently a stub)
      expect(screen.queryByDisplayValue('Test Campaign')).not.toBeInTheDocument();
    });
  });
});
