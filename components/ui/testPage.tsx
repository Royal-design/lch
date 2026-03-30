"use client"

import axios from "axios"
import { useEffect, useState } from "react"

export const TestPage = () => {
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/test")
        setData(res.data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [])
  return (
    <div className="flex min-h-svh flex-col gap-4 p-6">
      <p className="text-2xl text-red-300">welcome</p>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
