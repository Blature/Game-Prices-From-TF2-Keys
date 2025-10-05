// This is your serverless function
exports.handler = async (event, context) => {
  const appId = 440;
  const currency = 18; // Ukraine
  const marketHashName = "Mann Co. Supply Crate Key";
  const steamApiUrl = `https://steamcommunity.com/market/priceoverview/?appid=${appId}&currency=${currency}&market_hash_name=${encodeURIComponent(
    marketHashName
  )}`;

  try {
    // Use Node 18+ global fetch available in Netlify runtime
    const response = await fetch(steamApiUrl);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error("Failed to fetch price from Steam");
    }

    // Return a successful response to the browser
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    // Return an error response to the browser
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ success: false, message: error.message }),
    };
  }
};
