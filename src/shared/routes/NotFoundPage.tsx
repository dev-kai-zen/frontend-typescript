import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h5" gutterBottom>
        Page not found
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        That URL does not match any screen in this app.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/home")}>
        Go to home
      </Button>
    </Box>
  );
}
