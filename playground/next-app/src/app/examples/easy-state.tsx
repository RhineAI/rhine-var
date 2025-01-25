"use client"

import React from "react";
import {enableRhineVarLog, rhineProxy, rhineText, rhineMap, useRhine} from "rhine-var";

console.log('\n\n=================== Rhine Var Playground ===================\n\n')

enableRhineVarLog(true)

const defaultValue = {
  arr: [
    {
      text: rhineText('aaa')
    }
  ],
  map: rhineMap([['aa', {name: rhineText('hhh')}]])
}
const url = 'room-11'
const state = rhineProxy(defaultValue, url)


export default function EasyState() {

  const snap = useRhine(state)

  return <div className='page'>
  </div>
}
