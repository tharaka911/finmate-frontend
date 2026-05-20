export const CATEGORY_MAP = {
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
  OTHER: "Other Expenses"
};

export const TYPE_MAP = {
  CASH: "Cash Payment",
  CREDIT: "Credit Card"
};

export const getCategoryLabel = (category) => CATEGORY_MAP[category] || category;
export const getTypeLabel = (type) => TYPE_MAP[type] || type;

export const CATEGORIES = Object.keys(CATEGORY_MAP);
export const TYPES = Object.keys(TYPE_MAP);
