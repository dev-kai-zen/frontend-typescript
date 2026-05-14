import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";

import { AuthBootstrap } from "./features/auth/AuthBootstrap";
import AppRoutes from "./shared/routes/AppRoutes";
import { getEnv } from "./shared/config/env";
import { AppQueryProvider } from "./shared/query/AppQueryProvider";
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
      <AppQueryProvider>
        <AppThemeProvider>
          {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
              {routes}
            </GoogleOAuthProvider>
          ) : (
            routes
          )}
        </AppThemeProvider>
      </AppQueryProvider>
    </BrowserRouter>
  );
}
