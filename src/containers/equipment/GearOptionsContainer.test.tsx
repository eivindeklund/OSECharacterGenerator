import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EquipmentItem } from '../../types';
import GearOptionsContainer from './GearOptionsContainer';

// ── Mock ItemOptionsContainer ─────────────────────────────────────────────────

vi.mock('./ItemOptionsContainer', () => ({
  default: ({ items }: { items: EquipmentItem[] }) => (
    <div data-testid="item-options">
      {items.map((i) => (
        <span key={i.id} data-testid={`item-${i.id}`}>{i.name}</span>
      ))}
    </div>
  ),
}));

// ── CampaignContext mock ───────────────────────────────────────────────────────

const campaignContextState = {
  allowNonBxEquipment: null as boolean | null,
};

vi.mock('../../contexts/CampaignContext', () => ({
  useCampaign: () => ({
    availableEquipment: () => allItems,
    activeCampaign: { allowNonBxEquipment: campaignContextState.allowNonBxEquipment },
  }),
}));

// ── Test items ────────────────────────────────────────────────────────────────

const bxItem: EquipmentItem = {
  id: 'torches', name: 'Torches', price: 1, category: 'gear',
  in_bx_basic: true, in_bx_expert: false,
};

const nonBxItem: EquipmentItem = {
  id: 'fancy-rope', name: 'Fancy Rope', price: 5, category: 'gear',
  in_bx_basic: false, in_bx_expert: false,
};

const allItems = [bxItem, nonBxItem];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GearOptionsContainer', () => {
  const renderGear = () =>
    render(<GearOptionsContainer purchaseLedger={{}} handleUpdateLedger={vi.fn()} />);

  describe('when allowNonBxEquipment is null (player controls)', () => {
    beforeEach(() => {
      campaignContextState.allowNonBxEquipment = null;
    });

    it('shows the B/X items only checkbox', () => {
      renderGear();
      expect(screen.getByRole('checkbox', { name: /b\/x items only/i })).toBeInTheDocument();
    });

    it('filters out non-B/X items by default (checkbox starts checked)', () => {
      renderGear();
      expect(screen.getByTestId('item-torches')).toBeInTheDocument();
      expect(screen.queryByTestId('item-fancy-rope')).not.toBeInTheDocument();
    });
  });

  describe('when allowNonBxEquipment is false (B/X forced by campaign)', () => {
    beforeEach(() => {
      campaignContextState.allowNonBxEquipment = false;
    });

    it('hides the B/X items checkbox', () => {
      renderGear();
      expect(screen.queryByRole('checkbox', { name: /b\/x items only/i })).not.toBeInTheDocument();
    });

    it('only shows B/X items', () => {
      renderGear();
      expect(screen.getByTestId('item-torches')).toBeInTheDocument();
      expect(screen.queryByTestId('item-fancy-rope')).not.toBeInTheDocument();
    });
  });

  describe('when allowNonBxEquipment is true (all equipment unlocked by campaign)', () => {
    beforeEach(() => {
      campaignContextState.allowNonBxEquipment = true;
    });

    it('hides the B/X items checkbox', () => {
      renderGear();
      expect(screen.queryByRole('checkbox', { name: /b\/x items only/i })).not.toBeInTheDocument();
    });

    it('shows all items including non-B/X', () => {
      renderGear();
      expect(screen.getByTestId('item-torches')).toBeInTheDocument();
      expect(screen.getByTestId('item-fancy-rope')).toBeInTheDocument();
    });
  });
});
