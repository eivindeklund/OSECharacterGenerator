import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { StoredCharacterData } from '../types'
import ImportCharacterScreen from './ImportCharacterScreen'

describe('ImportCharacterScreen', () => {
  const mockCharacterData = {
    character: { name: 'Test Hero' },
    characterClass: { name: 'Fighter' },
    characterStatistics: { hitPoints: 10, armourClass: 9 },
    abilityScores: {
      strength: 18,
      intelligence: 10,
      wisdom: 10,
      dexterity: 10,
      constitution: 10,
      charisma: 10
    }
  } as StoredCharacterData

  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  it('renders character details correctly', () => {
    render(
      <ImportCharacterScreen 
        characterData={mockCharacterData} 
        onConfirm={mockOnConfirm} 
        onCancel={mockOnCancel} 
      />
    )

    expect(screen.getByText('Test Hero')).toBeInTheDocument()
    expect(screen.getByText('Fighter')).toBeInTheDocument()
    
    // Check ability scores
    // The component renders scores as KEY: Value, e.g., "STR: 18"
    expect(screen.getByText('STR:')).toBeInTheDocument() 
    // Using getAllByText just in case multiple '18' appear elsewhere, but getByText is stricter.
    // Given the markup: <strong>STR:</strong> 18
    // Testing text content might require exact match or regex.
  })

  it('calls onConfirm when Import button is clicked', () => {
    render(
      <ImportCharacterScreen 
        characterData={mockCharacterData} 
        onConfirm={mockOnConfirm} 
        onCancel={mockOnCancel} 
      />
    )
    
    const confirmButton = screen.getByText('Import')
    fireEvent.click(confirmButton)
    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <ImportCharacterScreen 
        characterData={mockCharacterData} 
        onConfirm={mockOnConfirm} 
        onCancel={mockOnCancel} 
      />
    )
    
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('renders error message if no characterData is provided', () => {
    render(
      <ImportCharacterScreen 
        characterData={null} 
        onConfirm={mockOnConfirm} 
        onCancel={mockOnCancel} 
      />
    )
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Invalid character data provided.')).toBeInTheDocument()
  })
})
