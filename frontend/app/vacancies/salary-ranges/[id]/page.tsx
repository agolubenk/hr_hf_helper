'use client'

import { useRouter, useParams } from "next/navigation"
import { useEffect } from "react"

export default function SalaryRangeDetailRedirect() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  useEffect(() => {
    if (id) {
      router.replace(`/vacancies/salary-ranges?detail=${encodeURIComponent(id)}`)
    } else {
      router.replace('/vacancies/salary-ranges')
    }
  }, [router, id])

  return null
}
