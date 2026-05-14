import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import type { RbacCategoryDto } from "../types/rbac-categories.types";

type Props = {
  target: RbacCategoryDto | null;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
};

export function RbacCategoryDeleteDialog({
  target,
  onClose,
  onConfirm,
  busy,
}: Props) {
  return (
    <Dialog
      open={!!target}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Delete category?</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          This soft-deletes <strong>{target?.category_name}</strong>. Permissions
          in this category may become uncategorized per server rules.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={busy}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
