import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import JobForm from './JobForm'
import { deleteJob, updateMatchStatus } from '@/app/actions'
import { AlertTriangle, Clock, CheckCircle, Users } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: '담당자 대시보드 — 상상우리',
}

export default async function AdminPage() {
  const [{ data: allSeniors }, { data: matchRows }, { data: allJobs }] = await Promise.all([
    supabase.from('seniors').select('id, name, region, desired_job, career_years').order('created_at', { ascending: false }),
    supabase.from('matches').select('id, senior_id, score, status, seniors(name), jobs(title, region)').order('score', { ascending: false }),
    supabase.from('jobs').select('id, title, region, job_type, required_career').order('created_at', { ascending: false }),
  ])

  // Split matches by status
  const completedMatchRows = (matchRows ?? []).filter((m: any) => m.status === 'completed')
  const pendingMatchRows = (matchRows ?? []).filter((m: any) => m.status !== 'completed')

  // Get completed seniors
  const completedBySenior = new Map<string, any>()
  for (const m of completedMatchRows) {
    if (!completedBySenior.has(m.senior_id)) completedBySenior.set(m.senior_id, m)
  }
  const completed = [...completedBySenior.values()]
  const completedSeniorIds = new Set(completed.map(m => m.senior_id))

  // Get pending seniors (excluding completed)
  const pendingBySenior = new Map<string, any>()
  for (const m of pendingMatchRows) {
    if (!completedSeniorIds.has(m.senior_id) && !pendingBySenior.has(m.senior_id)) {
      pendingBySenior.set(m.senior_id, m)
    }
  }
  const pending = [...pendingBySenior.values()]
  const pendingSeniorIds = new Set(pending.map(m => m.senior_id))

  // Get unmatched seniors (excluding completed and pending)
  const unmatched = (allSeniors ?? []).filter((s) => !completedSeniorIds.has(s.id) && !pendingSeniorIds.has(s.id))

  const stats = [
    { label: '미매칭', value: unmatched.length, unit: '명', icon: <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-red-500" /> },
    { label: '매칭 대기', value: pending.length, unit: '명', icon: <Clock className="mx-auto mb-2 h-8 w-8 text-yellow-500" /> },
    { label: '배정 완료', value: completed.length, unit: '명', icon: <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" /> },
    { label: '전체 시니어', value: allSeniors?.length ?? 0, unit: '명', icon: <Users className="mx-auto mb-2 h-8 w-8 text-blue-500" /> },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">담당자 대시보드</h1>
      <p className="text-lg text-gray-600">
        공고를 등록하고 시니어 매칭 현황을 확인합니다.
      </p>

      {/* 집계 카드 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, unit, icon }) => (
          <Card key={label}>
            <CardContent className="pt-6 text-center">
              {icon}
              <p className="text-4xl font-bold text-blue-600">
                {value}
                <span className="ml-1 text-2xl font-normal text-gray-500">{unit}</span>
              </p>
              <p className="mt-1 text-base text-gray-600">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 일자리 관리 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">일자리 관리</h2>
        <JobForm />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              등록된 일자리{' '}
              <span className="text-base font-normal text-gray-500">
                ({allJobs?.length ?? 0}건)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-lg">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    {['공고명', '지역', '직종', '요구 경력', ''].map((col) => (
                      <th key={col} className="px-4 py-3 font-semibold text-gray-700">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!allJobs || allJobs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                        등록된 일자리가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    allJobs.map((job: any) => (
                      <tr key={job.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3">{job.title}</td>
                        <td className="px-4 py-3">{job.region}</td>
                        <td className="px-4 py-3">{job.job_type}</td>
                        <td className="px-4 py-3">{job.required_career}년</td>
                        <td className="px-4 py-3">
                          <form action={deleteJob.bind(null, job.id)}>
                            <Button
                              type="submit"
                              variant="destructive"
                              className="h-12 text-base"
                            >
                              삭제 확인
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 미매칭 */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <CardTitle className="text-xl">미매칭</CardTitle>
          <Badge variant="destructive" className="text-sm">
            배정 필요 ({unmatched.length})
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-lg">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  {['시니어 이름', '지역', '희망 직종', '경력(년)', '상세'].map((col) => (
                    <th key={col} className="px-4 py-3 font-semibold text-gray-700">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {unmatched.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                      미매칭 시니어가 없습니다.
                    </td>
                  </tr>
                ) : (
                  unmatched.map((s) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">{s.name}</td>
                      <td className="px-4 py-3">{s.region}</td>
                      <td className="px-4 py-3">{s.desired_job}</td>
                      <td className="px-4 py-3">{s.career_years}년</td>
                      <td className="px-4 py-3">
                        <Link href={`/recommendations?senior_id=${s.id}`}>
                          <Button variant="outline" className="h-12 text-base">상세 보기</Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 매칭 대기 */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <CardTitle className="text-xl">매칭 대기</CardTitle>
          <Badge variant="secondary" className="text-sm">
            검토 중 ({pending.length})
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-lg">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  {['시니어 이름', '추천 일자리', '매칭 점수', '일자리 지역', '액션'].map((col) => (
                    <th key={col} className="px-4 py-3 font-semibold text-gray-700">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                      매칭 대기 중인 항목이 없습니다.
                    </td>
                  </tr>
                ) : (
                  pending.map((m: any) => (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">{m.seniors?.name ?? '-'}</td>
                      <td className="px-4 py-3">{m.jobs?.title ?? '-'}</td>
                      <td className="px-4 py-3 font-semibold text-blue-600">{m.score}점</td>
                      <td className="px-4 py-3">{m.jobs?.region ?? '-'}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <Link href={`/recommendations?senior_id=${m.senior_id}`}>
                          <Button variant="outline" className="h-12 text-base">상세 보기</Button>
                        </Link>
                        <form action={updateMatchStatus.bind(null, m.id, 'completed')}>
                          <Button type="submit" className="h-12 text-base bg-blue-600 hover:bg-blue-700">배정 완료 처리</Button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 배정 완료 */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <CardTitle className="text-xl">배정 완료</CardTitle>
          <Badge className="text-sm bg-green-500 hover:bg-green-600">
            연결 성공 ({completed.length})
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-lg">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  {['시니어 이름', '연결 일자리', '일자리 지역', '액션'].map((col) => (
                    <th key={col} className="px-4 py-3 font-semibold text-gray-700">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completed.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                      배정 완료된 시니어가 없습니다.
                    </td>
                  </tr>
                ) : (
                  completed.map((m: any) => (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">{m.seniors?.name ?? '-'}</td>
                      <td className="px-4 py-3 font-medium">{m.jobs?.title ?? '-'}</td>
                      <td className="px-4 py-3">{m.jobs?.region ?? '-'}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <Link href={`/recommendations?senior_id=${m.senior_id}`}>
                          <Button variant="outline" className="h-12 text-base">상세 보기</Button>
                        </Link>
                        <form action={updateMatchStatus.bind(null, m.id, 'pending')}>
                          <Button variant="outline" type="submit" className="h-12 text-base text-gray-500">실행 취소</Button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
