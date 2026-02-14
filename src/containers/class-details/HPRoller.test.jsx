import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import HPRoller from './HPRoller';

describe('HPRoller', () => {
  const mockRollHP = vi.fn();
  const defaultProps = {
    characterClass: { hd: 8 },
    characterStatistics: {
      hitPoints: null,
      hpResult: null,
      hpRolls: 0,
    },
    characterModifiers: { constitutionMod: '+1' },
    rollHP: mockRollHP,
  };

  test('should render "Roll HP" button initially', () => {
    render(<HPRoller {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Roll HP/i })).toBeInTheDocument();
    expect(screen.getByText('d8')).toBeInTheDocument();
  });

  test('should show hit points and result after rolling', () => {
    const rolledProps = {
      ...defaultProps,
      characterStatistics: {
        hitPoints: 6,
        hpResult: 5,
        hpRolls: 1,
      },
    };
    render(<HPRoller {...rolledProps} />);
    // The button should now show "Reroll?" if hpResult <= 2, 
    // but here it's 5, so it should show the final HP if not rerollable.
    // Wait, the logic is: {!canReroll && hitPoints}
    // and canReroll = HPRolls < 2 && (HPResult === null || HPResult <= 2)
    // For hitPoints=6, hpResult=5, hpRolls=1 -> canReroll = false
    expect(screen.getByRole('button')).toHaveTextContent('6');
    expect(screen.getByText('5')).toBeInTheDocument(); // HPResult
    expect(screen.getAllByText('6')).toHaveLength(2); // Button and "Hit Points" container
  });

  test('should show "Reroll?" if result is low', () => {
    const lowProps = {
      ...defaultProps,
      characterStatistics: {
        hitPoints: 2,
        hpResult: 1,
        hpRolls: 1,
      },
    };
    render(<HPRoller {...lowProps} />);
    expect(screen.getByRole('button', { name: /Reroll\?/i })).toBeInTheDocument();
  });

  test('should call rollHP when button is clicked', (done) => {
    render(<HPRoller {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Roll HP/i }));
    
    // rollHP is wrapped in a 200ms setTimeout in the component
    setTimeout(() => {
      expect(mockRollHP).toHaveBeenCalled();
      done();
    }, 300);
  });
});
