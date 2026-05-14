export function cloneMatrix(
  src: Record<number, number[]>,
): Record<number, number[]> {
  const out: Record<number, number[]> = {};
  for (const [k, v] of Object.entries(src)) {
    out[Number(k)] = [...v];
  }
  return out;
}

export function sortIds(ids: number[]): number[] {
  return [...ids].sort((a, b) => a - b);
}

export function sortedIdsEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = sortIds(a);
  const sb = sortIds(b);
  return sa.every((v, i) => v === sb[i]);
}
