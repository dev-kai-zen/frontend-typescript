import { Alert, LinearProgress, Stack } from "@mui/material";

import { RbacAdminSection } from "../../../../shared/components/rbac/RbacAdminSection";
import { RolePermissionsMatrixHeader } from "../components/RolePermissionsMatrixHeader";
import { RolePermissionsMatrixLegend } from "../components/RolePermissionsMatrixLegend";
import { RolePermissionsMatrixSearchBar } from "../components/RolePermissionsMatrixSearchBar";
import { RolePermissionsMatrixTable } from "../components/RolePermissionsMatrixTable";
import { useRolePermissionsMatrixPage } from "../hooks/useRolePermissionsMatrixPage";

/**
 * RBAC — Role × permission matrix (`PUT` replaces each changed role’s full set).
 *
 * **For junior developers**
 * - `services/rbac-role-permissions-api.ts` — GET links + PUT replace per role
 * - `services/role-permissions-matrix-snapshot.ts` — loads roles, catalog, categories, matrix
 * - `hooks/useRolePermissionsMatrixPage.ts` — edits, save, and orchestration
 * - `../../roles/services/rbac-roles-api.ts` — column headers (via snapshot)
 * - `../../permissions/services/rbac-permissions-api.ts` — row catalog (via snapshot)
 *
 * Backend: `/api/v1/rbac/roles/:id/permissions`
 */
export default function RbacRolePermissionsPage() {
  const vm = useRolePermissionsMatrixPage();

  return (
    <Stack spacing={3}>
      <RolePermissionsMatrixHeader
        loading={vm.loading}
        saving={vm.saving}
        hasChanges={vm.hasChanges}
        rolesEmpty={vm.roles.length === 0}
        onReload={vm.reload}
        onResetLocal={vm.resetLocal}
        onSave={vm.save}
      />

      {vm.error ? (
        <Alert severity="error" onClose={vm.dismissError}>
          {vm.error}
        </Alert>
      ) : null}

      {vm.hasChanges ? (
        <Alert severity="warning">
          Unsaved changes — save to persist updates for each affected role.
        </Alert>
      ) : null}

      {vm.loading ? <LinearProgress /> : null}

      <RbacAdminSection sx={{ opacity: vm.loading ? 0.6 : 1 }}>
        <RolePermissionsMatrixSearchBar
          searchTerm={vm.searchTerm}
          onSearchTermChange={vm.setSearchTerm}
        />

        <RolePermissionsMatrixTable
          roles={vm.roles}
          categoryBlocks={vm.categoryBlocks}
          matrix={vm.matrix}
          expandedKeys={vm.expandedKeys}
          loading={vm.loading}
          saving={vm.saving}
          catalogLength={vm.catalogLength}
          onToggleExpanded={vm.toggleExpanded}
          onTogglePermission={vm.togglePermission}
          onSelectAllInCategory={vm.selectAllInCategory}
          categoryGrantedCount={vm.categoryGrantedCount}
        />

        <RolePermissionsMatrixLegend />
      </RbacAdminSection>
    </Stack>
  );
}
