export const metadata = {
  title: 'Data Deletion Policy | BookLocal',
  alternates: { canonical: '/legal/data-deletion' },
};
export const dynamic = 'force-static';
export const revalidate = false;

export default function DataDeletion() {
  return (
    <main className="max-w-2xl mx-auto p-8 mt-10">
      <h1 className="text-2xl font-bold mb-4">Data Deletion Policy</h1>
      <p className="mb-4">Effective: August 2025</p>
      <p className="mb-4">You may request deletion of your BookLocal account and personal data at any time. To do so:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Go to your account settings and select “Delete Account” (if available), or</li>
        <li>Email <a className="underline" href="mailto:privacy@booklocal.com">privacy@booklocal.com</a> from your registered address with the subject “Delete My Account”.</li>
      </ul>
      <p className="mb-4">Upon verification, we will delete or anonymize your data within 30 days, except where retention is required by law (e.g., for payment records).</p>
      <p className="mb-4">Deleted data cannot be recovered. Some data may remain in backups for up to 90 days before being purged.</p>
      <p className="mb-4">For questions, contact <a className="underline" href="mailto:privacy@booklocal.com">privacy@booklocal.com</a>.</p>
    </main>
  );
}
