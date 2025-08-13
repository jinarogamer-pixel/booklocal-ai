export const metadata = {
  title: 'Privacy Policy | BookLocal',
  description: 'How BookLocal collects, uses, and protects your information.',
  alternates: { canonical: '/legal/privacy' },
};

export const dynamic = 'force-static';
export const revalidate = false;

export default function Privacy() {
  return (
    <main className="max-w-2xl mx-auto p-8 mt-10">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">Effective: August 2025</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Who we are</h2>
      <p className="mb-4">
        BookLocal (“we”, “us”). Legal entity: <strong>[Your LLC/Inc name]</strong>,
        <strong> [address]</strong>. Contact: <a className="underline" href="mailto:privacy@booklocal.com">privacy@booklocal.com</a>.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Information we collect</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Account: name, email, phone, password hash</li>
        <li>Bookings & provider profile data</li>
        <li>Payment metadata via Stripe (we don’t store full card data)</li>
        <li>Usage data: IP, device/browser info, pages</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">How we use it (legal bases)</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Provide and secure the service (contract, legitimate interests)</li>
        <li>Process payments and payouts via Stripe (contract)</li>
        <li>Send confirmations and important notices (contract, legitimate interests)</li>
        <li>Improve features and prevent abuse (legitimate interests)</li>
        <li>Where required, analytics/marketing only with consent</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Sharing</h2>
      <p className="mb-2">We don’t sell your personal data. We share with:</p>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Stripe</strong> (payments & payouts)</li>
        <li><strong>Vercel</strong> (hosting) and <strong>Supabase</strong> (database/auth/storage)</li>
        <li>Optional analytics providers you enable (listed here if used)</li>
        <li>Law enforcement when required by law</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Retention</h2>
      <p className="mb-4">We keep data only as long as needed for the purposes above, then delete or anonymize it. You can request deletion.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Your rights</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Access, correct, delete your data</li>
        <li>Portability, restriction, and objection (where applicable)</li>
        <li>Opt out of marketing</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Cookies & tracking</h2>
      <p className="mb-4">We use essential cookies. Non-essential cookies (analytics/ads) only with your consent. You can change your choices anytime.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">International transfers</h2>
      <p className="mb-4">Where data moves outside your region, we use appropriate safeguards (e.g., Standard Contractual Clauses).</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p>Questions or requests? <a className="underline" href="mailto:privacy@booklocal.com">privacy@booklocal.com</a></p>

      <p className="text-sm text-neutral-500 mt-10">
        Key subprocessors: Stripe, Vercel, Supabase. We will update this list if it changes.
      </p>
    </main>
  );
}
