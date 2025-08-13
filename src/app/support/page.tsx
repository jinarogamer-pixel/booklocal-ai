export const metadata = {
  title: 'Support | BookLocal',
  alternates: { canonical: '/support' },
};
export const dynamic = 'force-static';
export const revalidate = false;

export default function Support() {
  return (
    <main className="max-w-2xl mx-auto p-8 mt-10">
      <h1 className="text-2xl font-bold mb-4">Support</h1>
      <p className="mb-4">For help, contact <a className="underline" href="mailto:support@booklocal.com">support@booklocal.com</a>. We aim to respond within 2 business days.</p>
      <p className="mb-4">For privacy or data deletion requests, email <a className="underline" href="mailto:privacy@booklocal.com">privacy@booklocal.com</a>.</p>
    </main>
  );
}
