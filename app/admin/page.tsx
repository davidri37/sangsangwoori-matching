import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import JobForm from './JobForm'

export const metadata = {
  title: '담당자 대시보드 — 상상우리',
}

export default async function AdminPage() {
  const [{ data: allSeniors }, { data: matchRows }, { count: jobCount }] = await Promise.all([
    supabase.from('seniors').select('id, name, region, desired_job, career_years').order('created_at', { ascending: false }),
    supabase.from('matches').select('senior_id, score, seniors(name), jobs(title, region)').order('score', { ascending: false }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
  ])

  const matchedSeniorIds = new Set((matchRows ?? []).map((m: any) => m.senior_id))
  const unmatched = (allSeniors ?? []).filter((s) => !matchedSeniorIds.has(s.id))

  // Best match per senior (rows already sorted by score desc)
  const bestBySenior = new Map<string, any>()
  for (const m of matchRows ?? []) {
    if (!bestBySenior.has(m.senior_id)) bestBySenior.set(m.senior_id, m)
  }
  const pending = [...bestBySenior.values()]

  const stats = [
    { label: '전체 시니어', value: allSeniors?.length ?? 0, unit: '명' },
    { label: '등록 공고', value: jobCount ?? 0, unit: '건' },
    { label: '매칭 완료', value: pending.length, unit: '명' },
    { label: '미매칭', value: unmatched.length, unit: '명' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">담당자 대시보드</h1>
      <p className="text-lg text-gray-600">
        공고를 등록하고 시니어 매칭 현황을 확인합니다.
      </p>

      {/* 집계 카드 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, unit }) => (
          <Card key={label}>
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-bold text-blue-600">
                {value}
                <span className="ml-1 text-2xl font-normal text-gray-500">{unit}</span>
              </p>
              <p className="mt-1 text-base text-gray-600">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <JobForm />

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
                  {['시니어 이름', '지역', '희망 직종', '경력(년)'].map((col) => (
                    <th key={col} className="px-4 py-3 font-semibold text-gray-700">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {unmatched.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
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
                  {['시니어 이름', '추천 일자리', '매칭 점수', '일자리 지역'].map((col) => (
                    <th key={col} className="px-4 py-3 font-semibold text-gray-700">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                      매칭 대기 중인 항목이 없습니다.
                    </td>
                  </tr>
                ) : (
                  pending.map((m: any) => (
                    <tr key={m.senior_id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">{m.seniors?.name ?? '-'}</td>
                      <td className="px-4 py-3">{m.jobs?.title ?? '-'}</td>
                      <td className="px-4 py-3 font-semibold text-blue-600">{m.score}점</td>
                      <td className="px-4 py-3">{m.jobs?.region ?? '-'}</td>
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
