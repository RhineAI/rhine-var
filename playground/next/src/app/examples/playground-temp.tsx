"use client"

import React from "react";
import {rhineProxy, enableRhineVarLog, map} from "rhine-var";

console.log('\n\n=================== Rhine Var Temp Playground ===================\n\n')

enableRhineVarLog(true)



const defaultValue = {
  obj: {
    size: 20,
  },
  map: map(),
}

const state = rhineProxy(defaultValue, 'room-5', {overwrite: true})

state.afterSynced(() => {
  console.log(state.json())
})

export default function PlaygroundTemp() {
  return <div className='page'/>
}
