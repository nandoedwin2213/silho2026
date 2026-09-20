"use client";

import Script from "next/script";

export function Analytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <>
      <Script id="analytics-datalayer" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];`}
      </Script>
      {measurementId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
          <Script id="analytics-gtag" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || []; function gtag(){window.dataLayer.push(arguments);} window.gtag = gtag; gtag('js', new Date()); gtag('config', '${measurementId}', { anonymize_ip: true });`}
          </Script>
        </>
      )}
    </>
  );
}
