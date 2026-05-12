import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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

import { getRbacApiErrorMessage } from "../permissions/rbac-api-errors";
import {
  createRbacRole,
  deleteRbacRole,
  fetchRbacRoles,
  updateRbacRole,
} from "./rbac-roles-api";
import { RbacRoleFormDialog } from "./RbacRoleFormDialog";
import type { RbacRoleDto } from "./rbac-roles.types";

/**
 * RBAC — Roles (named bundles of permissions).
 *
 * **For junior developers**
 * - `rbac-roles.types.ts` — role DTOs
 * - `rbac-roles-api.ts` — CRUD on `/api/v1/rbac/roles`
 * - `RbacRoleFormDialog.tsx` — create / edit metadata
 * - Assign permissions per role on **Role permissions** (`RbacRolePermissionsPage`)
 * - This file — table + wiring
 *
 * Backend: `/api/v1/rbac/roles`
 */
export default function RbacRolesPage() {
  const [rows, setRows] = useState<RbacRoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<RbacRoleDto | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<RbacRoleDto | null>(null);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect -- intentional load gate */
    setError(null);
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      try {
        const list = await fetchRbacRoles();
        if (cancelled) return;
        setRows(list);
      } catch (err) {
        if (!cancelled) {
          setError(getRbacApiErrorMessage(err, "Failed to load RBAC roles"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshNonce]);

  const openCreate = () => {
    setEditing(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEdit = (row: RbacRoleDto) => {
    setEditing(row);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: {
    roleName: string;
    roleDescription: string | null;
  }) => {
    setError(null);
    try {
      if (formMode === "create") {
        await createRbacRole({
          roleName: values.roleName,
          roleDescription: values.roleDescription,
        });
      } else if (editing) {
        await updateRbacRole(editing.id, {
          roleName: values.roleName,
          roleDescription: values.roleDescription,
        });
      }
      setFormOpen(false);
      setEditing(null);
      setRefreshNonce((n) => n + 1);
    } catch (err) {
      setError(
        getRbacApiErrorMessage(
          err,
          formMode === "create"
            ? "Failed to create role"
            : "Failed to update role",
        ),
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError(null);
    try {
      await deleteRbacRole(deleteTarget.id);
      setDeleteTarget(null);
      setRefreshNonce((n) => n + 1);
    } catch (err) {
      setError(getRbacApiErrorMessage(err, "Failed to delete role"));
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
            RBAC roles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Roles group permissions for assignment to users. Map permissions to
            roles under <strong>RBAC → Role permissions</strong>. Deleting a role
            soft-deletes it.
          </Typography>
        </div>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ flexWrap: "wrap", alignItems: "center" }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => setRefreshNonce((n) => n + 1)}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
          >
            Add role
          </Button>
        </Stack>
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
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      No roles yet. Create a role here, then map permissions under
                      RBAC → Role permissions.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.role_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {row.role_description ? (
                        <Typography variant="body2" color="text.secondary">
                          {row.role_description}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => openEdit(row)}
                      >
                        Edit
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RbacRoleFormDialog
        open={formOpen}
        mode={formMode}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={(values) => void handleFormSubmit(values)}
      />

      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete role?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This soft-deletes <strong>{deleteTarget?.role_name}</strong>. User
            assignments may need cleanup separately.
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
