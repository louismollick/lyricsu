import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const isNumber = (input: unknown): input is number =>
  typeof input === "number";

export const isString = (input: unknown): input is string =>
  typeof input === "string";

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

const addTensDigit = (input: number) => (input < 10 ? "0" + input : input);

export const toHHMMSS = (input: number) => {
  const minutes = Math.floor(input / 60);
  const seconds = Math.floor(input - minutes * 60);

  return addTensDigit(minutes) + ":" + addTensDigit(seconds);
};
