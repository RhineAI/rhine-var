"use client"

import React from "react";
import {enableRhineVarLog, rhineProxy, text, map, item, useRhine} from "rhine-var";

console.log('\n\n=================== Rhine Var Playground ===================\n\n')

enableRhineVarLog(true)

const defaultValue = {
  text: text('aaa')
}

const url = 'room-11'
const state = rhineProxy(defaultValue, url, true)

state.afterSynced(() => {
  state.text.value = 'bbb'
  console.log(state.text.json())
  console.log(state.json().text)
  console.log(state.text.value)
})

export default function EasyState() {

  return <div className='page'>
  </div>
}
