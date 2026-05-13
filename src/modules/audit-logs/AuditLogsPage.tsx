import CategoryIcon from "@mui/icons-material/Category";
import RefreshIcon from "@mui/icons-material/Refresh";
import SubjectIcon from "@mui/icons-material/Subject";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DifferenceIcon from "@mui/icons-material/Difference";
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
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useEffect, useMemo, useState } from "react";

import { RbacAdminSection } from "../rbac/components/RbacAdminSection";
import { RbacStatCard } from "../rbac/components/RbacStatCard";
import { getRbacApiErrorMessage } from "../rbac/permissions/rbac-api-errors";
import { fetchAuditLogs } from "./audit-logs-api";
import type { AuditLogDto } from "./audit-logs.types";

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

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const;

/**
 * Administration — audit trail (read-only list from `/api/v1/audit-logs`).
 *
 * **For junior developers**
 * - `audit-logs.types.ts` — log row DTOs
 * - `audit-logs-api.ts` — GET with optional `action`, `entity_type`, `limit`, `offset`
 * - Backend caps `limit` at 200 and defaults to 50 when omitted
 */
export default function AuditLogsPage() {
  const [rows, setRows] = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const [draftAction, setDraftAction] = useState("");
  const [draftEntityType, setDraftEntityType] = useState("");
  const [appliedAction, setAppliedAction] = useState("");
  const [appliedEntityType, setAppliedEntityType] = useState("");

  const [pageSize, setPageSize] = useState<number>(50);
  const [pageIndex, setPageIndex] = useState(0);

  const [detailRow, setDetailRow] = useState<AuditLogDto | null>(null);

  const offset = pageIndex * pageSize;

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect -- intentional load gate */
    setError(null);
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      try {
        const list = await fetchAuditLogs({
          action: appliedAction.trim() || undefined,
          entity_type: appliedEntityType.trim() || undefined,
          limit: pageSize,
          offset,
        });
        if (cancelled) return;
        setRows(list);
      } catch (err) {
        if (!cancelled) {
          setError(getRbacApiErrorMessage(err, "Failed to load audit logs"));
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
    appliedAction,
    appliedEntityType,
    pageSize,
    offset,
  ]);

  const canGoPrev = pageIndex > 0;
  const canGoNext = rows.length === pageSize;

  const stats = useMemo(() => {
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
    setPageIndex(0);
    setError(null);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
          Audit logs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Immutable-style trail of changes (newest first). Filter by action or
          entity type; pagination uses limit and offset on the server. KPIs summarize
          the <strong>current page</strong> only.
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
            label="Distinct actions"
            value={String(stats.distinctActions)}
            tone="info"
            icon={<DifferenceIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RbacStatCard
            label="Entity types"
            value={String(stats.distinctEntities)}
            tone="secondary"
            icon={<CategoryIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RbacStatCard
            label="With change fields"
            value={String(stats.withFieldChanges)}
            tone="success"
            icon={<DifferenceIcon />}
          />
        </Grid>
      </Grid>

      <RbacAdminSection>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              flexWrap: "wrap",
              alignItems: { xs: "stretch", sm: "flex-end" },
            }}
          >
            <TextField
              label="Action"
              size="small"
              value={draftAction}
              onChange={(e) => setDraftAction(e.target.value)}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label="Entity type"
              size="small"
              value={draftEntityType}
              onChange={(e) => setDraftEntityType(e.target.value)}
              sx={{ minWidth: 180 }}
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
                <TableCell sx={{ fontWeight: 700 }}>Entity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Entity ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Changed fields</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Old (preview)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>New (preview)</TableCell>
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
                      No audit rows match this page or filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatTimestamp(row.timestamp)}
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
                    <TableCell>
                      <Chip
                        label={row.entity_type}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell>
                      {row.entity_id ?? (
                        <Typography variant="body2" color="text.disabled">
                          —
                        </Typography>
                      )}
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
                        title={
                          row.change_fields?.length
                            ? row.change_fields.join(", ")
                            : undefined
                        }
                      >
                        {row.change_fields?.length
                          ? row.change_fields.join(", ")
                          : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "ui-monospace, monospace",
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={formatJsonPreview(row.old_values, 500)}
                      >
                        {formatJsonPreview(row.old_values)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "ui-monospace, monospace",
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={formatJsonPreview(row.new_values, 500)}
                      >
                        {formatJsonPreview(row.new_values)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View full entry">
                        <IconButton
                          size="small"
                          color="primary"
                          aria-label="View audit entry"
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

        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Page {pageIndex + 1}
            {rows.length === 0 && !loading ? " · empty" : ""}
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            sx={{ flexWrap: "wrap", alignItems: "center" }}
          >
            <TextField
              select
              label="Rows per page"
              size="small"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(0);
              }}
              sx={{ minWidth: 140 }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                disabled={!canGoPrev || loading}
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                disabled={!canGoNext || loading}
                onClick={() => setPageIndex((p) => p + 1)}
              >
                Next
              </Button>
            </Stack>
          </Stack>
        </Box>
      </RbacAdminSection>

      <Dialog
        open={!!detailRow}
        onClose={() => setDetailRow(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Audit entry</DialogTitle>
        <DialogContent>
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
