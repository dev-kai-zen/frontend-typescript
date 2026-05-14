import BlockIcon from "@mui/icons-material/Block";
import CategoryIcon from "@mui/icons-material/Category";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Chip,
  IconButton,
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

import type { RbacPermissionDto } from "../types/rbac-permissions.types";

type Props = {
  pageSlice: RbacPermissionDto[];
  categoryById: Map<number, string>;
  filteredCount: number;
  loading: boolean;
  saving: boolean;
  page: number;
  rowsPerPage: number;
  toggleBusyPermissionId: number | null;
  onPageChange: (_event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onToggleActive: (row: RbacPermissionDto) => void;
  onEdit: (row: RbacPermissionDto) => void;
  onDelete: (row: RbacPermissionDto) => void;
};

export function PermissionsTableSection({
  pageSlice,
  categoryById,
  filteredCount,
  loading,
  saving,
  page,
  rowsPerPage,
  toggleBusyPermissionId,
  onPageChange,
  onRowsPerPageChange,
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
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageSlice.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No permissions match this filter.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pageSlice.map((row) => {
                const isActive = row.is_active ?? true;
                return (
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
                    <TableCell width="10%">
                      <Chip
                        size="small"
                        label={isActive ? "Active" : "Inactive"}
                        color={isActive ? "success" : "default"}
                        variant={isActive ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip
                        title={isActive ? "Disable permission" : "Enable permission"}
                      >
                        <span>
                          <IconButton
                            size="small"
                            color={isActive ? "warning" : "success"}
                            disabled={
                              toggleBusyPermissionId === row.id || saving
                            }
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
                      <Tooltip title="Edit permission">
                        <IconButton
                          size="small"
                          color="primary"
                          disabled={saving}
                          onClick={() => onEdit(row)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete permission">
                        <IconButton
                          size="small"
                          color="error"
                          disabled={saving}
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
