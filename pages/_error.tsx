import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import type { NextPageContext } from 'next';

type ErrorProps = { statusCode?: number };

const CustomErrorComponent = (props: ErrorProps) => {
  const status = typeof props.statusCode === 'number' ? props.statusCode : 500;
  return <Error statusCode={status} />;
};

CustomErrorComponent.getInitialProps = async (contextData: NextPageContext) => {
  // In case this is running in a serverless function, await this in order to give Sentry
  // time to send the error before the lambda exits
  // Use captureException if captureUnderscoreErrorException is not available
  const maybeSentry = Sentry as unknown as Record<string, unknown>;
  const hasHelper = typeof maybeSentry.captureUnderscoreErrorException === 'function';

  if (hasHelper) {
    // call helper with a safe typed function signature
    await (maybeSentry.captureUnderscoreErrorException as (arg: unknown) => Promise<void>)(contextData);
  } else if (typeof Sentry.captureException === 'function') {
    Sentry.captureException(contextData as unknown as Error);
  }

  // This will contain the status code of the response
  return Error.getInitialProps(contextData);
};

export default CustomErrorComponent;
