import { Note } from '../entities/Note';
import { debounce } from '../helpers/debounce'

interface INoteContent {
  title: string
  body: string
}

interface INotesConfig {
  onNoteSelect?: (id: number) => void;
  onNoteAdd?: (note: Note) => void;
  onNoteEdit?: (noteContent: INoteContent) => void;
  onNoteDelete?: (id: number) => void;
}

export class DomHandler {
  root: HTMLElement
  onNoteSelect
  onNoteAdd
  onNoteEdit
  onNoteDelete

  constructor(
    root: HTMLElement,
    {
      onNoteSelect,
      onNoteAdd,
      onNoteEdit,
      onNoteDelete,
    }: INotesConfig = {
        onNoteSelect() { },
        onNoteAdd() { },
        onNoteEdit() { },
        onNoteDelete() { },
      }
  ) {

    if (!(root instanceof HTMLElement)) throw new Error("Root element not found")
    this.root = root

    this.onNoteSelect = onNoteSelect
    this.onNoteAdd = onNoteAdd
    this.onNoteEdit = onNoteEdit
    this.onNoteDelete = onNoteDelete

    this.#boot()
  }

  #boot() {
    this.root.innerHTML = [
      /*html*/`<aside class="notes__sidebar">`,
        /*html*/`<button class="notes__add" type="button">Add Note</button>`,
      /**/
        /*html*/`<ul class="notes__list">`,
        /*html*/`</ul>`,
      /**/
      /*html*/`</aside>`,
      /**/
      /*html*/`<main class="notes__preview">`,
        /*html*/`<input type="text" class="notes__title" placeholder="Enter a title">`,
      /**/
        /*html*/`<textarea name="note-body" id="note-body" cols="30" rows="10" class="notes__body" placeholder="Enter the note body"></textarea>`,
      /*html*/`</main>`,
    ].join('')

    this.#setEventListeners()
    this.updateNotePreviewVisibility(false)
  }

  #setEventListeners() {
    this.#setAddButtonEventListener()
    this.#setInputsEventListener()
  }

  #setAddButtonEventListener() {
    const btn = this.root.querySelector<HTMLButtonElement>(".notes__add")
    if (!btn) throw new Error("Add button not found")

    btn.addEventListener("click", () => {
      const note = new Note({ title: "New note", body: "Add body content here" })

      this.#createListItem(note)

      if (this.onNoteAdd) this.onNoteAdd(note)
    })
  }

  #setInputsEventListener() {
    const input = this.root.querySelector<HTMLInputElement>(".notes__title")
    if (!input) throw new Error("Title input not found")

    const textarea = this.root.querySelector<HTMLTextAreaElement>("#note-body")
    if (!textarea) throw new Error("Body input not found");

    [input, textarea].forEach(el => {
      el.addEventListener('input', () => {
        const title = input.value.trim()
        const body = textarea.value.trim()

        this.#debouncedOnEdit({ title, body })
      })
    })
  }

  #debouncedOnEdit = debounce((noteContent: INoteContent) => {
    if (this.onNoteEdit) this.onNoteEdit(noteContent)
  })

  #createListItem({ id, title, body, updated }: Note) {
    const MAX_BODY_LENGHT = 60

    const shownBody = [
      body.substring(0, MAX_BODY_LENGHT),
      body.length > MAX_BODY_LENGHT ? "..." : ''
    ].join('')

    const updatedLocalized = new Date(updated).toLocaleString(undefined, {
      dateStyle: "full",
      timeStyle: "short"
    })

    return [
      /*html*/`<li class="notes__list-item" data-note-id="${id}">`,
        /*html*/`<h2 class="notes__small-title">${title}</h2>`,
        /*html*/`<p class="notes__small-body">${shownBody}</p>`,
        /*html*/`<time class="notes__small-updated">${updatedLocalized}</time>`,
      /*html*/`</li>`,
    ].join('')

  }

  updateNotesList(notes: Note[]) {
    const listElement = this.root.querySelector<HTMLUListElement>('.notes__list')
    if (!listElement) throw new Error("List element not found")

    listElement.innerHTML = ''

    notes.forEach(note => {
      const listItemElement = this.#createListItem(note)

      listElement.insertAdjacentHTML("beforeend", listItemElement)
    })

    listElement.querySelectorAll<HTMLLIElement>(".notes__list-item").forEach(listItemElement => {
      listItemElement.addEventListener('click', () => {
        const dataNoteId = listItemElement.dataset['noteId']

        if (!dataNoteId) throw new Error("Note Id not found!")

        this.onNoteSelect && this.onNoteSelect(Number(dataNoteId))
      })

      listItemElement.addEventListener("dblclick", () => {
        const doDelete = confirm("Are you sure you want to delete this note?")
        if (!doDelete) return

        const dataNoteId = listItemElement.dataset['noteId']
        if (!dataNoteId) throw new Error("Note Id not found!")
        this.onNoteDelete && this.onNoteDelete(Number(dataNoteId))
      })
    })
  }

  updateActiveNote(note?: Note) {
    const SELECTED_CLASS = "notes__list-item--selected"

    const input = this.root.querySelector<HTMLInputElement>(".notes__title")
    if (!input) throw new Error("Title input not found")

    const textarea = this.root.querySelector<HTMLTextAreaElement>("#note-body")
    if (!textarea) throw new Error("Body input not found");

    this.root.querySelectorAll<HTMLLIElement>(".notes__list-item").forEach(li => {
      li.classList.remove(SELECTED_CLASS)
    })

    if (!note) {
      input.value = ''
      textarea.value = ''

      return
    }

    const { id, title, body } = note

    input.value = title
    textarea.value = body

    const chosen = this.root.querySelector<HTMLLIElement>(`.notes__list-item[data-note-id="${id}"]`)

    if (!chosen) throw new Error("Note note found")

    chosen.classList.add(SELECTED_CLASS)
  }

  updateNotePreviewVisibility(visible = true) {
    const notePreview = this.root.querySelector<HTMLElement>(".notes__preview")

    if (!notePreview) throw new Error("Note preview note found")

    notePreview.style.visibility = visible ? "visible" : "hidden"
  }
}