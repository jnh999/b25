export const amountToSmallestUnit = (amount: number, currency: string) => {
  if (currency === "BTC") {
    return amount * 100000000;
  }
  return amount * 1000000;
};

export const amountToLargestUnit = (amount: number, currency: string) => {
  if (currency === "BTC") {
    return amount / 100000000;
  }
  return amount / 1000000;
};

export const placeholderBitcoinPriceUsd = 103100;

export const convert = (
  sourceCurrency: string,
  sourceAmount: number,
  targetCurrency: string
) => {
  return sourceAmount * placeholderBitcoinPriceUsd;
};
