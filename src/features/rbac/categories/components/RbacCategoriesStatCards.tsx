import CategoryIcon from "@mui/icons-material/Category";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Grid from "@mui/material/Grid";

import type { RbacCategoriesPageStats } from "../hooks/useRbacCategoriesPage";
import { RbacStatCard } from "../../components/RbacStatCard";

type Props = {
  stats: RbacCategoriesPageStats;
};

export function RbacCategoriesStatCards({ stats }: Props) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <RbacStatCard
          label="Categories"
          value={String(stats.categories)}
          tone="primary"
          icon={<CategoryIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <RbacStatCard
          label="Permissions"
          value={String(stats.permissions)}
          tone="info"
          icon={<LockOutlinedIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <RbacStatCard
          label="Avg per category"
          value={stats.avgPerCat}
          tone="success"
          icon={<FolderOutlinedIcon />}
        />
      </Grid>
    </Grid>
  );
}
