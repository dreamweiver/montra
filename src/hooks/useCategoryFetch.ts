"use client";

import { useState, useEffect } from "react";
import { getCategories } from "@/actions/categories";
import type { Category } from "@/types";

export function useCategoryFetch(type: "income" | "expense", onTypeChange?: () => void) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories(type).then((data) => {
      setCategories(data);
      onTypeChange?.();
    });
  }, [type, onTypeChange]);

  return categories;
}
