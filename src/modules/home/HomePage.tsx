import { Typography } from "@mui/material";

export default function HomePage() {
  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Home
      </Typography>
      <Typography color="text.secondary">
        You are signed in. Add new screens under <code>src/modules/</code>,
        register a <code>&lt;Route&gt;</code> in{" "}
        <code>src/shared/routes.tsx</code>, and add a link in{" "}
        <code>SIDEBAR_LINKS</code> inside{" "}
        <code>src/shared/shell/MainLayout.tsx</code>.
      </Typography>
    </div>
  );
}
