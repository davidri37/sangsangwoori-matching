'use client'

import { useActionState } from 'react'
import { registerSenior } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerSenior, null)

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-3xl font-bold">시니어 프로필 등록</h1>
      <p className="text-lg text-gray-600">
        아래 정보를 입력하시면 맞춤 일자리를 자동으로 추천해 드립니다.
      </p>

      {state && (
        <div
          className={`rounded-lg p-4 text-lg font-medium ${
            state.success
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {state.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-medium">
                이름
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="홍길동"
                className="h-12 text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region" className="text-lg font-medium">
                지역
              </Label>
              <Input
                id="region"
                name="region"
                placeholder="예) 서울 강남구"
                className="h-12 text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desired_job" className="text-lg font-medium">
                희망 직종
              </Label>
              <Input
                id="desired_job"
                name="desired_job"
                placeholder="예) 경비, 청소, 행정 보조"
                className="h-12 text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="career_years" className="text-lg font-medium">
                경력 (년)
              </Label>
              <Input
                id="career_years"
                name="career_years"
                type="number"
                min={0}
                placeholder="0"
                className="h-12 text-lg"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-14 w-full text-xl font-bold"
              disabled={pending}
            >
              {pending ? '등록 중...' : '등록하기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
