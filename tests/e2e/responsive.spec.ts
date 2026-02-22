import { test, expect } from '@playwright/test'

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1024, height: 1440 },
]

viewports.forEach(({ name, width, height }) => {
  test.describe(`Responsive Layout - ${name}`, () => {
    test.use({ viewport: { width, height } })

    test('should render correctly', async ({ page }) => {
      await page.goto('/')

      // Main elements should be visible
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('aside')).toBeVisible()
    })

    test('should not have horizontal overflow', async ({ page }) => {
      await page.goto('/')

      const body = await page.locator('body')
      const boundingBox = await body.boundingBox()

      expect(boundingBox?.width).toBeLessThanOrEqual(width)
    })
  })
})
