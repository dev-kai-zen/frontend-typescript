/** Standard API envelope from the backend. */
export type ApiResult<T> = {
  success: boolean;
  message?: string;
  data?: T;
};
