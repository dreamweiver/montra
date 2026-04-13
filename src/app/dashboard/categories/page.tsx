"use client";

// =============================================================================
// Categories Page
// =============================================================================
// Manages user's transaction categories with CRUD operations.
// Categories are split into Income and Expense sections.
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { getCategories, seedDefaultCategories } from "@/actions/categories";
import { AddCategorySheet, EditCategorySheet, CategoryCard } from "@/components/features/categories";
import { EmptyState } from "@/components/shared";
import { Category } from "@/types";

// =============================================================================
// Main Component
// =============================================================================
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Seed default categories
  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      const result = await seedDefaultCategories();
      if (result.success) {
        toast.success("Default categories created!");
        fetchCategories();
      } else {
        toast.error(result.error || "Failed to create default categories");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create default categories");
    } finally {
      setSeeding(false);
    }
  };

  // Handle edit
  const handleEdit = (category: Category) => {
    setEditCategory(category);
    setEditOpen(true);
  };

  // Filter by type
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  // =============================================================================
  // Loading State
  // =============================================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // =============================================================================
  // Empty State
  // =============================================================================
  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your transactions with custom categories
          </p>
        </div>

        <EmptyState
          title="No categories yet"
          description="Create custom categories or start with our defaults"
          action={
            <div className="flex gap-3">
              <Button onClick={handleSeedDefaults} disabled={seeding}>
                {seeding ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Add Default Categories
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  // =============================================================================
  // Main Render
  // =============================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground mt-1">
          Organize your transactions with custom categories
        </p>
      </div>

      {/* Expense Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl text-red-600">Expense Categories</CardTitle>
            <CardDescription>Categories for your spending</CardDescription>
          </div>
          <AddCategorySheet type="expense" onSuccess={fetchCategories} />
        </CardHeader>
        <CardContent>
          {expenseCategories.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">
              No expense categories yet. Add one to get started.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {expenseCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={fetchCategories}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Income Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl text-green-600">Income Categories</CardTitle>
            <CardDescription>Categories for your earnings</CardDescription>
          </div>
          <AddCategorySheet type="income" onSuccess={fetchCategories} />
        </CardHeader>
        <CardContent>
          {incomeCategories.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">
              No income categories yet. Add one to get started.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {incomeCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={fetchCategories}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Sheet */}
      <EditCategorySheet
        category={editCategory}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
