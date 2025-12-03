
import { test, expect } from '@playwright/test';

test.describe('Tranger User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Full Trip Lifecycle', async ({ page }) => {
    // 1. Change Language to verify i18n
    await page.getByRole('button', { name: 'EN' }).click(); // assuming default is EN
    // Toggle logic cycles EN -> TW -> JP -> EN. 
    // Just checking existence of button first.

    // 2. Create Trip (Manual)
    await page.getByRole('button', { name: 'New Trip' }).first().click();
    await page.getByPlaceholder('Add a city...').fill('London');
    await page.keyboard.press('Enter');
    
    // Disable AI
    await page.getByText('Use AI Assistant').click();
    await page.getByRole('button', { name: 'Create Empty Trip' }).click();

    // 3. Verify Dashboard -> Editor Transition
    await expect(page.getByText('Trip to London')).toBeVisible();

    // 4. Add Activity
    await page.getByRole('button', { name: 'Add Entry' }).first().click();
    await expect(page.getByText('Edit Activity')).toBeVisible();

    // 5. Fill Activity Form
    await page.locator('input[value="New Activity"]').fill('Morning Coffee');
    await page.getByPlaceholder('Add location...').fill('Cafe Nero');
    await page.getByText('Save').click();

    // 6. Verify Activity on Board
    await expect(page.getByText('Morning Coffee')).toBeVisible();
    await expect(page.getByText('Cafe Nero')).toBeVisible();

    // 7. Open Chat
    await page.getByTitle('Chat').click();
    await page.getByPlaceholder('Type a message...').fill('Meeting here?');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByText('Meeting here?')).toBeVisible();

    // 8. Edit Trip Settings
    await page.getByTitle('Settings').click();
    await page.locator('input[value="Trip to London"]').fill('UK Adventure');
    await page.getByText('Save Changes').click();
    
    // 9. Verify Name Change
    await expect(page.getByText('UK Adventure')).toBeVisible();
  });
});
