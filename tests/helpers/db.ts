import { createClient } from '@supabase/supabase-js'

export const E2E_PREFIX = 'E2E-'

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not set. .env.local 파일을 확인하세요.')
  return createClient(url, key)
}

/**
 * E2E 테스트용 데이터를 모두 삭제합니다.
 * matches → seniors, jobs 순서로 삭제 (FK 제약 준수)
 */
export async function cleanE2EData(): Promise<void> {
  const db = client()

  const [{ data: seniors }, { data: jobs }] = await Promise.all([
    db.from('seniors').select('id').like('name', `${E2E_PREFIX}%`),
    db.from('jobs').select('id').like('title', `${E2E_PREFIX}%`),
  ])

  const seniorIds = (seniors ?? []).map((s: any) => s.id as string)
  const jobIds = (jobs ?? []).map((j: any) => j.id as string)

  if (seniorIds.length > 0) {
    await db.from('matches').delete().in('senior_id', seniorIds)
    await db.from('seniors').delete().in('id', seniorIds)
  }
  if (jobIds.length > 0) {
    await db.from('matches').delete().in('job_id', jobIds)
    await db.from('jobs').delete().in('id', jobIds)
  }
}

export async function insertJob(params: {
  title: string
  region: string
  job_type: string
  required_career: number
}): Promise<string> {
  const db = client()
  const { data, error } = await db
    .from('jobs')
    .insert({ ...params, title: `${E2E_PREFIX}${params.title}` })
    .select('id')
    .single()
  if (error || !data) throw new Error(`insertJob 실패: ${error?.message}`)
  return (data as any).id as string
}

export async function countE2ESeniors(): Promise<number> {
  const db = client()
  const { data } = await db.from('seniors').select('id').like('name', `${E2E_PREFIX}%`)
  return (data ?? []).length
}

/**
 * E2E 시니어(이름으로 검색)와 E2E 공고 간 매칭 건수를 반환합니다.
 * 실제 공고가 DB에 남아 있어도 E2E 공고 기준으로만 검증할 수 있습니다.
 */
export async function countMatchesBetweenE2ESeniorAndE2EJobs(
  seniorName: string,
): Promise<number> {
  const db = client()

  const [{ data: seniors }, { data: jobs }] = await Promise.all([
    db.from('seniors').select('id').eq('name', seniorName),
    db.from('jobs').select('id').like('title', `${E2E_PREFIX}%`),
  ])

  const seniorIds = (seniors ?? []).map((s: any) => s.id as string)
  const jobIds = (jobs ?? []).map((j: any) => j.id as string)

  if (seniorIds.length === 0 || jobIds.length === 0) return 0

  const { data: matches } = await db
    .from('matches')
    .select('id')
    .in('senior_id', seniorIds)
    .in('job_id', jobIds)

  return (matches ?? []).length
}
