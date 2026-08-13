import { test, expect } from '@playwright/test';

test.describe('Order Lifecycle E2E Flow', () => {
  test('Complete Order Creation and Payment Flow', async ({ page }) => {
    // Generate a unique email for the test
    const timestamp = Date.now();
    const testEmail = `testuser_${timestamp}@example.com`;
    const testPassword = 'Password123!';

    // 1. Register a new user
    await page.goto('http://localhost:3000/register');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.locator('h1')).toContainText('Orders');

    // 2. Go to Create Order page
    await page.click('text="Create Order"');
    await expect(page).toHaveURL('http://localhost:3000/orders/new');

    // 3. Fill in Order Details
    await page.fill('input[name="customer"]', 'Playwright Corp');
    
    // Fill in a due date in the future to ensure 'pending' status instead of 'overdue'
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateString = futureDate.toISOString().split('T')[0];
    await page.fill('input[name="dueDate"]', dateString);

    // Add a line item (description, qty: 2, price: 50.00 -> Total: 100)
    await page.fill('input[placeholder="Item name"]', 'Consulting Services');
    await page.fill('input[type="number"][min="1"]', '2');
    await page.fill('input[type="number"][min="0"]', '50');

    // Submit Order
    await page.click('button[type="submit"]');

    // 4. Wait for redirect to order details page
    await page.waitForURL(/\/orders\/[a-zA-Z0-9_-]+/);
    await expect(page.locator('h1')).toContainText('Order from Playwright Corp');
    
    // Verify initial status is Pending
    await expect(page.locator('span', { hasText: 'Pending' })).toBeVisible();
    await expect(page.locator('text="$100.00"').first()).toBeVisible();

    // 5. Make a partial payment ($40)
    await page.fill('input[name="amount"]', '40');
    await page.fill('textarea[name="note"]', 'First installment');
    await page.click('button:has-text("Submit Payment")');

    // Wait for success toast or UI update
    await expect(page.locator('text="Payment recorded successfully!"')).toBeVisible();

    // Verify status changed to Partial
    await expect(page.locator('span', { hasText: 'Partial' })).toBeVisible();
    
    // Verify Amount Due is $60.00
    await expect(page.locator('dd:has-text("$60.00")')).toBeVisible();

    // 6. Pay remainder ($60)
    await page.fill('input[name="amount"]', '60');
    await page.fill('textarea[name="note"]', 'Final installment');
    await page.click('button:has-text("Submit Payment")');

    // Wait for success toast
    await expect(page.locator('text="Payment recorded successfully!"')).toBeVisible();

    // 7. Verify status changed to Paid
    await expect(page.locator('span', { hasText: 'Paid' })).toBeVisible();
    
    // Verify Amount Due is $0.00
    await expect(page.locator('dd:has-text("$0.00")')).toBeVisible();
    
    // Verify the payment form disappears (no longer amount due > 0)
    await expect(page.locator('button:has-text("Submit Payment")')).not.toBeVisible();
  });
});
