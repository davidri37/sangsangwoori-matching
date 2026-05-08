'use client'

import { useActionState } from 'react'
import { registerJob } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function JobForm() {
  const [state, action, pending] = useActionState(registerJob, null)

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {state && (
        <div
          className={`rounded-lg p-4 text-lg font-medium ${
            state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {state.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">공고 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg font-medium">
                공고 제목
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="예) 아파트 경비원 모집"
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
                placeholder="예) 서울"
                className="h-12 text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_type" className="text-lg font-medium">
                직종
              </Label>
              <Input
                id="job_type"
                name="job_type"
                placeholder="예) 경비, 청소, 조리"
                className="h-12 text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="required_career" className="text-lg font-medium">
                요구 경력 (년)
              </Label>
              <Input
                id="required_career"
                name="required_career"
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
              {pending ? '등록 중...' : '공고 등록하기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
