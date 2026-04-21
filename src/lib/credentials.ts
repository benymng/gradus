const KEY = 'gradus_notion_creds'

export interface Credentials {
  token: string
  databaseId: string
}

export function getCredentials(): Credentials | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Credentials) : null
  } catch {
    return null
  }
}

export function setCredentials(token: string, databaseId: string) {
  localStorage.setItem(KEY, JSON.stringify({ token, databaseId }))
}

export function clearCredentials() {
  localStorage.removeItem(KEY)
}
