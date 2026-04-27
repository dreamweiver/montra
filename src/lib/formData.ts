// =============================================================================
// FormData Parsers
// =============================================================================
// Shared parsers for extracting typed fields from FormData in server actions.
// =============================================================================

export function parseTransactionFormData(formData: FormData) {
  return {
    amount: formData.get("amount") as string,
    type: formData.get("type") as "income" | "expense",
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    currency: (formData.get("currency") as string) || "INR",
    transaction_date: formData.get("transaction_date") as string,
  };
}

export function parseInvestmentFormData(formData: FormData) {
  return {
    name: formData.get("name") as string,
    symbol: (formData.get("symbol") as string) || null,
    type: formData.get("type") as string,
    quantity: formData.get("quantity") as string,
    purchase_price: formData.get("purchase_price") as string,
    current_price: formData.get("current_price") as string,
    currency: (formData.get("currency") as string) || "INR",
    purchase_date: formData.get("purchase_date") as string,
    notes: (formData.get("notes") as string) || null,
  };
}
