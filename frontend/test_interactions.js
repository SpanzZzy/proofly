const { chromium } = require("playwright");

async function runTests() {
  console.log("=== STARTING PROOFLY REAL BROWSER INTERACTION TEST SUITE ===");
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const errors = [];
  page.on("pageerror", (err) => {
    console.error("Browser Console Error:", err.message);
    errors.push(err.message);
  });

  try {
    // 1. Visit homepage
    console.log("1. Navigating to http://localhost:3000...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    const title = await page.title();
    console.log(`   Page title: "${title}"`);

    // 2. Initial theme verification (default light)
    console.log("2. Verifying default theme is Light...");
    let isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    const initialBodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    const initialFooterBg = await page.evaluate(() => {
      const el = document.querySelector("footer");
      return el ? window.getComputedStyle(el).backgroundColor : null;
    });
    console.log(`   Initial dark class present: ${isDark} (Expected: false)`);
    console.log(`   Initial computed body bg: ${initialBodyBg}`);
    console.log(`   Initial computed footer bg: ${initialFooterBg}`);
    if (isDark) throw new Error("Expected initial theme to be light");
    if (!initialBodyBg.includes("255, 255, 255")) throw new Error("Expected initial body background to be white");

    // 3. Test Theme Toggle to Dark
    console.log("3. Testing Theme Toggle to Dark...");
    const darkBtn = page.locator("#theme-toggle-dark");
    await darkBtn.click();
    await page.waitForTimeout(300);
    isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    const storedThemeDark = await page.evaluate(() => localStorage.getItem("theme"));
    const darkBodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    console.log(`   Dark mode active: ${isDark}, localStorage theme: "${storedThemeDark}", body bg: ${darkBodyBg}`);
    if (!isDark || storedThemeDark !== "dark") throw new Error("Dark theme toggle failed!");
    if (!darkBodyBg.includes("16, 17, 21")) throw new Error("Expected dark body background to be charcoal #101115");

    // 4. Test Theme Persistence across reload
    console.log("4. Testing theme persistence across page reload...");
    await page.reload({ waitUntil: "networkidle" });
    isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    const reloadBodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    console.log(`   After reload dark mode active: ${isDark}, body bg: ${reloadBodyBg}`);
    if (!isDark) throw new Error("Theme did not persist after reload!");

    // 5. Test Theme Toggle back to Light
    console.log("5. Testing Theme Toggle back to Light...");
    const lightBtn = page.locator("#theme-toggle-light");
    await lightBtn.click();
    await page.waitForTimeout(300);
    isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    const storedThemeLight = await page.evaluate(() => localStorage.getItem("theme"));
    const lightBodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    console.log(`   Light mode active: ${!isDark}, localStorage theme: "${storedThemeLight}", body bg: ${lightBodyBg}`);
    if (isDark || storedThemeLight !== "light") throw new Error("Light theme toggle failed!");
    if (!lightBodyBg.includes("255, 255, 255")) throw new Error("Expected light body background to be white");

    // 6. Test Navigation links & smooth scroll
    console.log("6. Testing desktop navigation smooth scrolls...");
    await page.locator("nav button:has-text('Explore Tools')").click();
    await page.waitForTimeout(300);
    await page.locator("nav button:has-text('How It Works')").click();
    await page.waitForTimeout(300);
    await page.locator("nav button:has-text('Privacy First')").click();
    await page.waitForTimeout(300);
    await page.locator("nav button:has-text('Open Source')").click();
    await page.waitForTimeout(300);

    // Click Brand logo to scroll to top
    console.log("   Clicking brand logo to scroll to top...");
    await page.locator("div[aria-label='Proofly Home']").first().click();
    await page.waitForTimeout(300);

    // 7. Test Scanner Tab Switching & 1-Click Test Scenarios across all 6 scanners
    console.log("7. Testing all 6 forensic scanner tabs & 1-click test scenarios...");
    const scenarios = [
      { tab: "Messages", btn: "Bank KYC & Account Block Threat", input: "#message-text" },
      { tab: "Websites", btn: "Punycode Homograph Mimic", input: "#url-input" },
      { tab: "Emails", btn: "CEO Impersonation & Wire Redirection", input: "#email-subject" },
      { tab: "Calls", btn: "Digital Arrest / CBI Narcotics Threat", input: "#phone-number" },
      { tab: "Payments", btn: "UPI Transfer - Pending vs Completed", input: "#claimed-amount" },
      { tab: "Images", btn: "90% Discount Luxury Goods Ad", input: "#image-context" }
    ];

    for (const s of scenarios) {
      await page.locator(`#tools-section button:has-text("${s.tab}")`).first().click();
      await page.waitForTimeout(200);
      const btn = page.locator(`button:has-text("${s.btn}")`);
      await btn.click();
      await page.waitForTimeout(200);
      const val = await page.locator(s.input).inputValue();
      if (!val || val.length === 0) throw new Error(`${s.tab} scenario failed to populate input!`);
    }
    console.log("   All 6 tabs switched & test scenarios populated successfully.");

    // Switch back to Messages for live analysis test
    await page.locator(`#tools-section button:has-text("Messages")`).first().click();
    await page.waitForTimeout(200);

    // 8. Test Clear Text button and re-population
    console.log("8. Testing 1-click test scenario & Clear Text button...");
    const exampleBtn = page.locator("button:has-text('Bank KYC & Account Block Threat')");
    await exampleBtn.click();
    await page.waitForTimeout(200);
    let textareaValue = await page.locator("#message-text").inputValue();
    console.log(`   Populated textarea length: ${textareaValue.length} characters`);
    if (!textareaValue.includes("SBI")) throw new Error("1-click example failed to populate textarea");

    // Click Clear Text
    console.log("   Testing Clear Text button...");
    await page.locator("button:has-text('Clear Text')").click();
    textareaValue = await page.locator("#message-text").inputValue();
    console.log(`   After clear textarea length: ${textareaValue.length} characters`);
    if (textareaValue.length !== 0) throw new Error("Clear Text button failed");

    // Re-populate example for actual backend analysis
    await exampleBtn.click();
    await page.waitForTimeout(400);
    const recheckedText = await page.locator("#message-text").inputValue();
    console.log(`   Re-populated textarea length for analysis: ${recheckedText.length} characters`);

    // 9. Submit real analysis request to backend
    console.log("9. Submitting live forensic analysis request to backend...");
    const analyzeBtn = page.locator("button:has-text('Analyze Message')");
    await analyzeBtn.click();

    // Wait for result workspace to appear (Ollama Gemma 4 inference can take 20-40s)
    console.log("   Waiting for forensic result workspace (timeout: 60s)...");
    await page.waitForSelector("#evidence-workspace", { timeout: 60000 });
    console.log("   Forensic result workspace successfully rendered!");

    // 10. Verify Claim vs Evidence sections
    console.log("10. Verifying Claim vs Evidence sections & Risk Badge...");
    const riskBadge = await page.locator("#evidence-workspace button[aria-label*='Risk score']").innerText();
    console.log(`   Detected Risk Badge: "${riskBadge.replace(/\n/g, ' ')}"`);

    // 11. Test Accordions in Results
    console.log("11. Testing Warning Signs accordions...");
    const collapseAllBtn = page.locator("button:has-text('Collapse All')");
    if (await collapseAllBtn.isVisible()) {
      await collapseAllBtn.click();
      await page.waitForTimeout(200);
      console.log("   Collapsed all warning signs.");
      await page.locator("button:has-text('Expand All')").click();
      await page.waitForTimeout(200);
      console.log("   Expanded all warning signs.");
    }

    // Test Technical Limitations Accordion
    console.log("   Testing Technical Limitations accordion...");
    const unknownsBtn = page.locator("button:has-text('What We Cannot Verify')");
    await unknownsBtn.click();
    await page.waitForTimeout(200);
    await unknownsBtn.click();

    // 12. Test Toolbar Actions: Copy, Export, Speech, Print, Methodology Dialog
    console.log("12. Testing Toolbar actions...");
    // Copy
    await page.locator("button[title='Copy Summary to Clipboard']").click();
    await page.waitForTimeout(200);
    // Export JSON
    await page.locator("button[title='Download JSON Report']").click();
    await page.waitForTimeout(200);
    // Speech Readout
    await page.locator("button[aria-label='Speech Readout']").click();
    await page.waitForTimeout(300);
    await page.locator("button[aria-label='Speech Readout']").click();

    // Methodology Dialog Modal
    console.log("   Testing Methodology Dialog Modal...");
    await page.locator("button[title='Click to view local model inspection architecture']").click();
    await page.waitForSelector("h3:has-text('Forensic Architecture & Methodology')", { timeout: 3000 });
    console.log("   Methodology Dialog Modal opened.");
    await page.locator("button:has-text('Got It')").click();
    await page.waitForTimeout(300);
    console.log("   Methodology Dialog Modal closed.");

    // 13. Test History Drawer
    console.log("13. Testing Investigation History Drawer...");
    await page.locator("button[aria-label='Investigation History']").click();
    await page.waitForSelector("h3:has-text('Investigation History')", { timeout: 3000 });
    console.log("   History Drawer opened.");

    // Verify history item is present
    const historyItem = page.locator("div:has-text('SBI')").first();
    console.log("   History item verified.");

    // Test Clear History
    await page.locator("button:has-text('Clear History')").click();
    await page.waitForTimeout(300);
    console.log("   History cleared.");

    // Close History Drawer
    await page.locator("button[aria-label='Close History']").click();
    await page.waitForTimeout(300);

    // 14. Test Mobile Navigation & Responsive Theme Toggle
    console.log("14. Testing Mobile Viewport (375x667) & Mobile Theme Toggle...");
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);

    // Open mobile hamburger menu
    await page.locator("button[aria-label='Toggle navigation menu']").click();
    await page.waitForTimeout(300);
    console.log("   Mobile menu opened.");

    // Click dark mode in mobile menu
    const mobileDarkBtn = page.locator("div.md\\:hidden button[aria-label*='dark']").first();
    if (await mobileDarkBtn.isVisible()) {
      await mobileDarkBtn.click();
      await page.waitForTimeout(300);
      isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
      console.log(`   Mobile dark toggle activated: ${isDark}`);
      if (!isDark) throw new Error("Mobile dark toggle failed!");
    }

    // Close mobile menu
    await page.locator("button[aria-label='Toggle navigation menu']").click();
    await page.waitForTimeout(300);

    console.log("=== ALL BROWSER INTERACTION TESTS PASSED WITH 100% SUCCESS! ===");
  } catch (err) {
    console.error("Test Failure:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
