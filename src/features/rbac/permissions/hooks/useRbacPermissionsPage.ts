import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type ChangeEvent,
  useMemo,
  useState,
} from "react";
import type { SelectChangeEvent } from "@mui/material";

import { rbacPermissionsForCategoriesKeys } from "../../categories/hooks/rbac-permissions-for-categories-query-keys";
import { rbacCategoriesKeys } from "../../categories/hooks/rbac-categories-query-keys";
import { getRbacApiErrorMessage } from "../rbac-api-errors";
import type {
  CreateRbacPermissionPayload,
  RbacPermissionDto,
  UpdateRbacPermissionPayload,
} from "../types/rbac-permissions.types";
import type { RbacCategoryDto } from "../../categories/types/rbac-categories.types";
import {
  createRbacPermission,
  deleteRbacPermission,
  updateRbacPermission,
} from "../services/rbac-permissions-api";
import { FILTER_ALL } from "../services/rbac-permissions-admin-fetch";
import { rbacPermissionsKeys } from "./rbac-permissions-query-keys";
import { useRbacCategoriesQuery } from "../../categories/hooks/useRbacCategoriesQuery";
import { useRbacPermissionsAdminListQuery } from "./useRbacPermissionsAdminListQuery";

export type RbacPermissionsPageStats = {
  inView: number;
  uncategorized: number;
  categorized: number;
  categories: number;
};

export type RbacPermissionsPageViewModel = {
  categories: RbacCategoryDto[];
  categoryById: Map<number, string>;
  filteredRows: RbacPermissionDto[];
  pageSlice: RbacPermissionDto[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  dismissError: () => void;
  refresh: () => void;
  filterCategoryId: string;
  handleFilterChange: (e: SelectChangeEvent<string>) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  page: number;
  rowsPerPage: number;
  handleChangePage: (_event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => void;
  stats: RbacPermissionsPageStats;
  openCreate: () => void;
  openEdit: (row: RbacPermissionDto) => void;
  formOpen: boolean;
  formMode: "create" | "edit";
  editing: RbacPermissionDto | null;
  closeForm: () => void;
  submitPermissionForm: (values: {
    permissionCode: string;
    permissionDescription: string;
    categoryId: number | null;
  }) => Promise<void>;
  deleteTarget: RbacPermissionDto | null;
  setDeleteTarget: (row: RbacPermissionDto | null) => void;
  confirmDelete: () => Promise<void>;
  togglePermissionActive: (row: RbacPermissionDto) => Promise<void>;
  toggleBusyPermissionId: number | null;
  formSaving: boolean;
  deleteBusy: boolean;
};

function invalidatePermissionRelatedQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: rbacPermissionsKeys.all });
  void queryClient.invalidateQueries({ queryKey: rbacCategoriesKeys.all });
  void queryClient.invalidateQueries({
    queryKey: rbacPermissionsForCategoriesKeys.all,
  });
}

export function useRbacPermissionsPage(): RbacPermissionsPageViewModel {
  const queryClient = useQueryClient();

  const categoriesQuery = useRbacCategoriesQuery();

  const [filterCategoryId, setFilterCategoryId] = useState(FILTER_ALL);
  const permissionsQuery = useRbacPermissionsAdminListQuery(filterCategoryId);

  const [mutationError, setMutationError] = useState<string | null>(null);
  const [dismissedListStamp, setDismissedListStamp] = useState<string | null>(
    null,
  );

  const [searchTerm, setSearchTermState] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<RbacPermissionDto | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<RbacPermissionDto | null>(
    null,
  );

  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );

  const rows = useMemo(
    () => permissionsQuery.data ?? [],
    [permissionsQuery.data],
  );

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.category_name] as const)),
    [categories],
  );

  const ceStamp = categoriesQuery.isError
    ? String(categoriesQuery.errorUpdatedAt ?? "")
    : "";
  const peStamp = permissionsQuery.isError
    ? String(permissionsQuery.errorUpdatedAt ?? "")
    : "";
  const listErrorStamp =
    categoriesQuery.isError || permissionsQuery.isError
      ? `${ceStamp}:${peStamp}`
      : null;

  const listErrorMessage = useMemo(() => {
    if (categoriesQuery.isError && categoriesQuery.error != null) {
      return getRbacApiErrorMessage(
        categoriesQuery.error,
        "Failed to load categories",
      );
    }
    if (permissionsQuery.isError && permissionsQuery.error != null) {
      return getRbacApiErrorMessage(
        permissionsQuery.error,
        "Failed to load RBAC permissions",
      );
    }
    return null;
  }, [
    categoriesQuery.isError,
    categoriesQuery.error,
    permissionsQuery.isError,
    permissionsQuery.error,
  ]);

  const showListError =
    listErrorMessage !== null &&
    listErrorStamp !== null &&
    listErrorStamp !== dismissedListStamp;

  const displayError =
    mutationError ?? (showListError ? listErrorMessage : null);

  const dismissError = () => {
    if (mutationError !== null) {
      setMutationError(null);
    } else if (listErrorStamp !== null) {
      setDismissedListStamp(listErrorStamp);
    }
  };

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const cat =
        row.category_id == null
          ? ""
          : (categoryById.get(row.category_id) ?? "");
      return (
        row.permission_code.toLowerCase().includes(q) ||
        (row.permission_description?.toLowerCase().includes(q) ?? false) ||
        cat.toLowerCase().includes(q)
      );
    });
  }, [rows, searchTerm, categoryById]);

  const stats = useMemo((): RbacPermissionsPageStats => {
    const uncategorized = rows.filter((r) => r.category_id == null).length;
    const categorized = rows.filter((r) => r.category_id != null).length;
    return {
      inView: rows.length,
      uncategorized,
      categorized,
      categories: categories.length,
    };
  }, [rows, categories.length]);

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

  const handleFilterChange = (e: SelectChangeEvent<string>) => {
    setFilterCategoryId(e.target.value);
    setPage(0);
  };

  const pageSlice = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const createMutation = useMutation({
    mutationFn: (payload: CreateRbacPermissionPayload) =>
      createRbacPermission(payload),
    onSuccess: () => {
      setMutationError(null);
      invalidatePermissionRelatedQueries(queryClient);
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err: unknown) => {
      setMutationError(getRbacApiErrorMessage(err, "Failed to create permission"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; payload: UpdateRbacPermissionPayload }) =>
      updateRbacPermission(vars.id, vars.payload),
    onSuccess: () => {
      setMutationError(null);
      invalidatePermissionRelatedQueries(queryClient);
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err: unknown) => {
      setMutationError(getRbacApiErrorMessage(err, "Failed to update permission"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRbacPermission(id),
    onSuccess: () => {
      setMutationError(null);
      invalidatePermissionRelatedQueries(queryClient);
      setDeleteTarget(null);
    },
    onError: (err: unknown) => {
      setMutationError(getRbacApiErrorMessage(err, "Failed to delete permission"));
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (vars: { id: number; isActive: boolean }) =>
      updateRbacPermission(vars.id, { isActive: vars.isActive }),
    onSuccess: () => {
      setMutationError(null);
      invalidatePermissionRelatedQueries(queryClient);
    },
    onError: (err: unknown) => {
      setMutationError(
        getRbacApiErrorMessage(err, "Failed to update permission status"),
      );
    },
  });

  const refresh = () => {
    setMutationError(null);
    setDismissedListStamp(null);
    invalidatePermissionRelatedQueries(queryClient);
  };

  const openCreate = () => {
    setMutationError(null);
    setEditing(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEdit = (row: RbacPermissionDto) => {
    setMutationError(null);
    setEditing(row);
    setFormMode("edit");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const submitPermissionForm = async (values: {
    permissionCode: string;
    permissionDescription: string;
    categoryId: number | null;
  }) => {
    setMutationError(null);
    if (formMode === "create") {
      await createMutation.mutateAsync({
        permissionCode: values.permissionCode,
        permissionDescription: values.permissionDescription || null,
        categoryId: values.categoryId,
      });
    } else if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        payload: {
          permissionDescription: values.permissionDescription || null,
          categoryId: values.categoryId,
        },
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setMutationError(null);
    await deleteMutation.mutateAsync(deleteTarget.id);
  };

  const togglePermissionActive = async (row: RbacPermissionDto) => {
    const nextActive = !(row.is_active ?? true);
    setMutationError(null);
    await toggleActiveMutation.mutateAsync({
      id: row.id,
      isActive: nextActive,
    });
  };

  const toggleBusyPermissionId =
    toggleActiveMutation.isPending && toggleActiveMutation.variables
      ? toggleActiveMutation.variables.id
      : null;

  const loading =
    categoriesQuery.isFetching || permissionsQuery.isFetching;
  const saving =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    toggleActiveMutation.isPending;

  const formSaving =
    createMutation.isPending || updateMutation.isPending;
  const deleteBusy = deleteMutation.isPending;

  return {
    categories,
    categoryById,
    filteredRows,
    pageSlice,
    loading,
    saving,
    error: displayError,
    dismissError,
    refresh,
    filterCategoryId,
    handleFilterChange,
    searchTerm,
    setSearchTerm,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    stats,
    openCreate,
    openEdit,
    formOpen,
    formMode,
    editing,
    closeForm,
    submitPermissionForm,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
    togglePermissionActive,
    toggleBusyPermissionId,
    formSaving,
    deleteBusy,
  };
}