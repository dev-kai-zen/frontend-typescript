import { Alert, LinearProgress, Stack } from "@mui/material";

import { RbacAdminSection } from "../../../../shared/components/rbac/RbacAdminSection";
import { RoleAssignmentsHistoryAboutPanel } from "../components/RoleAssignmentsHistoryAboutPanel";
import { RoleAssignmentsHistoryFiltersBar } from "../components/RoleAssignmentsHistoryFiltersBar";
import { RoleAssignmentsHistoryKpiCards } from "../components/RoleAssignmentsHistoryKpiCards";
import { RoleAssignmentsHistoryPageIntro } from "../components/RoleAssignmentsHistoryPageIntro";
import { RoleAssignmentsHistoryTableSection } from "../components/RoleAssignmentsHistoryTableSection";
import { RoleAssignmentsHistoryToolbar } from "../components/RoleAssignmentsHistoryToolbar";
import { useRoleAssignmentsHistoryPage } from "../hooks/useRoleAssignmentsHistoryPage";

/**
 * RBAC — Role assignments (live links from `rbac_user_roles`).
 *
 * Rows reflect **current** assignments. Revocations remove rows; full chronological
 * history requires audit logging on the backend (not wired yet).
 *
 * **For junior developers**
 * - `services/role-assignments-history-snapshot.ts` — builds rows from users API + per-user roles
 * - `hooks/useRoleAssignmentsHistoryPage.ts` — filters, pagination, CSV export
 */
export default function RbacRoleAssignmentsHistoryPage() {
  const vm = useRoleAssignmentsHistoryPage();

  return (
    <Stack spacing={3}>
      <RoleAssignmentsHistoryPageIntro />

      <RoleAssignmentsHistoryToolbar loading={vm.loading} onRefresh={vm.refresh} />

      {vm.error ? (
        <Alert severity="error" onClose={vm.dismissError}>
          {vm.error}
        </Alert>
      ) : null}

      {vm.loading ? <LinearProgress /> : null}

      <RoleAssignmentsHistoryKpiCards stats={vm.stats} />

      <RbacAdminSection>
        <RoleAssignmentsHistoryFiltersBar
          searchTerm={vm.searchTerm}
          filterRoleId={vm.filterRoleId}
          roleFilterOptions={vm.roleFilterOptions}
          filteredCount={vm.filteredRows.length}
          onSearchTermChange={vm.setSearchTerm}
          onFilterRoleIdChange={vm.setFilterRoleId}
          onExportCsv={vm.exportFilteredCsv}
        />

        <RoleAssignmentsHistoryTableSection
          pageSlice={vm.pageSlice}
          filteredCount={vm.filteredRows.length}
          loading={vm.loading}
          page={vm.page}
          rowsPerPage={vm.rowsPerPage}
          onPageChange={vm.handleChangePage}
          onRowsPerPageChange={vm.handleChangeRowsPerPage}
        />
      </RbacAdminSection>

      <RbacAdminSection
        sx={{
          p: 2,
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255, 155, 81, 0.08)"
              : "rgba(255, 155, 81, 0.12)",
          borderColor: "primary.main",
        }}
      >
        <RoleAssignmentsHistoryAboutPanel />
      </RbacAdminSection>
    </Stack>
  );
}
