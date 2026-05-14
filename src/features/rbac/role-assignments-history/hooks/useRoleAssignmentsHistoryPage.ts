import { useQueryClient } from "@tanstack/react-query";
import { type ChangeEvent, useCallback, useMemo, useState } from "react";

import { getRbacApiErrorMessage } from "../../permissions/rbac-api-errors";
import type { RoleAssignmentRow } from "../types/role-assignments-history.types";
import { downloadRoleAssignmentsCsv } from "../utils/role-assignments-history-csv";
import { roleAssignmentsHistoryKeys } from "./role-assignments-history-query-keys";
import { useRoleAssignmentsHistoryQuery } from "./useRoleAssignmentsHistoryQuery";

export type RoleAssignmentsHistoryStats = {
  total: number;
  usersWithRoles: number;
  rolesUsed: number;
  distinctAssigners: number;
};

export type RoleAssignmentsHistoryPageViewModel = {
  loading: boolean;
  error: string | null;
  dismissError: () => void;
  refresh: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterRoleId: string;
  setFilterRoleId: (value: string) => void;
  roleFilterOptions: [number, string][];
  filteredRows: RoleAssignmentRow[];
  pageSlice: RoleAssignmentRow[];
  page: number;
  rowsPerPage: number;
  handleChangePage: (_event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => void;
  stats: RoleAssignmentsHistoryStats;
  exportFilteredCsv: () => void;
};

export function useRoleAssignmentsHistoryPage(): RoleAssignmentsHistoryPageViewModel {
  const queryClient = useQueryClient();
  const query = useRoleAssignmentsHistoryQuery();

  const [dismissedListStamp, setDismissedListStamp] = useState<string | null>(
    null,
  );

  const [searchTerm, setSearchTermState] = useState("");
  const [filterRoleId, setFilterRoleIdState] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const rows = useMemo(() => query.data ?? [], [query.data]);

  const listErrorStamp = query.isError
    ? String(query.errorUpdatedAt ?? "")
    : null;

  const listErrorMessage = useMemo(() => {
    if (!query.isError || query.error == null) return null;
    return getRbacApiErrorMessage(
      query.error,
      "Failed to load role assignments",
    );
  }, [query.isError, query.error]);

  const showListError =
    listErrorMessage !== null &&
    listErrorStamp !== null &&
    listErrorStamp !== dismissedListStamp;

  const displayError = showListError ? listErrorMessage : null;

  const dismissError = () => {
    if (listErrorStamp !== null) setDismissedListStamp(listErrorStamp);
  };

  const roleFilterOptions = useMemo((): [number, string][] => {
    const m = new Map<number, string>();
    rows.forEach((r) => {
      if (!m.has(r.roleId)) m.set(r.roleId, r.roleName);
    });
    return [...m.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], undefined, { sensitivity: "base" }),
    );
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesRole =
        filterRoleId === "all" || String(r.roleId) === filterRoleId;
      if (!matchesRole) return false;
      if (!q) return true;
      return (
        r.userEmail.toLowerCase().includes(q) ||
        (r.userName?.toLowerCase().includes(q) ?? false) ||
        r.roleName.toLowerCase().includes(q) ||
        r.assignedByLabel.toLowerCase().includes(q)
      );
    });
  }, [rows, searchTerm, filterRoleId]);

  const stats = useMemo((): RoleAssignmentsHistoryStats => {
    const total = rows.length;
    const usersWithRoles = new Set(rows.map((r) => r.userId)).size;
    const rolesUsed = new Set(rows.map((r) => r.roleId)).size;
    const distinctAssigners = new Set(rows.map((r) => r.assignedById)).size;
    return { total, usersWithRoles, rolesUsed, distinctAssigners };
  }, [rows]);

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

  const setFilterRoleId = (value: string) => {
    setFilterRoleIdState(value);
    setPage(0);
  };

  const pageSlice = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const refresh = () => {
    setDismissedListStamp(null);
    void queryClient.invalidateQueries({
      queryKey: roleAssignmentsHistoryKeys.all,
    });
  };

  const exportFilteredCsv = useCallback(() => {
    downloadRoleAssignmentsCsv("role-assignments.csv", filteredRows);
  }, [filteredRows]);

  const loading = query.isFetching;

  return {
    loading,
    error: displayError,
    dismissError,
    refresh,
    searchTerm,
    setSearchTerm,
    filterRoleId,
    setFilterRoleId,
    roleFilterOptions,
    filteredRows,
    pageSlice,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    stats,
    exportFilteredCsv,
  };
}
