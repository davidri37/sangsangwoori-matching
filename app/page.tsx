import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const cards = [
  {
    title: '프로필 등록',
    description: '시니어 정보를 입력하면 맞춤 일자리를 찾아드립니다.',
    href: '/register',
    label: '등록하러 가기',
  },
  {
    title: '추천 목록',
    description: '등록된 프로필을 기반으로 최적의 일자리를 추천합니다.',
    href: '/recommendations',
    label: '추천 보기',
  },
  {
    title: '담당자 대시보드',
    description: '매칭 현황을 한눈에 확인하고 배정 상태를 관리합니다.',
    href: '/admin',
    label: '대시보드 열기',
  },
]

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-blue-700">
          상상우리 일자리 매칭
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          시니어의 경험과 역량에 딱 맞는 일자리를 자동으로 연결해 드립니다.
        </p>
      </section>

      <div className="grid gap-6 sm:grid-cols-3">
        {cards.map(({ title, description, href, label }) => (
          <Card key={href} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-4">
              <p className="text-lg text-gray-600">{description}</p>
              <Link
                href={href}
                className={buttonVariants({ size: 'lg', className: 'w-full text-lg' })}
              >
                {label}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
