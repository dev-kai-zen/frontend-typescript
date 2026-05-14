import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";

type Props = {
  searchTerm: string;
  filterRoleId: string;
  roleFilterOptions: [number, string][];
  filteredCount: number;
  onSearchTermChange: (value: string) => void;
  onFilterRoleIdChange: (value: string) => void;
  onExportCsv: () => void;
};

export function RoleAssignmentsHistoryFiltersBar({
  searchTerm,
  filterRoleId,
  roleFilterOptions,
  filteredCount,
  onSearchTermChange,
  onFilterRoleIdChange,
  onExportCsv,
}: Props) {
  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ flex: 1 }}
        >
          <TextField
            size="small"
            placeholder="Search users, roles, assigner…"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: { sm: 280 }, flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="rah-role-filter">Role</InputLabel>
            <Select<string>
              labelId="rah-role-filter"
              label="Role"
              value={filterRoleId}
              onChange={(e) => onFilterRoleIdChange(e.target.value)}
            >
              <MenuItem value="all">All roles</MenuItem>
              {roleFilterOptions.map(([id, name]) => (
                <MenuItem key={id} value={String(id)}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={onExportCsv}
          disabled={filteredCount === 0}
        >
          Export CSV
        </Button>
      </Stack>
    </Box>
  );
}
