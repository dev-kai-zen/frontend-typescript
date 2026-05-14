import GroupsIcon from "@mui/icons-material/Groups";
import SubjectIcon from "@mui/icons-material/Subject";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Grid from "@mui/material/Grid";

import { RbacStatCard } from "../../../shared/components/rbac/RbacStatCard";
import type { UserLogsPageStats } from "../hooks/useUserLogsPage";

type Props = {
  stats: UserLogsPageStats;
};

export function UserLogsKpiCards({ stats }: Props) {
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
          label="Distinct users"
          value={String(stats.distinctUsers)}
          tone="info"
          icon={<GroupsIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <RbacStatCard
          label="Distinct actions"
          value={String(stats.distinctActions)}
          tone="secondary"
          icon={<SubjectIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <RbacStatCard
          label="HTTP ≥400 on page"
          value={String(stats.errorStatuses)}
          tone="warning"
          icon={<WarningAmberIcon />}
        />
      </Grid>
    </Grid>
  );
}
