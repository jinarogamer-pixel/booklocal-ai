// Privacy Policy page
export default function Privacy() {
  return (
    <main className="max-w-2xl mx-auto p-8 glass-card animate-fade-in-up mt-10">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-2">Your privacy is important to us. This policy explains how BookLocal collects, uses, and protects your data...</p>
      <ul className="list-disc pl-6 mb-4">
        <li>We collect only necessary information for bookings and payments.</li>
        <li>Your data is never sold to third parties.</li>
        <li>We use industry-standard security to protect your information.</li>
        <li>You can request deletion of your data at any time.</li>
      </ul>
      <p>For questions, contact privacy@booklocal.com.</p>
    </main>
  );
}
