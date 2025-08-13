import Error from 'next/error';
import { captureError } from '../src/lib/errorMonitoring';

function CustomError({ statusCode, err, hasGetInitialPropsRun, eventId }) {
  // If Sentry event ID is available, we can show it to the user for support
  const errorEventId = eventId || (err && err.eventId);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#ededed', padding: '2rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{statusCode || 'Error'}</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '1rem', textAlign: 'center' }}>
        {statusCode === 404
          ? "This page could not be found."
          : statusCode === 500
          ? "A server-side error occurred."
          : "An error occurred on this page."}
      </p>
      {errorEventId && (
        <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1rem' }}>
          Error ID: {errorEventId}
        </p>
      )}
      <a 
        href="/"
        style={{ 
          color: '#38bdf8', 
          textDecoration: 'none', 
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          border: '1px solid #38bdf8',
          borderRadius: '4px',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#38bdf8'}
        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        Go Home
      </a>
    </div>
  );
}

CustomError.getInitialProps = async (context) => {
  const { res, err } = context;
  let statusCode = 500;
  let hasGetInitialPropsRun = false;
  let eventId = undefined;

  // Determine status code
  if (res) {
    statusCode = res.statusCode;
  } else if (err) {
    statusCode = err.statusCode || 500;
  }

  // Handle the case where err is undefined/falsy (the main issue we're fixing)
  if (!err) {
    // Create a fallback error object for undefined errors
    const fallbackError = new Error('Unknown error occurred - original error was undefined');
    fallbackError.statusCode = statusCode;
    
    try {
      // Attempt to capture this undefined error scenario
      eventId = await captureError(fallbackError, {
        context: 'custom_error_page',
        originalError: 'undefined',
        statusCode,
        userAgent: context.req?.headers?.['user-agent'],
        url: context.req?.url,
      });
    } catch (captureErr) {
      // If error capture also fails, at least log to console
      console.error('[Custom Error Page] Failed to capture undefined error:', captureErr);
    }

    return {
      statusCode,
      hasGetInitialPropsRun,
      eventId,
      err: fallbackError
    };
  }

  // For normal errors with proper error objects
  try {
    // Capture the error if it hasn't been captured yet
    if (!err.eventId) {
      eventId = await captureError(err, {
        context: 'custom_error_page',
        statusCode,
        userAgent: context.req?.headers?.['user-agent'],
        url: context.req?.url,
      });
      
      // Attach eventId to error object for potential reuse
      if (eventId) {
        err.eventId = eventId;
      }
    } else {
      eventId = err.eventId;
    }
  } catch (captureErr) {
    // If error capture fails, continue without it
    console.error('[Custom Error Page] Failed to capture error:', captureErr);
  }

  return {
    statusCode,
    hasGetInitialPropsRun,
    eventId,
    err
  };
};

export default CustomError;