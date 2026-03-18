export function pluralize(something: any[] | number, suffix = 's'): string {
  if (typeof something === 'number') {
    return something > 1 ? suffix : '';
  } else {
    return something.length > 1 ? suffix : '';
  }
}

export function logError(description: string, err: unknown) {
  console.error(description + ':');
  if (err instanceof Error) {
    console.error(err.message);
    if (err.stack) console.error(err.stack);
  } else {
    console.error(err);
  }
}

export function pad(i: number) {
  return i.toString().padStart(2, '0');
}
