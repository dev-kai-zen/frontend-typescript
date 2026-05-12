import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { getRbacApiErrorMessage } from "../permissions/rbac-api-errors";
import { fetchRbacPermissions } from "../permissions/rbac-permissions-api";
import type { RbacPermissionDto } from "../permissions/rbac-permissions.types";
import { fetchRbacRoles } from "../roles/rbac-roles-api";
import type { RbacRoleDto } from "../roles/rbac-roles.types";
import { fetchRolePermissions, setRolePermissions } from "./rbac-role-permissions-api";

const ROLE_NONE = "";

/**
 * RBAC — Which permissions belong to each role (`PUT` replaces the full set).
 *
 * **For junior developers**
 * - `rbac-role-permissions.types.ts` — join-row DTOs
 * - `rbac-role-permissions-api.ts` — GET list + PUT replace
 * - `../roles/rbac-roles-api.ts` — role picker data
 * - `../permissions/rbac-permissions-api.ts` — permission catalog
 *
 * Backend: `/api/v1/rbac/roles/:id/permissions`
 */
export default function RbacRolePermissionsPage() {
  const [roles, setRoles] = useState<RbacRoleDto[]>([]);
  const [catalog, setCatalog] = useState<RbacPermissionDto[]>([]);
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>(ROLE_NONE);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filter, setFilter] = useState("");

  const [listLoading, setListLoading] = useState(true);
  const [permLoading, setPermLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect -- intentional load gate */
    setError(null);
    setListLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      try {
        const [roleList, permList] = await Promise.all([
          fetchRbacRoles(),
          fetchRbacPermissions(),
        ]);
        if (cancelled) return;
        setRoles(roleList);
        setCatalog(permList);
      } catch (err) {
        if (!cancelled) {
          setError(
            getRbacApiErrorMessage(
              err,
              "Failed to load roles or permission catalog",
            ),
          );
        }
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshNonce]);

  useEffect(() => {
    if (selectedRoleKey === ROLE_NONE) {
      return;
    }

    const roleId = Number.parseInt(selectedRoleKey, 10);
    if (!Number.isFinite(roleId)) return;

    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect -- intentional load gate */
    setError(null);
    setPermLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      try {
        const links = await fetchRolePermissions(roleId);
        if (cancelled) return;
        setSelectedIds(
          links.map((l) => l.permission_id).sort((a, b) => a - b),
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            getRbacApiErrorMessage(
              err,
              "Failed to load permissions for this role",
            ),
          );
        }
      } finally {
        if (!cancelled) setPermLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedRoleKey, refreshNonce]);

  const selectedRoleId =
    selectedRoleKey === ROLE_NONE
      ? null
      : Number.parseInt(selectedRoleKey, 10);

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    const v = event.target.value;
    setSelectedRoleKey(v);
    setFilter("");
    if (v === ROLE_NONE) {
      setSelectedIds([]);
      setPermLoading(false);
    }
  };

  const toggle = (permissionId: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      }
      return [...prev, permissionId].sort((a, b) => a - b);
    });
  };

  const handleSave = async () => {
    if (selectedRoleId === null || !Number.isFinite(selectedRoleId)) return;
    setError(null);
    setSaving(true);
    try {
      await setRolePermissions(selectedRoleId, selectedIds);
      setRefreshNonce((n) => n + 1);
    } catch (err) {
      setError(
        getRbacApiErrorMessage(err, "Failed to update role permissions"),
      );
    } finally {
      setSaving(false);
    }
  };

  const q = filter.trim().toLowerCase();
  const filtered = q
    ? catalog.filter((p) => p.permission_code.toLowerCase().includes(q))
    : catalog;

  const matrixDisabled =
    listLoading || permLoading || saving || selectedRoleId === null;

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <div>
          <Typography variant="h5" component="h1" gutterBottom>
            Role permissions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a role, then check the permission codes it should include.
            Saving replaces the entire set on the server for that role.
          </Typography>
        </div>
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
            disabled={listLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => void handleSave()}
            disabled={
              selectedRoleId === null ||
              listLoading ||
              permLoading ||
              saving
            }
          >
            Save for role
          </Button>
        </Stack>
      </Box>

      {error ? (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {listLoading ? <LinearProgress /> : null}

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <FormControl fullWidth size="small" disabled={listLoading}>
              <InputLabel id="rbac-role-perm-role-label">Role</InputLabel>
              <Select<string>
                labelId="rbac-role-perm-role-label"
                label="Role"
                value={selectedRoleKey}
                onChange={handleRoleChange}
              >
                <MenuItem value={ROLE_NONE}>
                  <em>Select a role…</em>
                </MenuItem>
                {roles.map((r) => (
                  <MenuItem key={r.id} value={String(r.id)}>
                    {r.role_name} (#{r.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {roles.length === 0 && !listLoading ? (
              <Typography variant="body2" color="text.secondary">
                No roles exist yet. Create roles under{" "}
                <strong>RBAC → Roles</strong> first.
              </Typography>
            ) : null}

            {selectedRoleKey !== ROLE_NONE ? (
              <>
                {permLoading ? <LinearProgress /> : null}
                <TextField
                  size="small"
                  label="Filter by permission code"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  fullWidth
                  disabled={matrixDisabled}
                />
                <Box
                  sx={{
                    maxHeight: 420,
                    overflow: "auto",
                    pr: 1,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  <FormGroup>
                    {filtered.length === 0 && !listLoading && !permLoading ? (
                      <Typography variant="body2" color="text.secondary">
                        {catalog.length === 0
                          ? "No permissions in the catalog yet."
                          : "No permissions match this filter."}
                      </Typography>
                    ) : (
                      filtered.map((p) => (
                        <FormControlLabel
                          key={p.id}
                          control={
                            <Checkbox
                              checked={selectedIds.includes(p.id)}
                              onChange={() => toggle(p.id)}
                              disabled={matrixDisabled}
                            />
                          }
                          label={
                            <Typography variant="body2" component="span">
                              <strong>{p.permission_code}</strong>
                              {p.permission_description ? (
                                <Typography
                                  component="span"
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block" }}
                                >
                                  {p.permission_description}
                                </Typography>
                              ) : null}
                            </Typography>
                          }
                        />
                      ))
                    )}
                  </FormGroup>
                </Box>
              </>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
