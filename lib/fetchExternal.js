import https from 'node:https';

const isDev = process.env.NODE_ENV === 'development';

function isTlsVerifyError(error) {
  const code = error?.cause?.code || error?.code;
  return (
    code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
    code === 'CERT_HAS_EXPIRED' ||
    code === 'SELF_SIGNED_CERT_IN_CHAIN'
  );
}

function fetchViaHttps(url, options, rejectUnauthorized) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const body = options.body;

    const req = https.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: `${urlObj.pathname}${urlObj.search}`,
        method: options.method || 'GET',
        headers: options.headers,
        agent: new https.Agent({ rejectUnauthorized }),
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: async () => JSON.parse(text),
            text: async () => text,
          });
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

/**
 * Fetch external HTTPS APIs (Meta, Interakt, Stripe, etc.).
 * In local dev, retries once with relaxed TLS if certificate verification fails.
 */
export async function fetchExternal(url, options = {}) {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (isDev && isTlsVerifyError(error)) {
      console.warn(
        `[fetchExternal] TLS verify failed for ${url}; retrying with dev-only insecure HTTPS. ` +
          'Use npm run dev (includes --use-system-ca) or install your corporate root CA.'
      );
      return fetchViaHttps(url, options, false);
    }
    throw error;
  }
}
