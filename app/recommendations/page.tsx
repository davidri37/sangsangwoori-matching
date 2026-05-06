import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: '추천 목록 — 상상우리',
}

const COLUMNS = ['시니어 이름', '추천 일자리', '지역', '매칭 점수']

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const { sort } = await searchParams
  const ascending = sort === 'asc'

  const { data: matches } = await supabase
    .from('matches')
    .select('id, score, seniors(name), jobs(title, region)')
    .order('score', { ascending })

  const nextSort = ascending ? 'desc' : 'asc'
  const sortLabel = ascending ? '점수 오름차순 ↑' : '점수 내림차순 ↓'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">자동 매칭 추천 목록</h1>
        <Link href={`/recommendations?sort=${nextSort}`}>
          <Badge
            variant="outline"
            className="cursor-pointer text-base hover:bg-gray-100"
          >
            {sortLabel}
          </Badge>
        </Link>
      </div>

      <p className="text-lg text-gray-600">
        시니어 프로필과 일자리 정보를 바탕으로 자동 매칭된 결과입니다.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            추천 결과{' '}
            <span className="text-base font-normal text-gray-500">
              ({matches?.length ?? 0}건)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-lg">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  {COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 font-semibold text-gray-700"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!matches || matches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLUMNS.length}
                      className="px-4 py-16 text-center text-gray-400"
                    >
                      추천 데이터가 없습니다. 시니어 프로필을 먼저 등록해 주세요.
                    </td>
                  </tr>
                ) : (
                  matches.map((m: any) => (
                    <tr
                      key={m.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{m.seniors?.name ?? '-'}</td>
                      <td className="px-4 py-3">{m.jobs?.title ?? '-'}</td>
                      <td className="px-4 py-3">{m.jobs?.region ?? '-'}</td>
                      <td className="px-4 py-3 font-semibold text-blue-600">
                        {m.score}점
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
