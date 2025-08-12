import Link from 'next/link';
export default function Custom404() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#ededed' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
      <p style={{ fontSize: '1.2rem' }}>Sorry, the page you are looking for does not exist.</p>
      <Link href="/" style={{ color: '#38bdf8', textDecoration: 'none', marginTop: '2rem' }}>Go Home</Link>
    </div>
  );
}
