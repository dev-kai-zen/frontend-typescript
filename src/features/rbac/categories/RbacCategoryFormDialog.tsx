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

import type { RbacCategoryDto } from "./rbac-categories.types";

export type RbacCategoryFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initial?: RbacCategoryDto | null;
  onClose: () => void;
  onSubmit: (values: { categoryName: string }) => void;
};

type FieldsProps = {
  mode: "create" | "edit";
  initial: RbacCategoryDto | null;
  onClose: () => void;
  onSubmit: RbacCategoryFormDialogProps["onSubmit"];
};

function RbacCategoryFormFields({
  mode,
  initial,
  onClose,
  onSubmit,
}: FieldsProps) {
  const [categoryName, setCategoryName] = useState(
    () => (mode === "edit" && initial ? initial.category_name : ""),
  );

  const handleSave = () => {
    const t = categoryName.trim();
    if (!t) return;
    onSubmit({ categoryName: t });
  };

  return (
    <>
      <DialogTitle>
        {mode === "create" ? "Create category" : "Rename category"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
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
          disabled={!categoryName.trim()}
        >
          {mode === "create" ? "Create" : "Save"}
        </Button>
      </DialogActions>
    </>
  );
}

/** Create / edit RBAC category (`category_name` field on the API). */
export function RbacCategoryFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: RbacCategoryFormDialogProps) {
  const fieldsKey = `${mode}-${initial?.id ?? "new"}`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {open ? (
        <RbacCategoryFormFields
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
