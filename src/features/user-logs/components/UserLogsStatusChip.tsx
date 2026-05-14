import { Chip, Typography } from "@mui/material";

type Props = {
  statusCode: number | null | undefined;
};

export function UserLogsStatusChip({ statusCode }: Props) {
  if (statusCode === null || statusCode === undefined) {
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    );
  }
  if (statusCode >= 500) {
    return (
      <Chip label={String(statusCode)} size="small" color="error" variant="outlined" />
    );
  }
  if (statusCode >= 400) {
    return (
      <Chip
        label={String(statusCode)}
        size="small"
        color="warning"
        variant="outlined"
      />
    );
  }
  return (
    <Chip label={String(statusCode)} size="small" color="success" variant="outlined" />
  );
}
