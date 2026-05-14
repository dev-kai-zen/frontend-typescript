export const rolePermissionsMatrixKeys = {
  all: ["role-permissions-matrix"] as const,
  snapshot: () =>
    [...rolePermissionsMatrixKeys.all, "snapshot"] as const,
};
