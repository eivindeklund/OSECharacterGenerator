import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StoredCharacterData } from '../types';
import CharacterStorageScreen from './CharacterStorageScreen';

// Mock the child component to verify props are passed
vi.mock('../containers/storage/CharacterStorage', () => {
  return {
    default: (props) => {
      // Render the number of stored characters to verify the prop was passed
      return (
        <div data-testid="mock-storage">
          {props.storedCharacters ? props.storedCharacters.length : 0} characters
          <button onClick={props.deleteStoredCharacter}>Delete</button>
        </div>
      );
    }
  };
});

// Mock Header
vi.mock('../components/general/Header', () => {
  return {
    default: () => <div>Header</div>
  };
});

describe('CharacterStorageScreen', () => {
  const mockDeleteStoredCharacter = vi.fn();
  const mockProps = {
    loadCharacter: vi.fn(),
    setCharacterRolled: vi.fn(),
    storedCharacters: [{ id: 1 }, { id: 2 }] as unknown as StoredCharacterData[],
    deleteStoredCharacter: mockDeleteStoredCharacter
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes storedCharacters to CharacterStorage', () => {
    render(<MemoryRouter><CharacterStorageScreen {...mockProps} /></MemoryRouter>);
    expect(screen.getByTestId('mock-storage')).toHaveTextContent('2 characters');
  });

  it('passes deleteStoredCharacter to CharacterStorage', () => {
    render(<MemoryRouter><CharacterStorageScreen {...mockProps} /></MemoryRouter>);
    fireEvent.click(screen.getByText('Delete'));
    expect(mockDeleteStoredCharacter).toHaveBeenCalled();
  });
});

