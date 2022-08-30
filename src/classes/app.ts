import { Note } from "../entities/Note";
import { DomHandler } from "./dom-handler";
import { Saver } from './saver'

export class App {
  notes: Note[] = []
  activeNote?: Note
  view: DomHandler
  saver: Saver

  constructor(root: HTMLElement) {
    this.saver = new Saver()

    this.view = new DomHandler(root, this.#handlers())

    this.#refreshNotes()
  }

  #handlers(): ConstructorParameters<typeof DomHandler>[1] {
    return {
      onNoteSelect: (noteId) =>  {
        const selectedNote = this.notes.find( ({id}) => id === noteId)
        if(!selectedNote) return
        this.#setActiveNote(selectedNote)
      },
      onNoteAdd: (note) =>  {
        this.saver.saveNote(note)
        this.#refreshNotes()
      },
      onNoteDelete: (noteId) => {
        this.saver.deleteNote(noteId)
        this.#refreshNotes()
      },
      onNoteEdit: ({body, title}) => {
        if(!this.activeNote) return

        this.activeNote.title = title
        this.activeNote.body = body
        this.activeNote.updated = new Date().toISOString()

        this.saver.saveNote(this.activeNote)

        this.#refreshNotes()
      },
    }
  }

  #refreshNotes() {
    const notes = this.saver.getAllNotes()

    this.#setNotes(notes)

    if(notes.length) this.#setActiveNote(notes[0])
  }

  #setNotes(notes: Note[]) {
    this.notes = notes
    this.view.updateNotesList(notes)
    this.view.updateNotePreviewVisibility(notes.length > 0)
  }

  #setActiveNote(note?: Note) {
    this.activeNote = note
    this.view.updateActiveNote(note)
  }
}