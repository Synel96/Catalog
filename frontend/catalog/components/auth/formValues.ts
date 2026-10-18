// The auth pages are prerendered, so a visitor can type into them before
// React hydrates. Controlled inputs would be reset to their (empty) state on
// hydration; uncontrolled ones keep what was typed, so these forms read their
// values from the DOM on submit instead.
export function formValues<K extends string>(form: HTMLFormElement, keys: readonly K[]) {
  const data = new FormData(form);
  return Object.fromEntries(keys.map((key) => [key, String(data.get(key) ?? "")])) as Record<
    K,
    string
  >;
}
