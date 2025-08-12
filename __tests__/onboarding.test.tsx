// __tests__/onboarding.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingStepper from '../src/app/onboarding/OnboardingStepper';

describe('OnboardingStepper', () => {
  it('renders all steps and navigates through them', () => {
    render(<OnboardingStepper />);
    expect(screen.getByText('Business Profile')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Business Profile'));
    expect(screen.getByText('Business Profile')).toHaveStyle('color: #fff');
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Services & Pricing')).toBeInTheDocument();
  });
});

// Add more onboarding tests as needed
