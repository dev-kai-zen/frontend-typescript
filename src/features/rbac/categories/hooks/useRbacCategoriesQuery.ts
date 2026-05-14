import { useQuery } from "@tanstack/react-query";

import { fetchRbacCategories } from "../services/rbac-categories-api";
import { rbacCategoriesKeys } from "./rbac-categories-query-keys";

export function useRbacCategoriesQuery() {
  return useQuery({
    queryKey: rbacCategoriesKeys.list(),
    queryFn: fetchRbacCategories,
  });
}
