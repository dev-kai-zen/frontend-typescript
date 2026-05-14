import { Alert, LinearProgress, Stack } from "@mui/material";

import { RbacAdminSection } from "../../../shared/components/rbac/RbacAdminSection";
import { UserLogDetailDialog } from "../components/UserLogDetailDialog";
import { UserLogsFiltersToolbar } from "../components/UserLogsFiltersToolbar";
import { UserLogsKpiCards } from "../components/UserLogsKpiCards";
import { UserLogsPageIntro } from "../components/UserLogsPageIntro";
import { UserLogsTableSection } from "../components/UserLogsTableSection";
import { useUserLogsPage } from "../hooks/useUserLogsPage";

/**
 * Administration — user activity logs (`GET /api/v1/user-logs`).
 *
 * **For junior developers**
 * - `types/user-logs.types.ts` — row + query types (response snake_case, query camelCase)
 * - `services/user-logs-api.ts` — GET with optional `userId`, `action`, `module`, `limit`, `offset`
 * - `hooks/useUserLogsPage.ts` — filters, pagination, React Query
 * - Backend caps `limit` at 200 and defaults to 50 when omitted
 */
export default function UserLogsPage() {
  const vm = useUserLogsPage();

  return (
    <Stack spacing={3}>
      <UserLogsPageIntro />

      {vm.error ? (
        <Alert severity="error" onClose={vm.dismissError}>
          {vm.error}
        </Alert>
      ) : null}

      {vm.loading ? <LinearProgress /> : null}

      <UserLogsKpiCards stats={vm.stats} />

      <RbacAdminSection>
        <UserLogsFiltersToolbar
          draftUserId={vm.draftUserId}
          draftAction={vm.draftAction}
          draftModule={vm.draftModule}
          onDraftUserIdChange={vm.setDraftUserId}
          onDraftActionChange={vm.setDraftAction}
          onDraftModuleChange={vm.setDraftModule}
          onApplyFilters={vm.applyFilters}
          onRefresh={vm.refresh}
          loading={vm.loading}
        />

        <UserLogsTableSection
          rows={vm.rows}
          loading={vm.loading}
          page={vm.page}
          rowsPerPage={vm.rowsPerPage}
          tableCount={vm.tableCount}
          onPageChange={vm.handleChangePage}
          onRowsPerPageChange={vm.handleChangeRowsPerPage}
          onOpenDetail={vm.openDetail}
        />
      </RbacAdminSection>

      <UserLogDetailDialog
        open={vm.detailRow !== null}
        description={vm.detailRow?.description ?? null}
        detailJson={vm.detailJson}
        onClose={vm.closeDetail}
      />
    </Stack>
  );
}
