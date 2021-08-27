export function unknownToString(e: unknown): string {
  if (typeof e === 'string') {
    return e;
  }

  if (e instanceof Error) {
    return String(e);
  }

  const isObj = (d: unknown): d is Record<string, unknown> => typeof d === 'object' && d !== null;

  if (isObj(e)) {
    const summary = ['error', 'message', 'description', 'error_message', 'error_description'].reduce((str, key) => {
      if (key in e) {
        return str + '. ' + unknownToString(e[key]);
      }

      return str;
    }, '');

    if (summary.trim() !== '') {
      return summary;
    }
  }

  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
