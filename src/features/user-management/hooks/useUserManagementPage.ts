import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ChangeEvent, useMemo, useState } from "react";

import { getRbacApiErrorMessage } from "../../rbac/permissions/services/rbac-api-errors";
import type {
  UpdateUserAdminPayload,
  UserListItemDto,
} from "../types/users.types";
import { deleteUserAdmin, updateUserAdmin } from "../services/users-api";
import { userManagementKeys } from "./user-management-query-keys";
import { useUserManagementSnapshotQuery } from "./useUserManagementSnapshotQuery";
import { useUserRolesDialog } from "./useUserRolesDialog";

export type UserManagementPageStats = {
  total: number;
  active: number;
  inactive: number;
  withRoles: number;
};

export type UserManagementPageViewModel = {
  rows: UserListItemDto[];
  rolesByUserId: Record<number, string[]>;
  loading: boolean;
  error: string | null;
  dismissError: () => void;
  stats: UserManagementPageStats;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  page: number;
  rowsPerPage: number;
  filteredRows: UserListItemDto[];
  pageSlice: UserListItemDto[];
  handleChangePage: (_event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => void;
  refresh: () => void;
  rolesTarget: UserListItemDto | null;
  openRoles: (row: UserListItemDto) => void;
  closeRoles: () => void;
  rolesDialog: ReturnType<typeof useUserRolesDialog>;
  editTarget: UserListItemDto | null;
  openEdit: (row: UserListItemDto) => void;
  closeEdit: () => void;
  submitEdit: (values: {
    email: string;
    fullName: string | null;
  }) => Promise<void>;
  deleteTarget: UserListItemDto | null;
  openDelete: (row: UserListItemDto) => void;
  closeDelete: () => void;
  confirmDelete: () => Promise<void>;
  activeToggleTarget: UserListItemDto | null;
  openActiveToggle: (row: UserListItemDto) => void;
  closeActiveToggle: () => void;
  confirmActiveToggle: () => Promise<void>;
};

export function useUserManagementPage(): UserManagementPageViewModel {
  const queryClient = useQueryClient();
  const snapshotQuery = useUserManagementSnapshotQuery();

  const [mutationError, setMutationError] = useState<string | null>(null);
  const [dismissedErrorStamp, setDismissedErrorStamp] = useState<string | null>(
    null,
  );

  const [searchTerm, setSearchTermState] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [rolesTarget, setRolesTarget] = useState<UserListItemDto | null>(null);
  const [editTarget, setEditTarget] = useState<UserListItemDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserListItemDto | null>(
    null,
  );
  const [activeToggleTarget, setActiveToggleTarget] =
    useState<UserListItemDto | null>(null);

  const invalidateSnapshot = () =>
    void queryClient.invalidateQueries({
      queryKey: userManagementKeys.snapshot(),
    });

  const updateUserMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateUserAdminPayload;
    }) => updateUserAdmin(id, payload),
    onSuccess: invalidateSnapshot,
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => deleteUserAdmin(id),
    onSuccess: invalidateSnapshot,
  });

  const rows = useMemo(
    () => snapshotQuery.data?.users ?? [],
    [snapshotQuery.data?.users],
  );
  const rolesByUserId = useMemo(
    () => snapshotQuery.data?.rolesByUserId ?? {},
    [snapshotQuery.data?.rolesByUserId],
  );

  const loading = snapshotQuery.isFetching;

  const errorStamp =
    snapshotQuery.isError && snapshotQuery.errorUpdatedAt != null
      ? String(snapshotQuery.errorUpdatedAt)
      : null;

  const loadErrorMessage = useMemo(() => {
    if (!snapshotQuery.isError || snapshotQuery.error == null) return null;
    return getRbacApiErrorMessage(snapshotQuery.error, "Failed to load users");
  }, [snapshotQuery.isError, snapshotQuery.error]);

  const showLoadError =
    loadErrorMessage !== null &&
    errorStamp !== null &&
    errorStamp !== dismissedErrorStamp;

  const displayError =
    mutationError ?? (showLoadError ? loadErrorMessage : null);

  const dismissError = () => {
    if (mutationError !== null) {
      setMutationError(null);
    } else if (errorStamp !== null) {
      setDismissedErrorStamp(errorStamp);
    }
  };

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r) => r.is_active).length;
    const inactive = total - active;
    let withRoles = 0;
    for (const r of rows) {
      if ((rolesByUserId[r.id]?.length ?? 0) > 0) withRoles += 1;
    }
    return { total, active, inactive, withRoles };
  }, [rows, rolesByUserId]);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const roleStr = rolesByUserId[row.id]?.join(" ").toLowerCase() ?? "";
      return (
        row.email.toLowerCase().includes(q) ||
        (row.full_name?.toLowerCase().includes(q) ?? false) ||
        String(row.id).includes(q) ||
        roleStr.includes(q)
      );
    });
  }, [rows, rolesByUserId, searchTerm]);

  const pageSlice = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const setSearchTerm = (value: string) => {
    setSearchTermState(value);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const refresh = () => void snapshotQuery.refetch();

  const rolesDialog = useUserRolesDialog({
    open: rolesTarget !== null,
    user: rolesTarget,
    onClose: () => setRolesTarget(null),
    onSaved: invalidateSnapshot,
  });

  const submitEdit = async (values: {
    email: string;
    fullName: string | null;
  }) => {
    if (!editTarget) return;
    setMutationError(null);
    try {
      await updateUserMutation.mutateAsync({
        id: editTarget.id,
        payload: { email: values.email, fullName: values.fullName },
      });
      setEditTarget(null);
    } catch (err) {
      setMutationError(getRbacApiErrorMessage(err, "Failed to update user"));
    }
  };

  const confirmActiveToggle = async () => {
    const u = activeToggleTarget;
    if (!u) return;
    setMutationError(null);
    try {
      await updateUserMutation.mutateAsync({
        id: u.id,
        payload: { isActive: !u.is_active },
      });
      setActiveToggleTarget(null);
    } catch (err) {
      setMutationError(
        getRbacApiErrorMessage(err, "Failed to update account status"),
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setMutationError(null);
    try {
      await deleteUserMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setMutationError(getRbacApiErrorMessage(err, "Failed to delete user"));
    }
  };

  return {
    rows,
    rolesByUserId,
    loading,
    error: displayError,
    dismissError,
    stats,
    searchTerm,
    setSearchTerm,
    page,
    rowsPerPage,
    filteredRows,
    pageSlice,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    rolesTarget,
    openRoles: setRolesTarget,
    closeRoles: () => setRolesTarget(null),
    rolesDialog,
    editTarget,
    openEdit: setEditTarget,
    closeEdit: () => setEditTarget(null),
    submitEdit,
    deleteTarget,
    openDelete: setDeleteTarget,
    closeDelete: () => setDeleteTarget(null),
    confirmDelete,
    activeToggleTarget,
    openActiveToggle: setActiveToggleTarget,
    closeActiveToggle: () => setActiveToggleTarget(null),
    confirmActiveToggle,
  };
}
