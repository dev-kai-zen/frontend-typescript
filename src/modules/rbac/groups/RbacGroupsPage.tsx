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

import {
  createRbacGroup,
  deleteRbacGroup,
  fetchRbacGroups,
  updateRbacGroup,
} from "./rbac-groups-api";
import { getRbacApiErrorMessage } from "../permissions/rbac-api-errors";
import { RbacGroupFormDialog } from "./RbacGroupFormDialog";
import type { RbacGroupDto } from "./rbac-groups.types";

/**
 * RBAC — Permission groups (organizational buckets for permissions).
 *
 * **For junior developers**
 * - `rbac-groups.types.ts` — API DTOs
 * - `../api/rbac-groups-api.ts` — HTTP only
 * - `RbacGroupFormDialog.tsx` — create / rename form
 * - This file — list + actions
 *
 * Backend: `/api/v1/rbac/groups`
 */
export default function RbacGroupsPage() {
  const [rows, setRows] = useState<RbacGroupDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<RbacGroupDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RbacGroupDto | null>(null);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect -- intentional load gate */
    setError(null);
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      try {
        const list = await fetchRbacGroups();
        if (cancelled) return;
        setRows(list);
      } catch (err) {
        if (!cancelled) {
          setError(getRbacApiErrorMessage(err, "Failed to load RBAC groups"));
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

  const openEdit = (row: RbacGroupDto) => {
    setEditing(row);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: { groupName: string }) => {
    setError(null);
    try {
      if (formMode === "create") {
        await createRbacGroup({ groupName: values.groupName });
      } else if (editing) {
        await updateRbacGroup(editing.id, { groupName: values.groupName });
      }
      setFormOpen(false);
      setEditing(null);
      setRefreshNonce((n) => n + 1);
    } catch (err) {
      setError(
        getRbacApiErrorMessage(
          err,
          formMode === "create"
            ? "Failed to create group"
            : "Failed to update group",
        ),
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError(null);
    try {
      await deleteRbacGroup(deleteTarget.id);
      setDeleteTarget(null);
      setRefreshNonce((n) => n + 1);
    } catch (err) {
      setError(getRbacApiErrorMessage(err, "Failed to delete group"));
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
            RBAC groups
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Groups organize optional buckets for permissions. Deleting a group
            may set linked permissions’ <code>group_id</code> to null (backend
            rule).
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
            Add group
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
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      No groups yet. Create one to assign permissions.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.group_name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => openEdit(row)}
                      >
                        Rename
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

      <RbacGroupFormDialog
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
        <DialogTitle>Delete group?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This soft-deletes <strong>{deleteTarget?.group_name}</strong>.
            Permissions in this group may become ungrouped per server rules.
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
