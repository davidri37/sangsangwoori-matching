import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: '추천 목록 — 상상우리',
}

const COLUMNS = ['시니어 이름', '추천 일자리', '지역', '매칭 점수']

export default function RecommendationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">자동 매칭 추천 목록</h1>
        <Badge variant="outline" className="text-base">
          점수 내림차순
        </Badge>
      </div>

      <p className="text-lg text-gray-600">
        시니어 프로필과 일자리 정보를 바탕으로 자동 매칭된 결과가 표시됩니다.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">추천 결과</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 데이터 연동은 다음 블록에서 */}
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
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-4 py-16 text-center text-gray-400"
                  >
                    추천 데이터가 없습니다. 시니어 프로필을 먼저 등록해 주세요.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
