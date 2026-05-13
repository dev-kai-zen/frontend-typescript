import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import SecurityIcon from "@mui/icons-material/Security";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  Alert,
  Avatar,
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
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
  Chip,
} from "@mui/material";
import Link from "@mui/material/Link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { fetchUsersForAdmin } from "../../user-management/users-api";
import { fetchUserRoles } from "../../user-management/user-roles-api";
import type { UserRoleLinkDto } from "../../user-management/user-roles.types";
import { getRbacApiErrorMessage } from "../permissions/rbac-api-errors";
import { fetchRbacRoles } from "../roles/rbac-roles-api";
import { RbacAdminSection } from "../components/RbacAdminSection";
import { RbacStatCard } from "../components/RbacStatCard";

type AssignmentRow = {
  linkId: number;
  userId: number;
  userEmail: string;
  userName: string | null;
  roleId: number;
  roleName: string;
  assignedById: number;
  assignedByLabel: string;
  assignedAtLabel: string;
};

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function downloadCsv(filename: string, rows: AssignmentRow[]) {
  const header = [
    "assigned_at",
    "user_email",
    "user_name",
    "role",
    "assigned_by",
  ];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        `"${r.assignedAtLabel.replace(/"/g, '""')}"`,
        `"${r.userEmail.replace(/"/g, '""')}"`,
        `"${(r.userName ?? "").replace(/"/g, '""')}"`,
        `"${r.roleName.replace(/"/g, '""')}"`,
        `"${r.assignedByLabel.replace(/"/g, '""')}"`,
      ].join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * RBAC — Role assignments (live links from `rbac_user_roles`).
 *
 * Rows reflect **current** assignments. Revocations remove rows; full chronological
 * history requires audit logging on the backend (not wired yet).
 */
export default function RbacRoleAssignmentsHistoryPage() {
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRoleId, setFilterRoleId] = useState<string>("all");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [users, roleCatalog] = await Promise.all([
        fetchUsersForAdmin(),
        fetchRbacRoles(),
      ]);
      const roleNameById = new Map<number, string>(
        roleCatalog.map((r) => [r.id, r.role_name]),
      );
      const emailById = new Map<number, string>(
        users.map((u) => [u.id, u.email]),
      );

      const linkLists = await Promise.all(
        users.map((u) => fetchUserRoles(u.id)),
      );

      const built: AssignmentRow[] = [];
      users.forEach((u, i) => {
        const links = linkLists[i] as UserRoleLinkDto[];
        for (const link of links) {
          const roleName =
            roleNameById.get(link.role_id) ?? `Role #${link.role_id}`;
          const assignerEmail = emailById.get(link.assigned_by);
          built.push({
            linkId: link.id,
            userId: u.id,
            userEmail: u.email,
            userName: u.full_name,
            roleId: link.role_id,
            roleName,
            assignedById: link.assigned_by,
            assignedByLabel:
              assignerEmail ?? `User #${link.assigned_by}`,
            assignedAtLabel: formatWhen(link.created_at),
          });
        }
      });

      built.sort((a, b) => {
        const ta = a.assignedAtLabel === "—" ? 0 : new Date(a.assignedAtLabel).getTime();
        const tb = b.assignedAtLabel === "—" ? 0 : new Date(b.assignedAtLabel).getTime();
        return tb - ta;
      });

      setRows(built);
    } catch (err) {
      setError(getRbacApiErrorMessage(err, "Failed to load role assignments"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    /* Loads assignment rows from the API; effect-owned loading/error flags match other RBAC pages. */
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- intentional load gate */
    void load();
  }, [load, refreshNonce]);

  const roleFilterOptions = useMemo(() => {
    const m = new Map<number, string>();
    rows.forEach((r) => {
      if (!m.has(r.roleId)) m.set(r.roleId, r.roleName);
    });
    return [...m.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], undefined, { sensitivity: "base" }),
    );
  }, [rows]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesRole =
        filterRoleId === "all" || String(r.roleId) === filterRoleId;
      if (!matchesRole) return false;
      if (!q) return true;
      return (
        r.userEmail.toLowerCase().includes(q) ||
        (r.userName?.toLowerCase().includes(q) ?? false) ||
        r.roleName.toLowerCase().includes(q) ||
        r.assignedByLabel.toLowerCase().includes(q)
      );
    });
  }, [rows, searchTerm, filterRoleId]);

  const stats = useMemo(() => {
    const total = rows.length;
    const usersWithRoles = new Set(rows.map((r) => r.userId)).size;
    const rolesUsed = new Set(rows.map((r) => r.roleId)).size;
    const distinctAssigners = new Set(rows.map((r) => r.assignedById)).size;
    return { total, usersWithRoles, rolesUsed, distinctAssigners };
  }, [rows]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const paged = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
          Role assignments history
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Active user–role links from the RBAC catalog. Sorting favors the most
          recent assignment time when the API exposes it.
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => setRefreshNonce((n) => n + 1)}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {error ? (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {loading ? <LinearProgress /> : null}

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
        }}
      >
        <RbacStatCard
          label="Active assignments"
          value={String(stats.total)}
          tone="primary"
          icon={<PersonAddIcon />}
        />
        <RbacStatCard
          label="Users with roles"
          value={String(stats.usersWithRoles)}
          tone="info"
          icon={<SecurityIcon />}
        />
        <RbacStatCard
          label="Roles in use"
          value={String(stats.rolesUsed)}
          tone="secondary"
          icon={<SecurityIcon />}
        />
        <RbacStatCard
          label="Distinct assigners"
          value={String(stats.distinctAssigners)}
          tone="success"
          icon={<CheckCircleIcon />}
        />
      </Box>

      <RbacAdminSection>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{
              alignItems: { xs: "stretch", md: "center" },
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
                placeholder="Search users, roles, assigner…"
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
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="rah-role-filter">Role</InputLabel>
                <Select<string>
                  labelId="rah-role-filter"
                  label="Role"
                  value={filterRoleId}
                  onChange={(e) => {
                    setFilterRoleId(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">All roles</MenuItem>
                  {roleFilterOptions.map(([id, name]) => (
                    <MenuItem key={id} value={String(id)}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() =>
                downloadCsv("role-assignments.csv", filtered)
              }
              disabled={filtered.length === 0}
            >
              Export CSV
            </Button>
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
              {paged.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No assignments match this filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((r) => (
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
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </RbacAdminSection>

      <RbacAdminSection
        sx={{
          p: 2,
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255, 155, 81, 0.08)"
              : "rgba(255, 155, 81, 0.12)",
          borderColor: "primary.main",
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
          <InfoOutlinedIcon color="primary" sx={{ mt: 0.25 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }} gutterBottom>
              About this view
            </Typography>
            <Typography variant="body2" color="text.secondary">
              To change assignments, use{" "}
              <Link
                component={RouterLink}
                to="/user-management"
                color="primary"
                sx={{ fontWeight: 600, textUnderlineOffset: 3 }}
              >
                User management
              </Link>{" "}
              (Set roles). Revoked links disappear from this list; persistent audit
              history would require logging changes on the server.
            </Typography>
          </Box>
        </Stack>
      </RbacAdminSection>
    </Stack>
  );
}
