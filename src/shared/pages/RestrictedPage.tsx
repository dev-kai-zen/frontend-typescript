import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function RestrictedPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h5" gutterBottom>
        Access restricted
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        You are signed in, but your role does not allow this screen. Contact an
        administrator if you believe this is a mistake.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/home")}>
        Go to home
      </Button>
    </Box>
  );
}
