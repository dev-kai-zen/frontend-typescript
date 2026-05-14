import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import type { UserListItemDto } from "../types/users.types";

export type UserDeleteConfirmDialogProps = {
  open: boolean;
  target: UserListItemDto | null;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function UserDeleteConfirmDialog({
  open,
  target,
  onClose,
  onConfirm,
}: UserDeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete user?</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Permanently remove <strong>{target?.email}</strong>? This cannot be
          undone if the API hard-deletes the row.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" variant="contained" onClick={() => void onConfirm()}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
