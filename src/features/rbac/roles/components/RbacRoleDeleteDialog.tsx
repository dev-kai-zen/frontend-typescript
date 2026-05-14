import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

import type { RbacRoleDto } from "../types/rbac-roles.types";

type Props = {
  target: RbacRoleDto | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function RbacRoleDeleteDialog({
  target,
  deleting,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={target !== null}
      onClose={deleting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Delete role?</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          This soft-deletes <strong>{target?.role_name}</strong>. User assignments
          may need cleanup separately.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleting}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          disabled={deleting}
          onClick={onConfirm}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
