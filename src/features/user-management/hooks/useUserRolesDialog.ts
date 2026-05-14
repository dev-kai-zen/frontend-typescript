import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { useAuthStore } from "../../auth/auth-store";
import { getRbacApiErrorMessage } from "../../rbac/permissions/rbac-api-errors";
import { fetchRbacRoles } from "../../rbac/roles/services/rbac-roles-api";
import type { RbacRoleDto } from "../../rbac/roles/types/rbac-roles.types";
import { fetchUserRoles, setUserRoles } from "../services/user-roles-api";
import type { UserListItemDto } from "../types/users.types";
import { userManagementKeys } from "./user-management-query-keys";

export type UserRolesDialogViewModel = {
  actorId: number | null;
  catalog: RbacRoleDto[];
  filteredRoles: RbacRoleDto[];
  selectedIds: number[];
  toggleRole: (roleId: number) => void;
  filter: string;
  setFilter: (value: string) => void;
  loading: boolean;
  saving: boolean;
  loadError: string | null;
  saveError: string | null;
  disabled: boolean;
  save: () => Promise<void>;
  userLabel: string;
};

type Args = {
  open: boolean;
  user: UserListItemDto | null;
  onClose: () => void;
  onSaved: () => void;
};

export function useUserRolesDialog(args: Args): UserRolesDialogViewModel {
  const { open, user, onClose, onSaved } = args;
  const queryClient = useQueryClient();
  const actorId = useAuthStore((s) => s.user?.id ?? null);

  const userId = user?.id ?? null;
  const enabled = open && userId !== null;

  const assignmentQuery = useQuery({
    queryKey:
      userId !== null
        ? userManagementKeys.rolesDialog(userId)
        : [...userManagementKeys.all, "roles-dialog", "idle"],
    queryFn: async () => {
      const [catalog, links] = await Promise.all([
        fetchRbacRoles(),
        fetchUserRoles(userId!),
      ]);
      return {
        catalog,
        initialIds: links.map((l) => l.role_id).sort((a, b) => a - b),
      };
    },
    enabled,
  });

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filter, setFilter] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || userId === null) {
      /* eslint-disable react-hooks/set-state-in-effect -- dialog closed cleanup */
      setFilter("");
      setSaveError(null);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }
    setSaveError(null);
  }, [open, userId]);

  useEffect(() => {
    if (!assignmentQuery.data) return;
    /* eslint-disable react-hooks/set-state-in-effect -- sync selection from server */
    setSelectedIds(assignmentQuery.data.initialIds);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [assignmentQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (userId === null || actorId === null) {
        throw new Error("Missing user or actor");
      }
      await setUserRoles(userId, {
        roleIds: selectedIds,
        assignedBy: actorId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userManagementKeys.snapshot(),
      });
      if (userId !== null) {
        await queryClient.invalidateQueries({
          queryKey: userManagementKeys.rolesDialog(userId),
        });
      }
      onSaved();
      onClose();
    },
  });

  const toggleRole = (roleId: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      }
      return [...prev, roleId].sort((a, b) => a - b);
    });
  };

  const catalog = assignmentQuery.data?.catalog ?? [];

  const q = filter.trim().toLowerCase();
  const filteredRoles = q
    ? catalog.filter((r) => r.role_name.toLowerCase().includes(q))
    : catalog;

  const loadError = useMemo(() => {
    if (!assignmentQuery.isError || assignmentQuery.error == null) return null;
    return getRbacApiErrorMessage(
      assignmentQuery.error,
      "Failed to load roles for this user",
    );
  }, [assignmentQuery.isError, assignmentQuery.error]);

  const loading = assignmentQuery.isFetching;
  const saving = saveMutation.isPending;
  const disabled = loading || saving || actorId === null;

  const save = async () => {
    setSaveError(null);
    try {
      await saveMutation.mutateAsync();
    } catch (err) {
      setSaveError(getRbacApiErrorMessage(err, "Failed to update user roles"));
    }
  };

  const userLabel =
    user != null ? `${user.email} (#${user.id})` : "user";

  return {
    actorId,
    catalog,
    filteredRoles,
    selectedIds,
    toggleRole,
    filter,
    setFilter,
    loading,
    saving,
    loadError,
    saveError,
    disabled,
    save,
    userLabel,
  };
}
