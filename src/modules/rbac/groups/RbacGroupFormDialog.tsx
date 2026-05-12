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

import type { RbacGroupDto } from "./rbac-groups.types";

export type RbacGroupFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initial?: RbacGroupDto | null;
  onClose: () => void;
  onSubmit: (values: { groupName: string }) => void;
};

type FieldsProps = {
  mode: "create" | "edit";
  initial: RbacGroupDto | null;
  onClose: () => void;
  onSubmit: RbacGroupFormDialogProps["onSubmit"];
};

function RbacGroupFormFields({
  mode,
  initial,
  onClose,
  onSubmit,
}: FieldsProps) {
  const [groupName, setGroupName] = useState(
    () => (mode === "edit" && initial ? initial.group_name : ""),
  );

  const handleSave = () => {
    const t = groupName.trim();
    if (!t) return;
    onSubmit({ groupName: t });
  };

  return (
    <>
      <DialogTitle>
        {mode === "create" ? "Create group" : "Rename group"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            fullWidth
            helperText="Must be unique. Used to organize permissions."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!groupName.trim()}
        >
          {mode === "create" ? "Create" : "Save"}
        </Button>
      </DialogActions>
    </>
  );
}

/** Create / edit RBAC group (single `group_name` field on the API). */
export function RbacGroupFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: RbacGroupFormDialogProps) {
  const fieldsKey = `${mode}-${initial?.id ?? "new"}`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {open ? (
        <RbacGroupFormFields
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
