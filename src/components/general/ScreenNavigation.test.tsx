import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ScreenNavigation from './ScreenNavigation';

describe('ScreenNavigation', () => {
  const mockOnNext = vi.fn();
  const mockOnPrev = vi.fn();
  const mockOnNavigation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render Next button with custom label', () => {
    render(<ScreenNavigation onNext={mockOnNext} nextLabel="Details" />);
    expect(screen.getByText('Details >')).toBeInTheDocument();
  });

  test('should disable Next button if requirements exist', () => {
    render(
      <ScreenNavigation
        onNext={mockOnNext}
        requirements={['Field is required']}
      />
    );
    const nextButton = screen.getByRole('button', { name: /Next >/i });
    expect(nextButton).toBeDisabled();
    expect(screen.getByText('Field is required')).toBeInTheDocument();
  });

  test('should call onNavigation and onNext when Next is clicked', () => {
    render(
      <ScreenNavigation
        onNext={mockOnNext}
        onNavigation={mockOnNavigation}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Next >/i }));
    expect(mockOnNavigation).toHaveBeenCalledTimes(1);
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  test('should call onNavigation and onPrev when Back is clicked', () => {
    render(
      <ScreenNavigation
        onPrev={mockOnPrev}
        onNavigation={mockOnNavigation}
        prevLabel="Back"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /< Back/i }));
    expect(mockOnNavigation).toHaveBeenCalledTimes(1);
    expect(mockOnPrev).toHaveBeenCalledTimes(1);
  });
});
