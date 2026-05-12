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
          Authenticated URLs and sidebar entries are defined in{" "}
          <code>shared/routes/routesConfig.ts</code>. React Router registration
          is in <code>shared/routes/AppRoutes.tsx</code>; flat leaves and drawer
          data helpers live in <code>shared/routes/route-nav.ts</code>
          . Types are in <code>shared/routes/route-nav-types.ts</code>. Use{" "}
          <code>hidden: true</code> on a leaf keeps the URL but skips the drawer.
          Optional <code>permission</code>, <code>permissionAny</code>, or{" "}
          <code>permissionAll</code> (see <code>route-nav-types.ts</code>) are enforced
          in the router and sidebar via <code>route-permission.ts</code>.
        </p>
      </Typography>
    </div>
  );
}
