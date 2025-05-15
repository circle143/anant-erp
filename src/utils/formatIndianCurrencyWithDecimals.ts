export const formatIndianCurrencyWithDecimals = (
  input: number | string
): string => {
  const num = typeof input === "string" ? parseFloat(input) : input;
  if (isNaN(num)) return "Invalid number";

  const [integerPart, decimalPart] = num.toString().split(".");

  const formattedInteger = new Intl.NumberFormat("en-IN").format(
    Number(integerPart)
  );

  return decimalPart
    ? `₹${formattedInteger}.${decimalPart}`
    : `₹${formattedInteger}`;
};
