import type { RbacCategoryDto } from "../../categories/types/rbac-categories.types";
import type { RbacPermissionDto } from "../../permissions/types/rbac-permissions.types";

/** Expand every category that has at least one permission (matches initial load UX). */
export function computeInitialExpandedKeys(
  categories: RbacCategoryDto[],
  catalog: RbacPermissionDto[],
): string[] {
  const blocks: string[] = [];
  categories.forEach((c) => {
    if (catalog.some((p) => p.category_id === c.id)) {
      blocks.push(`c:${c.id}`);
    }
  });
  if (catalog.some((p) => p.category_id == null)) {
    blocks.push("uncategorized");
  }
  return blocks;
}
