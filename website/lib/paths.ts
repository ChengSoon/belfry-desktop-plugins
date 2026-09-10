export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function sitePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
