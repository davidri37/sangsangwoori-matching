'use client'

import { useActionState } from 'react'
import { registerSenior } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const REGIONS = ['서울', '경기', '인천', '기타']
const JOB_TYPES = ['경비', '청소', '조리', '돌봄', '기타']

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="rounded bg-red-50 px-3 py-2 text-base font-medium text-red-700">
      {message}
    </p>
  )
}

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerSenior, null)
  const errors = state?.fieldErrors ?? {}

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-3xl font-bold">시니어 프로필 등록</h1>
      <p className="text-lg text-gray-600">
        아래 정보를 입력하시면 맞춤 일자리를 자동으로 추천해 드립니다.
      </p>

      {state?.success && (
        <div className="rounded-lg bg-green-50 p-4 text-lg font-medium text-green-700">
          {state.message}
        </div>
      )}

      {state && !state.success && !state.fieldErrors && (
        <div className="rounded-lg bg-red-50 p-4 text-lg font-medium text-red-700">
          {state.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-6">
            {/* 이름 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-medium">
                이름 <span className="text-red-500">*</span>
              </Label>
              <FieldError message={errors.name} />
              <Input
                id="name"
                name="name"
                placeholder="홍길동"
                className="h-12 text-lg"
              />
            </div>

            {/* 지역 */}
            <div className="space-y-2">
              <Label className="text-lg font-medium">
                지역 <span className="text-red-500">*</span>
              </Label>
              <FieldError message={errors.region} />
              <Select name="region">
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="지역을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r} className="text-lg">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 희망 직종 */}
            <div className="space-y-2">
              <Label className="text-lg font-medium">
                희망 직종 <span className="text-red-500">*</span>
              </Label>
              <FieldError message={errors.desired_job} />
              <Select name="desired_job">
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="직종을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((j) => (
                    <SelectItem key={j} value={j} className="text-lg">
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 경력 */}
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
