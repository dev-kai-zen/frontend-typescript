import axios from "axios";

/** Normalize backend `{ message: string }` or axios errors for UI alerts. */
export function getRbacApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: unknown } | undefined;
    if (typeof data?.message === "string") return data.message;
    return fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
