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
  detailJson: string;
  onClose: () => void;
};

export function AuditLogDetailDialog({ open, detailJson, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Audit entry</DialogTitle>
      <DialogContent>
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
