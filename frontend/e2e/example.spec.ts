import { test, expect } from '@playwright/test'

test('homepage has title', async ({ page }) => {
  await page.goto('/')

  // Expect the page title to contain Bulletin Board
  await expect(page.locator('h1')).toContainText('Bulletin Board')
})

test('can navigate to create post', async ({ page }) => {
  await page.goto('/')

  // Click on New Post button
  await page.click('text=New Post')

  // Wait for navigation or form appearance
  // This is a placeholder - adjust based on actual implementation
  await page.waitForTimeout(500)
})
