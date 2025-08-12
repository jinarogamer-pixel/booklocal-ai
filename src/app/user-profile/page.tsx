import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import UserProfileForm from './UserProfileForm';
import AccountSecurity from './AccountSecurity';

export default function UserProfile({ user }: { user: any }) {
  const { t } = useTranslation('user-profile');
  return (
    <div className="glass-card" style={{ maxWidth: 600, margin: '3rem auto' }}>
      <h1 className="hero-title" style={{ marginBottom: '1.5rem' }}>{t('profile')}</h1>
      <UserProfileForm user={user} />
      <AccountSecurity user={user} />
    </div>
  );
}

