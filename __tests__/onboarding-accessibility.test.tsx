// __tests__/onboarding-accessibility.test.tsx
import { render } from '@testing-library/react';
import OnboardingStepper from '../src/app/onboarding/OnboardingStepper';
import { axe } from 'jest-axe';
import 'jest-axe/extend-expect';

describe('OnboardingStepper accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<OnboardingStepper />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
