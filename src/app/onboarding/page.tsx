import OnboardingStepper from './OnboardingStepper';
import AuthGuard from '../components/AuthGuard';

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <div style={{ maxWidth: 600, margin: '3rem auto' }}>
        <h1 className="hero-title mb-4">Welcome to BookLocal!</h1>
        <p className="mb-6">Let&apos;s get your provider profile set up. This quick onboarding will help you start booking clients fast.</p>
        <OnboardingStepper />
      </div>
    </AuthGuard>
  );
}
