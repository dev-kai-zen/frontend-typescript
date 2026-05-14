import { Alert, LinearProgress, Stack } from "@mui/material";

import { RbacAdminSection } from "../../rbac/components/RbacAdminSection";
import { AuditLogDetailDialog } from "../components/AuditLogDetailDialog";
import { AuditLogsKpiCards } from "../components/AuditLogsKpiCards";
import { AuditLogsPageIntro } from "../components/AuditLogsPageIntro";
import { AuditLogsTableSection } from "../components/AuditLogsTableSection";
import { AuditLogsToolbar } from "../components/AuditLogsToolbar";
import { useAuditLogsPage } from "../hooks/useAuditLogsPage";

/**
 * Administration — audit trail (read-only list from `/api/v1/audit-logs`).
 *
 * **For junior developers**
 * - `types/audit-logs.types.ts` — log row DTOs
 * - `services/audit-logs-api.ts` — GET with optional `action`, `entity_type`, `limit`, `offset`
 * - `hooks/useAuditLogsPage.ts` — page orchestration (filters, pagination, React Query)
 * - Backend caps `limit` at 200 and defaults to 50 when omitted
 */
export default function AuditLogsPage() {
  const vm = useAuditLogsPage();

  return (
    <Stack spacing={3}>
      <AuditLogsPageIntro />

      {vm.error ? (
        <Alert severity="error" onClose={vm.dismissError}>
          {vm.error}
        </Alert>
      ) : null}

      {vm.loading ? <LinearProgress /> : null}

      <AuditLogsKpiCards stats={vm.stats} />

      <RbacAdminSection>
        <AuditLogsToolbar
          draftAction={vm.draftAction}
          draftEntityType={vm.draftEntityType}
          onDraftActionChange={vm.setDraftAction}
          onDraftEntityTypeChange={vm.setDraftEntityType}
          onApplyFilters={vm.applyFilters}
          onRefresh={vm.refresh}
          loading={vm.loading}
        />

        <AuditLogsTableSection
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

      <AuditLogDetailDialog
        open={vm.detailRow !== null}
        detailJson={vm.detailJson}
        onClose={vm.closeDetail}
      />
    </Stack>
  );
}
