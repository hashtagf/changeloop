export function createUsers(rows = []) {
  const byId = new Map(rows.map((row) => [row.id, { ...row }]));
  return {
    get: (id) => (byId.has(id) ? { ...byId.get(id) } : null),
    list: () => [...byId.values()].map((row) => ({ ...row })),
    displayName: (id) => byId.get(id)?.name ?? "unknown"
  };
}
