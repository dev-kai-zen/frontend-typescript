import { Alert, LinearProgress, Stack } from "@mui/material";

import { RbacAdminSection } from "../../../shared/components/rbac/RbacAdminSection";
import { UserActiveToggleDialog } from "../components/UserActiveToggleDialog";
import { UserDeleteConfirmDialog } from "../components/UserDeleteConfirmDialog";
import { UserEditFormDialog } from "../components/UserEditFormDialog";
import { UserManagementPageIntro } from "../components/UserManagementPageIntro";
import { UserManagementStatsCards } from "../components/UserManagementStatsCards";
import { UserManagementToolbar } from "../components/UserManagementToolbar";
import { UserManagementUsersTable } from "../components/UserManagementUsersTable";
import { UserRolesDialog } from "../components/UserRolesDialog";
import { useUserManagementPage } from "../hooks/useUserManagementPage";

/**
 * Administration — users: list, edit, activate/deactivate, RBAC roles, delete.
 *
 * **For juniors**
 * - `types/users.types.ts`, `types/user-roles.types.ts` — DTOs
 * - `services/users-api.ts`, `services/user-roles-api.ts` — REST
 * - `services/user-management-snapshot.ts` — list + resolved role labels
 * - `hooks/useUserManagementPage.ts` — React Query + mutations + table state
 * - `hooks/useUserRolesDialog.ts` — dialog roles query + save
 * - `components/*` — presentation only
 *
 * Layout aligns with RBAC admin screens (stats row, bordered panel, search + table).
 */
export default function UserManagementPage() {
  const vm = useUserManagementPage();

  return (
    <Stack spacing={3}>
      <UserManagementPageIntro />

      {vm.error ? (
        <Alert severity="error" onClose={vm.dismissError}>
          {vm.error}
        </Alert>
      ) : null}

      {vm.loading ? <LinearProgress /> : null}

      <UserManagementStatsCards stats={vm.stats} />

      <RbacAdminSection>
        <UserManagementToolbar
          searchTerm={vm.searchTerm}
          onSearchTermChange={vm.setSearchTerm}
          onRefresh={vm.refresh}
          loading={vm.loading}
        />

        <UserManagementUsersTable
          pageSlice={vm.pageSlice}
          filteredRowCount={vm.filteredRows.length}
          totalRowCount={vm.rows.length}
          loading={vm.loading}
          rolesByUserId={vm.rolesByUserId}
          page={vm.page}
          rowsPerPage={vm.rowsPerPage}
          onPageChange={vm.handleChangePage}
          onRowsPerPageChange={vm.handleChangeRowsPerPage}
          onOpenRoles={vm.openRoles}
          onOpenEdit={vm.openEdit}
          onOpenActiveToggle={vm.openActiveToggle}
          onOpenDelete={vm.openDelete}
        />
      </RbacAdminSection>

      <UserRolesDialog
        open={vm.rolesTarget !== null}
        user={vm.rolesTarget}
        onClose={vm.closeRoles}
        vm={vm.rolesDialog}
      />

      <UserEditFormDialog
        open={vm.editTarget !== null}
        user={vm.editTarget}
        onClose={vm.closeEdit}
        onSubmit={(v) => void vm.submitEdit(v)}
      />

      <UserActiveToggleDialog
        open={vm.activeToggleTarget !== null}
        target={vm.activeToggleTarget}
        onClose={vm.closeActiveToggle}
        onConfirm={vm.confirmActiveToggle}
      />

      <UserDeleteConfirmDialog
        open={vm.deleteTarget !== null}
        target={vm.deleteTarget}
        onClose={vm.closeDelete}
        onConfirm={vm.confirmDelete}
      />
    </Stack>
  );
}
