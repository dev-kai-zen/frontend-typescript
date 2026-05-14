import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { getRbacApiErrorMessage } from "../../permissions/services/rbac-api-errors";
import type { RbacRoleDto } from "../../roles/types/rbac-roles.types";
import type { CategoryBlock } from "../types/role-permissions-matrix.types";
import { setRolePermissions } from "../services/rbac-role-permissions-api";
import {
  cloneMatrix,
  sortedIdsEqual,
  sortIds,
} from "../utils/role-permissions-matrix.helpers";
import { computeInitialExpandedKeys } from "../utils/role-permissions-matrix-expanded-keys";
import { rolePermissionsMatrixKeys } from "./role-permissions-matrix-query-keys";
import { useRolePermissionsMatrixQuery } from "./useRolePermissionsMatrixQuery";

export type RolePermissionsMatrixPageViewModel = {
  roles: RbacRoleDto[];
  categoryBlocks: CategoryBlock[];
  matrix: Record<number, number[]>;
  expandedKeys: string[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  toggleExpanded: (key: string) => void;
  togglePermission: (roleId: number, permissionId: number) => void;
  selectAllInCategory: (block: CategoryBlock, roleId: number) => void;
  categoryGrantedCount: (block: CategoryBlock, roleId: number) => number;
  loading: boolean;
  saving: boolean;
  error: string | null;
  dismissError: () => void;
  hasChanges: boolean;
  reload: () => void;
  resetLocal: () => void;
  save: () => Promise<void>;
  catalogLength: number;
};

export function useRolePermissionsMatrixPage(): RolePermissionsMatrixPageViewModel {
  const queryClient = useQueryClient();
  const snapshotQuery = useRolePermissionsMatrixQuery();

  const [matrix, setMatrix] = useState<Record<number, number[]>>({});
  const [baseline, setBaseline] = useState<Record<number, number[]>>({});
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [mutationError, setMutationError] = useState<string | null>(null);
  const [dismissedListStamp, setDismissedListStamp] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const data = snapshotQuery.data;
    if (!data) return;
    /* eslint-disable react-hooks/set-state-in-effect -- mirror server snapshot after fetch */
    const m = cloneMatrix(data.matrix);
    setMatrix(m);
    setBaseline(cloneMatrix(data.matrix));
    setExpandedKeys(computeInitialExpandedKeys(data.categories, data.catalog));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [snapshotQuery.dataUpdatedAt, snapshotQuery.data]);

  const roles = useMemo(
    () => snapshotQuery.data?.roles ?? [],
    [snapshotQuery.data],
  );
  const categories = useMemo(
    () => snapshotQuery.data?.categories ?? [],
    [snapshotQuery.data],
  );
  const catalog = useMemo(
    () => snapshotQuery.data?.catalog ?? [],
    [snapshotQuery.data],
  );
  const catalogLength = catalog.length;

  const listErrorStamp = snapshotQuery.isError
    ? String(snapshotQuery.errorUpdatedAt ?? "")
    : null;

  const listErrorMessage = useMemo(() => {
    if (!snapshotQuery.isError || snapshotQuery.error == null) return null;
    return getRbacApiErrorMessage(
      snapshotQuery.error,
      "Failed to load matrix data",
    );
  }, [snapshotQuery.isError, snapshotQuery.error]);

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

  const categoryBlocks: CategoryBlock[] = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const blocks: CategoryBlock[] = [];

    for (const c of categories) {
      let perms = catalog.filter((p) => p.category_id === c.id);
      if (q) {
        perms = perms.filter(
          (p) =>
            p.permission_code.toLowerCase().includes(q) ||
            (p.permission_description?.toLowerCase().includes(q) ?? false),
        );
      }
      if (perms.length > 0) {
        blocks.push({
          key: `c:${c.id}`,
          title: c.category_name,
          permissions: [...perms].sort((a, b) =>
            a.permission_code.localeCompare(b.permission_code),
          ),
        });
      }
    }

    let unc = catalog.filter((p) => p.category_id == null);
    if (q) {
      unc = unc.filter(
        (p) =>
          p.permission_code.toLowerCase().includes(q) ||
          (p.permission_description?.toLowerCase().includes(q) ?? false),
      );
    }
    if (unc.length > 0) {
      blocks.push({
        key: "uncategorized",
        title: "Uncategorized",
        permissions: [...unc].sort((a, b) =>
          a.permission_code.localeCompare(b.permission_code),
        ),
      });
    }

    return blocks;
  }, [categories, catalog, searchTerm]);

  const hasChanges = useMemo(() => {
    for (const r of roles) {
      const a = matrix[r.id] ?? [];
      const b = baseline[r.id] ?? [];
      if (!sortedIdsEqual(a, b)) return true;
    }
    return false;
  }, [roles, matrix, baseline]);

  const saveMutation = useMutation({
    mutationFn: async (vars: {
      roles: RbacRoleDto[];
      matrix: Record<number, number[]>;
      baseline: Record<number, number[]>;
    }) => {
      for (const r of vars.roles) {
        const a = vars.matrix[r.id] ?? [];
        const b = vars.baseline[r.id] ?? [];
        if (!sortedIdsEqual(a, b)) {
          await setRolePermissions(r.id, a);
        }
      }
    },
    onSuccess: (_data, vars) => {
      setMutationError(null);
      setBaseline(cloneMatrix(vars.matrix));
    },
    onError: (err: unknown) => {
      setMutationError(
        getRbacApiErrorMessage(err, "Failed to save permission matrix"),
      );
    },
  });

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const togglePermission = (roleId: number, permissionId: number) => {
    setMatrix((prev) => {
      const cur = prev[roleId] ?? [];
      const has = cur.includes(permissionId);
      const nextIds = has
        ? cur.filter((id) => id !== permissionId)
        : [...cur, permissionId];
      return { ...prev, [roleId]: sortIds(nextIds) };
    });
  };

  const selectAllInCategory = (block: CategoryBlock, roleId: number) => {
    const ids = block.permissions.map((p) => p.id);
    setMatrix((prev) => {
      const cur = prev[roleId] ?? [];
      const allOn = ids.every((id) => cur.includes(id));
      const nextIds = allOn
        ? cur.filter((id) => !ids.includes(id))
        : sortIds([...new Set([...cur, ...ids])]);
      return { ...prev, [roleId]: nextIds };
    });
  };

  const categoryGrantedCount = (block: CategoryBlock, roleId: number) => {
    const cur = matrix[roleId] ?? [];
    const ids = block.permissions.map((p) => p.id);
    return ids.filter((id) => cur.includes(id)).length;
  };

  const reload = () => {
    setMutationError(null);
    setDismissedListStamp(null);
    void queryClient.invalidateQueries({
      queryKey: rolePermissionsMatrixKeys.all,
    });
  };

  const resetLocal = () => {
    setMatrix(cloneMatrix(baseline));
  };

  const save = async () => {
    if (roles.length === 0) return;
    setMutationError(null);
    await saveMutation.mutateAsync({ roles, matrix, baseline });
  };

  const loading = snapshotQuery.isFetching;
  const saving = saveMutation.isPending;

  return {
    roles,
    categoryBlocks,
    matrix,
    expandedKeys,
    searchTerm,
    setSearchTerm,
    toggleExpanded,
    togglePermission,
    selectAllInCategory,
    categoryGrantedCount,
    loading,
    saving,
    error: displayError,
    dismissError,
    hasChanges,
    reload,
    resetLocal,
    save,
    catalogLength,
  };
}
