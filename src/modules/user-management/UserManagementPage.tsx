import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

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
 * - `../users/users-api.ts` — REST for users
 * - `user-roles-api.ts` — PUT replaces all roles for a user
 * - `UserEditFormDialog.tsx` — email / name
 * - `UserRolesDialog.tsx` — checkbox matrix + save
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

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <div>
          <Typography variant="h5" component="h1" gutterBottom>
            User management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Edit profiles, deactivate accounts, assign RBAC roles, or remove
            users. Deactivate sets <code>is_active</code>; delete calls the
            server remove endpoint.
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => setRefreshNonce((n) => n + 1)}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error ? (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {loading ? <LinearProgress /> : null}

      <Card variant="outlined">
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role(s)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      No users returned by the API.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const roleLabels = rolesByUserId.get(row.id) ?? [];
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {row.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {row.full_name ?? "—"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        {roleLabels.length === 0 ? (
                          <Typography
                            variant="body2"
                            color="text.disabled"
                            component="span"
                          >
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
                        <Button
                          size="small"
                          startIcon={<VpnKeyIcon />}
                          onClick={() => setRolesTarget(row)}
                        >
                          Set roles
                        </Button>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => setEditTarget(row)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          startIcon={
                            row.is_active ? (
                              <BlockIcon />
                            ) : (
                              <CheckCircleOutlinedIcon />
                            )
                          }
                          color={row.is_active ? "warning" : "success"}
                          onClick={() => setActiveToggleTarget(row)}
                        >
                          {row.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => setDeleteTarget(row)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
