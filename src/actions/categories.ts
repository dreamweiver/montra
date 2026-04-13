"use server";

// =============================================================================
// Category Server Actions
// =============================================================================
// Server-side actions for CRUD operations on categories.
// All actions require authentication via Supabase.
// =============================================================================

import { sql } from "@/db/neon";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Category } from "@/types/category";
import { DEFAULT_CATEGORY_ICONS, DEFAULT_CATEGORY_COLORS } from "@/types/category";

// ---------------------------------------------
// Helper: Get Authenticated User
// ---------------------------------------------
async function getAuthUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// =============================================================================
// Get Categories
// =============================================================================
export async function getCategories(type?: "income" | "expense"): Promise<Category[]> {
  try {
    const user = await getAuthUser();

    if (!user) {
      return [];
    }

    let result;
    if (type) {
      result = await sql`
        SELECT * FROM categories 
        WHERE user_id = ${user.id} AND type = ${type}
        ORDER BY name ASC
      `;
    } else {
      result = await sql`
        SELECT * FROM categories 
        WHERE user_id = ${user.id}
        ORDER BY type ASC, name ASC
      `;
    }

    return result as Category[];
  } catch (error) {
    console.error("Get categories error:", error);
    return [];
  }
}

// =============================================================================
// Add Category
// =============================================================================
export async function addCategory(formData: FormData) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const name = (formData.get("name") as string).trim();
    const type = formData.get("type") as "income" | "expense";
    const icon = formData.get("icon") as string || DEFAULT_CATEGORY_ICONS[name] || "📦";
    const color = formData.get("color") as string || DEFAULT_CATEGORY_COLORS[name] || "#6b7280";

    // Check for duplicate
    const existing = await sql`
      SELECT id FROM categories 
      WHERE user_id = ${user.id} AND name = ${name} AND type = ${type}
    `;

    if (existing.length > 0) {
      return { success: false, error: `Category "${name}" already exists for ${type}` };
    }

    await sql`
      INSERT INTO categories (user_id, name, type, icon, color)
      VALUES (${user.id}, ${name}, ${type}, ${icon}, ${color})
    `;

    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/transactions");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add category";
    console.error("Add category error:", error);
    return { success: false, error: message };
  }
}

// =============================================================================
// Update Category
// =============================================================================
export async function updateCategory(id: number, formData: FormData) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const name = (formData.get("name") as string).trim();
    const icon = formData.get("icon") as string;
    const color = formData.get("color") as string;

    // Check ownership
    const existing = await sql`
      SELECT id FROM categories WHERE id = ${id} AND user_id = ${user.id}
    `;

    if (existing.length === 0) {
      return { success: false, error: "Category not found" };
    }

    await sql`
      UPDATE categories 
      SET name = ${name}, icon = ${icon}, color = ${color}
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/transactions");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    console.error("Update category error:", error);
    return { success: false, error: message };
  }
}

// =============================================================================
// Delete Category
// =============================================================================
export async function deleteCategory(id: number) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    // Check if category is in use
    const transactions = await sql`
      SELECT COUNT(*) as count FROM transactions 
      WHERE category_id = ${id} AND user_id = ${user.id}
    `;

    if (transactions[0]?.count > 0) {
      return { 
        success: false, 
        error: `Cannot delete: ${transactions[0].count} transaction(s) use this category` 
      };
    }

    await sql`
      DELETE FROM categories WHERE id = ${id} AND user_id = ${user.id}
    `;

    revalidatePath("/dashboard/categories");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete category";
    console.error("Delete category error:", error);
    return { success: false, error: message };
  }
}

// =============================================================================
// Seed Default Categories
// =============================================================================
// Creates default categories for a new user
// =============================================================================
export async function seedDefaultCategories() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    // Check if user already has categories
    const existing = await sql`
      SELECT COUNT(*) as count FROM categories WHERE user_id = ${user.id}
    `;

    if (existing[0]?.count > 0) {
      return { success: true, message: "Categories already exist" };
    }

    // Default expense categories
    const expenseCategories = [
      { name: "Food", icon: "🍔", color: "#ef4444" },
      { name: "Transport", icon: "🚗", color: "#f97316" },
      { name: "Shopping", icon: "🛍️", color: "#eab308" },
      { name: "Rent", icon: "🏠", color: "#22c55e" },
      { name: "Entertainment", icon: "🎬", color: "#06b6d4" },
      { name: "Bills", icon: "📄", color: "#3b82f6" },
      { name: "Healthcare", icon: "🏥", color: "#8b5cf6" },
      { name: "Others", icon: "📦", color: "#6b7280" },
    ];

    // Default income categories
    const incomeCategories = [
      { name: "Salary", icon: "💰", color: "#10b981" },
      { name: "Freelance", icon: "💻", color: "#6366f1" },
      { name: "Investment", icon: "📈", color: "#14b8a6" },
      { name: "Others", icon: "📦", color: "#6b7280" },
    ];

    // Insert expense categories
    for (const cat of expenseCategories) {
      await sql`
        INSERT INTO categories (user_id, name, type, icon, color)
        VALUES (${user.id}, ${cat.name}, 'expense', ${cat.icon}, ${cat.color})
      `;
    }

    // Insert income categories
    for (const cat of incomeCategories) {
      await sql`
        INSERT INTO categories (user_id, name, type, icon, color)
        VALUES (${user.id}, ${cat.name}, 'income', ${cat.icon}, ${cat.color})
      `;
    }

    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/transactions");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to seed categories";
    console.error("Seed categories error:", error);
    return { success: false, error: message };
  }
}
