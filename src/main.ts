import { App } from "./classes/app"

const root = document.querySelector<HTMLDivElement>('#root')

if(!root) throw new Error('Root element not found')

const app = new App(root)

export { app }
