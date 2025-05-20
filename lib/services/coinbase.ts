// USD<>BTC https://api.coinbase.com/v2/prices/BTC-USD/spot
// EUR<>BTC https://api.coinbase.com/v2/prices/BTC-EUR/spot
// Conversion rates: https://www.coinbase.com/converter/usd/btc

const getBTCPrice = async () => {
  try {
    const response = await fetch(
      "https://api.coinbase.com/v2/prices/BTC-USD/spot"
    );
    const data = await response.json();
    return parseFloat(data.data.amount);
  } catch (error) {
    console.error("Error getting BTC price", error);
    return 99709.52;
  }
};

const getEURPrice = async () => {
  try {
    const response = await fetch(
      "https://api.coinbase.com/v2/prices/BTC-EUR/spot"
    );
    const data = await response.json();
    return parseFloat(data.data.amount);
  } catch (error) {
    console.error("Error getting EUR price", error);
    return 88287.43;
  }
};

export { getBTCPrice, getEURPrice };
