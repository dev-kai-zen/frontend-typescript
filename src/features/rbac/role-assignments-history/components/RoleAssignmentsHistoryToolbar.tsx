import RefreshIcon from "@mui/icons-material/Refresh";
import { Button, Stack } from "@mui/material";

type Props = {
  loading: boolean;
  onRefresh: () => void;
};

export function RoleAssignmentsHistoryToolbar({ loading, onRefresh }: Props) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "flex-end",
      }}
    >
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={onRefresh}
        disabled={loading}
      >
        Refresh
      </Button>
    </Stack>
  );
}
