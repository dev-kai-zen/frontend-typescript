import { Alert, LinearProgress, Stack } from "@mui/material";

import { RbacAdminSection } from "../../../../shared/components/rbac/RbacAdminSection";
import { PermissionDeleteDialog } from "../components/PermissionDeleteDialog";
import { PermissionsFiltersBar } from "../components/PermissionsFiltersBar";
import { PermissionsKpiCards } from "../components/PermissionsKpiCards";
import { PermissionsPageIntro } from "../components/PermissionsPageIntro";
import { PermissionsTableSection } from "../components/PermissionsTableSection";
import { PermissionsToolbar } from "../components/PermissionsToolbar";
import { RbacPermissionFormDialog } from "../components/RbacPermissionFormDialog";
import { useRbacPermissionsPage } from "../hooks/useRbacPermissionsPage";

/**
 * RBAC — Permissions admin surface.
 *
 * Backend: `/api/v1/rbac/permissions` (+ optional `?categoryId=`),
 * `/api/v1/rbac/categories`
 *
 * **For junior developers**
 * - `types/rbac-permissions.types.ts` — permission DTOs
 * - `services/rbac-permissions-api.ts` — REST
 * - `services/rbac-permissions-admin-fetch.ts` — filter semantics for this page
 * - `hooks/useRbacPermissionsPage.ts` — orchestration
 */
export default function RbacPermissionsPage() {
  const vm = useRbacPermissionsPage();

  return (
    <Stack spacing={3}>
      <PermissionsPageIntro />

      <PermissionsToolbar
        loading={vm.loading}
        onRefresh={vm.refresh}
        onAdd={vm.openCreate}
      />

      {vm.error ? (
        <Alert severity="error" onClose={vm.dismissError}>
          {vm.error}
        </Alert>
      ) : null}

      {vm.loading ? <LinearProgress /> : null}

      <PermissionsKpiCards stats={vm.stats} />

      <RbacAdminSection>
        <PermissionsFiltersBar
          searchTerm={vm.searchTerm}
          filterCategoryId={vm.filterCategoryId}
          categories={vm.categories}
          onSearchTermChange={vm.setSearchTerm}
          onFilterChange={vm.handleFilterChange}
        />

        <PermissionsTableSection
          pageSlice={vm.pageSlice}
          categoryById={vm.categoryById}
          filteredCount={vm.filteredRows.length}
          loading={vm.loading}
          saving={vm.saving}
          page={vm.page}
          rowsPerPage={vm.rowsPerPage}
          toggleBusyPermissionId={vm.toggleBusyPermissionId}
          onPageChange={vm.handleChangePage}
          onRowsPerPageChange={vm.handleChangeRowsPerPage}
          onToggleActive={vm.togglePermissionActive}
          onEdit={vm.openEdit}
          onDelete={vm.setDeleteTarget}
        />
      </RbacAdminSection>

      <RbacPermissionFormDialog
        open={vm.formOpen}
        mode={vm.formMode}
        initial={vm.editing}
        categories={vm.categories}
        busy={vm.formSaving}
        onClose={vm.closeForm}
        onSubmit={(values) => void vm.submitPermissionForm(values)}
      />

      <PermissionDeleteDialog
        target={vm.deleteTarget}
        deleting={vm.deleteBusy}
        onClose={() => vm.setDeleteTarget(null)}
        onConfirm={() => void vm.confirmDelete()}
      />
    </Stack>
  );
}
