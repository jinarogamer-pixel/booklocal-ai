import UserProfileForm from './UserProfileForm';
import AccountSecurity from './AccountSecurity';

// Replace this with your actual user fetching logic
async function getUser(): Promise<{
  id: string;
  name?: string;
  email: string;
  avatar_url?: string;
  email_confirmed?: boolean;
}> {
  // Example: fetch from your backend or Supabase
  return {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    avatar_url: '',
    email_confirmed: true,
  };
}

export default async function UserProfilePage() {
  const user = await getUser();
  return (
    <div className="glass-card" style={{ maxWidth: 600, margin: '3rem auto' }}>
      <h1 className="hero-title" style={{ marginBottom: '1.5rem' }}>Profile</h1>
      <UserProfileForm user={user} />
      <AccountSecurity user={user} />
    </div>
  );
}

