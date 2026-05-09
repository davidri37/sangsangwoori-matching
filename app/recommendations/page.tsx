import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: '추천 목록 — 상상우리',
}

function getScoreLabel(score: number) {
  if (score >= 6) return '매우 적합'
  if (score >= 4) return '적합'
  if (score >= 2) return '보통'
  return '미흡'
}

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; senior_id?: string }>
}) {
  const { sort, senior_id } = await searchParams
  const ascending = sort === 'asc'

  let query = supabase
    .from('matches')
    .select('id, score, seniors(name), jobs(title, region)')
    .order('score', { ascending })

  if (senior_id) {
    query = query.eq('senior_id', senior_id)
  }

  const { data: matches } = await query

  let seniorName = ''
  if (senior_id && matches && matches.length > 0) {
    seniorName = matches[0].seniors?.name
  } else if (senior_id) {
    const { data: senior } = await supabase.from('seniors').select('name').eq('id', senior_id).single()
    seniorName = senior?.name || ''
  }

  const nextSort = ascending ? 'desc' : 'asc'
  const sortLabel = ascending ? '점수 오름차순 ↑' : '점수 내림차순 ↓'
  const sortHref = senior_id ? `/recommendations?senior_id=${senior_id}&sort=${nextSort}` : `/recommendations?sort=${nextSort}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {seniorName ? `${seniorName} 님께 맞는 일자리` : '자동 매칭 추천 목록'}
        </h1>
        <Link href={sortHref}>
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
        <div className="py-16 text-center">
          <p className="text-gray-500 text-lg">추천 데이터가 없습니다. 시니어 프로필을 먼저 등록해 주세요.</p>
          <p className="mt-2 text-gray-600 text-lg font-medium">담당자가 직접 연락드리니 잠시만 기다려 주세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m: any) => (
            <Card key={m.id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-snug">{m.jobs?.title ?? '-'}</CardTitle>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary" className="text-sm font-medium">{getScoreLabel(m.score)}</Badge>
                    <Badge className="text-base font-bold">{m.score}점</Badge>
                  </div>
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
