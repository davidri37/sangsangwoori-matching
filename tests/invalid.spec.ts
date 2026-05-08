/**
 * 실패 시나리오
 *
 * WHEN   : /register 에서 이름 비움 + 나머지 입력 후 제출
 * THEN   : 빨간 에러 박스 노출 ("필수 항목" 문구)
 *          seniors 테이블에 새 레코드 미삽입
 *
 * 구현 방식: 브라우저 native validation(required 속성)을 비활성화(novalidate)하여
 *           서버 측 유효성 검사 코드를 직접 테스트
 */
import { test, expect } from '@playwright/test'
import { cleanE2EData, countE2ESeniors } from './helpers/db'

test.describe('실패 시나리오: 이름 누락 제출', () => {
  test.beforeEach(async () => {
    await cleanE2EData()
  })

  test.afterEach(async () => {
    await cleanE2EData()
  })

  test('이름 없이 제출하면 빨간 에러 박스 노출 + DB 미삽입', async ({ page }) => {
    await page.goto('/register')

    // 브라우저 native validation 비활성화 → 서버 액션의 유효성 검사 테스트
    await page.evaluate(() => {
      document.querySelector('form')!.setAttribute('novalidate', 'true')
    })

    // 이름 필드 비워둠, 나머지만 입력
    await page.locator('[data-slot="select-trigger"]').first().click()
    await page.getByRole('option', { name: '서울' }).click()
    await page.locator('[data-slot="select-trigger"]').nth(1).click()
    await page.getByRole('option', { name: '경비' }).click()
    await page.fill('#career_years', '3')
    await page.click('button[type="submit"]')

    // 이름 필드 위 빨간 에러 박스 노출 확인
    const errorBox = page.locator('.bg-red-50')
    await expect(errorBox).toBeVisible()
    await expect(errorBox).toContainText('이름을 입력해 주세요')

    // DB에 시니어 레코드 미삽입 확인
    const count = await countE2ESeniors()
    expect(count).toBe(0)
  })
})
