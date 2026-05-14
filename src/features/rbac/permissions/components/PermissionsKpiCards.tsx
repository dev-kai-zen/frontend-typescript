import CategoryIcon from "@mui/icons-material/Category";
import FilterListIcon from "@mui/icons-material/FilterList";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Grid from "@mui/material/Grid";

import { RbacStatCard } from "../../../../shared/components/rbac/RbacStatCard";
import type { RbacPermissionsPageStats } from "../hooks/useRbacPermissionsPage";

type Props = {
  stats: RbacPermissionsPageStats;
};

export function PermissionsKpiCards({ stats }: Props) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <RbacStatCard
          label="In current filter"
          value={String(stats.inView)}
          tone="primary"
          icon={<LockOutlinedIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <RbacStatCard
          label="Categories defined"
          value={String(stats.categories)}
          tone="info"
          icon={<CategoryIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <RbacStatCard
          label="Categorized (this view)"
          value={String(stats.categorized)}
          tone="success"
          icon={<CategoryIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <RbacStatCard
          label="Uncategorized (this view)"
          value={String(stats.uncategorized)}
          tone="warning"
          icon={<FilterListIcon />}
        />
      </Grid>
    </Grid>
  );
}
