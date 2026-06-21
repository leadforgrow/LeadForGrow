const PREFIX = '[Meta]';

export function metaLog(step, message, data) {
  const label = step ? `${PREFIX}[${step}]` : PREFIX;
  if (data !== undefined) {
    const out = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    console.log(`${label} ${message}`, out);
  } else {
    console.log(`${label} ${message}`);
  }
}

export function metaWarn(step, message, data) {
  const label = step ? `${PREFIX}[${step}]` : PREFIX;
  if (data !== undefined) {
    console.warn(`${label} ${message}`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
  } else {
    console.warn(`${label} ${message}`);
  }
}

export function metaError(step, message, error) {
  const label = step ? `${PREFIX}[${step}]` : PREFIX;

  if (error instanceof Error) {
    console.error(`${label} ${message}`, error.message);
    if (error.stack) console.error(`${label} stack:`, error.stack);
    return;
  }

  if (error !== undefined) {
    console.error(
      `${label} ${message}`,
      typeof error === 'string' ? error : JSON.stringify(error, null, 2)
    );
    return;
  }

  console.error(`${label} ${message}`);
}
