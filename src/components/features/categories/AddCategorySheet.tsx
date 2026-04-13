"use client";

// =============================================================================
// AddCategorySheet Component
// =============================================================================
// A slide-out sheet for adding new transaction categories.
// =============================================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { addCategory } from "@/actions/categories";
import { LoadingOverlay } from "@/components/shared";
import { TransactionType } from "@/types";

// =============================================================================
// Emoji Picker Data
// =============================================================================
const CATEGORY_EMOJIS = [
  "🍔", "🍕", "☕", "🛒", "🛍️", "🏠", "🚗", "⛽", "🚌", "✈️",
  "🎬", "🎮", "📱", "💻", "📄", "💡", "🏥", "💊", "🎓", "📚",
  "💰", "💵", "💳", "📈", "🏦", "👔", "👗", "💼", "🎁", "📦",
];

const CATEGORY_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#6b7280", "#78716c", "#71717a",
];

// =============================================================================
// Component Props
// =============================================================================
interface AddCategorySheetProps {
  type: TransactionType;
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
export default function AddCategorySheet({ type, onSuccess }: AddCategorySheetProps) {
  const [open, setOpen] = useState(false);
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

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");

  const onSubmit = async (data: CategoryForm) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("type", type);
      formData.append("icon", data.icon);
      formData.append("color", data.color);

      const result = await addCategory(formData);

      if (!result.success) {
        toast.error(result.error || "Failed to add category");
        return;
      }

      toast.success("Category added successfully!");
      reset();
      setOpen(false);
      onSuccess?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      console.error(error);
      toast.error("Failed to add category", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !loading && setOpen(isOpen)}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add {type === "income" ? "Income" : "Expense"} Category
        </Button>
      </SheetTrigger>

      <SheetContent className="sm:max-w-md p-6 overflow-hidden">
        {loading && <LoadingOverlay message="Adding category" />}

        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl">
            Add {type === "income" ? "Income" : "Expense"} Category
          </SheetTitle>
          <SheetDescription>
            Create a new category to organize your transactions
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <fieldset disabled={loading} className="space-y-6">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
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
              <div className="grid grid-cols-10 gap-1">
                {CATEGORY_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setValue("icon", emoji)}
                    className={`text-xl p-2 rounded hover:bg-muted transition-colors ${
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
              <div className="grid grid-cols-10 gap-1">
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
              Add Category
            </Button>
          </fieldset>
        </form>
      </SheetContent>
    </Sheet>
  );
}
