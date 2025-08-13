export const metadata = {
  title: 'Terms of Service | BookLocal',
  alternates: { canonical: '/legal/terms' },
};
export const dynamic = 'force-static';
export const revalidate = false;

export default function Terms() {
  return (
    <main className="max-w-2xl mx-auto p-8 mt-10">
      <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-4">Effective: August 2025</p>


      <h2 className="text-xl font-semibold mt-6 mb-2">1. Agreement & Contact</h2>
      <p>These Terms govern your use of BookLocal. Entity: <strong>BookLocal</strong>, West Palm Beach, Florida. Contact: <a className="underline" href="mailto:support@booklocal.com">support@booklocal.com</a>. We aim to respond within 2 business days.</p>


      <h2 className="text-xl font-semibold mt-6 mb-2">2. Use of the Service</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>You must be legally able to enter a contract in your jurisdiction.</li>
        <li>No unlawful content, payments, or attempts to bypass security.</li>
        <li>Service providers must comply with all applicable laws and licensing requirements.</li>
        <li>Disputes between users and providers should be resolved in good faith; BookLocal may assist but is not liable for outcomes.</li>
        <li>Cancellation and refund policies are set by providers unless otherwise stated.</li>
        <li>Prohibited uses include fraud, abuse, harassment, and posting false information.</li>
      </ul>


      <h2 className="text-xl font-semibold mt-6 mb-2">3. Bookings & Payments</h2>
      <p>Payments and payouts are processed by <strong>Stripe</strong> over HTTPS. You agree to comply with Stripe’s terms and policies when using payment features. All payment and user data is encrypted in transit and at rest.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Content & Reviews</h2>
      <p>You grant us a license to host and display content you submit. We may moderate or remove content that violates these Terms.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Disclaimers & Limitation of Liability</h2>
      <p>Provided “as-is” without warranties. To the extent permitted by law, our liability is limited to the fees you paid in the 12 months preceding the claim.</p>


      <h2 className="text-xl font-semibold mt-6 mb-2">6. Termination</h2>
      <p>We may suspend or terminate accounts for policy violations. You may stop using the Service at any time. Data deletion is available as described in our Data Deletion Policy.</p>


      <h2 className="text-xl font-semibold mt-6 mb-2">7. Governing Law</h2>
      <p>Florida, USA. Venue as permitted by law; mandatory consumer rights are unaffected.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Changes</h2>
      <p>We may update these Terms; we’ll post changes with a new Effective date.</p>
    </main>
  );
}
