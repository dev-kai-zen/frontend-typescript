import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Stack, TextField } from "@mui/material";

type Props = {
  draftAction: string;
  draftEntityType: string;
  onDraftActionChange: (value: string) => void;
  onDraftEntityTypeChange: (value: string) => void;
  onApplyFilters: () => void;
  onRefresh: () => void;
  loading: boolean;
};

export function AuditLogsToolbar({
  draftAction,
  draftEntityType,
  onDraftActionChange,
  onDraftEntityTypeChange,
  onApplyFilters,
  onRefresh,
  loading,
}: Props) {
  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          flexWrap: "wrap",
          alignItems: { xs: "stretch", sm: "flex-end" },
        }}
      >
        <TextField
          label="Action"
          size="small"
          value={draftAction}
          onChange={(e) => onDraftActionChange(e.target.value)}
          sx={{ minWidth: 160 }}
        />
        <TextField
          label="Entity type"
          size="small"
          value={draftEntityType}
          onChange={(e) => onDraftEntityTypeChange(e.target.value)}
          sx={{ minWidth: 180 }}
        />
        <Button variant="contained" onClick={onApplyFilters}>
          Apply filters
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>
    </Box>
  );
}
