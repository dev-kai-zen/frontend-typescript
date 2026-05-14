import VisibilityIcon from "@mui/icons-material/Visibility";
import {
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

import type { UserLogDto } from "../types/user-logs.types";
import { formatJsonPreview, formatTimestamp } from "../utils/user-logs-format";
import { UserLogsStatusChip } from "./UserLogsStatusChip";

type Props = {
  rows: UserLogDto[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  tableCount: number;
  onPageChange: (_event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenDetail: (row: UserLogDto) => void;
};

export function UserLogsTableSection({
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
              <TableCell sx={{ fontWeight: 700 }}>Module</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Route</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Device</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Metadata</TableCell>
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
                    No user log rows match this page or filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {row.created_at ? formatTimestamp(row.created_at) : "—"}
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
                  <TableCell>{row.module ?? "—"}</TableCell>
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
                        row.method && row.route
                          ? `${row.method} ${row.route}`
                          : (row.route ?? undefined)
                      }
                    >
                      {row.method && row.route
                        ? `${row.method} ${row.route}`
                        : (row.route ?? "—")}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <UserLogsStatusChip statusCode={row.status_code} />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 160 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={
                        [row.device_type, row.browser, row.os]
                          .filter(Boolean)
                          .join(" · ") || undefined
                      }
                    >
                      {[row.device_type, row.browser, row.os]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </Typography>
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
                      title={formatJsonPreview(row.metadata, 500)}
                    >
                      {formatJsonPreview(row.metadata)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View full entry">
                      <IconButton
                        size="small"
                        color="primary"
                        aria-label="View log entry"
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
