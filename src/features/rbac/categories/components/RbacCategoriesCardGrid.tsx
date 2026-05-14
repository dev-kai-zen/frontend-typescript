import CategoryIcon from "@mui/icons-material/Category";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import { RbacAdminSection } from "../../components/RbacAdminSection";
import type { RbacCategoryDto } from "../types/rbac-categories.types";

type Props = {
  rows: RbacCategoryDto[];
  loading: boolean;
  codesByCategoryId: Map<number, string[]>;
  onEdit: (row: RbacCategoryDto) => void;
  onDelete: (row: RbacCategoryDto) => void;
};

export function RbacCategoriesCardGrid({
  rows,
  loading,
  codesByCategoryId,
  onEdit,
  onDelete,
}: Props) {
  return (
    <RbacAdminSection>
      <Box sx={{ px: 2, py: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          All categories
        </Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        {rows.length === 0 && !loading ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            No categories yet. Create one, then attach permissions from the
            Permissions screen.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {rows.map((category) => {
              const codes = codesByCategoryId.get(category.id) ?? [];
              const preview = codes.slice(0, 4);
              const extra = codes.length - preview.length;
              return (
                <Grid key={category.id} size={{ xs: 12, md: 6 }}>
                  <Card
                    elevation={0}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      height: "100%",
                      transition: (theme) =>
                        theme.transitions.create(
                          ["border-color", "box-shadow"],
                          { duration: theme.transitions.duration.shortest },
                        ),
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: 2,
                      },
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          sx={{
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{ alignItems: "center" }}
                          >
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 1.5,
                                bgcolor: (theme) =>
                                  theme.palette.mode === "dark"
                                    ? "rgba(255, 155, 81, 0.15)"
                                    : "rgba(255, 155, 81, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "primary.main",
                              }}
                            >
                              <CategoryIcon />
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {category.category_name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ID {category.id}
                                {category.created_at
                                  ? ` · Created ${new Date(category.created_at).toLocaleDateString()}`
                                  : ""}
                              </Typography>
                            </Box>
                          </Stack>
                          <Chip
                            label={`${codes.length} permissions`}
                            size="small"
                            color="primary"
                          />
                        </Stack>

                        <Divider />

                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 700, display: "block", mb: 1 }}
                          >
                            Permission codes
                          </Typography>
                          {preview.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              No permissions in this category yet.
                            </Typography>
                          ) : (
                            <Stack
                              direction="row"
                              sx={{ flexWrap: "wrap", gap: 1 }}
                            >
                              {preview.map((code) => (
                                <Chip
                                  key={code}
                                  label={code}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    fontFamily: "ui-monospace, monospace",
                                    fontSize: "0.75rem",
                                  }}
                                />
                              ))}
                              {extra > 0 ? (
                                <Chip
                                  label={`+${extra} more`}
                                  size="small"
                                  variant="outlined"
                                  color="secondary"
                                />
                              ) : null}
                            </Stack>
                          )}
                        </Box>

                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <Tooltip title="Rename category">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => onEdit(category)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete category">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onDelete(category)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </RbacAdminSection>
  );
}
