import axios, { AxiosError, type AxiosRequestConfig } from "axios"

export async function apiRequest<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const body = init?.body
  const headers = new Headers(init?.headers)
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData

  if (!isFormData && body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const config: AxiosRequestConfig = {
    url: input.toString(),
    method: init?.method || "GET",
    data: body,
    headers: Object.fromEntries(headers.entries()),
    withCredentials: true,
  }

  try {
    const response = await axios.request<T>(config)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      const data = error.response?.data as { error?: string } | undefined
      throw new Error(data?.error || error.message || "Request failed")
    }

    throw error
  }
}
