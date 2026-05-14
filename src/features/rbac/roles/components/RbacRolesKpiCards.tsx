import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SecurityIcon from "@mui/icons-material/Security";
import Grid from "@mui/material/Grid";

import { RbacStatCard } from "../../../../shared/components/rbac/RbacStatCard";
import type { RbacRolesPageStats } from "../hooks/useRbacRolesPage";

type Props = {
  stats: RbacRolesPageStats;
};

export function RbacRolesKpiCards({ stats }: Props) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <RbacStatCard
          label="Roles"
          value={String(stats.roles)}
          tone="primary"
          icon={<SecurityIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <RbacStatCard
          label="Permissions in catalog"
          value={String(stats.permissions)}
          tone="info"
          icon={<LockOutlinedIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <RbacStatCard
          label="Roles with description"
          value={String(stats.withDesc)}
          tone="success"
          icon={<SecurityIcon />}
        />
      </Grid>
    </Grid>
  );
}