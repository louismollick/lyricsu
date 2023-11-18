import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isNumber = (input: unknown): input is number =>
  typeof input === "number";
export const isString = (input: unknown): input is string =>
  typeof input === "string";

export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export const params = (args: Record<string, string>) => {
  const filtered = {} as Record<string, string>;
  Object.entries(args).forEach(([key, value]) => {
    if (value === undefined) return;
    filtered[key] = value;
  });

  const str = new URLSearchParams(filtered).toString();
  return str.length > 0 ? "?" + str : str;
};

export const repeatArray = (arr: string[], times: number) =>
  /* eslint-disable-next-line */
  Array<string>(times)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .fill([...arr])
    .reduce((a, b) => a.concat(b));
