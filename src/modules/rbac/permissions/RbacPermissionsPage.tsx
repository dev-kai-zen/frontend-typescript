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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { fetchRbacGroups } from "../groups/rbac-groups-api";
import {
  createRbacPermission,
  deleteRbacPermission,
  fetchRbacPermissions,
  updateRbacPermission,
} from "./rbac-permissions-api";
import { RbacPermissionFormDialog } from "./RbacPermissionFormDialog";
import { getRbacApiErrorMessage } from "./rbac-api-errors";
import type { RbacGroupDto, RbacPermissionDto } from "./rbac-permissions.types";

const FILTER_ALL = "";
/** Client-only filter: backend has no `groupId=null` query; we fetch all and filter. */
const UNGROUPED_SENTINEL = "__ungrouped__";

/**
 * RBAC — Permissions admin surface.
 *
 * **Layout for juniors**
 * - `rbac-permissions.types.ts` — shapes shared with API + UI
 * - `../api/rbac-permissions-api.ts` — HTTP calls only (no React)
 * - `../api/rbac-groups-api.ts` — supporting data for filters / dropdown
 * - `RbacPermissionFormDialog.tsx` — reusable create/edit form
 * - This file — loads data, handles errors, opens dialogs
 *
 * Backend: `/api/v1/rbac/permissions` (+ optional `?groupId=`), `/api/v1/rbac/groups`
 */
export default function RbacPermissionsPage() {
  const [rows, setRows] = useState<RbacPermissionDto[]>([]);
  const [groups, setGroups] = useState<RbacGroupDto[]>([]);
  const [groupById, setGroupById] = useState<Map<number, string>>(
    () => new Map(),
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterGroupId, setFilterGroupId] = useState<string>(FILTER_ALL);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<RbacPermissionDto | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<RbacPermissionDto | null>(
    null,
  );

  /** Bumps to re-run the load effect without changing the filter (Refresh button). */
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    /* Data-fetch effect: loading/error state is tied to this async lifecycle. */
    /* eslint-disable react-hooks/set-state-in-effect -- intentional load gate */
    setError(null);
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      try {
        const groupList = await fetchRbacGroups();
        if (cancelled) return;
        setGroups(groupList);
        setGroupById(new Map(groupList.map((g) => [g.id, g.group_name])));

        let list: RbacPermissionDto[];
        if (filterGroupId === UNGROUPED_SENTINEL) {
          const all = await fetchRbacPermissions();
          if (cancelled) return;
          list = all.filter((r) => r.group_id == null);
        } else if (filterGroupId === FILTER_ALL) {
          list = await fetchRbacPermissions();
          if (cancelled) return;
        } else {
          const n = Number.parseInt(filterGroupId, 10);
          list = await fetchRbacPermissions(Number.isFinite(n) ? n : undefined);
          if (cancelled) return;
        }
        setRows(list);
      } catch (err) {
        if (!cancelled) {
          setError(
            getRbacApiErrorMessage(err, "Failed to load RBAC permissions"),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filterGroupId, refreshNonce]);

  const handleFilterChange = (e: SelectChangeEvent<string>) => {
    setFilterGroupId(e.target.value);
  };

  const openCreate = () => {
    setEditing(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEdit = (row: RbacPermissionDto) => {
    setEditing(row);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: {
    permissionCode: string;
    permissionDescription: string;
    groupId: number | null;
  }) => {
    setError(null);
    try {
      if (formMode === "create") {
        await createRbacPermission({
          permissionCode: values.permissionCode,
          permissionDescription: values.permissionDescription || null,
          groupId: values.groupId,
        });
      } else if (editing) {
        await updateRbacPermission(editing.id, {
          permissionDescription: values.permissionDescription || null,
          groupId: values.groupId,
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
            ? "Failed to create permission"
            : "Failed to update permission",
        ),
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError(null);
    try {
      await deleteRbacPermission(deleteTarget.id);
      setDeleteTarget(null);
      setRefreshNonce((n) => n + 1);
    } catch (err) {
      setError(getRbacApiErrorMessage(err, "Failed to delete permission"));
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
            Permissions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage permission codes linked to optional groups. Codes are used by
            the auth payload and route guards.
          </Typography>
        </div>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ flexWrap: "wrap", alignItems: "center" }}
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="perm-filter-group">Filter by group</InputLabel>
            <Select
              labelId="perm-filter-group"
              label="Filter by group"
              value={filterGroupId}
              onChange={handleFilterChange}
            >
              <MenuItem value={FILTER_ALL}>All groups</MenuItem>
              <MenuItem value={UNGROUPED_SENTINEL}>Ungrouped only</MenuItem>
              {groups.map((g) => (
                <MenuItem key={g.id} value={String(g.id)}>
                  {g.group_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            Add permission
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
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Group</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      No permissions match this filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.permission_code}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.permission_description ?? "—"}</TableCell>
                    <TableCell>
                      {row.group_id == null ? (
                        <Chip
                          size="small"
                          label="Ungrouped"
                          variant="outlined"
                        />
                      ) : (
                        (groupById.get(row.group_id) ??
                        `Group #${row.group_id}`)
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

      <RbacPermissionFormDialog
        open={formOpen}
        mode={formMode}
        initial={editing}
        groups={groups}
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
        <DialogTitle>Delete permission?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This soft-deletes <strong>{deleteTarget?.permission_code}</strong>{" "}
            in the database. Ensure no roles still require this code before
            deleting.
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
