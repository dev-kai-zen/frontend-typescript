export const rbacPermissionsKeys = {
  all: ["rbac-permissions"] as const,
  list: (categoryId?: number) =>
    [...rbacPermissionsKeys.all, "list", { categoryId }] as const,
  adminFilter: (filterKey: string) =>
    [...rbacPermissionsKeys.all, "admin-filter", filterKey] as const,
};
