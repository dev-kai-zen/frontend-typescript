import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
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
import { useEffect, useMemo, useState } from "react";

import { RbacAdminSection } from "../rbac/components/RbacAdminSection";
import { RbacStatCard } from "../rbac/components/RbacStatCard";
import { getRbacApiErrorMessage } from "../rbac/permissions/rbac-api-errors";
import { fetchRbacRoles } from "../rbac/roles/rbac-roles-api";
import {
  deleteUserAdmin,
  fetchUsersForAdmin,
  updateUserAdmin,
  type UserListItemDto,
} from "./users-api";
import { UserEditFormDialog } from "./UserEditFormDialog";
import { UserRolesDialog } from "./UserRolesDialog";
import { fetchUserRoles } from "./user-roles-api";

/**
 * Administration — users: list, edit, activate/deactivate, RBAC roles, delete.
 *
 * **For juniors**
 * - `users-api.ts` — REST for users
 * - `user-roles-api.ts` — PUT replaces all roles for a user
 * - `UserEditFormDialog.tsx` — email / name
 * - `UserRolesDialog.tsx` — checkbox matrix + save
 *
 * Layout aligns with RBAC admin screens (stats row, bordered panel, search + table).
 */
export default function UserManagementPage() {
  const [rows, setRows] = useState<UserListItemDto[]>([]);
  /** Resolved role display names per user id (from RBAC links + role catalog). */
  const [rolesByUserId, setRolesByUserId] = useState<Map<number, string[]>>(
    () => new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [rolesTarget, setRolesTarget] = useState<UserListItemDto | null>(null);
  const [editTarget, setEditTarget] = useState<UserListItemDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserListItemDto | null>(
    null,
  );
  const [activeToggleTarget, setActiveToggleTarget] =
    useState<UserListItemDto | null>(null);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect -- load gate */
    setError(null);
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      try {
        const [list, catalog] = await Promise.all([
          fetchUsersForAdmin(),
          fetchRbacRoles(),
        ]);
        if (cancelled) return;
        setRows(list);

        const roleNameById = new Map(
          catalog.map((r) => [r.id, r.role_name] as const),
        );
        const linkLists = await Promise.all(
          list.map((u) => fetchUserRoles(u.id)),
        );
        if (cancelled) return;

        const next = new Map<number, string[]>();
        list.forEach((u, i) => {
          const names = linkLists[i]
            .map((l) => roleNameById.get(l.role_id) ?? `#${l.role_id}`)
            .sort((a, b) => a.localeCompare(b));
          next.set(u.id, names);
        });
        setRolesByUserId(next);
      } catch (err) {
        if (!cancelled) {
          setError(getRbacApiErrorMessage(err, "Failed to load users"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshNonce]);

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r) => r.is_active).length;
    const inactive = total - active;
    let withRoles = 0;
    for (const r of rows) {
      if ((rolesByUserId.get(r.id)?.length ?? 0) > 0) withRoles += 1;
    }
    return { total, active, inactive, withRoles };
  }, [rows, rolesByUserId]);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const roleStr =
        rolesByUserId.get(row.id)?.join(" ").toLowerCase() ?? "";
      return (
        row.email.toLowerCase().includes(q) ||
        (row.full_name?.toLowerCase().includes(q) ?? false) ||
        String(row.id).includes(q) ||
        roleStr.includes(q)
      );
    });
  }, [rows, rolesByUserId, searchTerm]);

  const pageSlice = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleEditSubmit = async (values: {
    email: string;
    fullName: string | null;
  }) => {
    if (!editTarget) return;
    setError(null);
    try {
      await updateUserAdmin(editTarget.id, {
        email: values.email,
        fullName: values.fullName,
      });
      setEditTarget(null);
      setRefreshNonce((n) => n + 1);
    } catch (err) {
      setError(getRbacApiErrorMessage(err, "Failed to update user"));
    }
  };

  const confirmActiveToggle = async () => {
    const u = activeToggleTarget;
    if (!u) return;
    setError(null);
    try {
      await updateUserAdmin(u.id, { isActive: !u.is_active });
      setActiveToggleTarget(null);
      setRefreshNonce((n) => n + 1);
    } catch (err) {
      setError(getRbacApiErrorMessage(err, "Failed to update account status"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError(null);
    try {
      await deleteUserAdmin(deleteTarget.id);
      setDeleteTarget(null);
      setRefreshNonce((n) => n + 1);
    } catch (err) {
      setError(getRbacApiErrorMessage(err, "Failed to delete user"));
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
          User management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Edit profiles, deactivate accounts, assign RBAC roles, or remove users.
          Deactivate sets <code>is_active</code>; delete calls the server remove
          endpoint.
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
            label="Total users"
            value={String(stats.total)}
            tone="primary"
            icon={<SupervisorAccountIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RbacStatCard
            label="Active"
            value={String(stats.active)}
            tone="success"
            icon={<CheckCircleOutlinedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RbacStatCard
            label="Inactive"
            value={String(stats.inactive)}
            tone="warning"
            icon={<PersonOffIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RbacStatCard
            label="With RBAC roles"
            value={String(stats.withRoles)}
            tone="info"
            icon={<VpnKeyIcon />}
          />
        </Grid>
      </Grid>

      <RbacAdminSection>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
            }}
          >
            <TextField
              size="small"
              placeholder="Search by email, name, id, or role…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ minWidth: { sm: 280 }, flex: { sm: 1 } }}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => setRefreshNonce((n) => n + 1)}
              disabled={loading}
              sx={{ flexShrink: 0 }}
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
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role(s)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageSlice.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      {rows.length === 0
                        ? "No users returned by the API."
                        : "No users match this search."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pageSlice.map((row) => {
                  const roleLabels = rolesByUserId.get(row.id) ?? [];
                  const initialSource =
                    row.full_name?.trim() || row.email || "?";
                  const initial = initialSource.charAt(0).toUpperCase();
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: "primary.main",
                              fontSize: "0.9rem",
                            }}
                          >
                            {initial}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700 }}
                              color="primary"
                            >
                              {row.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID {row.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" color="text.secondary">
                          {row.full_name ?? "—"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        {roleLabels.length === 0 ? (
                          <Typography variant="body2" color="text.disabled">
                            —
                          </Typography>
                        ) : (
                          <Stack
                            direction="row"
                            useFlexGap
                            sx={{ flexWrap: "wrap", gap: 0.5 }}
                          >
                            {roleLabels.map((name) => (
                              <Chip
                                key={`${row.id}-${name}`}
                                size="small"
                                label={name}
                                variant="outlined"
                                color="primary"
                              />
                            ))}
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.is_active ? (
                          <Chip
                            size="small"
                            color="success"
                            label="Active"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            size="small"
                            color="default"
                            label="Inactive"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Set RBAC roles">
                          <IconButton
                            size="small"
                            color="secondary"
                            aria-label="Set roles"
                            onClick={() => setRolesTarget(row)}
                          >
                            <VpnKeyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit profile">
                          <IconButton
                            size="small"
                            color="primary"
                            aria-label="Edit user"
                            onClick={() => setEditTarget(row)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={
                            row.is_active ? "Deactivate account" : "Activate account"
                          }
                        >
                          <IconButton
                            size="small"
                            color={row.is_active ? "warning" : "success"}
                            aria-label={
                              row.is_active ? "Deactivate user" : "Activate user"
                            }
                            onClick={() => setActiveToggleTarget(row)}
                          >
                            {row.is_active ? (
                              <BlockIcon fontSize="small" />
                            ) : (
                              <CheckCircleOutlinedIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete user">
                          <IconButton
                            size="small"
                            color="error"
                            aria-label="Delete user"
                            onClick={() => setDeleteTarget(row)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          rowsPerPageOptions={[5, 10, 25, 50]}
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </RbacAdminSection>

      <UserRolesDialog
        open={!!rolesTarget}
        user={rolesTarget}
        onClose={() => setRolesTarget(null)}
        onSaved={() => setRefreshNonce((n) => n + 1)}
      />

      <UserEditFormDialog
        open={!!editTarget}
        user={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={(v) => void handleEditSubmit(v)}
      />

      <Dialog
        open={!!activeToggleTarget}
        onClose={() => setActiveToggleTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {activeToggleTarget?.is_active
            ? "Deactivate user?"
            : "Activate user?"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {activeToggleTarget?.is_active ? (
              <>
                Deactivate <strong>{activeToggleTarget.email}</strong>? They
                should not be able to sign in while inactive (per your backend
                rules).
              </>
            ) : (
              <>
                Reactivate <strong>{activeToggleTarget?.email}</strong>?
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActiveToggleTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={activeToggleTarget?.is_active ? "warning" : "success"}
            onClick={() => void confirmActiveToggle()}
          >
            {activeToggleTarget?.is_active ? "Deactivate" : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete user?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Permanently remove <strong>{deleteTarget?.email}</strong>? This
            cannot be undone if the API hard-deletes the row.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void confirmDelete()}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
