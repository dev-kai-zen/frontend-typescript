import { useQueryClient } from "@tanstack/react-query";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";

import { getRbacApiErrorMessage } from "../../rbac/permissions/rbac-api-errors";
import type { UserLogDto } from "../types/user-logs.types";
import { userLogsKeys } from "./user-logs-query-keys";
import { useUserLogsQuery } from "./useUserLogsQuery";

export type UserLogsPageStats = {
  pageRows: number;
  distinctUsers: number;
  distinctActions: number;
  errorStatuses: number;
};

export type UserLogsPageViewModel = {
  rows: UserLogDto[];
  loading: boolean;
  error: string | null;
  dismissError: () => void;
  draftUserId: string;
  draftAction: string;
  draftModule: string;
  setDraftUserId: (value: string) => void;
  setDraftAction: (value: string) => void;
  setDraftModule: (value: string) => void;
  applyFilters: () => void;
  refresh: () => void;
  rowsPerPage: number;
  page: number;
  tableCount: number;
  handleChangePage: (_event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => void;
  stats: UserLogsPageStats;
  detailRow: UserLogDto | null;
  openDetail: (row: UserLogDto) => void;
  closeDetail: () => void;
  detailJson: string;
};

export function useUserLogsPage(): UserLogsPageViewModel {
  const queryClient = useQueryClient();

  const [appliedUserId, setAppliedUserId] = useState<number | undefined>(
    undefined,
  );
  const [appliedAction, setAppliedAction] = useState("");
  const [appliedModule, setAppliedModule] = useState("");
  const [draftUserId, setDraftUserId] = useState("");
  const [draftAction, setDraftAction] = useState("");
  const [draftModule, setDraftModule] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const [detailRow, setDetailRow] = useState<UserLogDto | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [dismissedErrorStamp, setDismissedErrorStamp] = useState<string | null>(
    null,
  );

  const offset = page * rowsPerPage;

  const listQuery = useMemo(
    () => ({
      userId: appliedUserId,
      action: appliedAction.trim() || undefined,
      module: appliedModule.trim() || undefined,
      limit: rowsPerPage,
      offset,
    }),
    [appliedUserId, appliedAction, appliedModule, rowsPerPage, offset],
  );

  const query = useUserLogsQuery(listQuery);

  const rows = useMemo(() => query.data ?? [], [query.data]);

  const errorStamp =
    query.isError && query.errorUpdatedAt != null
      ? String(query.errorUpdatedAt)
      : null;

  useEffect(() => {
    if (!query.isFetching && rows.length === 0 && offset > 0) {
      /* eslint-disable react-hooks/set-state-in-effect -- snap page back when this offset is empty */
      setPage((p) => Math.max(0, p - 1));
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [query.isFetching, rows.length, offset]);

  const listErrorMessage = useMemo(() => {
    if (!query.isError || query.error == null) return null;
    return getRbacApiErrorMessage(query.error, "Failed to load user logs");
  }, [query.isError, query.error]);

  const showListError =
    listErrorMessage !== null &&
    errorStamp !== null &&
    errorStamp !== dismissedErrorStamp;

  const displayError =
    validationError ?? (showListError ? listErrorMessage : null);

  const dismissError = () => {
    if (validationError !== null) {
      setValidationError(null);
    } else if (errorStamp !== null) {
      setDismissedErrorStamp(errorStamp);
    }
  };

  const tableCount =
    rows.length === 0 && !query.isFetching
      ? 0
      : rows.length < rowsPerPage
        ? page * rowsPerPage + rows.length
        : page * rowsPerPage + rowsPerPage + 1;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const stats = useMemo((): UserLogsPageStats => {
    const pageRows = rows.length;
    const distinctUsers = new Set(
      rows.map((r) => r.user_id).filter((id): id is number => id != null),
    ).size;
    const distinctActions = new Set(rows.map((r) => r.action).filter(Boolean))
      .size;
    const errorStatuses = rows.filter(
      (r) =>
        r.status_code != null &&
        Number.isFinite(r.status_code) &&
        r.status_code >= 400,
    ).length;
    return { pageRows, distinctUsers, distinctActions, errorStatuses };
  }, [rows]);

  const detailJson = useMemo(() => {
    if (!detailRow) return "";
    try {
      return JSON.stringify(
        {
          id: detailRow.id,
          user_id: detailRow.user_id,
          action: detailRow.action,
          module: detailRow.module,
          description: detailRow.description,
          method: detailRow.method,
          route: detailRow.route,
          status_code: detailRow.status_code,
          ip_address: detailRow.ip_address,
          user_agent: detailRow.user_agent,
          device_type: detailRow.device_type,
          browser: detailRow.browser,
          os: detailRow.os,
          session_id: detailRow.session_id,
          metadata: detailRow.metadata,
          created_at: detailRow.created_at,
          updated_at: detailRow.updated_at,
        },
        null,
        2,
      );
    } catch {
      return "";
    }
  }, [detailRow]);

  const applyFilters = () => {
    const uidRaw = draftUserId.trim();
    if (uidRaw === "") {
      setAppliedUserId(undefined);
    } else {
      const n = Number.parseInt(uidRaw, 10);
      if (!Number.isFinite(n)) {
        setValidationError("User ID must be a whole number or empty.");
        return;
      }
      setAppliedUserId(n);
    }
    setAppliedAction(draftAction.trim());
    setAppliedModule(draftModule.trim());
    setPage(0);
    setValidationError(null);
    setDismissedErrorStamp(null);
  };

  const refresh = () => {
    setValidationError(null);
    setDismissedErrorStamp(null);
    void queryClient.invalidateQueries({ queryKey: userLogsKeys.all });
  };

  return {
    rows,
    loading: query.isFetching,
    error: displayError,
    dismissError,
    draftUserId,
    draftAction,
    draftModule,
    setDraftUserId,
    setDraftAction,
    setDraftModule,
    applyFilters,
    refresh,
    rowsPerPage,
    page,
    tableCount,
    handleChangePage,
    handleChangeRowsPerPage,
    stats,
    detailRow,
    openDetail: setDetailRow,
    closeDetail: () => setDetailRow(null),
    detailJson,
  };
}
