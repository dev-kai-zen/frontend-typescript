import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, InputAdornment, Stack, TextField } from "@mui/material";

export type UserManagementToolbarProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onRefresh: () => void;
  loading: boolean;
};

export function UserManagementToolbar({
  searchTerm,
  onSearchTermChange,
  onRefresh,
  loading,
}: UserManagementToolbarProps) {
  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        <TextField
          size="small"
          placeholder="Search by email, name, id, or role…"
          value={searchTerm}
          onChange={(e) => {
            onSearchTermChange(e.target.value);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: { sm: 280 }, flex: { sm: 1 } }}
        />
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
          sx={{ flexShrink: 0 }}
        >
          Refresh
        </Button>
      </Stack>
    </Box>
  );
}
