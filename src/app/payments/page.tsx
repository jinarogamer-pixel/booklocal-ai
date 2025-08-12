

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import PaymentsDashboard from './PaymentsDashboard';

export default function Page() {
  // If you want to fetch data on the server, do it here and pass as props
  return <PaymentsDashboard />;
}
