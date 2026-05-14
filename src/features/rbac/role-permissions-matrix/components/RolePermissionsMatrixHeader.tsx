import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, Stack, Typography } from "@mui/material";

type Props = {
  loading: boolean;
  saving: boolean;
  hasChanges: boolean;
  rolesEmpty: boolean;
  onReload: () => void;
  onResetLocal: () => void;
  onSave: () => void;
};

export function RolePermissionsMatrixHeader({
  loading,
  saving,
  hasChanges,
  rolesEmpty,
  onReload,
  onResetLocal,
  onSave,
}: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
          Role permission matrix
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Toggle intersections to grant permissions to roles. Saving writes only
          roles you changed.
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ flexWrap: "wrap", alignItems: "center" }}
      >
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onReload}
          disabled={loading || saving}
        >
          Reload
        </Button>
        <Button
          variant="outlined"
          onClick={onResetLocal}
          disabled={loading || saving || !hasChanges}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => void onSave()}
          disabled={loading || saving || !hasChanges || rolesEmpty}
        >
          Save changes
        </Button>
      </Stack>
    </Box>
  );
}
