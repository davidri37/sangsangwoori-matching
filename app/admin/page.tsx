import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: '담당자 대시보드 — 상상우리',
}

type Section = {
  id: string
  label: string
  badge: string
  badgeVariant: 'destructive' | 'secondary' | 'default'
  columns: string[]
  emptyMessage: string
}

const sections: Section[] = [
  {
    id: 'unmatched',
    label: '미매칭',
    badge: '배정 필요',
    badgeVariant: 'destructive',
    columns: ['시니어 이름', '지역', '희망 직종', '경력(년)'],
    emptyMessage: '미매칭 시니어가 없습니다.',
  },
  {
    id: 'pending',
    label: '매칭 대기',
    badge: '검토 중',
    badgeVariant: 'secondary',
    columns: ['시니어 이름', '추천 일자리', '매칭 점수', '등록일'],
    emptyMessage: '매칭 대기 중인 항목이 없습니다.',
  },
  {
    id: 'assigned',
    label: '배정 완료',
    badge: '완료',
    badgeVariant: 'default',
    columns: ['시니어 이름', '배정 일자리', '지역', '배정일'],
    emptyMessage: '배정 완료된 항목이 없습니다.',
  },
]

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">담당자 대시보드</h1>
      <p className="text-lg text-gray-600">
        시니어 매칭 현황을 단계별로 확인하고 배정 상태를 관리합니다.
      </p>

      {sections.map(
        ({ id, label, badge, badgeVariant, columns, emptyMessage }) => (
          <Card key={id}>
            <CardHeader className="flex flex-row items-center gap-3">
              <CardTitle className="text-xl">{label}</CardTitle>
              <Badge variant={badgeVariant} className="text-sm">
                {badge}
              </Badge>
            </CardHeader>
            <CardContent>
              {/* 데이터 연동은 다음 블록에서 */}
              <div className="overflow-x-auto">
                <table className="w-full text-lg">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left">
                      {columns.map((col) => (
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
                        colSpan={columns.length}
                        className="px-4 py-12 text-center text-gray-400"
                      >
                        {emptyMessage}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ),
      )}
    </div>
  )
}
