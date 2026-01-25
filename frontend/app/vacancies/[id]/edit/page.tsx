'use client'

import { useRouter, useParams } from "next/navigation"
import { useEffect } from "react"

export default function VacancyEditRedirect() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  useEffect(() => {
    if (id) {
      router.replace(`/vacancies?edit=${encodeURIComponent(id)}`)
    } else {
      router.replace('/vacancies')
    }
  }, [router, id])

  return null
}
