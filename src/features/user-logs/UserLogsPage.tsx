import GroupsIcon from "@mui/icons-material/Groups";
import RefreshIcon from "@mui/icons-material/Refresh";
import SubjectIcon from "@mui/icons-material/Subject";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";

import { RbacAdminSection } from "../../shared/components/rbac/RbacAdminSection";
import { RbacStatCard } from "../../shared/components/rbac/RbacStatCard";
import { getRbacApiErrorMessage } from "../rbac/permissions/rbac-api-errors";
import { fetchUserLogs } from "./user-logs-api";
import type { UserLogDto } from "./user-logs.types";

function formatJsonPreview(value: unknown, maxLen = 72): string {
  if (value === null || value === undefined) return "—";
  try {
    const s = JSON.stringify(value);
    if (s.length <= maxLen) return s;
    return `${s.slice(0, maxLen - 1)}…`;
  } catch {
    return String(value);
  }
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function statusChip(code: number | null | undefined) {
  if (code === null || code === undefined) {
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    );
  }
  if (code >= 500) {
    return (
      <Chip label={String(code)} size="small" color="error" variant="outlined" />
    );
  }
  if (code >= 400) {
    return (
      <Chip label={String(code)} size="small" color="warning" variant="outlined" />
    );
  }
  return (
    <Chip label={String(code)} size="small" color="success" variant="outlined" />
  );
}

/**
 * Administration — user activity logs (`GET /api/v1/user-logs`).
 *
 * **For junior developers**
 * - `user-logs.types.ts` — row + query types (response snake_case, query camelCase)
 * - `user-logs-api.ts` — GET with optional `userId`, `action`, `module`, `limit`, `offset`
 * - Backend caps `limit` at 200 and defaults to 50 when omitted
 */
export default function UserLogsPage() {
  const [rows, setRows] = useState<UserLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const [draftUserId, setDraftUserId] = useState("");
  const [draftAction, setDraftAction] = useState("");
  const [draftModule, setDraftModule] = useState("");
  const [appliedUserId, setAppliedUserId] = useState<number | undefined>(
    undefined,
  );
  const [appliedAction, setAppliedAction] = useState("");
  const [appliedModule, setAppliedModule] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const [detailRow, setDetailRow] = useState<UserLogDto | null>(null);

  const offset = page * rowsPerPage;

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect -- intentional load gate */
    setError(null);
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      try {
        const list = await fetchUserLogs({
          userId: appliedUserId,
          action: appliedAction.trim() || undefined,
          module: appliedModule.trim() || undefined,
          limit: rowsPerPage,
          offset,
        });
        if (cancelled) return;
        setRows(list);
        if (list.length === 0 && offset > 0) {
          setPage((p) => Math.max(0, p - 1));
        }
      } catch (err) {
        if (!cancelled) {
          setError(getRbacApiErrorMessage(err, "Failed to load user logs"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    refreshNonce,
    appliedUserId,
    appliedAction,
    appliedModule,
    rowsPerPage,
    offset,
  ]);

  const tableCount =
    rows.length === 0 && !loading
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

  const stats = useMemo(() => {
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
        setError("User ID must be a whole number or empty.");
        return;
      }
      setAppliedUserId(n);
    }
    setAppliedAction(draftAction.trim());
    setAppliedModule(draftModule.trim());
    setPage(0);
    setError(null);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
          User logs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Request and activity records (newest first). Filters map to{" "}
          <code>userId</code>, <code>action</code>, and <code>module</code> query
          parameters. KPIs below summarize the <strong>current page</strong> only.
        </Typography>
      </Box>

      {error ? (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {loading ? <LinearProgress /> : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RbacStatCard
            label="Rows (this page)"
            value={String(stats.pageRows)}
            tone="primary"
            icon={<SubjectIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RbacStatCard
            label="Distinct users"
            value={String(stats.distinctUsers)}
            tone="info"
            icon={<GroupsIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RbacStatCard
            label="Distinct actions"
            value={String(stats.distinctActions)}
            tone="secondary"
            icon={<SubjectIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RbacStatCard
            label="HTTP ≥400 on page"
            value={String(stats.errorStatuses)}
            tone="warning"
            icon={<WarningAmberIcon />}
          />
        </Grid>
      </Grid>

      <RbacAdminSection>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={2}
              sx={{
                flexWrap: "wrap",
                alignItems: { xs: "stretch", lg: "flex-end" },
              }}
            >
              <TextField
                label="User ID"
                size="small"
                value={draftUserId}
                onChange={(e) => setDraftUserId(e.target.value)}
                slotProps={{
                  htmlInput: { inputMode: "numeric", pattern: "[0-9]*" },
                }}
                sx={{ minWidth: 120 }}
              />
              <TextField
                label="Action"
                size="small"
                value={draftAction}
                onChange={(e) => setDraftAction(e.target.value)}
                sx={{ minWidth: 160 }}
              />
              <TextField
                label="Module"
                size="small"
                value={draftModule}
                onChange={(e) => setDraftModule(e.target.value)}
                sx={{ minWidth: 160 }}
              />
              <Button variant="contained" onClick={applyFilters}>
                Apply filters
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => setRefreshNonce((n) => n + 1)}
                disabled={loading}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </Box>

        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow
                sx={(theme) => ({
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(37, 52, 63, 0.06)",
                })}
              >
                <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Module</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Route</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Device</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Metadata</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Details
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No user log rows match this page or filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {row.created_at ? formatTimestamp(row.created_at) : "—"}
                    </TableCell>
                    <TableCell>
                      {row.user_id !== null && row.user_id !== undefined ? (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {row.user_id}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700 }}
                        color="primary"
                      >
                        {row.action}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.module ?? "—"}</TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "ui-monospace, monospace",
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={
                          row.method && row.route
                            ? `${row.method} ${row.route}`
                            : (row.route ?? undefined)
                        }
                      >
                        {row.method && row.route
                          ? `${row.method} ${row.route}`
                          : (row.route ?? "—")}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{statusChip(row.status_code)}</TableCell>
                    <TableCell sx={{ maxWidth: 160 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={
                          [row.device_type, row.browser, row.os]
                            .filter(Boolean)
                            .join(" · ") || undefined
                        }
                      >
                        {[row.device_type, row.browser, row.os]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "ui-monospace, monospace",
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={formatJsonPreview(row.metadata, 500)}
                      >
                        {formatJsonPreview(row.metadata)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View full entry">
                        <IconButton
                          size="small"
                          color="primary"
                          aria-label="View log entry"
                          onClick={() => setDetailRow(row)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          rowsPerPageOptions={[5, 10, 25, 50]}
          count={tableCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to, count }) =>
            rows.length === rowsPerPage
              ? `${from}–${to} of many`
              : `${from}–${to} of ${count}`
          }
        />
      </RbacAdminSection>

      <Dialog
        open={!!detailRow}
        onClose={() => setDetailRow(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>User log entry</DialogTitle>
        <DialogContent>
          {detailRow?.description ? (
            <Typography variant="body2" sx={{ mb: 2, mt: 0.5 }}>
              {detailRow.description}
            </Typography>
          ) : null}
          <Typography
            component="pre"
            sx={{
              m: 0,
              mt: 1,
              p: 2,
              bgcolor: "action.hover",
              borderRadius: 1,
              fontSize: 12,
              overflow: "auto",
              maxHeight: 480,
            }}
          >
            {detailJson}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailRow(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
