'use client'

import { useActionState } from 'react'
import { registerJob } from '@/app/actions'
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

export default function JobForm() {
  const [state, action, pending] = useActionState(registerJob, null)

  return (
    <div className="space-y-4">
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
                공고 제목 <span className="text-red-500">*</span>
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
              <Label className="text-lg font-medium">
                지역 <span className="text-red-500">*</span>
              </Label>
              <Select name="region">
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="지역 선택" />
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

            <div className="space-y-2">
              <Label className="text-lg font-medium">
                직종 <span className="text-red-500">*</span>
              </Label>
              <Select name="job_type">
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="직종 선택" />
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
