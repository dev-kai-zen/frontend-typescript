import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { getRbacApiErrorMessage } from "../../permissions/rbac-api-errors";
import {
  createRbacCategory,
  deleteRbacCategory,
  updateRbacCategory,
} from "../services/rbac-categories-api";
import type { RbacCategoryDto } from "../types/rbac-categories.types";
import { rbacCategoriesKeys } from "./rbac-categories-query-keys";
import { rbacPermissionsForCategoriesKeys } from "./rbac-permissions-for-categories-query-keys";
import { useRbacCategoriesListQuery } from "./useRbacCategoriesListQuery";
import { useRbacPermissionsForCategoriesQuery } from "./useRbacPermissionsForCategoriesQuery";

export type RbacCategoriesPageStats = {
  categories: number;
  permissions: number;
  avgPerCat: string;
};

export type RbacCategoriesPageViewModel = {
  rows: RbacCategoryDto[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  stats: RbacCategoriesPageStats;
  codesByCategoryId: Map<number, string[]>;
  refresh: () => void;
  formOpen: boolean;
  formMode: "create" | "edit";
  editing: RbacCategoryDto | null;
  openCreate: () => void;
  openEdit: (row: RbacCategoryDto) => void;
  closeForm: () => void;
  submitForm: (values: { categoryName: string }) => void;
  formBusy: boolean;
  deleteTarget: RbacCategoryDto | null;
  openDelete: (row: RbacCategoryDto) => void;
  closeDelete: () => void;
  confirmDelete: () => void;
  deleteBusy: boolean;
};

export function useRbacCategoriesPage(): RbacCategoriesPageViewModel {
  const queryClient = useQueryClient();

  const categoriesQuery = useRbacCategoriesListQuery();
  const permissionsQuery = useRbacPermissionsForCategoriesQuery();

  const [localError, setLocalError] = useState<string | null>(null);
  /** Hide banner until the underlying failure identity changes (React Query errors persist). */
  const [dismissedErrorSig, setDismissedErrorSig] = useState<string | null>(
    null,
  );

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<RbacCategoryDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RbacCategoryDto | null>(
    null,
  );

  const rows = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );
  const permissions = useMemo(
    () => permissionsQuery.data ?? [],
    [permissionsQuery.data],
  );

  const loading = categoriesQuery.isFetching || permissionsQuery.isFetching;

  const queryError = useMemo(() => {
    if (categoriesQuery.isError && categoriesQuery.error != null) {
      return getRbacApiErrorMessage(
        categoriesQuery.error,
        "Failed to load RBAC categories",
      );
    }
    if (permissionsQuery.isError && permissionsQuery.error != null) {
      return getRbacApiErrorMessage(
        permissionsQuery.error,
        "Failed to load permissions for categories",
      );
    }
    return null;
  }, [
    categoriesQuery.isError,
    categoriesQuery.error,
    permissionsQuery.isError,
    permissionsQuery.error,
  ]);

  const errorSig = useMemo(() => {
    if (localError != null) return `local:${localError}`;
    if (queryError != null) {
      return `q:${String(categoriesQuery.errorUpdatedAt ?? "")}:${String(permissionsQuery.errorUpdatedAt ?? "")}`;
    }
    return null;
  }, [
    localError,
    queryError,
    categoriesQuery.errorUpdatedAt,
    permissionsQuery.errorUpdatedAt,
  ]);

  const rawError = localError ?? queryError;
  const error =
    rawError != null && errorSig != null && errorSig !== dismissedErrorSig
      ? rawError
      : null;

  const codesByCategoryId = useMemo(() => {
    const m = new Map<number, string[]>();
    for (const p of permissions) {
      if (p.category_id == null) continue;
      const list = m.get(p.category_id) ?? [];
      list.push(p.permission_code);
      m.set(p.category_id, list);
    }
    for (const [, list] of m) {
      list.sort((a, b) => a.localeCompare(b));
    }
    return m;
  }, [permissions]);

  const stats = useMemo((): RbacCategoriesPageStats => {
    const totalPerm = permissions.length;
    const avg =
      rows.length === 0
        ? "0"
        : String(Math.round(totalPerm / rows.length));
    return {
      categories: rows.length,
      permissions: totalPerm,
      avgPerCat: avg,
    };
  }, [rows.length, permissions.length]);

  const refresh = () => {
    setLocalError(null);
    setDismissedErrorSig(null);
    void queryClient.invalidateQueries({ queryKey: rbacCategoriesKeys.all });
    void queryClient.invalidateQueries({
      queryKey: rbacPermissionsForCategoriesKeys.all,
    });
  };

  const createMut = useMutation({
    mutationFn: createRbacCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rbacCategoriesKeys.all });
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      setLocalError(getRbacApiErrorMessage(err, "Failed to create category"));
    },
  });

  const updateMut = useMutation({
    mutationFn: (args: { id: number; categoryName: string }) =>
      updateRbacCategory(args.id, { categoryName: args.categoryName }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rbacCategoriesKeys.all });
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      setLocalError(getRbacApiErrorMessage(err, "Failed to update category"));
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteRbacCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rbacCategoriesKeys.all });
      void queryClient.invalidateQueries({
        queryKey: rbacPermissionsForCategoriesKeys.all,
      });
      setDeleteTarget(null);
    },
    onError: (err) => {
      setLocalError(getRbacApiErrorMessage(err, "Failed to delete category"));
    },
  });

  const openCreate = () => {
    setLocalError(null);
    setEditing(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEdit = (row: RbacCategoryDto) => {
    setLocalError(null);
    setEditing(row);
    setFormMode("edit");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const submitForm = (values: { categoryName: string }) => {
    setLocalError(null);
    if (formMode === "create") {
      createMut.mutate({ categoryName: values.categoryName });
    } else if (editing) {
      updateMut.mutate({
        id: editing.id,
        categoryName: values.categoryName,
      });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setLocalError(null);
    deleteMut.mutate(deleteTarget.id);
  };

  return {
    rows,
    loading,
    error,
    clearError: () => {
      if (errorSig != null) setDismissedErrorSig(errorSig);
      setLocalError(null);
    },
    stats,
    codesByCategoryId,
    refresh,
    formOpen,
    formMode,
    editing,
    openCreate,
    openEdit,
    closeForm,
    submitForm,
    formBusy: createMut.isPending || updateMut.isPending,
    deleteTarget,
    openDelete: setDeleteTarget,
    closeDelete: () => setDeleteTarget(null),
    confirmDelete,
    deleteBusy: deleteMut.isPending,
  };
}
