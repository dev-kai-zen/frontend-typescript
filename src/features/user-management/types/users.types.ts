/**
 * User list / admin PATCH payloads (`/api/v1/users`).
 */

export type UserListItemDto = {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  google_id?: string | null;
  picture_url?: string | null;
};

export type UpdateUserAdminPayload = {
  email?: string;
  fullName?: string | null;
  googleId?: string | null;
  pictureUrl?: string | null;
  isActive?: boolean;
};
