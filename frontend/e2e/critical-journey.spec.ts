import { test, expect } from '@playwright/test';

test.describe('Critical User Journey: Registration -> Order Creation -> Payment', () => {
  const uniqueId = Date.now();
  const testUser = {
    email: `testuser_${uniqueId}@example.com`,
    password: 'Password123!',
  };

  test('completes full flow successfully', async ({ page }) => {
    // 1. Register a new user
    await page.goto('http://localhost:3000/register');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    
    // Wait for navigation after registration
    await Promise.all([
      page.waitForURL('http://localhost:3000/'),
      page.click('button[type="submit"]')
    ]);

    await expect(page).toHaveURL('http://localhost:3000/');

    // 2. Go to New Order
    await Promise.all([
      page.waitForURL('**/orders/new'),
      page.click('text="Create Order"')
    ]);

    // 3. Create an Order
    await page.fill('input[name="customer"]', 'Acme Corporation');
    await page.fill('input[name="dueDate"]', '2026-12-31');
    
    // Line item 1
    await page.fill('input[placeholder="Item name"]', 'Widget A');
    await page.locator('div').filter({ hasText: /^Quantity$/ }).locator('input').fill('10');
    await page.locator('div').filter({ hasText: /^Price \(\$\)$/ }).locator('input').fill('500'); // 5.00

    await Promise.all([
      page.waitForURL('**/orders/*'),
      page.click('button[type="submit"]')
    ]);

    // Ensure we are on the order details page
    await expect(page).toHaveURL(/.*\/orders\/[a-f0-9]+$/);
    
    // Verify status is Pending
    await expect(page.locator('text=Pending')).toBeVisible();

    // 4. Add Payment
    await page.fill('input[name="amount"]', '5000'); // Full payment (10 * 500)
    await page.fill('textarea[name="note"]', 'Paid in full');

    await page.click('button:has-text("Submit Payment")');

    // Verify status changed to Paid
    // Depending on UI updates, we might need to wait for the status to change
    await expect(page.locator('text=Paid').first()).toBeVisible();
    
    // Verify Audit Log is displayed
    await expect(page.getByText('ORDER CREATED', { exact: true })).toBeVisible();
    await expect(page.getByText('PAYMENT ADDED', { exact: true })).toBeVisible();
  });
});
