export function pluralize(something: any[] | number, suffix = 's'): string {
  if (typeof something === 'number') {
    return something > 1 ? suffix : '';
  } else {
    return something.length > 1 ? suffix : '';
  }
}

export async function logError(description: string, err: unknown) {
  console.error(description + ':');
  try {
    if (err instanceof Error) {
      console.error(JSON.stringify(err, null, 2));
    } else {
      console.error(err);
    }
  } catch {}
}

export function pad(i: number) {
  return i.toString().padStart(2, '0');
}
