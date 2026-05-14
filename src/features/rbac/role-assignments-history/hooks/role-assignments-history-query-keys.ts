export const roleAssignmentsHistoryKeys = {
  all: ["role-assignments-history"] as const,
  snapshot: () =>
    [...roleAssignmentsHistoryKeys.all, "snapshot"] as const,
};
