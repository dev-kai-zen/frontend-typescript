import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SecurityIcon from "@mui/icons-material/Security";
import { Box } from "@mui/material";

import { RbacStatCard } from "../../../../shared/components/rbac/RbacStatCard";
import type { RoleAssignmentsHistoryStats } from "../hooks/useRoleAssignmentsHistoryPage";

type Props = {
  stats: RoleAssignmentsHistoryStats;
};

export function RoleAssignmentsHistoryKpiCards({ stats }: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
      }}
    >
      <RbacStatCard
        label="Active assignments"
        value={String(stats.total)}
        tone="primary"
        icon={<PersonAddIcon />}
      />
      <RbacStatCard
        label="Users with roles"
        value={String(stats.usersWithRoles)}
        tone="info"
        icon={<SecurityIcon />}
      />
      <RbacStatCard
        label="Roles in use"
        value={String(stats.rolesUsed)}
        tone="secondary"
        icon={<SecurityIcon />}
      />
      <RbacStatCard
        label="Distinct assigners"
        value={String(stats.distinctAssigners)}
        tone="success"
        icon={<CheckCircleIcon />}
      />
    </Box>
  );
}
