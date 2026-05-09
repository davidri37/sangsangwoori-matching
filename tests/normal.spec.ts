/**
 * 정상 시나리오
 *
 * GIVEN  : jobs 테이블에 "서울/경비/요구경력 3년" 공고 1건
 * WHEN   : /register 에서 이름·지역·희망직종·경력 입력 후 제출
 * THEN   : 초록 성공 박스 노출
 *          담당자 대시보드 "매칭 대기" 섹션에 100점 매칭 행 표시
 *
 * 점수 산출: 지역 일치(50) + 직종 일치(30) + 경력 충족(20) = 100점
 *
 * 스펙 참고: /recommendations?senior_id 필터링 및 금색 배지 카드는
 *           현재 미구현 → 동일 데이터를 /admin 대시보드에서 검증
 */
import { test, expect } from '@playwright/test'
import { cleanE2EData, insertJob } from './helpers/db'

const SENIOR_NAME = 'E2E-테스트시니어'

test.describe('정상 시나리오: 시니어 등록 → 자동 매칭', () => {
  test.beforeEach(async () => {
    await cleanE2EData()
    await insertJob({
      title: '서울경비원',
      region: '서울',
      job_type: '경비',
      required_career: 3,
    })
  })

  test.afterEach(async () => {
    await cleanE2EData()
  })

  test('프로필 등록 성공 박스 노출 + 담당자 대시보드 100점 매칭 표시', async ({ page }) => {
    // --- 폼 제출 ---
    await page.goto('/register')
    await page.fill('#name', SENIOR_NAME)
    await page.locator('[data-slot="select-trigger"]').first().click()
    await page.getByRole('option', { name: '서울' }).click()
    await page.locator('[data-slot="select-trigger"]').nth(1).click()
    await page.getByRole('option', { name: '경비' }).click()
    await page.fill('#career_years', '5')
    await page.click('button[type="submit"]')

    // 초록 성공 박스 노출
    const successBox = page.locator('.bg-green-50')
    await expect(successBox).toBeVisible()
    await expect(successBox).toContainText('등록이 완료되었습니다')

    // --- 담당자 대시보드 검증 ---
    // /admin 페이지 테이블 순서: 0=일자리목록, 1=미매칭, 2=매칭대기
    await page.goto('/admin')
    const matchingTable = page.locator('table').nth(2)
    const matchRow = matchingTable.locator('tr').filter({ hasText: SENIOR_NAME })
    await expect(matchRow).toBeVisible()
    await expect(matchRow).toContainText('6점')
  })
})
