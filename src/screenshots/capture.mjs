import puppeteer from 'puppeteer'

const BASE = 'http://localhost:5173'

const PAGES = [
  { path: '/',              name: '01-splash' },
  { path: '/onboarding',    name: '02-onboarding-step1' },
  { path: '/home',          name: '03-home' },
  { path: '/plan',          name: '04-plan' },
  { path: '/chat',          name: '05-chat' },
  { path: '/trips',         name: '06-trips' },
  { path: '/feed',          name: '07-feed' },
  { path: '/profile',       name: '08-profile' },
  { path: '/stats',         name: '09-stats' },
  { path: '/pro',           name: '10-pro-paywall' },
  { path: '/auth',          name: '11-auth' },
]

async function capture() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()

  // Mobile-first viewport matching the app's design
  await page.setViewport({ width: 390, height: 844 })

  console.log('📸 ROAMIE Screenshot Capture\n')

  for (const { path, name } of PAGES) {
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle0', timeout: 15000 })
      // Let animations settle
      await new Promise(r => setTimeout(r, 2000))

      // Scroll to bottom to trigger lazy content, then back to top
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await new Promise(r => setTimeout(r, 500))
      await page.evaluate(() => window.scrollTo(0, 0))
      await new Promise(r => setTimeout(r, 300))

      const filePath = `src/screenshots/${name}.png`
      await page.screenshot({ path: filePath, fullPage: true })
      console.log(`  ✅ ${name}.png — ${path}`)
    } catch (err) {
      console.error(`  ❌ ${name}.png — ${path}: ${err.message}`)
    }
  }

  await browser.close()
  console.log('\n🎉 All screenshots captured in src/screenshots/')
}

capture()
