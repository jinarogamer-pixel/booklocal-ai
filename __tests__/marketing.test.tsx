// __tests__/marketing.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import MarketingToolsPanel from '../src/app/components/MarketingToolsPanel';

describe('MarketingToolsPanel', () => {
  it('renders promo codes and allows adding a new one', () => {
    render(<MarketingToolsPanel />);
    expect(screen.getByText('WELCOME10')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('New promo code'), { target: { value: 'FALL25' } });
    fireEvent.click(screen.getByText('Add'));
    expect(screen.getByText('FALL25')).toBeInTheDocument();
  });
});

// Add more marketing tools tests as needed
