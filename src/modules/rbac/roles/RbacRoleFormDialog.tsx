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

import type { RbacRoleDto } from "./rbac-roles.types";

export type RbacRoleFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initial?: RbacRoleDto | null;
  onClose: () => void;
  onSubmit: (values: { roleName: string; roleDescription: string | null }) => void;
};

type FieldsProps = {
  mode: "create" | "edit";
  initial: RbacRoleDto | null;
  onClose: () => void;
  onSubmit: RbacRoleFormDialogProps["onSubmit"];
};

function RbacRoleFormFields({
  mode,
  initial,
  onClose,
  onSubmit,
}: FieldsProps) {
  const [roleName, setRoleName] = useState(
    () => (mode === "edit" && initial ? initial.role_name : ""),
  );
  const [roleDescription, setRoleDescription] = useState(
    () => (mode === "edit" && initial ? initial.role_description ?? "" : ""),
  );

  const handleSave = () => {
    const name = roleName.trim();
    if (!name) return;
    const descTrim = roleDescription.trim();
    onSubmit({
      roleName: name,
      roleDescription: descTrim === "" ? null : descTrim,
    });
  };

  return (
    <>
      <DialogTitle>
        {mode === "create" ? "Create role" : "Edit role"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Role name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            required
            fullWidth
            helperText="Must be unique (server enforces)."
          />
          <TextField
            label="Description"
            value={roleDescription}
            onChange={(e) => setRoleDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            helperText="Optional. Shown in admin tools only."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!roleName.trim()}
        >
          {mode === "create" ? "Create" : "Save"}
        </Button>
      </DialogActions>
    </>
  );
}

/** Create or edit an RBAC role (`role_name`, `role_description`). */
export function RbacRoleFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: RbacRoleFormDialogProps) {
  const fieldsKey = `${mode}-${initial?.id ?? "new"}`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {open ? (
        <RbacRoleFormFields
          key={fieldsKey}
          mode={mode}
          initial={initial ?? null}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
}
