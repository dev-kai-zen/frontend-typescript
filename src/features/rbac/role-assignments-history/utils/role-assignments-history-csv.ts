import type { RoleAssignmentRow } from "../types/role-assignments-history.types";

export function downloadRoleAssignmentsCsv(
  filename: string,
  rows: RoleAssignmentRow[],
): void {
  const header = [
    "assigned_at",
    "user_email",
    "user_name",
    "role",
    "assigned_by",
  ];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        `"${r.assignedAtLabel.replace(/"/g, '""')}"`,
        `"${r.userEmail.replace(/"/g, '""')}"`,
        `"${(r.userName ?? "").replace(/"/g, '""')}"`,
        `"${r.roleName.replace(/"/g, '""')}"`,
        `"${r.assignedByLabel.replace(/"/g, '""')}"`,
      ].join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
