export const rbacRolesKeys = {
  all: ["rbac-roles"] as const,
  list: () => [...rbacRolesKeys.all, "list"] as const,
};
