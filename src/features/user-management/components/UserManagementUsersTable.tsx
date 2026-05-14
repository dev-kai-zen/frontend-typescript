import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import {
  Avatar,
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
import Box from "@mui/material/Box";
import type { ChangeEvent } from "react";

import type { UserListItemDto } from "../types/users.types";

export type UserManagementUsersTableProps = {
  pageSlice: UserListItemDto[];
  filteredRowCount: number;
  totalRowCount: number;
  loading: boolean;
  rolesByUserId: Record<number, string[]>;
  page: number;
  rowsPerPage: number;
  onPageChange: (_event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenRoles: (row: UserListItemDto) => void;
  onOpenEdit: (row: UserListItemDto) => void;
  onOpenActiveToggle: (row: UserListItemDto) => void;
  onOpenDelete: (row: UserListItemDto) => void;
};

export function UserManagementUsersTable({
  pageSlice,
  filteredRowCount,
  totalRowCount,
  loading,
  rolesByUserId,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onOpenRoles,
  onOpenEdit,
  onOpenActiveToggle,
  onOpenDelete,
}: UserManagementUsersTableProps) {
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
              <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role(s)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
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
                    {totalRowCount === 0
                      ? "No users returned by the API."
                      : "No users match this search."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pageSlice.map((row) => {
                const roleLabels = rolesByUserId[row.id] ?? [];
                const initialSource =
                  row.full_name?.trim() || row.email || "?";
                const initial = initialSource.charAt(0).toUpperCase();
                return (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: "primary.main",
                            fontSize: "0.9rem",
                          }}
                        >
                          {initial}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700 }}
                            color="primary"
                          >
                            {row.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" color="text.secondary">
                        {row.full_name ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      {roleLabels.length === 0 ? (
                        <Typography variant="body2" color="text.disabled">
                          —
                        </Typography>
                      ) : (
                        <Stack
                          direction="row"
                          useFlexGap
                          sx={{ flexWrap: "wrap", gap: 0.5 }}
                        >
                          {roleLabels.map((name) => (
                            <Chip
                              key={`${row.id}-${name}`}
                              size="small"
                              label={name}
                              variant="outlined"
                              color="primary"
                            />
                          ))}
                        </Stack>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.is_active ? (
                        <Chip
                          size="small"
                          color="success"
                          label="Active"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          size="small"
                          color="default"
                          label="Inactive"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Set RBAC roles">
                        <IconButton
                          size="small"
                          color="secondary"
                          aria-label="Set roles"
                          onClick={() => onOpenRoles(row)}
                        >
                          <VpnKeyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit profile">
                        <IconButton
                          size="small"
                          color="primary"
                          aria-label="Edit user"
                          onClick={() => onOpenEdit(row)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={
                          row.is_active ? "Deactivate account" : "Activate account"
                        }
                      >
                        <IconButton
                          size="small"
                          color={row.is_active ? "warning" : "success"}
                          aria-label={
                            row.is_active ? "Deactivate user" : "Activate user"
                          }
                          onClick={() => onOpenActiveToggle(row)}
                        >
                          {row.is_active ? (
                            <BlockIcon fontSize="small" />
                          ) : (
                            <CheckCircleOutlinedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete user">
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="Delete user"
                          onClick={() => onOpenDelete(row)}
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
        count={filteredRowCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </>
  );
}
