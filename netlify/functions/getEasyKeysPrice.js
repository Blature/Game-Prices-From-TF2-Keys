// Import required libraries
const fetch = require("node-fetch");
const cheerio = require("cheerio");

// The target URL
const targetUrl = "https://easykeys.ir/browse/tf2";
// Some websites block requests without a user-agent, so we add one.
const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

exports.handler = async (event, context) => {
  try {
    // Fetch the HTML content of the page
    const response = await fetch(targetUrl, {
      headers: { "User-Agent": userAgent },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          success: false,
          message: `Error fetching page: ${response.statusText}`,
        }),
      };
    }

    const html = await response.text();
    // Load the HTML into Cheerio to parse it
    const $ = cheerio.load(html);

    // Find the specific element containing the price using its CSS selectors
    const priceElement = $('span[dir="rtl"].text-teal-200.mr-4 b');

    if (priceElement.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          message:
            "Price element not found on the page. The website structure might have changed.",
        }),
      };
    }

    // Extract the price text (e.g., "187,600")
    const priceText = priceElement.text().trim();

    // Return the successful response
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, price: priceText }),
    };
  } catch (error) {
    console.error("Error scraping EasyKeys:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "An internal server error occurred while scraping.",
      }),
    };
  }
};
