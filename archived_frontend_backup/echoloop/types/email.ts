export interface Email {
  id: string
  sender: string
  subject: string
  timestamp: string
  seen: boolean
  starred?: boolean
  summary: string[]
}
