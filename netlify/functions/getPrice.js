// This is your serverless function
exports.handler = async (event, context) => {
  const appId = 440;
  const currency = 18; // Ukraine
  const marketHashName = "Mann Co. Supply Crate Key";
  const steamApiUrl = `https://steamcommunity.com/market/priceoverview/?appid=${appId}&currency=${currency}&market_hash_name=${encodeURIComponent(
    marketHashName
  )}`;

  try {
    // We need to import 'node-fetch' because serverless functions don't have the browser's fetch
    // Run 'npm install node-fetch' in your project folder
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(steamApiUrl);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error("Failed to fetch price from Steam");
    }

    // Return a successful response to the browser
    return {
      statusCode: 200,
      headers: {
        // This header is VERY IMPORTANT to solve the CORS issue
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    // Return an error response to the browser
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message }),
    };
  }
};
