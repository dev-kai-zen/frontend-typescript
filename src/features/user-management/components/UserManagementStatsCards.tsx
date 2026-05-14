import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import Grid from "@mui/material/Grid";

import { RbacStatCard } from "../../../shared/components/rbac/RbacStatCard";

import type { UserManagementPageStats } from "../hooks/useUserManagementPage";

export type UserManagementStatsCardsProps = {
  stats: UserManagementPageStats;
};

export function UserManagementStatsCards({ stats }: UserManagementStatsCardsProps) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <RbacStatCard
          label="Total users"
          value={String(stats.total)}
          tone="primary"
          icon={<SupervisorAccountIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <RbacStatCard
          label="Active"
          value={String(stats.active)}
          tone="success"
          icon={<CheckCircleOutlinedIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <RbacStatCard
          label="Inactive"
          value={String(stats.inactive)}
          tone="warning"
          icon={<PersonOffIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <RbacStatCard
          label="With RBAC roles"
          value={String(stats.withRoles)}
          tone="info"
          icon={<VpnKeyIcon />}
        />
      </Grid>
    </Grid>
  );
}
