/** Express 5: req.params values are typed string | string[]. Normalize to a single int. */
export function paramToInt(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  return parseInt(raw ?? "", 10);
}
