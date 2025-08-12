// __tests__/review-moderation.test.tsx
import { render, screen } from '@testing-library/react';
import ReviewModerationPanel from '../src/app/components/ReviewModerationPanel';

describe('ReviewModerationPanel', () => {
  it('renders review moderation panel', () => {
    render(<ReviewModerationPanel />);
    expect(screen.getByText('Review Moderation')).toBeInTheDocument();
  });
});

// Add more review moderation tests as needed
