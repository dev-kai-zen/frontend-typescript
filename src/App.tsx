import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";

import { AuthBootstrap } from "./features/auth/components/AuthBootstrap";
import AppRoutes from "./shared/routes/AppRoutes";
import { getEnv } from "./shared/config/env";
import { AppQueryProvider } from "./shared/query/AppQueryProvider";
import { AppThemeProvider } from "./shared/theme/AppThemeProvider";
import { SnackbarProvider } from "notistack";

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
        <SnackbarProvider
          maxSnack={3}
          preventDuplicate={true}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <AppThemeProvider>
            {googleClientId ? (
              <GoogleOAuthProvider clientId={googleClientId}>
                {routes}
              </GoogleOAuthProvider>
            ) : (
              routes
            )}
          </AppThemeProvider>
        </SnackbarProvider>
      </AppQueryProvider>
    </BrowserRouter>
  );
}
