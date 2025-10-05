const targetUrl = "https://easykeys.ir/browse/tf2";

function normalizePersianDigits(str) {
  const map = {
    "۰": "0",
    "۱": "1",
    "۲": "2",
    "۳": "3",
    "۴": "4",
    "۵": "5",
    "۶": "6",
    "۷": "7",
    "۸": "8",
    "۹": "9",
  };
  return str.replace(/[۰-۹]/g, (d) => map[d] || d);
}

exports.handler = async () => {
  try {
    // Use a prerender service to fetch rendered content (avoids headless browser in serverless)
    const prerenderUrl = `https://r.jina.ai/http://easykeys.ir/browse/tf2`;
    const response = await fetch(prerenderUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          success: false,
          message: `Error fetching prerendered page: ${response.statusText}`,
        }),
      };
    }

    const text = await response.text();
    // Clean Markdown markers to improve matching (e.g., **200,000**تومان)
    const cleaned = text
      .replace(/\*\*/g, "")
      .replace(/`/g, "")
      .replace(/\s+/g, " ");
    // Try to extract number preceding "تومان" allowing optional markup
    const match = cleaned.match(/([۰-۹0-9.,]+)\s*تومان/);
    if (!match) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          success: false,
          message: "Price not found in prerendered content.",
        }),
      };
    }

    const raw = match[1].trim();
    const normalized = normalizePersianDigits(raw).replace(/\s/g, "");

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ success: true, price: normalized }),
    };
  } catch (error) {
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
