import { Note } from "../entities/Note"

export class Saver {
  #STORAGE_KEY = "local-notes-app-data"

  getAllNotes(): Note[] {
    const notes = this.#getFromLocalStorage()

    return notes
  }

  saveNote({ id, title, body, updated }: Note): void {
    const notes = this.getAllNotes()
    const existingNote = notes.find(note => note.id === id)

    if (existingNote) {
      Object.assign(existingNote, { title, body, updated })
    } else {
      const note = new Note({ title, body })
      notes.push(note)
    }

    this.#saveToLocalStorage(notes)
  }

  deleteNote(id: number): void {
    const notes = this.#getFromLocalStorage()
    const filtered = notes.filter(note => note.id !== id)

    this.#saveToLocalStorage(filtered)
  }

  #getFromLocalStorage(): Note[] {
    const stringFromLocalStorage = localStorage.getItem(this.#STORAGE_KEY)

    const firstNote = new Note({ title: "First note", body: "Insert here the note Body" })

    const notes = stringFromLocalStorage
      ? JSON.parse(stringFromLocalStorage)
      : [firstNote]

    const sortedNotes = this.#sortNotes(notes)
    return sortedNotes
  }

  #saveToLocalStorage(notes: Note[]): void {
    const sortedNotes = this.#sortNotes(notes)
    localStorage.setItem(this.#STORAGE_KEY, JSON.stringify(sortedNotes))
  }

  #sortNotes(notes: Note[]) {
    return [...notes].sort((a, b) => {
      return new Date(a.updated) > new Date(b.updated) ? -1 : 1
    })
  }
}