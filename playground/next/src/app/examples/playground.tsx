'use client'

import React from 'react'
import { rhineProxy, enableRhineVarLog, StoredRhineVar } from 'rhine-var'

console.log('\n\n=================== Rhine Var Playground ===================\n\n')

enableRhineVarLog(true)

// Interface for Example

export interface Group {
  id: string
  people: Person[]
}

export interface Person {
  name: string
  age: number
  description?: string
}

const defaultValue: Group = {
  id: 'group-1',
  people: [
    { name: 'Henry', age: 20, description: 'A young man.' },
    { name: 'Emily', age: 22 },
  ],
}
const group = rhineProxy<Group>(defaultValue, 'ws://localhost:11600/room-3', {
  overwrite: true,
})

group.afterSynced(() => {
  // 基本的监听 监听当前节点的直接属性变化
  group.subscribe((key, value, oldValue, type) => {
    console.log('group.subscribe', key, type, ': ', oldValue, '->', value)
  })

  // 监听指定属性的变化
  group.subscribeKey('id', (key, value, oldValue, type) => {
    console.log('group.subscribeKey', key, type, ': ', oldValue, '->', value)
  })

  // 监听内部及深层所有的属性变化
  group.subscribeDeep((path, value, oldValue, type) => {
    console.log('group.subscribeDeep', path, type, ': ', oldValue, '->', value)
  })

  // 监听器都能在任意对象或数组上添加
  group.people[1].subscribe(() => {
    // xxx
  })

  // 和 Js 中一样 任意读取或操作他
  console.log('第一人的名字:', group.people[0].name)

  console.log('修改 group 的 id 为 group-2')
  group.id = 'group-2'

  console.log('删除第一个的 description 属性')
  delete group.people[0].description

  // 像操作 Array 一样操作 RhineVar
  console.log('当前 group 中的人数为:', group.people.length)

  console.log('添加一个新成员 Jessica')
  group.people.push({ name: 'Jessica', age: 19 } as any)

  // 通过 .json() 更清晰的打印无代理信息的数据
  console.log('当前 people 数据:', group.people.json())

  // 在 TypeScript 中通过 “ = ” 赋值一个对象时，可能出现类型校验不通过情况，可通过 as 修改类型
  group.people[1] = { name: 'Jessica', age: 19 } as StoredRhineVar<Person> // 当然你也可以直接使用 “ as any ”
})

export default function Playground() {
  return <div className='page' />
}
