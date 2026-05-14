import SearchIcon from "@mui/icons-material/Search";
import type { SelectChangeEvent } from "@mui/material";
import {
  Box,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";

import type { RbacCategoryDto } from "../../categories/types/rbac-categories.types";
import {
  FILTER_ALL,
  UNCATEGORIZED_SENTINEL,
} from "../services/rbac-permissions-admin-fetch";

type Props = {
  searchTerm: string;
  filterCategoryId: string;
  categories: RbacCategoryDto[];
  onSearchTermChange: (value: string) => void;
  onFilterChange: (e: SelectChangeEvent<string>) => void;
};

export function PermissionsFiltersBar({
  searchTerm,
  filterCategoryId,
  categories,
  onSearchTermChange,
  onFilterChange,
}: Props) {
  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "stretch", lg: "center" },
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
            placeholder="Search code, description, category…"
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
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="perm-filter-category">Category</InputLabel>
            <Select
              labelId="perm-filter-category"
              label="Category"
              value={filterCategoryId}
              onChange={onFilterChange}
            >
              <MenuItem value={FILTER_ALL}>All categories</MenuItem>
              <MenuItem value={UNCATEGORIZED_SENTINEL}>
                Uncategorized only
              </MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.category_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>
    </Box>
  );
}
