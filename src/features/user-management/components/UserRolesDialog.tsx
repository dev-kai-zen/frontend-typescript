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

import type { UserRolesDialogViewModel } from "../hooks/useUserRolesDialog";
import type { UserListItemDto } from "../types/users.types";

export type UserRolesDialogProps = {
  open: boolean;
  user: UserListItemDto | null;
  onClose: () => void;
  vm: UserRolesDialogViewModel;
};

/**
 * Replace RBAC roles for one user (`PUT /rbac/users/:id/roles`).
 * Data loading and save are handled by `useUserRolesDialog`.
 */
export function UserRolesDialog({
  open,
  user,
  onClose,
  vm,
}: UserRolesDialogProps) {
  const disabled = vm.disabled;

  return (
    <Dialog
      open={open}
      onClose={vm.saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Roles for{" "}
        {user ? (
          <strong>{vm.userLabel}</strong>
        ) : (
          "user"
        )}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {vm.actorId === null ? (
            <Typography color="warning.main" variant="body2">
              Sign in again — <code>assignedBy</code> is required to save.
            </Typography>
          ) : null}
          {vm.loadError ? (
            <Typography color="error" variant="body2">
              {vm.loadError}
            </Typography>
          ) : null}
          {vm.saveError ? (
            <Typography color="error" variant="body2">
              {vm.saveError}
            </Typography>
          ) : null}
          {vm.loading ? <LinearProgress /> : null}
          <Typography variant="body2" color="text.secondary">
            Saving replaces this user&apos;s entire role set on the server.
          </Typography>
          <TextField
            size="small"
            label="Filter roles"
            value={vm.filter}
            onChange={(e) => vm.setFilter(e.target.value)}
            fullWidth
            disabled={vm.loading}
          />
          <Box sx={{ maxHeight: 320, overflow: "auto", pr: 1 }}>
            <FormGroup>
              {vm.filteredRoles.length === 0 && !vm.loading ? (
                <Typography variant="body2" color="text.secondary">
                  {vm.catalog.length === 0
                    ? "No RBAC roles defined yet."
                    : "No roles match this filter."}
                </Typography>
              ) : (
                vm.filteredRoles.map((r) => (
                  <FormControlLabel
                    key={r.id}
                    control={
                      <Checkbox
                        checked={vm.selectedIds.includes(r.id)}
                        onChange={() => vm.toggleRole(r.id)}
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
        <Button onClick={onClose} disabled={vm.saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => void vm.save()}
          disabled={disabled}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
