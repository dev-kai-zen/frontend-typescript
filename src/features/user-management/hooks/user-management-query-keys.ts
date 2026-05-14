export const userManagementKeys = {
  all: ["user-management"] as const,
  snapshot: () => [...userManagementKeys.all, "snapshot"] as const,
  rolesDialog: (userId: number) =>
    [...userManagementKeys.all, "roles-dialog", userId] as const,
};
