import CategoryIcon from "@mui/icons-material/Category";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
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
  InputAdornment,
} from "@mui/material";
import { alpha, useTheme, type Theme } from "@mui/material/styles";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import { fetchRbacCategories } from "../categories/services/rbac-categories-api";
import type { RbacCategoryDto } from "../categories/types/rbac-categories.types";
import { getRbacApiErrorMessage } from "../permissions/rbac-api-errors";
import { fetchRbacPermissions } from "../permissions/rbac-permissions-api";
import type { RbacPermissionDto } from "../permissions/rbac-permissions.types";
import { fetchRbacRoles } from "../roles/rbac-roles-api";
import type { RbacRoleDto } from "../roles/rbac-roles.types";
import { fetchRolePermissions, setRolePermissions } from "./rbac-role-permissions-api";
import { RbacAdminSection } from "../components/RbacAdminSection";

function cloneMatrix(src: Record<number, number[]>): Record<number, number[]> {
  const out: Record<number, number[]> = {};
  for (const [k, v] of Object.entries(src)) {
    out[Number(k)] = [...v];
  }
  return out;
}

function sortIds(ids: number[]): number[] {
  return [...ids].sort((a, b) => a - b);
}

function sortedIdsEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = sortIds(a);
  const sb = sortIds(b);
  return sa.every((v, i) => v === sb[i]);
}

type CategoryBlock = {
  key: string;
  title: string;
  permissions: RbacPermissionDto[];
};

/** Solid blend so sticky cells mask horizontally scrolled content (alpha tints bleed through). */
function opaqueStickyCategoryBg(theme: Theme): string {
  const paper = theme.palette.background.paper;
  const prim = theme.palette.primary.main;
  const pct = theme.palette.mode === "dark" ? "14%" : "10%";
  return `color-mix(in srgb, ${prim} ${pct}, ${paper})`;
}

const stickyColShadow = (theme: Theme) =>
  theme.palette.mode === "dark"
    ? "4px 0 14px rgba(0, 0, 0, 0.45)"
    : "4px 0 14px rgba(37, 52, 63, 0.12)";

/**
 * RBAC — Role × permission matrix (`PUT` replaces each changed role’s full set).
 *
 * **For junior developers**
 * - `rbac-role-permissions-api.ts` — GET links + PUT replace per role
 * - `../roles/rbac-roles-api.ts` — column headers
 * - `../permissions/rbac-permissions-api.ts` — row catalog
 *
 * Backend: `/api/v1/rbac/roles/:id/permissions`
 */
export default function RbacRolePermissionsPage() {
  const theme = useTheme();
  const catTint =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.primary.main, 0.12)
      : alpha(theme.palette.primary.main, 0.08);

  const [roles, setRoles] = useState<RbacRoleDto[]>([]);
  const [categories, setCategories] = useState<RbacCategoryDto[]>([]);
  const [catalog, setCatalog] = useState<RbacPermissionDto[]>([]);
  const [matrix, setMatrix] = useState<Record<number, number[]>>({});
  const [baseline, setBaseline] = useState<Record<number, number[]>>({});

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [roleList, permList, catList] = await Promise.all([
        fetchRbacRoles(),
        fetchRbacPermissions(),
        fetchRbacCategories(),
      ]);
      setRoles(roleList);
      setCatalog(permList);
      setCategories([...catList].sort((a, b) => a.id - b.id));

      const linksLists = await Promise.all(
        roleList.map((r) => fetchRolePermissions(r.id)),
      );
      const nextMatrix: Record<number, number[]> = {};
      roleList.forEach((r, i) => {
        nextMatrix[r.id] = sortIds(
          linksLists[i].map((l) => l.permission_id),
        );
      });
      setMatrix(nextMatrix);
      setBaseline(cloneMatrix(nextMatrix));

      const blocks: string[] = [];
      catList.forEach((c) => {
        if (permList.some((p) => p.category_id === c.id)) {
          blocks.push(`c:${c.id}`);
        }
      });
      if (permList.some((p) => p.category_id == null)) {
        blocks.push("uncategorized");
      }
      setExpandedKeys(blocks);
    } catch (err) {
      setError(
        getRbacApiErrorMessage(err, "Failed to load matrix data"),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- intentional load gate */
    void load();
  }, [load, refreshNonce]);

  const categoryBlocks: CategoryBlock[] = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const blocks: CategoryBlock[] = [];

    for (const c of categories) {
      let perms = catalog.filter((p) => p.category_id === c.id);
      if (q) {
        perms = perms.filter(
          (p) =>
            p.permission_code.toLowerCase().includes(q) ||
            (p.permission_description?.toLowerCase().includes(q) ?? false),
        );
      }
      if (perms.length > 0) {
        blocks.push({
          key: `c:${c.id}`,
          title: c.category_name,
          permissions: [...perms].sort((a, b) =>
            a.permission_code.localeCompare(b.permission_code),
          ),
        });
      }
    }

    let unc = catalog.filter((p) => p.category_id == null);
    if (q) {
      unc = unc.filter(
        (p) =>
          p.permission_code.toLowerCase().includes(q) ||
          (p.permission_description?.toLowerCase().includes(q) ?? false),
      );
    }
    if (unc.length > 0) {
      blocks.push({
        key: "uncategorized",
        title: "Uncategorized",
        permissions: [...unc].sort((a, b) =>
          a.permission_code.localeCompare(b.permission_code),
        ),
      });
    }

    return blocks;
  }, [categories, catalog, searchTerm]);

  const hasChanges = useMemo(() => {
    for (const r of roles) {
      const a = matrix[r.id] ?? [];
      const b = baseline[r.id] ?? [];
      if (!sortedIdsEqual(a, b)) return true;
    }
    return false;
  }, [roles, matrix, baseline]);

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const togglePermission = (roleId: number, permissionId: number) => {
    setMatrix((prev) => {
      const cur = prev[roleId] ?? [];
      const has = cur.includes(permissionId);
      const nextIds = has
        ? cur.filter((id) => id !== permissionId)
        : [...cur, permissionId];
      return { ...prev, [roleId]: sortIds(nextIds) };
    });
  };

  const selectAllInCategory = (
    block: CategoryBlock,
    roleId: number,
  ) => {
    const ids = block.permissions.map((p) => p.id);
    setMatrix((prev) => {
      const cur = prev[roleId] ?? [];
      const allOn = ids.every((id) => cur.includes(id));
      const nextIds = allOn
        ? cur.filter((id) => !ids.includes(id))
        : sortIds([...new Set([...cur, ...ids])]);
      return { ...prev, [roleId]: nextIds };
    });
  };

  const categoryGrantedCount = (block: CategoryBlock, roleId: number) => {
    const cur = matrix[roleId] ?? [];
    const ids = block.permissions.map((p) => p.id);
    return ids.filter((id) => cur.includes(id)).length;
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      for (const r of roles) {
        const a = matrix[r.id] ?? [];
        const b = baseline[r.id] ?? [];
        if (!sortedIdsEqual(a, b)) {
          await setRolePermissions(r.id, a);
        }
      }
      setBaseline(cloneMatrix(matrix));
    } catch (err) {
      setError(
        getRbacApiErrorMessage(err, "Failed to save permission matrix"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetLocal = () => {
    setMatrix(cloneMatrix(baseline));
  };

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
            Role permission matrix
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Toggle intersections to grant permissions to roles. Saving writes only
            roles you changed.
          </Typography>
        </Box>
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
            disabled={loading || saving}
          >
            Reload
          </Button>
          <Button
            variant="outlined"
            onClick={handleResetLocal}
            disabled={loading || saving || !hasChanges}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => void handleSave()}
            disabled={loading || saving || !hasChanges || roles.length === 0}
          >
            Save changes
          </Button>
        </Stack>
      </Box>

      {error ? (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {hasChanges ? (
        <Alert severity="warning">
          Unsaved changes — save to persist updates for each affected role.
        </Alert>
      ) : null}

      {loading ? <LinearProgress /> : null}

      <RbacAdminSection sx={{ opacity: loading ? 0.6 : 1 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <TextField
            size="small"
            placeholder="Search permissions…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: { xs: "100%", sm: 360 } }}
          />
        </Box>

        {roles.length === 0 && !loading ? (
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">
              No roles defined yet. Create roles under{" "}
              <strong>RBAC → Roles</strong> first.
            </Typography>
          </Box>
        ) : categoryBlocks.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">
              {catalog.length === 0
                ? "No permissions in the catalog yet."
                : "No permissions match this search."}
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: "min(70vh, 640px)" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={(theme) => ({
                      fontWeight: 700,
                      minWidth: 280,
                      position: "sticky",
                      left: 0,
                      zIndex: 6,
                      bgcolor: theme.palette.background.paper,
                      borderRight: 1,
                      borderColor: "divider",
                      boxShadow: stickyColShadow(theme),
                    })}
                  >
                    Permission
                  </TableCell>
                  {roles.map((role) => (
                    <TableCell
                      key={role.id}
                      align="center"
                      sx={{
                        fontWeight: 700,
                        minWidth: 132,
                        verticalAlign: "bottom",
                        bgcolor: (t) =>
                          t.palette.mode === "dark"
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(37, 52, 63, 0.06)",
                      }}
                    >
                      <Stack spacing={0.75} sx={{ alignItems: "center" }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {role.role_name}
                        </Typography>
                        <Chip
                          label={`${(matrix[role.id] ?? []).length} selected`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Stack>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {categoryBlocks.map((block) => (
                  <Fragment key={block.key}>
                    <TableRow
                      sx={{
                        bgcolor: catTint,
                        "&:hover": { bgcolor: catTint },
                      }}
                    >
                      <TableCell
                        sx={(theme) => ({
                          position: "sticky",
                          left: 0,
                          zIndex: 5,
                          bgcolor: opaqueStickyCategoryBg(theme),
                          borderRight: 1,
                          borderColor: "divider",
                          boxShadow: stickyColShadow(theme),
                        })}
                      >
                        <Stack direction="row" sx={{ alignItems: "center" }} spacing={0.5}>
                          <IconButton
                            size="small"
                            aria-label={
                              expandedKeys.includes(block.key)
                                ? "Collapse category"
                                : "Expand category"
                            }
                            onClick={() => toggleExpanded(block.key)}
                          >
                            {expandedKeys.includes(block.key) ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </IconButton>
                          <CategoryIcon color="primary" fontSize="small" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {block.title}
                          </Typography>
                          <Chip
                            label={block.permissions.length}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      </TableCell>
                      {roles.map((role) => (
                        <TableCell
                          key={role.id}
                          align="center"
                          sx={{ bgcolor: catTint }}
                        >
                          <Tooltip title="Toggle all permissions in this category for this role">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                selectAllInCategory(block, role.id)
                              }
                              disabled={loading || saving}
                            >
                              {categoryGrantedCount(block, role.id)}/
                              {block.permissions.length}
                            </Button>
                          </Tooltip>
                        </TableCell>
                      ))}
                    </TableRow>

                    {expandedKeys.includes(block.key)
                      ? block.permissions.map((permission) => (
                          <TableRow hover key={permission.id}>
                            <TableCell
                              sx={(theme) => ({
                                position: "sticky",
                                left: 0,
                                zIndex: 4,
                                bgcolor: theme.palette.background.paper,
                                borderRight: 1,
                                borderColor: "divider",
                                pl: 5,
                                boxShadow: stickyColShadow(theme),
                              })}
                            >
                              <Stack spacing={0.25}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: "ui-monospace, monospace",
                                    fontWeight: 600,
                                  }}
                                >
                                  {permission.permission_code}
                                </Typography>
                                {permission.permission_description ? (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {permission.permission_description}
                                  </Typography>
                                ) : null}
                              </Stack>
                            </TableCell>
                            {roles.map((role) => {
                              const checked = (matrix[role.id] ?? []).includes(
                                permission.id,
                              );
                              return (
                                <TableCell key={role.id} align="center">
                                  <Checkbox
                                    checked={checked}
                                    disabled={loading || saving}
                                    onChange={() =>
                                      togglePermission(role.id, permission.id)
                                    }
                                    color="primary"
                                    icon={
                                      <Box
                                        sx={{
                                          width: 20,
                                          height: 20,
                                          border: 2,
                                          borderColor: "divider",
                                          borderRadius: 0.5,
                                        }}
                                      />
                                    }
                                    checkedIcon={
                                      <CheckCircleIcon
                                        sx={{
                                          fontSize: 24,
                                          color: "success.main",
                                        }}
                                      />
                                    }
                                  />
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))
                      : null}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Paper
          elevation={0}
          square
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: (t) =>
              t.palette.mode === "dark"
                ? "rgba(255,255,255,0.04)"
                : "rgba(37, 52, 63, 0.05)",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, display: "block", mb: 1 }}
          >
            Legend
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <CheckCircleIcon sx={{ fontSize: 22, color: "success.main" }} />
              <Typography variant="caption">Granted</Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  border: 2,
                  borderColor: "divider",
                  borderRadius: 0.5,
                }}
              />
              <Typography variant="caption">Not granted</Typography>
            </Stack>
          </Stack>
        </Paper>
      </RbacAdminSection>
    </Stack>
  );
}
