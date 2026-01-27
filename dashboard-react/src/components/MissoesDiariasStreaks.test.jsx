import { render, screen } from '@testing-library/react';
import MissoesDiariasStreaks from './MissoesDiariasStreaks';

describe('MissoesDiariasStreaks', () => {
  it('renderiza sem crashar', () => {
    render(<MissoesDiariasStreaks userId="test-user" />);
    expect(screen.getByText(/miss/i)).toBeInTheDocument();
  });
});
