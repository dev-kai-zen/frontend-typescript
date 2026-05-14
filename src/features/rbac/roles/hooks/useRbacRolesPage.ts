import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ChangeEvent, useMemo, useState } from "react";

import { getRbacApiErrorMessage } from "../../permissions/rbac-api-errors";
import { rbacPermissionsKeys } from "../../permissions/hooks/rbac-permissions-query-keys";
import { useRbacPermissionsListQuery } from "../../permissions/hooks/useRbacPermissionsListQuery";
import type {
  CreateRbacRolePayload,
  RbacRoleDto,
  UpdateRbacRolePayload,
} from "../types/rbac-roles.types";
import {
  createRbacRole,
  deleteRbacRole,
  updateRbacRole,
} from "../services/rbac-roles-api";
import { rbacRolesKeys } from "./rbac-roles-query-keys";
import { useRbacRolesQuery } from "./useRbacRolesQuery";

export type RbacRolesPageStats = {
  roles: number;
  permissions: number;
  withDesc: number;
};

export type RbacRolesPageViewModel = {
  filteredRows: RbacRoleDto[];
  pageSlice: RbacRoleDto[];
  loading: boolean;
  error: string | null;
  dismissError: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  page: number;
  rowsPerPage: number;
  handleChangePage: (_event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => void;
  stats: RbacRolesPageStats;
  refresh: () => void;
  openCreate: () => void;
  openEdit: (row: RbacRoleDto) => void;
  formOpen: boolean;
  formMode: "create" | "edit";
  editing: RbacRoleDto | null;
  closeForm: () => void;
  submitRoleForm: (values: {
    roleName: string;
    roleDescription: string | null;
  }) => Promise<void>;
  deleteTarget: RbacRoleDto | null;
  setDeleteTarget: (row: RbacRoleDto | null) => void;
  confirmDelete: () => Promise<void>;
  toggleRoleActive: (row: RbacRoleDto) => Promise<void>;
  toggleBusyRoleId: number | null;
  savingRole: boolean;
  deletingRole: boolean;
};

function invalidateRolesAndPermissionsQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: rbacRolesKeys.all });
  void queryClient.invalidateQueries({ queryKey: rbacPermissionsKeys.all });
}

export function useRbacRolesPage(): RbacRolesPageViewModel {
  const queryClient = useQueryClient();

  const rolesQuery = useRbacRolesQuery();
  const permissionsQuery = useRbacPermissionsListQuery(undefined);

  const [mutationError, setMutationError] = useState<string | null>(null);
  const [dismissedListErrorStamp, setDismissedListErrorStamp] = useState<
    string | null
  >(null);

  const [searchTerm, setSearchTermState] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<RbacRoleDto | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<RbacRoleDto | null>(null);

  const rows = useMemo(
    () => rolesQuery.data ?? [],
    [rolesQuery.data],
  );

  const listFetching = rolesQuery.isFetching || permissionsQuery.isFetching;

  const listErrorStamp =
    rolesQuery.isError || permissionsQuery.isError
      ? `${rolesQuery.errorUpdatedAt ?? ""}:${permissionsQuery.errorUpdatedAt ?? ""}`
      : null;

  const listErrorMessage = useMemo(() => {
    if (rolesQuery.isError && rolesQuery.error != null) {
      return getRbacApiErrorMessage(
        rolesQuery.error,
        "Failed to load RBAC roles",
      );
    }
    if (permissionsQuery.isError && permissionsQuery.error != null) {
      return getRbacApiErrorMessage(
        permissionsQuery.error,
        "Failed to load permission catalog",
      );
    }
    return null;
  }, [
    rolesQuery.isError,
    rolesQuery.error,
    permissionsQuery.isError,
    permissionsQuery.error,
  ]);

  const showListError =
    listErrorMessage !== null &&
    listErrorStamp !== null &&
    listErrorStamp !== dismissedListErrorStamp;

  const displayError =
    mutationError ?? (showListError ? listErrorMessage : null);

  const dismissError = () => {
    if (mutationError !== null) {
      setMutationError(null);
    } else if (listErrorStamp !== null) {
      setDismissedListErrorStamp(listErrorStamp);
    }
  };

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.role_name.toLowerCase().includes(q) ||
        (r.role_description?.toLowerCase().includes(q) ?? false),
    );
  }, [rows, searchTerm]);

  const permissionCount = permissionsQuery.data?.length ?? 0;

  const stats = useMemo((): RbacRolesPageStats => {
    const withDesc = rows.filter((r) => !!r.role_description?.trim()).length;
    return {
      roles: rows.length,
      permissions: permissionCount,
      withDesc,
    };
  }, [rows, permissionCount]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const setSearchTerm = (value: string) => {
    setSearchTermState(value);
    setPage(0);
  };

  const pageSlice = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const createMutation = useMutation({
    mutationFn: (payload: CreateRbacRolePayload) => createRbacRole(payload),
    onSuccess: () => {
      setMutationError(null);
      invalidateRolesAndPermissionsQueries(queryClient);
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err: unknown) => {
      setMutationError(getRbacApiErrorMessage(err, "Failed to create role"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; payload: UpdateRbacRolePayload }) =>
      updateRbacRole(vars.id, vars.payload),
    onSuccess: () => {
      setMutationError(null);
      invalidateRolesAndPermissionsQueries(queryClient);
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err: unknown) => {
      setMutationError(getRbacApiErrorMessage(err, "Failed to update role"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRbacRole(id),
    onSuccess: () => {
      setMutationError(null);
      invalidateRolesAndPermissionsQueries(queryClient);
      setDeleteTarget(null);
    },
    onError: (err: unknown) => {
      setMutationError(getRbacApiErrorMessage(err, "Failed to delete role"));
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (vars: { id: number; isActive: boolean }) =>
      updateRbacRole(vars.id, { isActive: vars.isActive }),
    onSuccess: () => {
      setMutationError(null);
      invalidateRolesAndPermissionsQueries(queryClient);
    },
    onError: (err: unknown) => {
      setMutationError(
        getRbacApiErrorMessage(err, "Failed to update role status"),
      );
    },
  });

  const refresh = () => {
    setMutationError(null);
    invalidateRolesAndPermissionsQueries(queryClient);
  };

  const openCreate = () => {
    setMutationError(null);
    setEditing(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEdit = (row: RbacRoleDto) => {
    setMutationError(null);
    setEditing(row);
    setFormMode("edit");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const submitRoleForm = async (values: {
    roleName: string;
    roleDescription: string | null;
  }) => {
    setMutationError(null);
    if (formMode === "create") {
      await createMutation.mutateAsync({
        roleName: values.roleName,
        roleDescription: values.roleDescription,
      });
    } else if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        payload: {
          roleName: values.roleName,
          roleDescription: values.roleDescription,
        },
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setMutationError(null);
    await deleteMutation.mutateAsync(deleteTarget.id);
  };

  const toggleRoleActive = async (row: RbacRoleDto) => {
    const nextActive = !(row.is_active ?? true);
    setMutationError(null);
    await toggleActiveMutation.mutateAsync({
      id: row.id,
      isActive: nextActive,
    });
  };

  const toggleBusyRoleId =
    toggleActiveMutation.isPending && toggleActiveMutation.variables
      ? toggleActiveMutation.variables.id
      : null;

  const savingRole = createMutation.isPending || updateMutation.isPending;
  const deletingRole = deleteMutation.isPending;

  return {
    filteredRows,
    pageSlice,
    loading: listFetching,
    error: displayError,
    dismissError,
    searchTerm,
    setSearchTerm,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    stats,
    refresh,
    openCreate,
    openEdit,
    formOpen,
    formMode,
    editing,
    closeForm,
    submitRoleForm,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
    toggleRoleActive,
    toggleBusyRoleId,
    savingRole,
    deletingRole,
  };
}
