import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";

import type { RbacCategoryDto } from "../../categories/types/rbac-categories.types";
import type { RbacPermissionDto } from "../types/rbac-permissions.types";

export type RbacPermissionFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initial?: RbacPermissionDto | null;
  categories: RbacCategoryDto[];
  busy?: boolean;
  onClose: () => void;
  onSubmit: (values: {
    permissionCode: string;
    permissionDescription: string;
    categoryId: number | null;
  }) => void;
};

const UNCATEGORIZED_VALUE = "";

type FieldsProps = {
  mode: "create" | "edit";
  initial: RbacPermissionDto | null;
  categories: RbacCategoryDto[];
  busy: boolean;
  onClose: () => void;
  onSubmit: RbacPermissionFormDialogProps["onSubmit"];
};

function RbacPermissionFormFields({
  mode,
  initial,
  categories,
  busy,
  onClose,
  onSubmit,
}: FieldsProps) {
  const [code, setCode] = useState(
    () => (mode === "edit" && initial ? initial.permission_code : ""),
  );
  const [description, setDescription] = useState(
    () =>
      mode === "edit" && initial
        ? (initial.permission_description ?? "")
        : "",
  );
  const [categoryIdRaw, setCategoryIdRaw] = useState(() =>
    mode === "edit" && initial && initial.category_id != null
      ? String(initial.category_id)
      : UNCATEGORIZED_VALUE,
  );

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    setCategoryIdRaw(e.target.value);
  };

  const handleSave = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    onSubmit({
      permissionCode: trimmed,
      permissionDescription: description.trim(),
      categoryId:
        categoryIdRaw === "" || categoryIdRaw === UNCATEGORIZED_VALUE
          ? null
          : Number.parseInt(categoryIdRaw, 10),
    });
  };

  return (
    <>
      <DialogTitle>
        {mode === "create" ? "Create permission" : "Edit permission"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Permission code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            fullWidth
            disabled={mode === "edit" || busy}
            helperText={
              mode === "edit"
                ? "Code cannot be changed after creation (unique key)."
                : "Example: users.read, rbac.permissions.manage"
            }
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            disabled={busy}
          />
          <FormControl fullWidth disabled={busy}>
            <InputLabel id="rbac-perm-category-label">Category</InputLabel>
            <Select
              labelId="rbac-perm-category-label"
              label="Category"
              value={categoryIdRaw}
              onChange={handleCategoryChange}
            >
              <MenuItem value={UNCATEGORIZED_VALUE}>
                <em>Uncategorized</em>
              </MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.category_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!code.trim() || busy}
        >
          {mode === "create" ? "Create" : "Save"}
        </Button>
      </DialogActions>
    </>
  );
}

export function RbacPermissionFormDialog({
  open,
  mode,
  initial,
  categories,
  busy = false,
  onClose,
  onSubmit,
}: RbacPermissionFormDialogProps) {
  const fieldsKey = `${mode}-${initial?.id ?? "new"}`;

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      {open ? (
        <RbacPermissionFormFields
          key={fieldsKey}
          mode={mode}
          initial={initial ?? null}
          categories={categories}
          busy={busy}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
}
