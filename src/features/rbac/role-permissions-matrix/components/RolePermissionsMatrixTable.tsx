import CategoryIcon from "@mui/icons-material/Category";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Fragment } from "react";

import type { RbacRoleDto } from "../../roles/types/rbac-roles.types";
import type { CategoryBlock } from "../types/role-permissions-matrix.types";
import {
  opaqueStickyCategoryBg,
  stickyColShadow,
} from "../utils/role-permissions-matrix-table-theme";

type Props = {
  roles: RbacRoleDto[];
  categoryBlocks: CategoryBlock[];
  matrix: Record<number, number[]>;
  expandedKeys: string[];
  loading: boolean;
  saving: boolean;
  catalogLength: number;
  onToggleExpanded: (key: string) => void;
  onTogglePermission: (roleId: number, permissionId: number) => void;
  onSelectAllInCategory: (block: CategoryBlock, roleId: number) => void;
  categoryGrantedCount: (block: CategoryBlock, roleId: number) => number;
};

export function RolePermissionsMatrixTable({
  roles,
  categoryBlocks,
  matrix,
  expandedKeys,
  loading,
  saving,
  catalogLength,
  onToggleExpanded,
  onTogglePermission,
  onSelectAllInCategory,
  categoryGrantedCount,
}: Props) {
  const theme = useTheme();
  const catTint =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.primary.main, 0.12)
      : alpha(theme.palette.primary.main, 0.08);

  if (roles.length === 0 && !loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">
          No roles defined yet. Create roles under <strong>RBAC → Roles</strong>{" "}
          first.
        </Typography>
      </Box>
    );
  }

  if (categoryBlocks.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">
          {catalogLength === 0
            ? "No permissions in the catalog yet."
            : "No permissions match this search."}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer sx={{ maxHeight: "min(70vh, 640px)" }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={(t) => ({
                fontWeight: 700,
                minWidth: 280,
                position: "sticky",
                left: 0,
                zIndex: 6,
                bgcolor: t.palette.background.paper,
                borderRight: 1,
                borderColor: "divider",
                boxShadow: stickyColShadow(t),
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
                  sx={(t) => ({
                    position: "sticky",
                    left: 0,
                    zIndex: 5,
                    bgcolor: opaqueStickyCategoryBg(t),
                    borderRight: 1,
                    borderColor: "divider",
                    boxShadow: stickyColShadow(t),
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
                      onClick={() => onToggleExpanded(block.key)}
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
                  <TableCell key={role.id} align="center" sx={{ bgcolor: catTint }}>
                    <Tooltip title="Toggle all permissions in this category for this role">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onSelectAllInCategory(block, role.id)}
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
                        sx={(t) => ({
                          position: "sticky",
                          left: 0,
                          zIndex: 4,
                          bgcolor: t.palette.background.paper,
                          borderRight: 1,
                          borderColor: "divider",
                          pl: 5,
                          boxShadow: stickyColShadow(t),
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
                            <Typography variant="caption" color="text.secondary">
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
                                onTogglePermission(role.id, permission.id)
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
  );
}
