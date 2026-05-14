import type { ListUserLogsQuery } from "../types/user-logs.types";

export const userLogsKeys = {
  all: ["user-logs"] as const,
  list: (query: ListUserLogsQuery) => [...userLogsKeys.all, "list", query] as const,
};
