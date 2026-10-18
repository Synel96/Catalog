// Overlord profiles use a query parameter rather than a route parameter
// (/overlords/@id) so the page can be prerendered once and served from a
// static host: the id is only read in the browser.
export function overlordHref(id: number): string {
  return `/overlord?id=${id}`;
}
