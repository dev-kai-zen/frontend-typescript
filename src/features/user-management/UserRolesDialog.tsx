import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { useAuthStore } from "../auth/auth-store";
import { getRbacApiErrorMessage } from "../rbac/permissions/rbac-api-errors";
import { fetchRbacRoles } from "../rbac/roles/rbac-roles-api";
import type { RbacRoleDto } from "../rbac/roles/rbac-roles.types";
import type { UserListItemDto } from "./users-api";
import { fetchUserRoles, setUserRoles } from "./user-roles-api";

export type UserRolesDialogProps = {
  open: boolean;
  user: UserListItemDto | null;
  onClose: () => void;
  onSaved: () => void;
};

/**
 * Replace RBAC roles for one user (`PUT /rbac/users/:id/roles`).
 */
export function UserRolesDialog({
  open,
  user,
  onClose,
  onSaved,
}: UserRolesDialogProps) {
  const actorId = useAuthStore((s) => s.user?.id ?? null);

  const [catalog, setCatalog] = useState<RbacRoleDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;

    const userId = user.id;
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect -- dialog open gate */
    setError(null);
    setFilter("");
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      try {
        const [roles, links] = await Promise.all([
          fetchRbacRoles(),
          fetchUserRoles(userId),
        ]);
        if (cancelled) return;
        setCatalog(roles);
        setSelectedIds(links.map((l) => l.role_id).sort((a, b) => a - b));
      } catch (err) {
        if (!cancelled) {
          setError(
            getRbacApiErrorMessage(err, "Failed to load roles for this user"),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, user]);

  const toggle = (roleId: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      }
      return [...prev, roleId].sort((a, b) => a - b);
    });
  };

  const handleSave = async () => {
    if (!user || actorId === null) return;
    setError(null);
    setSaving(true);
    try {
      await setUserRoles(user.id, {
        roleIds: selectedIds,
        assignedBy: actorId,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(getRbacApiErrorMessage(err, "Failed to update user roles"));
    } finally {
      setSaving(false);
    }
  };

  const q = filter.trim().toLowerCase();
  const filtered = q
    ? catalog.filter((r) => r.role_name.toLowerCase().includes(q))
    : catalog;

  const disabled = loading || saving || actorId === null;

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Roles for{" "}
        {user ? (
          <strong>
            {user.email} (#{user.id})
          </strong>
        ) : (
          "user"
        )}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {actorId === null ? (
            <Typography color="warning.main" variant="body2">
              Sign in again — <code>assignedBy</code> is required to save.
            </Typography>
          ) : null}
          {error ? (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          ) : null}
          {loading ? <LinearProgress /> : null}
          <Typography variant="body2" color="text.secondary">
            Saving replaces this user&apos;s entire role set on the server.
          </Typography>
          <TextField
            size="small"
            label="Filter roles"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            fullWidth
            disabled={loading}
          />
          <Box sx={{ maxHeight: 320, overflow: "auto", pr: 1 }}>
            <FormGroup>
              {filtered.length === 0 && !loading ? (
                <Typography variant="body2" color="text.secondary">
                  {catalog.length === 0
                    ? "No RBAC roles defined yet."
                    : "No roles match this filter."}
                </Typography>
              ) : (
                filtered.map((r) => (
                  <FormControlLabel
                    key={r.id}
                    control={
                      <Checkbox
                        checked={selectedIds.includes(r.id)}
                        onChange={() => toggle(r.id)}
                        disabled={disabled}
                      />
                    }
                    label={
                      <Typography variant="body2" component="span">
                        <strong>{r.role_name}</strong>
                        {r.role_description ? (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            {r.role_description}
                          </Typography>
                        ) : null}
                      </Typography>
                    }
                  />
                ))
              )}
            </FormGroup>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => void handleSave()}
          disabled={disabled}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
