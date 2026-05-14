import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

type Props = {
  open: boolean;
  description: string | null;
  detailJson: string;
  onClose: () => void;
};

export function UserLogDetailDialog({
  open,
  description,
  detailJson,
  onClose,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>User log entry</DialogTitle>
      <DialogContent>
        {description ? (
          <Typography variant="body2" sx={{ mb: 2, mt: 0.5 }}>
            {description}
          </Typography>
        ) : null}
        <Typography
          component="pre"
          sx={{
            m: 0,
            mt: 1,
            p: 2,
            bgcolor: "action.hover",
            borderRadius: 1,
            fontSize: 12,
            overflow: "auto",
            maxHeight: 480,
          }}
        >
          {detailJson}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
