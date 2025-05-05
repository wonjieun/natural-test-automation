import { test, expect } from '@playwright/test';

test.describe('사용자 로그인', () => {
  test('유효한 정보로 로그인 성공', async ({ page }) => {

    // Given: 사용자가 로그인 페이지에 접속한다
    await page.goto('/login');  // 초기 페이지 이동

    await test.step('When: 사용자가 아이디 입력란에 "valid_user"를 입력한다', async () => {
      await page.locator('#username').fill('valid_user');
    });

    await test.step('And: 사용자가 비밀번호 입력란에 "valid_password"를 입력한다', async () => {
      await page.locator('#password').fill('valid_password');
    });

    await test.step('And: 사용자가 "로그인" 버튼을 클릭한다', async () => {
      await page.locator('button:has-text("로그인")').click();
    });

    await test.step('Then: 사용자는 "대시보드" 페이지로 이동한다', async () => {
      await expect(page).toHaveURL('/dashboard');
    });

    await test.step('And: 사용자는 "환영합니다, valid_user님!" 메시지를 본다', async () => {
      await expect(page.locator('#welcome-message')).toHaveText('환영합니다, valid_user님!');
    });
  });
});