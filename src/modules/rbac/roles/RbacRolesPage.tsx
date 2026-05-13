import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import GridOnIcon from "@mui/icons-material/GridOn";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import SecurityIcon from "@mui/icons-material/Security";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { Link as RouterLink } from "react-router-dom";

import { getRbacApiErrorMessage } from "../permissions/rbac-api-errors";
import { fetchRbacPermissions } from "../permissions/rbac-permissions-api";
import {
  createRbacRole,
  deleteRbacRole,
  fetchRbacRoles,
  updateRbacRole,
} from "./rbac-roles-api";
import { RbacRoleFormDialog } from "./RbacRoleFormDialog";
import type { RbacRoleDto } from "./rbac-roles.types";
import { RbacAdminSection } from "../components/RbacAdminSection";
import { RbacStatCard } from "../components/RbacStatCard";

/**
 * RBAC — Roles (named bundles of permissions).
 *
 * **For junior developers**
 * - `rbac-roles.types.ts` — role DTOs
 * - `rbac-roles-api.ts` — CRUD on `/api/v1/rbac/roles`
 * - `RbacRoleFormDialog.tsx` — create / edit metadata
 * - Map permissions for all roles on **Role permission matrix**
 *
 * Backend: `/api/v1/rbac/roles`
 */
export default function RbacRolesPage() {
  const [rows, setRows] = useState<RbacRoleDto[]>([]);
  const [permissionCount, setPermissionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
        const [roleList, perms] = await Promise.all([
          fetchRbacRoles(),
          fetchRbacPermissions(),
        ]);
        if (cancelled) return;
        setRows(roleList);
        setPermissionCount(perms.length);
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

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.role_name.toLowerCase().includes(q) ||
        (r.role_description?.toLowerCase().includes(q) ?? false),
    );
  }, [rows, searchTerm]);

  const stats = useMemo(() => {
    const withDesc = rows.filter((r) => !!r.role_description?.trim()).length;
    return {
      roles: rows.length,
      permissions: permissionCount,
      withDesc,
    };
  }, [rows, permissionCount]);

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

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const pageSlice = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
          Roles
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Roles group permissions for assignment to users. Use the{" "}
          <strong>Role permission matrix</strong> to attach permission codes.
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
        }}
      >
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
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add role
          </Button>
        </Stack>
      </Stack>

      {error ? (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {loading ? <LinearProgress /> : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <RbacStatCard
            label="Roles"
            value={String(stats.roles)}
            tone="primary"
            icon={<SecurityIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <RbacStatCard
            label="Permissions in catalog"
            value={String(stats.permissions)}
            tone="info"
            icon={<LockOutlinedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <RbacStatCard
            label="Roles with description"
            value={String(stats.withDesc)}
            tone="success"
            icon={<SecurityIcon />}
          />
        </Grid>
      </Grid>

      <RbacAdminSection>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <TextField
            size="small"
            placeholder="Search roles…"
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
            sx={{ maxWidth: { sm: 360 } }}
          />
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
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageSlice.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No roles yet. Create a role here, then map permissions in the
                      matrix.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pageSlice.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255, 155, 81, 0.15)"
                                : "rgba(255, 155, 81, 0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "primary.main",
                          }}
                        >
                          <SecurityIcon fontSize="small" />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {row.role_name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 420 }}>
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
                    <TableCell width="14%">
                      <Typography variant="body2" color="text.secondary">
                        {row.created_at
                          ? new Date(row.created_at).toLocaleDateString()
                          : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit role">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openEdit(row)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Open permission matrix">
                        <IconButton
                          size="small"
                          color="secondary"
                          component={RouterLink}
                          to="/admin/rbac/role-permissions"
                        >
                          <GridOnIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete role">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTarget(row)}
                        >
                          <DeleteIcon fontSize="small" />
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
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </RbacAdminSection>

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
          <Button color="error" variant="contained" onClick={() => void confirmDelete()}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
