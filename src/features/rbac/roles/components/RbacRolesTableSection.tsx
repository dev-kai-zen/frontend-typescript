import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import GridOnIcon from "@mui/icons-material/GridOn";
import SecurityIcon from "@mui/icons-material/Security";
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ChangeEvent } from "react";
import { Link as RouterLink } from "react-router-dom";

import type { RbacRoleDto } from "../types/rbac-roles.types";

type Props = {
  pageSlice: RbacRoleDto[];
  filteredCount: number;
  loading: boolean;
  page: number;
  rowsPerPage: number;
  onPageChange: (_event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  toggleBusyRoleId: number | null;
  onToggleActive: (row: RbacRoleDto) => void;
  onEdit: (row: RbacRoleDto) => void;
  onDelete: (row: RbacRoleDto) => void;
};

export function RbacRolesTableSection({
  pageSlice,
  filteredCount,
  loading,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  toggleBusyRoleId,
  onToggleActive,
  onEdit,
  onDelete,
}: Props) {
  return (
    <>
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
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
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
                    No roles yet. Create a role here, then map permissions in the
                    matrix.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pageSlice.map((row) => {
                const isActive = row.is_active ?? true;
                return (
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
                    <TableCell width="10%">
                      <Chip
                        size="small"
                        label={isActive ? "Active" : "Inactive"}
                        color={isActive ? "success" : "default"}
                        variant={isActive ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell width="14%">
                      <Typography variant="body2" color="text.secondary">
                        {row.created_at
                          ? new Date(row.created_at).toLocaleDateString()
                          : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={isActive ? "Disable role" : "Enable role"}>
                        <span>
                          <IconButton
                            size="small"
                            color={isActive ? "warning" : "success"}
                            disabled={toggleBusyRoleId === row.id}
                            onClick={() => void onToggleActive(row)}
                          >
                            {isActive ? (
                              <BlockIcon fontSize="small" />
                            ) : (
                              <CheckCircleOutlinedIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Edit role">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEdit(row)}
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
                          onClick={() => onDelete(row)}
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
        count={filteredCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </>
  );
}
