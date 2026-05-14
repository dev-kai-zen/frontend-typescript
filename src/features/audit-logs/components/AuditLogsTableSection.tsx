import VisibilityIcon from "@mui/icons-material/Visibility";
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
import { type ChangeEvent } from "react";

import type { AuditLogDto } from "../types/audit-logs.types";
import { formatJsonPreview, formatTimestamp } from "../utils/audit-logs-format";

type Props = {
  rows: AuditLogDto[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  tableCount: number;
  onPageChange: (_event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenDetail: (row: AuditLogDto) => void;
};

export function AuditLogsTableSection({
  rows,
  loading,
  page,
  rowsPerPage,
  tableCount,
  onPageChange,
  onRowsPerPageChange,
  onOpenDetail,
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
              <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Entity</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Entity ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Changed fields</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Old (preview)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>New (preview)</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Details
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No audit rows match this page or filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatTimestamp(row.timestamp)}
                  </TableCell>
                  <TableCell>
                    {row.user_id !== null && row.user_id !== undefined ? (
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.user_id}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700 }}
                      color="primary"
                    >
                      {row.action}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.entity_type}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  </TableCell>
                  <TableCell>
                    {row.entity_id ?? (
                      <Typography variant="body2" color="text.disabled">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "ui-monospace, monospace",
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={
                        row.change_fields?.length
                          ? row.change_fields.join(", ")
                          : undefined
                      }
                    >
                      {row.change_fields?.length
                        ? row.change_fields.join(", ")
                        : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "ui-monospace, monospace",
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={formatJsonPreview(row.old_values, 500)}
                    >
                      {formatJsonPreview(row.old_values)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "ui-monospace, monospace",
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={formatJsonPreview(row.new_values, 500)}
                    >
                      {formatJsonPreview(row.new_values)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View full entry">
                      <IconButton
                        size="small"
                        color="primary"
                        aria-label="View audit entry"
                        onClick={() => onOpenDetail(row)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
        count={tableCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        labelDisplayedRows={({ from, to, count }) =>
          rows.length === rowsPerPage
            ? `${from}–${to} of many`
            : `${from}–${to} of ${count}`
        }
      />
    </>
  );
}
