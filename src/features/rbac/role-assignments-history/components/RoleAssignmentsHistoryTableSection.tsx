import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SecurityIcon from "@mui/icons-material/Security";
import {
  Avatar,
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import type { ChangeEvent } from "react";

import type { RoleAssignmentRow } from "../types/role-assignments-history.types";

type Props = {
  pageSlice: RoleAssignmentRow[];
  filteredCount: number;
  loading: boolean;
  page: number;
  rowsPerPage: number;
  onPageChange: (_event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function RoleAssignmentsHistoryTableSection({
  pageSlice,
  filteredCount,
  loading,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
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
              <TableCell sx={{ fontWeight: 700 }}>Assigned at</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Action
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Assigned by</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageSlice.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No assignments match this filter.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pageSlice.map((r) => (
                <TableRow key={`${r.linkId}-${r.userId}-${r.roleId}`} hover>
                  <TableCell width="18%">
                    <Typography variant="body2" color="text.secondary">
                      {r.assignedAtLabel}
                    </Typography>
                  </TableCell>
                  <TableCell width="22%">
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: "primary.main",
                          fontSize: "0.85rem",
                        }}
                      >
                        {(r.userName ?? r.userEmail).charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {r.userName ?? r.userEmail}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {r.userEmail}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell width="16%">
                    <Chip
                      icon={<SecurityIcon sx={{ fontSize: "18px !important" }} />}
                      label={r.roleName}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center" width="12%">
                    <Chip
                      icon={<PersonAddIcon sx={{ fontSize: "18px !important" }} />}
                      label="Assigned"
                      size="small"
                      color="success"
                    />
                  </TableCell>
                  <TableCell width="20%">
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Avatar
                        sx={{
                          width: 26,
                          height: 26,
                          fontSize: "0.7rem",
                          bgcolor: "secondary.main",
                        }}
                      >
                        {r.assignedByLabel.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">{r.assignedByLabel}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center" width="12%">
                    <Chip label="Active" size="small" color="success" />
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
        count={filteredCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </>
  );
}
