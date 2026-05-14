import SearchIcon from "@mui/icons-material/Search";
import { Box, InputAdornment, TextField } from "@mui/material";

type Props = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
};

export function RbacRolesSearchBar({ searchTerm, onSearchTermChange }: Props) {
  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
      <TextField
        size="small"
        placeholder="Search roles…"
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
        sx={{ maxWidth: { sm: 360 } }}
      />
    </Box>
  );
}
