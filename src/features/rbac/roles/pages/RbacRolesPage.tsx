import { Alert, LinearProgress, Stack } from "@mui/material";

import { RbacAdminSection } from "../../../../shared/components/rbac/RbacAdminSection";
import { RbacRoleDeleteDialog } from "../components/RbacRoleDeleteDialog";
import { RbacRoleFormDialog } from "../components/RbacRoleFormDialog";
import { RbacRolesKpiCards } from "../components/RbacRolesKpiCards";
import { RbacRolesPageIntro } from "../components/RbacRolesPageIntro";
import { RbacRolesSearchBar } from "../components/RbacRolesSearchBar";
import { RbacRolesTableSection } from "../components/RbacRolesTableSection";
import { RbacRolesToolbar } from "../components/RbacRolesToolbar";
import { useRbacRolesPage } from "../hooks/useRbacRolesPage";

/**
 * RBAC — Roles (named bundles of permissions).
 *
 * **For junior developers**
 * - `types/rbac-roles.types.ts` — role DTOs
 * - `services/rbac-roles-api.ts` — CRUD on `/api/v1/rbac/roles`
 * - `hooks/useRbacRolesPage.ts` — list + mutations orchestration
 * - `components/RbacRoleFormDialog.tsx` — create / edit metadata
 * - Map permissions for all roles on **Role permission matrix**
 *
 * Backend: `/api/v1/rbac/roles`
 */
export default function RbacRolesPage() {
  const vm = useRbacRolesPage();

  return (
    <Stack spacing={3}>
      <RbacRolesPageIntro />

      <RbacRolesToolbar
        loading={vm.loading}
        onRefresh={vm.refresh}
        onAddRole={vm.openCreate}
      />

      {vm.error ? (
        <Alert severity="error" onClose={vm.dismissError}>
          {vm.error}
        </Alert>
      ) : null}

      {vm.loading ? <LinearProgress /> : null}

      <RbacRolesKpiCards stats={vm.stats} />

      <RbacAdminSection>
        <RbacRolesSearchBar
          searchTerm={vm.searchTerm}
          onSearchTermChange={vm.setSearchTerm}
        />

        <RbacRolesTableSection
          pageSlice={vm.pageSlice}
          filteredCount={vm.filteredRows.length}
          loading={vm.loading}
          page={vm.page}
          rowsPerPage={vm.rowsPerPage}
          onPageChange={vm.handleChangePage}
          onRowsPerPageChange={vm.handleChangeRowsPerPage}
          toggleBusyRoleId={vm.toggleBusyRoleId}
          onToggleActive={vm.toggleRoleActive}
          onEdit={vm.openEdit}
          onDelete={vm.setDeleteTarget}
        />
      </RbacAdminSection>

      <RbacRoleFormDialog
        open={vm.formOpen}
        mode={vm.formMode}
        initial={vm.editing}
        busy={vm.savingRole}
        onClose={vm.closeForm}
        onSubmit={(values) => void vm.submitRoleForm(values)}
      />

      <RbacRoleDeleteDialog
        target={vm.deleteTarget}
        deleting={vm.deletingRole}
        onClose={() => vm.setDeleteTarget(null)}
        onConfirm={() => void vm.confirmDelete()}
      />
    </Stack>
  );
}
