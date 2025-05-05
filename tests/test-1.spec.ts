import { test, expect } from '@playwright/test';

test('네이버 침착맨 검색 및 나무위키 확인', async ({ page }) => {
  await page.goto('https://www.naver.com/');

  // 검색어 입력 및 검색 (data-testid 활용 예시)
  await page.locator('[data-testid="search-input"]').click();
  await page.locator('[data-testid="search-input"]').fill('침착맨');
  await page.getByRole('button', { name: '검색' }).click();

  // 검색 결과 검증
  await expect(page.locator('body')).toContainText('침착맨');

  // 프로필 링크 클릭 및 새 탭 열기 대기
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: '침착맨 - 나무위키' }).click();
  const page1 = await page1Promise;

  // 새 탭 로드 완료 대기 및 URL 검증
  await page1.waitForLoadState();
  await expect(page1).toHaveURL(/namu\.wiki/); // 나무위키 URL 패턴 확인 (정확한 URL은 아님)
  await expect(page1).toHaveTitle(/침착맨/); // 제목에 '침착맨'이 포함되어 있는지 확인 (정확한 제목은 아님)

  // 특정 콘텐츠 존재 여부 검증 (예시)
  await page1.waitForSelector('h2:has-text("유튜브")'); // 유튜브 헤딩이 나타날 때까지 대기
  await expect(page1.getByRole('heading', { name: '유튜브' })).toBeVisible(); // 유튜브 헤딩이 보이는지 확인

  // 추가적인 콘텐츠 검증 (예시)
  await expect(page1.locator('body')).toContainText('유튜브 채널');
});