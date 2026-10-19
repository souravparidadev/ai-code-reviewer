const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  })

  if (response.status === 401) {
    window.location.href = `${API_URL}/auth/github`
    throw new Error("Unauthorized")
  }

  if (!response.ok) {
    const message = await response.text().catch(() => "")
    throw new Error(message || `API error: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export { API_URL }