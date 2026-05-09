/**
 * 엣지 시나리오: 조건 불일치로 매칭 없음
 *
 * GIVEN  : jobs 테이블에 E2E 전용 공고 "부산/청소/요구경력 10년" 1건 추가
 * WHEN   : /register 에서 "서울/경비/3년" 시니어 등록
 * THEN   : 등록 자체는 성공 (초록 박스)
 *          해당 E2E 공고와 이 시니어 간 매칭이 0건 (매칭 로직 검증)
 *
 * 점수 산출 (E2E 공고 기준):
 *   지역: '서울' ≠ '부산' → 0
 *   직종: '경비' ≠ '청소' (includes 불일치) → 0
 *   경력: 3 < 10 → 0
 *   합계: 0점 → matches 미삽입 ✓
 *
 * 격리 한계: 공유 DB에 required_career=0 인 실제 공고가 존재하므로
 *   해당 공고들과의 매칭은 발생합니다(경력 20점).
 *   따라서 /admin 미매칭 섹션 대신 DB를 직접 쿼리하여
 *   "E2E 공고 ↔ E2E 시니어" 매칭 건수가 0 임을 검증합니다.
 *
 * 스펙 참고: "기타/기타/0년" 공고는 경력 조건(3>=0 → +20점)으로 매칭이
 *   생성되므로, 경력도 불일치하는 "부산/청소/10년"을 사용합니다.
 */
import { test, expect } from '@playwright/test'
import { cleanE2EData, insertJob, countMatchesBetweenE2ESeniorAndE2EJobs } from './helpers/db'

const SENIOR_NAME = 'E2E-미매칭시니어'

test.describe('엣지 시나리오: 조건 불일치로 매칭 없음', () => {
  test.beforeEach(async () => {
    await cleanE2EData()
    // 서울/경비 시니어와 지역·직종·경력 모두 불일치하는 공고
    await insertJob({
      title: '부산청소부',
      region: '부산',
      job_type: '청소',
      required_career: 10,
    })
  })

  test.afterEach(async () => {
    await cleanE2EData()
  })

  test('E2E 공고와 시니어 간 매칭 0건 — 비매칭 로직 검증', async ({ page }) => {
    // --- 서울/경비/3년 시니어 등록 ---
    await page.goto('/register')
    await page.fill('#name', SENIOR_NAME)
    await page.locator('[data-slot="select-trigger"]').first().click()
    await page.getByRole('option', { name: '서울' }).click()
    await page.locator('[data-slot="select-trigger"]').nth(1).click()
    await page.getByRole('option', { name: '경비' }).click()
    await page.fill('#career_years', '3')
    await page.click('button[type="submit"]')

    // 등록 성공 메시지 확인
    const successBox = page.locator('.bg-green-50')
    await expect(successBox).toBeVisible()
    await expect(successBox).toContainText('등록이 완료되었습니다')

    // --- 핵심 검증: E2E 공고(부산/청소/10년)와의 매칭이 0건 ---
    // 공유 DB의 실제 공고는 일부 매칭이 될 수 있으나,
    // 이 테스트는 "조건 불일치 공고는 매칭을 생성하지 않는다"는 로직을 검증합니다.
    const matchCount = await countMatchesBetweenE2ESeniorAndE2EJobs(SENIOR_NAME)
    expect(matchCount).toBe(0)
  })
})
