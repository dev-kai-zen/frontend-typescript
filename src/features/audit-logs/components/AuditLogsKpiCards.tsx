import CategoryIcon from "@mui/icons-material/Category";
import DifferenceIcon from "@mui/icons-material/Difference";
import SubjectIcon from "@mui/icons-material/Subject";
import Grid from "@mui/material/Grid";

import { RbacStatCard } from "../../../shared/components/rbac/RbacStatCard";
import type { AuditLogsPageStats } from "../hooks/useAuditLogsPage";

type Props = {
  stats: AuditLogsPageStats;
};

export function AuditLogsKpiCards({ stats }: Props) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <RbacStatCard
          label="Rows (this page)"
          value={String(stats.pageRows)}
          tone="primary"
          icon={<SubjectIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <RbacStatCard
          label="Distinct actions"
          value={String(stats.distinctActions)}
          tone="info"
          icon={<DifferenceIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <RbacStatCard
          label="Entity types"
          value={String(stats.distinctEntities)}
          tone="secondary"
          icon={<CategoryIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <RbacStatCard
          label="With change fields"
          value={String(stats.withFieldChanges)}
          tone="success"
          icon={<DifferenceIcon />}
        />
      </Grid>
    </Grid>
  );
}
