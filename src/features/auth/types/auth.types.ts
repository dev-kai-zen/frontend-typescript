/** User shape returned by the backend after Google login / `me`. */
export type AuthUser = {
  id: number;
  google_id: string | null;
  name: string;
  email: string;
  picture: string;
  role_id: number | null;
  role: { role_name: string } | null;
  permissions: string[];
  provider: string;
  is_active: number;
};
