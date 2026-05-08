'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

type ActionState = { success: boolean; message: string } | null

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

  if (!name || !region || !desired_job) {
    return { success: false, message: '이름, 지역, 희망 직종은 필수 항목입니다.' }
  }

  const { data: senior, error } = await supabase
    .from('seniors')
    .insert({ name, region, desired_job, career_years: isNaN(career_years) ? 0 : career_years })
    .select('id')
    .single()

  if (error || !senior) {
    return { success: false, message: '저장에 실패했습니다. 다시 시도해 주세요.' }
  }

  await runMatching(senior.id, region, desired_job, career_years)

  revalidatePath('/recommendations')
  revalidatePath('/admin')

  return { success: true, message: `${name} 님의 프로필이 등록되었습니다!` }
}

async function runMatching(
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
      if (jobRegion === normRegion) score += 50
      if (normJob.includes(jobType) || jobType.includes(normJob)) score += 30
      if ((career_years || 0) >= job.required_career) score += 20
      return { senior_id: seniorId, job_id: job.id, score }
    })
    .filter((r) => r.score > 0)

  if (rows.length > 0) {
    await supabase.from('matches').insert(rows)
  }
}
