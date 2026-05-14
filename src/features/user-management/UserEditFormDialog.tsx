import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";

import type { UserListItemDto } from "./users-api";

export type UserEditFormDialogProps = {
  open: boolean;
  user: UserListItemDto | null;
  onClose: () => void;
  onSubmit: (values: { email: string; fullName: string | null }) => void;
};

type FieldsProps = {
  user: UserListItemDto;
  onClose: () => void;
  onSubmit: UserEditFormDialogProps["onSubmit"];
};

function UserEditFormFields({ user, onClose, onSubmit }: FieldsProps) {
  const [email, setEmail] = useState(user.email);
  const [fullName, setFullName] = useState(() => user.full_name ?? "");

  const handleSave = () => {
    const em = email.trim();
    if (!em) return;
    const fn = fullName.trim();
    onSubmit({ email: em, fullName: fn === "" ? null : fn });
  };

  return (
    <>
      <DialogTitle>Edit user</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            type="email"
          />
          <TextField
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!email.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </>
  );
}

/** Edit `email` and `full_name` for a user row. */
export function UserEditFormDialog({
  open,
  user,
  onClose,
  onSubmit,
}: UserEditFormDialogProps) {
  const fieldsKey = user ? String(user.id) : "none";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {open && user ? (
        <UserEditFormFields
          key={fieldsKey}
          user={user}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
}
