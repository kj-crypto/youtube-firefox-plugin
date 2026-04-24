export function urlJoin(...parts: string[]) {
  return parts
    .map((part) => part.replace(/\/{2,}/, '/').replace(/(^\/|\/$)/, ''))
    .join('/')
    .replace(/([a-z]+:)\//, '$1//');
}

export function validateResponse(response: Record<string, any>, schema: Record<string, any>) {
  for (const key of Object.keys(schema)) {
    if (!response[key] || response[key] === '') {
      console.log('Response missing ', key);
    }
  }
}
