import { render, screen } from '@testing-library/react';
import ProviderSignup from '../page';

describe('ProviderSignup', () => {
  it('renders the form', () => {
    render(<ProviderSignup />);
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Service Area/i)).toBeInTheDocument();
  });
});
