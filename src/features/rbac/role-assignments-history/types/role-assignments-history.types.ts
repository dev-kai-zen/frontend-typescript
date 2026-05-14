/**
 * One flattened row for the role-assignments admin table (built client-side).
 */

export type RoleAssignmentRow = {
  linkId: number;
  userId: number;
  userEmail: string;
  userName: string | null;
  roleId: number;
  roleName: string;
  assignedById: number;
  assignedByLabel: string;
  assignedAtLabel: string;
};
