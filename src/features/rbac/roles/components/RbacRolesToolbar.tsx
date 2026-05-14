import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Button, Stack } from "@mui/material";

type Props = {
  loading: boolean;
  onRefresh: () => void;
  onAddRole: () => void;
};

export function RbacRolesToolbar({ loading, onRefresh, onAddRole }: Props) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ flexWrap: "wrap", alignItems: "center" }}
      >
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAddRole}>
          Add role
        </Button>
      </Stack>
    </Stack>
  );
}
