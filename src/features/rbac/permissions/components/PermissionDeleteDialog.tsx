import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import type { RbacPermissionDto } from "../types/rbac-permissions.types";

type Props = {
  target: RbacPermissionDto | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function PermissionDeleteDialog({
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
      <DialogTitle>Delete permission?</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          This soft-deletes <strong>{target?.permission_code}</strong> in the database.
          Ensure no roles still require this code before deleting.
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
