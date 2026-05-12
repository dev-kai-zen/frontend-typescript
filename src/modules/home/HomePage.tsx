import { Typography } from "@mui/material";

export default function HomePage() {
  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Home
      </Typography>
      <Typography color="text.secondary" component="div">
        <p>You are signed in.</p>
        <p>
          Register screens with <code>*.routes.tsx</code>,{" "}
          <code>{'lazy(() => import("./Page"))'}</code>, merge slices into{" "}
          <code>routes/app-route-config.tsx</code>, and optional{" "}
          <code>children</code> for nested areas (example: Administration → User
          Management at <code>/administration/user-management</code>). In
          development, watch the browser console for duplicate route key / resolved
          path warnings.
        </p>
      </Typography>
    </div>
  );
}
