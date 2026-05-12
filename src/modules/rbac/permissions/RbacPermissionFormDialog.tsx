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

import type { RbacGroupDto, RbacPermissionDto } from "./rbac-permissions.types";

export type RbacPermissionFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  /** Edit mode: existing row */
  initial?: RbacPermissionDto | null;
  groups: RbacGroupDto[];
  onClose: () => void;
  onSubmit: (values: {
    permissionCode: string;
    permissionDescription: string;
    groupId: number | null;
  }) => void;
};

const UNGROUPED_VALUE = "";

type FieldsProps = {
  mode: "create" | "edit";
  initial: RbacPermissionDto | null;
  groups: RbacGroupDto[];
  onClose: () => void;
  onSubmit: RbacPermissionFormDialogProps["onSubmit"];
};

/**
 * Mounted with a `key` from the parent so initial `useState` values reset per open/mode/row
 * without a sync effect.
 */
function RbacPermissionFormFields({
  mode,
  initial,
  groups,
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
  const [groupIdRaw, setGroupIdRaw] = useState(() =>
    mode === "edit" && initial && initial.group_id != null
      ? String(initial.group_id)
      : UNGROUPED_VALUE,
  );

  const handleGroupChange = (e: SelectChangeEvent<string>) => {
    setGroupIdRaw(e.target.value);
  };

  const handleSave = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    onSubmit({
      permissionCode: trimmed,
      permissionDescription: description.trim(),
      groupId:
        groupIdRaw === "" || groupIdRaw === UNGROUPED_VALUE
          ? null
          : Number.parseInt(groupIdRaw, 10),
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
            disabled={mode === "edit"}
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
          />
          <FormControl fullWidth>
            <InputLabel id="rbac-perm-group-label">Group</InputLabel>
            <Select
              labelId="rbac-perm-group-label"
              label="Group"
              value={groupIdRaw}
              onChange={handleGroupChange}
            >
              <MenuItem value={UNGROUPED_VALUE}>
                <em>Ungrouped</em>
              </MenuItem>
              {groups.map((g) => (
                <MenuItem key={g.id} value={String(g.id)}>
                  {g.group_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!code.trim()}
        >
          {mode === "create" ? "Create" : "Save"}
        </Button>
      </DialogActions>
    </>
  );
}

/**
 * Single form for create + edit so validation and fields stay in one place.
 * Juniors: add fields in `RbacPermissionFormFields` only — the page wires `onSubmit` to the API module.
 */
export function RbacPermissionFormDialog({
  open,
  mode,
  initial,
  groups,
  onClose,
  onSubmit,
}: RbacPermissionFormDialogProps) {
  const fieldsKey = `${mode}-${initial?.id ?? "new"}`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {open ? (
        <RbacPermissionFormFields
          key={fieldsKey}
          mode={mode}
          initial={initial ?? null}
          groups={groups}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
}
