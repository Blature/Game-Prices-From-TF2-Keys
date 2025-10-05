const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

const targetUrl = "https://easykeys.ir/browse/tf2";

exports.handler = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"
    );
    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 30000 });

    const selectors = [
      'span[dir="rtl"].text-teal-200.mr-4 b',
      'div.flex-auto:nth-child(1) > div.flex.flex-wrap:nth-child(1) > div.pt-6.px-2.text-center:nth-child(2) > p.mt-3.text-sm.text-gray-500:nth-child(2) > span.text-teal-200.mr-4:nth-child(1) > b:nth-child(1)'
    ];

    let priceText = "";
    for (const sel of selectors) {
      try {
        await page.waitForSelector(sel, { timeout: 8000 });
        const text = await page.$eval(sel, (el) => el.textContent.trim());
        if (text) {
          priceText = text;
          break;
        }
      } catch {}
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
            "Price element not found with known selectors after rendering the page.",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: true, price: priceText }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: false, message: error.message }),
    };
  } finally {
    if (browser) await browser.close();
  }
};
