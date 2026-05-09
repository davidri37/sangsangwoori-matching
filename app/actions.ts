'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

type ActionState = {
  success: boolean
  message: string
  fieldErrors?: Record<string, string>
  senior_id?: string
} | null

// 비교용 정규화 테이블 — 원본 데이터는 절대 수정하지 않음
const REGION_NORM: Record<string, string> = {
  서울특별시: '서울',
  경기도: '경기',
  인천광역시: '인천',
}

const JOB_NORM: Record<string, string> = {
  경비직: '경비',
  청소직: '청소',
  조리직: '조리',
  돌봄직: '돌봄',
}

const nr = (v: string) => REGION_NORM[v] ?? v
const nj = (v: string) => JOB_NORM[v] ?? v

export async function registerSenior(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = (formData.get('name') as string)?.trim()
  const region = (formData.get('region') as string)?.trim()
  const desired_job = (formData.get('desired_job') as string)?.trim()
  const career_years = parseInt((formData.get('career_years') as string) ?? '0', 10)

  const fieldErrors: Record<string, string> = {}
  if (!name) fieldErrors.name = '이름을 입력해 주세요.'
  if (!region) fieldErrors.region = '지역을 선택해 주세요.'
  if (!desired_job) fieldErrors.desired_job = '희망 직종을 선택해 주세요.'
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, message: '필수 항목을 확인해 주세요.', fieldErrors }
  }

  const { data: senior, error } = await supabase
    .from('seniors')
    .insert({ name, region, desired_job, career_years: isNaN(career_years) ? 0 : career_years })
    .select('id')
    .single()

  if (error || !senior) {
    return { success: false, message: '저장에 실패했습니다. 다시 시도해 주세요.' }
  }

  await matchSeniorToJobs(senior.id, region, desired_job, career_years)

  revalidatePath('/recommendations')
  revalidatePath('/admin')

  return { success: true, message: `${name} 님의 프로필이 등록되었습니다!`, senior_id: senior.id }
}

export async function registerJob(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = (formData.get('title') as string)?.trim()
  const region = (formData.get('region') as string)?.trim()
  const job_type = (formData.get('job_type') as string)?.trim()
  const required_career = parseInt((formData.get('required_career') as string) ?? '0', 10)

  if (!title || !region || !job_type) {
    return { success: false, message: '공고 제목, 지역, 직종은 필수 항목입니다.' }
  }

  const { data: job, error } = await supabase
    .from('jobs')
    .insert({ title, region, job_type, required_career: isNaN(required_career) ? 0 : required_career })
    .select('id')
    .single()

  if (error || !job) {
    return { success: false, message: '저장에 실패했습니다. 다시 시도해 주세요.' }
  }

  await matchJobToSeniors(job.id, region, job_type, required_career)

  revalidatePath('/recommendations')
  revalidatePath('/admin')

  return { success: true, message: `"${title}" 공고가 등록되었습니다!` }
}

export async function deleteJob(jobId: string): Promise<void> {
  await supabase.from('matches').delete().eq('job_id', jobId)
  await supabase.from('jobs').delete().eq('id', jobId)
  revalidatePath('/admin')
  revalidatePath('/recommendations')
}

export async function updateMatchStatus(matchId: string, status: string): Promise<void> {
  await supabase.from('matches').update({ status }).eq('id', matchId)
  revalidatePath('/admin')
  revalidatePath('/recommendations')
}

// 시니어 1명 → 전체 공고 매칭
async function matchSeniorToJobs(
  seniorId: string,
  region: string,
  desired_job: string,
  career_years: number,
) {
  const { data: jobs } = await supabase.from('jobs').select('*')
  if (!jobs || jobs.length === 0) return

  const normRegion = nr(region)
  const normJob = nj(desired_job)

  const rows = jobs
    .map((job) => {
      const jobRegion = nr(job.region)
      const jobType = nj(job.job_type)
      let score = 0
      if (jobRegion === normRegion) score += 3
      if (normJob.includes(jobType) || jobType.includes(normJob)) score += 2
      if ((career_years || 0) >= job.required_career) score += 1
      return { senior_id: seniorId, job_id: job.id, score }
    })
    .filter((r) => r.score > 0)

  if (rows.length > 0) {
    await supabase.from('matches').insert(rows)
  }
}

// 공고 1건 → 전체 시니어 매칭
async function matchJobToSeniors(
  jobId: string,
  region: string,
  job_type: string,
  required_career: number,
) {
  const { data: seniors } = await supabase.from('seniors').select('*')
  if (!seniors || seniors.length === 0) return

  const normJobRegion = nr(region)
  const normJobType = nj(job_type)

  const rows = seniors
    .map((senior) => {
      const seniorRegion = nr(senior.region)
      const seniorJob = nj(senior.desired_job)
      let score = 0
      if (seniorRegion === normJobRegion) score += 3
      if (seniorJob.includes(normJobType) || normJobType.includes(seniorJob)) score += 2
      if ((senior.career_years || 0) >= required_career) score += 1
      return { senior_id: senior.id, job_id: jobId, score }
    })
    .filter((r) => r.score > 0)

  if (rows.length > 0) {
    await supabase.from('matches').insert(rows)
  }
}
