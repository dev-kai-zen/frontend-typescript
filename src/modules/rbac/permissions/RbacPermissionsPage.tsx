import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from "@mui/icons-material/FilterList";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useEffect, useMemo, useState } from "react";

import { fetchRbacCategories } from "../categories/rbac-categories-api";
import {
  createRbacPermission,
  deleteRbacPermission,
  fetchRbacPermissions,
  updateRbacPermission,
} from "./rbac-permissions-api";
import { RbacPermissionFormDialog } from "./RbacPermissionFormDialog";
import { getRbacApiErrorMessage } from "./rbac-api-errors";
import type { RbacCategoryDto, RbacPermissionDto } from "./rbac-permissions.types";
import { RbacAdminSection } from "../components/RbacAdminSection";
import { RbacStatCard } from "../components/RbacStatCard";

const FILTER_ALL = "";
/** Client-only filter: backend has no `categoryId=null` query; we fetch all and filter. */
const UNCATEGORIZED_SENTINEL = "__uncategorized__";

/**
 * RBAC — Permissions admin surface.
 *
 * Backend: `/api/v1/rbac/permissions` (+ optional `?categoryId=`),
 * `/api/v1/rbac/categories`
 */
export default function RbacPermissionsPage() {
  const [rows, setRows] = useState<RbacPermissionDto[]>([]);
  const [categories, setCategories] = useState<RbacCategoryDto[]>([]);
  const [categoryById, setCategoryById] = useState<Map<number, string>>(
    () => new Map(),
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterCategoryId, setFilterCategoryId] = useState<string>(FILTER_ALL);
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
        const categoryList = await fetchRbacCategories();
        if (cancelled) return;
        setCategories(categoryList);
        setCategoryById(
          new Map(categoryList.map((c) => [c.id, c.category_name])),
        );

        let list: RbacPermissionDto[];
        if (filterCategoryId === UNCATEGORIZED_SENTINEL) {
          const all = await fetchRbacPermissions();
          if (cancelled) return;
          list = all.filter((r) => r.category_id == null);
        } else if (filterCategoryId === FILTER_ALL) {
          list = await fetchRbacPermissions();
          if (cancelled) return;
        } else {
          const n = Number.parseInt(filterCategoryId, 10);
          list = await fetchRbacPermissions(
            Number.isFinite(n) ? n : undefined,
          );
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
  }, [filterCategoryId, refreshNonce]);

  const handleFilterChange = (e: SelectChangeEvent<string>) => {
    setFilterCategoryId(e.target.value);
    setPage(0);
  };

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const cat =
        row.category_id == null
          ? ""
          : (categoryById.get(row.category_id) ?? "");
      return (
        row.permission_code.toLowerCase().includes(q) ||
        (row.permission_description?.toLowerCase().includes(q) ?? false) ||
        cat.toLowerCase().includes(q)
      );
    });
  }, [rows, searchTerm, categoryById]);

  const stats = useMemo(() => {
    const uncategorized = rows.filter((r) => r.category_id == null).length;
    const categorized = rows.filter((r) => r.category_id != null).length;
    return {
      inView: rows.length,
      uncategorized,
      categorized,
      categories: categories.length,
    };
  }, [rows, categories.length]);

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
    categoryId: number | null;
  }) => {
    setError(null);
    try {
      if (formMode === "create") {
        await createRbacPermission({
          permissionCode: values.permissionCode,
          permissionDescription: values.permissionDescription || null,
          categoryId: values.categoryId,
        });
      } else if (editing) {
        await updateRbacPermission(editing.id, {
          permissionDescription: values.permissionDescription || null,
          categoryId: values.categoryId,
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
          Permissions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage permission codes and optional categories. Codes flow into tokens and
          route guards.
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
            Add permission
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RbacStatCard
            label="In current filter"
            value={String(stats.inView)}
            tone="primary"
            icon={<LockOutlinedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RbacStatCard
            label="Categories defined"
            value={String(stats.categories)}
            tone="info"
            icon={<CategoryIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RbacStatCard
            label="Categorized (this view)"
            value={String(stats.categorized)}
            tone="success"
            icon={<CategoryIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RbacStatCard
            label="Uncategorized (this view)"
            value={String(stats.uncategorized)}
            tone="warning"
            icon={<FilterListIcon />}
          />
        </Grid>
      </Grid>

      <RbacAdminSection>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            sx={{
              alignItems: { xs: "stretch", lg: "center" },
              justifyContent: "space-between",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ flex: 1 }}
            >
              <TextField
                size="small"
                placeholder="Search code, description, category…"
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
                sx={{ minWidth: { sm: 280 }, flex: 1 }}
              />
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="perm-filter-category">Category</InputLabel>
                <Select
                  labelId="perm-filter-category"
                  label="Category"
                  value={filterCategoryId}
                  onChange={handleFilterChange}
                >
                  <MenuItem value={FILTER_ALL}>All categories</MenuItem>
                  <MenuItem value={UNCATEGORIZED_SENTINEL}>
                    Uncategorized only
                  </MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={String(c.id)}>
                      {c.category_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
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
                      No permissions match this filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pageSlice.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontFamily: "ui-monospace, monospace",
                          color: "primary.main",
                        }}
                      >
                        {row.permission_code}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 360 }}>
                      <Typography variant="body2" color="text.secondary">
                        {row.permission_description ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {row.category_id == null ? (
                        <Chip size="small" label="Uncategorized" variant="outlined" />
                      ) : (
                        <Chip
                          size="small"
                          icon={<CategoryIcon sx={{ fontSize: "18px !important" }} />}
                          label={
                            categoryById.get(row.category_id) ??
                            `Category #${row.category_id}`
                          }
                          variant="outlined"
                          color="primary"
                        />
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

      <RbacPermissionFormDialog
        open={formOpen}
        mode={formMode}
        initial={editing}
        categories={categories}
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
            This soft-deletes <strong>{deleteTarget?.permission_code}</strong> in the
            database. Ensure no roles still require this code before deleting.
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
