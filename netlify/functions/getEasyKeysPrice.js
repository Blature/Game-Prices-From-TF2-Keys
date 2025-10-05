// Import required libraries
const cheerio = require("cheerio");

// The target URL
const targetUrl = "https://easykeys.ir/browse/tf2";
// Some websites block requests without a user-agent, so we add one.
const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

exports.handler = async (event, context) => {
  try {
    // Use dynamic import to be compatible with node-fetch v3 (ESM-only)
    const fetch = (await import("node-fetch")).default;

    // Fetch the HTML content of the page
    const response = await fetch(targetUrl, {
      headers: { "User-Agent": userAgent },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          message: `Error fetching page: ${response.statusText}`,
        }),
      };
    }

    const html = await response.text();
    // Load the HTML into Cheerio to parse it
    const $ = cheerio.load(html);

    // Try multiple selectors for resilience based on Puppeteer probe
    const selectors = [
      'span[dir="rtl"].text-teal-200.mr-4 b',
      'div.flex-auto:nth-child(1) > div.flex.flex-wrap:nth-child(1) > div.pt-6.px-2.text-center:nth-child(2) > p.mt-3.text-sm.text-gray-500:nth-child(2) > span.text-teal-200.mr-4:nth-child(1) > b:nth-child(1)'
    ];

    let priceText = '';
    for (const sel of selectors) {
      const el = $(sel);
      if (el && el.length) {
        priceText = el.first().text().trim();
        if (priceText) break;
      }
    }

    if (!priceText) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          message:
            "Price element not found with known selectors. The website structure might have changed.",
        }),
      };
    }

    // Return the successful response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: true, price: priceText }),
    };
  } catch (error) {
    console.error("Error scraping EasyKeys:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        message: "An internal server error occurred while scraping.",
      }),
    };
  }
};
