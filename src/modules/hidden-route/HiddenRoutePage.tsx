import { Typography } from "@mui/material";

/** Example screen for a `hidden: true` route (sidebar does not list it). */
export default function HiddenRoutePage() {
  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Hidden route
      </Typography>
      <Typography color="text.secondary">
        This page is registered in <code>routesConfig.tsx</code> with{" "}
        <code>hidden: true</code>. Open it by URL or in-app navigation only.
      </Typography>
    </div>
  );
}
