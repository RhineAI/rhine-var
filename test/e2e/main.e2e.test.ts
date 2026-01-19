import { Page, Browser } from 'puppeteer'

let browser: Browser
let page: Page

describe('test e2e', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000')
  })
})
