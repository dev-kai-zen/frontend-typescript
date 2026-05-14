import apiClient from "../../../shared/api/api-client";
import type {
  CreateRbacCategoryPayload,
  RbacCategoryDto,
  UpdateRbacCategoryPayload,
} from "./rbac-categories.types";

type ListCategoriesResponse = { data: RbacCategoryDto[] };

/**
 * GET /api/v1/rbac/categories
 */
export async function fetchRbacCategories(): Promise<RbacCategoryDto[]> {
  const body = (await apiClient.get(
    "/api/v1/rbac/categories",
  )) as ListCategoriesResponse;
  return body.data ?? [];
}

export async function createRbacCategory(
  payload: CreateRbacCategoryPayload,
): Promise<RbacCategoryDto> {
  return (await apiClient.post("/api/v1/rbac/categories", {
    categoryName: payload.categoryName.trim(),
  })) as RbacCategoryDto;
}

export async function updateRbacCategory(
  id: number,
  payload: UpdateRbacCategoryPayload,
): Promise<RbacCategoryDto> {
  return (await apiClient.patch(`/api/v1/rbac/categories/${id}`, {
    categoryName: payload.categoryName.trim(),
  })) as RbacCategoryDto;
}

export async function deleteRbacCategory(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/rbac/categories/${id}`);
}
