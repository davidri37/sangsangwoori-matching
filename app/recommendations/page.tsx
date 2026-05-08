import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: '추천 목록 — 상상우리',
}

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
          <Badge variant="outline" className="cursor-pointer text-base hover:bg-gray-100">
            {sortLabel}
          </Badge>
        </Link>
      </div>

      <p className="text-lg text-gray-600">
        시니어 프로필과 일자리 정보를 바탕으로 자동 매칭된 결과입니다.{' '}
        <span className="font-medium text-gray-800">{matches?.length ?? 0}건</span>
      </p>

      {!matches || matches.length === 0 ? (
        <p className="py-16 text-center text-gray-400 text-lg">
          추천 데이터가 없습니다. 시니어 프로필을 먼저 등록해 주세요.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m: any) => (
            <Card key={m.id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-snug">{m.jobs?.title ?? '-'}</CardTitle>
                  <Badge className="shrink-0 text-base font-bold">{m.score}점</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-base text-gray-600">
                <p>지역: {m.jobs?.region ?? '-'}</p>
                <p>시니어: {m.seniors?.name ?? '-'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
