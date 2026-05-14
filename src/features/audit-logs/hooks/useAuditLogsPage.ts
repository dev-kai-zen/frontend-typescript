import { useQueryClient } from "@tanstack/react-query";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";

import { getRbacApiErrorMessage } from "../../rbac/permissions/rbac-api-errors";
import type { AuditLogDto } from "../types/audit-logs.types";
import { auditLogsKeys } from "./audit-logs-query-keys";
import { useAuditLogsQuery } from "./useAuditLogsQuery";

export type AuditLogsPageStats = {
  pageRows: number;
  distinctActions: number;
  distinctEntities: number;
  withFieldChanges: number;
};

export type AuditLogsPageViewModel = {
  rows: AuditLogDto[];
  loading: boolean;
  error: string | null;
  /** Hide the error banner until `query.errorUpdatedAt` changes (new failure). */
  dismissError: () => void;
  draftAction: string;
  draftEntityType: string;
  setDraftAction: (value: string) => void;
  setDraftEntityType: (value: string) => void;
  applyFilters: () => void;
  refresh: () => void;
  rowsPerPage: number;
  page: number;
  tableCount: number;
  handleChangePage: (_event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => void;
  stats: AuditLogsPageStats;
  detailRow: AuditLogDto | null;
  openDetail: (row: AuditLogDto) => void;
  closeDetail: () => void;
  detailJson: string;
};

export function useAuditLogsPage(): AuditLogsPageViewModel {
  const queryClient = useQueryClient();

  const [appliedAction, setAppliedAction] = useState("");
  const [appliedEntityType, setAppliedEntityType] = useState("");
  const [draftAction, setDraftAction] = useState("");
  const [draftEntityType, setDraftEntityType] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const [detailRow, setDetailRow] = useState<AuditLogDto | null>(null);

  /** Last `errorUpdatedAt` the user dismissed (hide banner until the server fails again). */
  const [dismissedErrorStamp, setDismissedErrorStamp] = useState<string | null>(
    null,
  );

  const offset = page * rowsPerPage;

  const listQuery = useMemo(
    () => ({
      action: appliedAction.trim() || undefined,
      entity_type: appliedEntityType.trim() || undefined,
      limit: rowsPerPage,
      offset,
    }),
    [appliedAction, appliedEntityType, rowsPerPage, offset],
  );

  const query = useAuditLogsQuery(listQuery);

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

  const errorMessage = useMemo(() => {
    if (!query.isError || query.error == null) return null;
    return getRbacApiErrorMessage(query.error, "Failed to load audit logs");
  }, [query.isError, query.error]);

  const tableCount =
    rows.length === 0 && !query.isFetching
      ? 0
      : rows.length < rowsPerPage
        ? page * rowsPerPage + rows.length
        : page * rowsPerPage + rowsPerPage + 1;

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const stats = useMemo((): AuditLogsPageStats => {
    const pageRows = rows.length;
    const distinctActions = new Set(rows.map((r) => r.action).filter(Boolean))
      .size;
    const distinctEntities = new Set(
      rows.map((r) => r.entity_type).filter(Boolean),
    ).size;
    const withFieldChanges = rows.filter(
      (r) => (r.change_fields?.length ?? 0) > 0,
    ).length;
    return { pageRows, distinctActions, distinctEntities, withFieldChanges };
  }, [rows]);

  const detailJson = useMemo(() => {
    if (!detailRow) return "";
    try {
      return JSON.stringify(
        {
          id: detailRow.id,
          user_id: detailRow.user_id,
          action: detailRow.action,
          entity_type: detailRow.entity_type,
          entity_id: detailRow.entity_id,
          change_fields: detailRow.change_fields,
          old_values: detailRow.old_values,
          new_values: detailRow.new_values,
          ip_address: detailRow.ip_address,
          user_agent: detailRow.user_agent,
          timestamp: detailRow.timestamp,
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
    setAppliedAction(draftAction.trim());
    setAppliedEntityType(draftEntityType.trim());
    setPage(0);
    setDismissedErrorStamp(null);
  };

  const refresh = () => {
    setDismissedErrorStamp(null);
    void queryClient.invalidateQueries({ queryKey: auditLogsKeys.all });
  };

  const displayError =
    errorMessage !== null &&
    errorStamp !== null &&
    errorStamp !== dismissedErrorStamp
      ? errorMessage
      : null;

  return {
    rows,
    loading: query.isFetching,
    error: displayError,
    dismissError: () => {
      if (errorStamp !== null) setDismissedErrorStamp(errorStamp);
    },
    draftAction,
    draftEntityType,
    setDraftAction,
    setDraftEntityType,
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
