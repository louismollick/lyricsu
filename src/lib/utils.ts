import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const isNumber = (input: unknown): input is number =>
  typeof input === "number";

export const isString = (input: unknown): input is string =>
  typeof input === "string";

export const safeJsonParse = <T>(str: string, fallback?: T) => {
  try {
    return (JSON.parse(str) ?? fallback) as T;
  } catch {
    return fallback as T;
  }
};

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;
