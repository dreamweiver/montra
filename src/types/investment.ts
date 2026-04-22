export type InvestmentType =
  | "stock"
  | "mutual_fund"
  | "fixed_deposit"
  | "gold"
  | "crypto"
  | "bond"
  | "real_estate";

export interface Investment {
  id: number;
  user_id: string;
  name: string;
  symbol: string | null;
  type: InvestmentType;
  quantity: string;
  purchase_price: string;
  current_price: string;
  currency: string;
  purchase_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvestmentWithGains extends Investment {
  invested_amount: number;
  current_value: number;
  gain_loss: number;
  gain_percentage: number;
}

export interface InvestmentStats {
  totalInvested: number;
  currentValue: number;
  totalGainLoss: number;
  gainPercentage: number;
  holdingCount: number;
}
