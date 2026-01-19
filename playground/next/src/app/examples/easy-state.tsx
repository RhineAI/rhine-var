'use client'

import React from 'react'
import { enableRhineVarLog, rhineProxy, text } from 'rhine-var'

console.log('\n\n=================== Rhine Var Playground ===================\n\n')

enableRhineVarLog(true)

const defaultValue = {
  text: text('Hi, Rhine Var!'),
}

const url = 'room-11'
const state = rhineProxy(defaultValue, url, {
  overwrite: true,
})

state.afterSynced(async () => {
  const undoManager = state.getUndoManager()!
  console.log(undoManager)
  console.log(undoManager.canUndo())

  console.log(state.text.value)

  state.text.insert(5, 'AAAAA')

  console.log(state.text.value)

  undoManager.undo()

  console.log(state.text.value)
})

export default function EasyState() {
  return <div className='page'></div>
}
