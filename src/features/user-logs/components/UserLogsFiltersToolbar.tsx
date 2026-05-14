import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Stack, TextField } from "@mui/material";

type Props = {
  draftUserId: string;
  draftAction: string;
  draftModule: string;
  onDraftUserIdChange: (value: string) => void;
  onDraftActionChange: (value: string) => void;
  onDraftModuleChange: (value: string) => void;
  onApplyFilters: () => void;
  onRefresh: () => void;
  loading: boolean;
};

export function UserLogsFiltersToolbar({
  draftUserId,
  draftAction,
  draftModule,
  onDraftUserIdChange,
  onDraftActionChange,
  onDraftModuleChange,
  onApplyFilters,
  onRefresh,
  loading,
}: Props) {
  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{
            flexWrap: "wrap",
            alignItems: { xs: "stretch", lg: "flex-end" },
          }}
        >
          <TextField
            label="User ID"
            size="small"
            value={draftUserId}
            onChange={(e) => onDraftUserIdChange(e.target.value)}
            slotProps={{
              htmlInput: { inputMode: "numeric", pattern: "[0-9]*" },
            }}
            sx={{ minWidth: 120 }}
          />
          <TextField
            label="Action"
            size="small"
            value={draftAction}
            onChange={(e) => onDraftActionChange(e.target.value)}
            sx={{ minWidth: 160 }}
          />
          <TextField
            label="Module"
            size="small"
            value={draftModule}
            onChange={(e) => onDraftModuleChange(e.target.value)}
            sx={{ minWidth: 160 }}
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
      </Stack>
    </Box>
  );
}
