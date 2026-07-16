export const formatINR = (amount: number | string): string => {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};
