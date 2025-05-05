import { test, expect } from '@playwright/test';

test.describe('채팅 기능', () => {

  test('특정 채팅방에 메시지 전송 및 확인', async ({ page }) => {
    // Given: 사용자가 로그인하여 채팅 목록 화면을 보고 있다
    // 초기 페이지 이동
    await page.goto('https://example.com/chat-list'); // 실제 채팅 목록 URL로 변경

    // And: 채팅 목록에 "스터디 그룹" 채팅방이 표시된다
    await test.step('스터디 그룹 채팅방이 채팅 목록에 표시되는지 확인', async () => {
      await expect(page.locator('text=스터디 그룹')).toBeVisible();
    });

    // When: 사용자가 채팅 목록에서 "스터디 그룹" 채팅방을 클릭하여 진입한다
    await test.step('"스터디 그룹" 채팅방 클릭', async () => {
      await page.locator('text=스터디 그룹').click();
      await page.waitForURL('**/chat/study-group'); // 실제 채팅방 URL로 변경, navigation 발생 대비
    });


    // And: 사용자가 메시지 입력 필드에 "안녕하세요, BDD 테스트 중입니다!"라고 입력한다
    await test.step('메시지 입력 필드에 텍스트 입력', async () => {
      await page.locator('input[name="message"]').fill('안녕하세요, BDD 테스트 중입니다!'); // 실제 메시지 입력 필드 selector로 변경
    });

    // And: 사용자가 "전송" 버튼을 클릭한다
    await test.step('"전송" 버튼 클릭', async () => {
      await page.locator('button:has-text("전송")').click(); // 실제 전송 버튼 selector로 변경
    });

    // Then: "스터디 그룹" 채팅방의 대화 내용 영역에 "안녕하세요, BDD 테스트 중입니다!" 메시지가 마지막 메시지로 표시된다
    await test.step('마지막 메시지가 올바르게 표시되는지 확인', async () => {
      const lastMessage = page.locator('.message:last-child'); // 실제 메시지 selector로 변경
      await expect(lastMessage).toContainText('안녕하세요, BDD 테스트 중입니다!');
    });
  });
});