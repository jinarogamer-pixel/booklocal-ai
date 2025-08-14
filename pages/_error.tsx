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
  if (typeof Sentry.captureUnderscoreErrorException === 'function') {
    // @ts-ignore - upstream Sentry helper may exist in runtime
    await Sentry.captureUnderscoreErrorException(contextData as any);
  } else if (typeof Sentry.captureException === 'function') {
    Sentry.captureException(contextData as any);
  }

  // This will contain the status code of the response
  return Error.getInitialProps(contextData as any);
};

export default CustomErrorComponent;
