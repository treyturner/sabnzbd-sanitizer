export function pluralize(something: any[] | number, suffix = 's') : string {
  if (typeof something === 'number') {
    return something > 1 ? suffix : ''
  } else {
    return something.length > 1 ? suffix : ''    
  }
}
