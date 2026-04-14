"use client";

// =============================================================================
// CategoryCard Component
// =============================================================================
// Displays a single category with edit and delete actions.
// =============================================================================

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCategory } from "@/actions/categories";
import { ConfirmDialog } from "@/components/shared";
import { Category } from "@/types";
import { extractErrorMessage } from "@/lib/utils";

// =============================================================================
// Component Props
// =============================================================================
interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: () => void;
}

// =============================================================================
// Main Component
// =============================================================================
export default function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const result = await deleteCategory(category.id);

      if (!result.success) {
        toast.error(result.error || "Failed to delete category");
        return;
      }

      toast.success("Category deleted successfully!");
      onDelete();
    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      console.error(error);
      toast.error("Failed to delete category", { description: message });
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon with color background */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: `${category.color || "#6b7280"}20` }}
            >
              {category.icon || "📦"}
            </div>
            
            {/* Category name */}
            <span
              className="font-medium"
              style={{ color: category.color || "#6b7280" }}
            >
              {category.name}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(category)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDelete(true)}
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
