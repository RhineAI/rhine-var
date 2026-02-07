import { UndoManagerOptions } from 'yjs/dist/src/utils/UndoManager'

export default interface ProxyOptions {
  overwrite?: boolean

  undoManager?: boolean | UndoManagerOptions

  awareness?: boolean

  token?: string
}
