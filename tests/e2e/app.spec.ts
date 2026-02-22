import { test, expect } from '@playwright/test'

test.describe('Agent Teams Monitor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the main page', async ({ page }) => {
    // Check that the header is visible
    await expect(page.locator('header')).toBeVisible()

    // Check that the logo is visible
    await expect(page.getByText('Agent Teams')).toBeVisible()

    // Check that the sidebar is visible
    await expect(page.locator('aside')).toBeVisible()
  })

  test('should display connection status', async ({ page }) => {
    // In demo mode, should show connected status
    await expect(page.getByText('已连接')).toBeVisible()
  })

  test('should display demo conversations', async ({ page }) => {
    // Check that demo conversations are visible
    await expect(page.getByText('planner')).toBeVisible()
    await expect(page.getByText('code-reviewer')).toBeVisible()
  })

  test('should display message list', async ({ page }) => {
    // Check that messages are visible
    await expect(page.getByText('收到任务：实现用户认证系统')).toBeVisible()
  })

  test('should have working filter button', async ({ page }) => {
    // Click filter button
    await page.getByRole('button', { name: '筛选' }).click()

    // Check that filter options are visible
    await expect(page.getByText('全部类型')).toBeVisible()
    await expect(page.getByText('全部状态')).toBeVisible()
  })
})
