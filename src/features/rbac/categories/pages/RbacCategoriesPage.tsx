import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, Box, Button, LinearProgress, Stack, Typography } from "@mui/material";

import { RbacCategoriesCardGrid } from "../components/RbacCategoriesCardGrid";
import { RbacCategoriesStatCards } from "../components/RbacCategoriesStatCards";
import { RbacCategoryDeleteDialog } from "../components/RbacCategoryDeleteDialog";
import { RbacCategoryFormDialog } from "../components/RbacCategoryFormDialog";
import { useRbacCategoriesPage } from "../hooks/useRbacCategoriesPage";

/**
 * RBAC — Permission categories (organizational buckets for permissions).
 *
 * **For junior developers**
 * - `types/rbac-categories.types.ts` — API DTOs
 * - `services/rbac-categories-api.ts` — HTTP only
 * - `hooks/useRbacCategoriesPage.ts` — React Query + mutations
 * - `components/` — forms and tables/cards
 * - Backend: `/api/v1/rbac/categories`
 */
export default function RbacCategoriesPage() {
  const vm = useRbacCategoriesPage();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 700 }}
          gutterBottom
        >
          Permission categories
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Group permission codes into buckets. Deleting a category may leave
          linked permissions uncategorized (backend rule).
        </Typography>
      </Box>

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
            onClick={vm.refresh}
            disabled={vm.loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={vm.openCreate}
          >
            Add category
          </Button>
        </Stack>
      </Stack>

      {vm.error ? (
        <Alert severity="error" onClose={vm.clearError}>
          {vm.error}
        </Alert>
      ) : null}

      {vm.loading ? <LinearProgress /> : null}

      <RbacCategoriesStatCards stats={vm.stats} />

      <RbacCategoriesCardGrid
        rows={vm.rows}
        loading={vm.loading}
        codesByCategoryId={vm.codesByCategoryId}
        onEdit={vm.openEdit}
        onDelete={vm.openDelete}
      />

      <RbacCategoryFormDialog
        open={vm.formOpen}
        mode={vm.formMode}
        initial={vm.editing}
        onClose={vm.closeForm}
        onSubmit={(values) => vm.submitForm(values)}
        busy={vm.formBusy}
      />

      <RbacCategoryDeleteDialog
        target={vm.deleteTarget}
        onClose={vm.closeDelete}
        onConfirm={() => void vm.confirmDelete()}
        busy={vm.deleteBusy}
      />
    </Stack>
  );
}
