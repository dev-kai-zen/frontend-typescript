import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";

import { AuthBootstrap } from "./modules/auth/AuthBootstrap";
import AppRoutes from "./shared/routes";
import { getEnv } from "./shared/config/env";
import { AppThemeProvider } from "./shared/theme/AppThemeProvider";

export default function App() {
  const { googleClientId } = getEnv();
  const routes = (
    <AuthBootstrap>
      <AppRoutes />
    </AuthBootstrap>
  );

  return (
    <BrowserRouter>
      <AppThemeProvider>
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            {routes}
          </GoogleOAuthProvider>
        ) : (
          routes
        )}
      </AppThemeProvider>
    </BrowserRouter>
  );
}
