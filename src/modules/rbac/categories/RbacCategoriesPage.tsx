import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
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
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useEffect, useMemo, useState } from "react";

import {
  createRbacCategory,
  deleteRbacCategory,
  fetchRbacCategories,
  updateRbacCategory,
} from "./rbac-categories-api";
import { getRbacApiErrorMessage } from "../permissions/rbac-api-errors";
import { fetchRbacPermissions } from "../permissions/rbac-permissions-api";
import type { RbacPermissionDto } from "../permissions/rbac-permissions.types";
import { RbacCategoryFormDialog } from "./RbacCategoryFormDialog";
import type { RbacCategoryDto } from "./rbac-categories.types";
import { RbacAdminSection } from "../components/RbacAdminSection";
import { RbacStatCard } from "../components/RbacStatCard";

/**
 * RBAC — Permission categories (organizational buckets for permissions).
 *
 * **For junior developers**
 * - `rbac-categories.types.ts` — API DTOs
 * - `./rbac-categories-api.ts` — HTTP only
 * - `RbacCategoryFormDialog.tsx` — create / rename form
 * - This file — card grid + actions
 *
 * Backend: `/api/v1/rbac/categories`
 */
export default function RbacCategoriesPage() {
  const [rows, setRows] = useState<RbacCategoryDto[]>([]);
  const [permissions, setPermissions] = useState<RbacPermissionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<RbacCategoryDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RbacCategoryDto | null>(null);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect -- intentional load gate */
    setError(null);
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      try {
        const [cats, perms] = await Promise.all([
          fetchRbacCategories(),
          fetchRbacPermissions(),
        ]);
        if (cancelled) return;
        setRows(cats);
        setPermissions(perms);
      } catch (err) {
        if (!cancelled) {
          setError(getRbacApiErrorMessage(err, "Failed to load RBAC categories"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshNonce]);

  const codesByCategoryId = useMemo(() => {
    const m = new Map<number, string[]>();
    for (const p of permissions) {
      if (p.category_id == null) continue;
      const list = m.get(p.category_id) ?? [];
      list.push(p.permission_code);
      m.set(p.category_id, list);
    }
    for (const [, list] of m) {
      list.sort((a, b) => a.localeCompare(b));
    }
    return m;
  }, [permissions]);

  const stats = useMemo(() => {
    const totalPerm = permissions.length;
    const avg =
      rows.length === 0
        ? "0"
        : String(Math.round(totalPerm / rows.length));
    return {
      categories: rows.length,
      permissions: totalPerm,
      avgPerCat: avg,
    };
  }, [rows.length, permissions.length]);

  const openCreate = () => {
    setEditing(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEdit = (row: RbacCategoryDto) => {
    setEditing(row);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: { categoryName: string }) => {
    setError(null);
    try {
      if (formMode === "create") {
        await createRbacCategory({ categoryName: values.categoryName });
      } else if (editing) {
        await updateRbacCategory(editing.id, { categoryName: values.categoryName });
      }
      setFormOpen(false);
      setEditing(null);
      setRefreshNonce((n) => n + 1);
    } catch (err) {
      setError(
        getRbacApiErrorMessage(
          err,
          formMode === "create"
            ? "Failed to create category"
            : "Failed to update category",
        ),
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError(null);
    try {
      await deleteRbacCategory(deleteTarget.id);
      setDeleteTarget(null);
      setRefreshNonce((n) => n + 1);
    } catch (err) {
      setError(getRbacApiErrorMessage(err, "Failed to delete category"));
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
          Permission categories
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Group permission codes into buckets. Deleting a category may leave linked
          permissions uncategorized (backend rule).
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
            Add category
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
            label="Categories"
            value={String(stats.categories)}
            tone="primary"
            icon={<CategoryIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <RbacStatCard
            label="Permissions"
            value={String(stats.permissions)}
            tone="info"
            icon={<LockOutlinedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <RbacStatCard
            label="Avg per category"
            value={stats.avgPerCat}
            tone="success"
            icon={<FolderOutlinedIcon />}
          />
        </Grid>
      </Grid>

      <RbacAdminSection>
        <Box sx={{ px: 2, py: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            All categories
          </Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          {rows.length === 0 && !loading ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              No categories yet. Create one, then attach permissions from the
              Permissions screen.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {rows.map((category) => {
                const codes = codesByCategoryId.get(category.id) ?? [];
                const preview = codes.slice(0, 4);
                const extra = codes.length - preview.length;
                return (
                  <Grid key={category.id} size={{ xs: 12, md: 6 }}>
                    <Card
                      elevation={0}
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        height: "100%",
                        transition: (theme) =>
                          theme.transitions.create(
                            ["border-color", "box-shadow"],
                            { duration: theme.transitions.duration.shortest },
                          ),
                        "&:hover": {
                          borderColor: "primary.main",
                          boxShadow: 2,
                        },
                      }}
                    >
                      <CardContent>
                        <Stack spacing={2}>
                          <Stack
                            direction="row"
                            sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
                          >
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                              <Box
                                sx={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 1.5,
                                  bgcolor: (theme) =>
                                    theme.palette.mode === "dark"
                                      ? "rgba(255, 155, 81, 0.15)"
                                      : "rgba(255, 155, 81, 0.2)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "primary.main",
                                }}
                              >
                                <CategoryIcon />
                              </Box>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                  {category.category_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID {category.id}
                                  {category.created_at
                                    ? ` · Created ${new Date(category.created_at).toLocaleDateString()}`
                                    : ""}
                                </Typography>
                              </Box>
                            </Stack>
                            <Chip
                              label={`${codes.length} permissions`}
                              size="small"
                              color="primary"
                            />
                          </Stack>

                          <Divider />

                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 700, display: "block", mb: 1 }}
                            >
                              Permission codes
                            </Typography>
                            {preview.length === 0 ? (
                              <Typography variant="body2" color="text.secondary">
                                No permissions in this category yet.
                              </Typography>
                            ) : (
                              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                                {preview.map((code) => (
                                  <Chip
                                    key={code}
                                    label={code}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      fontFamily: "ui-monospace, monospace",
                                      fontSize: "0.75rem",
                                    }}
                                  />
                                ))}
                                {extra > 0 ? (
                                  <Chip
                                    label={`+${extra} more`}
                                    size="small"
                                    variant="outlined"
                                    color="secondary"
                                  />
                                ) : null}
                              </Stack>
                            )}
                          </Box>

                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ justifyContent: "flex-end" }}
                          >
                            <Tooltip title="Rename category">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => openEdit(category)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete category">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteTarget(category)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </RbacAdminSection>

      <RbacCategoryFormDialog
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
        <DialogTitle>Delete category?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This soft-deletes <strong>{deleteTarget?.category_name}</strong>.
            Permissions in this category may become uncategorized per server rules.
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
