export const CATEGORY_MAP = {
  // Expense categories
  GROCERY: "Grocery Store",
  FOOD: "Restaurants & Dining",
  FUN: "Entertainment & Fun",
  VEHICLE: "Vehicle & Transport",
  SHOPPING: "Shopping & Apparel",
  UTILITIES: "Bills & Utilities",
  HEALTH: "Medical & Wellness",
  INVESTMENT: "Investments & Savings",
  EDUCATION: "Education & Learning",
  TRAVEL: "Travel & Vacations",
  SUBSCRIPTION: "Subscriptions & Services",
  HOUSEHOLD: "Household & Maintenance",
  OTHER: "Other Expenses",
  
  // Income categories
  SALARY: "Salary & Wages",
  FREELANCE: "Freelance & Consulting",
  INTEREST: "Dividends & Interest",
  GIFT: "Gifts & Grants",
  OTHER_INCOME: "Other Income"
};

export const INCOME_CATEGORIES = ["SALARY", "FREELANCE", "INTEREST", "GIFT", "OTHER_INCOME"];
export const EXPENSE_CATEGORIES = [
  "GROCERY", "FOOD", "FUN", "VEHICLE", "SHOPPING", "UTILITIES", 
  "HEALTH", "INVESTMENT", "EDUCATION", "TRAVEL", "SUBSCRIPTION", 
  "HOUSEHOLD", "OTHER"
];

export const TYPE_MAP = {
  CASH: "Cash Payment",
  CREDIT: "Credit Card"
};

export const getCategoryLabel = (category) => CATEGORY_MAP[category] || category;
export const getTypeLabel = (type) => TYPE_MAP[type] || type;

export const CATEGORIES = Object.keys(CATEGORY_MAP);
export const TYPES = Object.keys(TYPE_MAP);
