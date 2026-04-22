"use client";

// =============================================================================
// EditCategorySheet Component
// =============================================================================
// A slide-out sheet for editing existing categories.
// =============================================================================

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateCategory } from "@/actions/categories";
import { LoadingOverlay } from "@/components/shared";
import { Category } from "@/types";
import { CATEGORY_EMOJIS, CATEGORY_COLORS } from "@/lib/constants";
import { extractErrorMessage } from "@/lib/utils";

// =============================================================================
// Component Props
// =============================================================================
interface EditCategorySheetProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// =============================================================================
// Form Data
// =============================================================================
interface CategoryForm {
  name: string;
  icon: string;
  color: string;
}

// =============================================================================
// Main Component
// =============================================================================
export default function EditCategorySheet({ 
  category, 
  open, 
  onOpenChange, 
  onSuccess 
}: EditCategorySheetProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryForm>({
    defaultValues: {
      name: "",
      icon: "📦",
      color: "#6b7280",
    },
  });

  // Update form when category changes
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        icon: category.icon || "📦",
        color: category.color || "#6b7280",
      });
    }
  }, [category, reset]);

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");

  const onSubmit = async (data: CategoryForm) => {
    if (!category) return;
    
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("icon", data.icon);
      formData.append("color", data.color);

      const result = await updateCategory(category.id, formData);

      if (!result.success) {
        toast.error(result.error || "Failed to update category");
        return;
      }

      toast.success("Category updated successfully!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      console.error(error);
      toast.error("Failed to update category", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !loading && onOpenChange(isOpen)}>
      <SheetContent className="w-full sm:max-w-md p-4 md:p-6 overflow-hidden">
        {loading && <LoadingOverlay message="Updating category" />}

        <SheetHeader className="mb-4 md:mb-6">
          <SheetTitle className="text-lg md:text-xl">Edit Category</SheetTitle>
          <SheetDescription className="text-xs md:text-sm">
            Update your category details
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
          <fieldset disabled={loading} className="space-y-4 md:space-y-6">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g., Groceries"
                {...register("name", { required: "Category name is required" })}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Icon Picker */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Icon</Label>
              <div className="grid grid-cols-8 md:grid-cols-10 gap-1">
                {CATEGORY_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setValue("icon", emoji)}
                    className={`text-lg md:text-xl p-1.5 md:p-2 rounded hover:bg-muted transition-colors ${
                      selectedIcon === emoji ? "bg-muted ring-2 ring-primary" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Color</Label>
              <div className="grid grid-cols-8 md:grid-cols-10 gap-1">
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue("color", color)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      selectedColor === color ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: `${selectedColor}20` }}
              >
                <span className="text-lg">{selectedIcon}</span>
                <span style={{ color: selectedColor }} className="font-medium">
                  {watch("name") || "Category Name"}
                </span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              Update Category
            </Button>
          </fieldset>
        </form>
      </SheetContent>
    </Sheet>
  );
}
