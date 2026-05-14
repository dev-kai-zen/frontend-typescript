import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import type { UserListItemDto } from "../types/users.types";

export type UserActiveToggleDialogProps = {
  open: boolean;
  target: UserListItemDto | null;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function UserActiveToggleDialog({
  open,
  target,
  onClose,
  onConfirm,
}: UserActiveToggleDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {target?.is_active ? "Deactivate user?" : "Activate user?"}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          {target?.is_active ? (
            <>
              Deactivate <strong>{target.email}</strong>? They should not be able
              to sign in while inactive (per your backend rules).
            </>
          ) : (
            <>
              Reactivate <strong>{target?.email}</strong>?
            </>
          )}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color={target?.is_active ? "warning" : "success"}
          onClick={() => void onConfirm()}
        >
          {target?.is_active ? "Deactivate" : "Activate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
