export interface NoteParams {
  id?: number
  title: string
  body: string
  updated?: string
}

export class Note {
  id: number
  title: string
  body: string
  updated: string

  constructor({ id, title, body, updated }: NoteParams) {
    this.id = id ?? performance.now()
    this.title = title
    this.body = body
    this.updated = updated ?? new Date().toISOString()
  }
}