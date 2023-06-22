export function getQuery(urlSearchParams) {
  const query = {};
  for (const [key, value] of urlSearchParams) {
    query[key] = value;
  }
  return query;
}
