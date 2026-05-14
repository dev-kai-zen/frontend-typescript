export const rbacCategoriesKeys = {
  all: ["rbac-categories"] as const,
  list: () => [...rbacCategoriesKeys.all, "list"] as const,
};
