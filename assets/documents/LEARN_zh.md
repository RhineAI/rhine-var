   <div align="center">

# RHINE-VAR &nbsp; Document

[English](LEARN.md) &nbsp; | &nbsp; [中文](LEARN_zh.md)

</div>

## 最简使用案例

```typescript jsx
const defaultValue = {count: 0}
const url = 'ws://localhost:6600/room-0'

const state = rhineProxy(defaultValue, url)

function Counter() {

  const snap = useRhine(state)

  return <div>
    <button onClick={() => state.count-- }> -1 </button>
    <span>{snap.count}</span>
    <button onClick={() => state.count++ }> +1 </button>
  </div>
}
```

使用 RHINE-VAR 构建多人协同应用时，一般情况，你的项目中只会存在一个公用的 `RhineVar 对象` 他可以是个结构复杂且非常庞大的 `Json 数据` 以存储你的项目的所有协同信息。

## rhineProxy

最核心的函数，用于创造一个 RhineVar 对象 其内部数据会自动与他人互相协同。

一般情况一个项目只使用一次，因为只需要一个根 RhineVar 对象。

```typescript jsx
function rhineProxy<T>(defaultValue, connector, overwrite)
```

| 参数         | 类型                     | 默认值 | 描述                                                                                                                                            |
| ------------ | ------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| defaultValue | T                        |        | 默认值。<br/>服务端没有该房间号的数据时，使用该默认值作为项目初始值。 <br/>附：还未初次连接到服务器时，也会暂时返回该值。                       |
| connector    | RhineConnector \| string |        | 连接器。<br/>传入连接器对象，或 websocket 链接，或简单房间名。<br/>传入简单的房间名时，将使用我们提供的公共服务器。<br/>服务端信息可见 README。 |
| overwrite    | boolean                  | false  | 覆盖模式。<br/>即使服务器中有数据，也使用默认值覆盖服务器中的数据。一般用于调试期间。                                                           |
| return       | RhineVar\<T\>            |        | RhineVar 协同变量根对象，除协同外还含有连接相关功能。                                                                                           |

公共服务器可用于测试，他无法保证性能和安全。等价于访问链接 `wss://rwq.rhineai.com/<room-id>`。

## useRhine

React 中特有的 Hook 函数。用于创建快照，当数据变化时，自动更新页面上的内容。

当任何人对值做出修改时，它会把最新的值立刻更新到所有人的屏幕上。

```typescript jsx
function useRhine<T>(proxy)
```

| 参数   | 类型                     | 默认值 | 描述                                                   |
| ------ | ------------------------ | ------ | ------------------------------------------------------ |
| proxy  | RhineVar\<T\>            |        | 需要订阅更新的 RhineVar 协同变量，或其内部的任意节点。 |
| return | Snapshot\<RhineVar\<T\>> |        | RhineVar 所对应的快照。                                |

注意：返回的快照为只读，请勿对其做出操作！快照仅用于在 React 的 XML 中读取数据。其他所有操作（如赋值或订阅等）请操作原 RhineVar 对象。

<br/>

## 进阶教学

定义类型

```typescript
export interface Group {
  id: string
  people: Person[]
}

export interface Person {
  name: string
  age: number
  description?: string
}
```

创建 RhineVar 对象

```typescript
const defaultValue: Group = {
  id: 'group-1',
  people: [
    { name: 'Henry', age: 20, description: 'A young man.' },
    { name: 'Emily', age: 22 },
  ],
}
const group = rhineProxy<Group>(defaultValue, 'ws://localhost:6600/room-1')

await group.waitSynced() // 在 Async Function 中使用，用于等待与服务器连接完成
```

订阅事件

```typescript
// 基本的订阅 订阅当前节点的直接属性变化
const subscriber: Callback = (key, value, oldValue, type) => {
  console.log('group.subscribe', key, type, ': ', oldValue, '->', value)
}
group.subscribe(subscriber) // 订阅
group.unsubscribe(subscriber) // 取消订阅
group.unsubscribeAll() // 取消当前节点所有订阅

// 订阅指定属性的变化
group.subscribeKey('id', (key, value, oldValue, type) => {
  console.log('group.subscribeKey', key, type, ': ', oldValue, '->', value)
})

// 订阅内部及深层所有的属性变化
group.subscribeDeep((path, value, oldValue, type) => {
  console.log('group.subscribeDeep', path, type, ': ', oldValue, '->', value)
})

// 订阅器都能在任意对象或数组上添加
group.people[1].subscribe(() => {
  // xxx
})
```

修改数据

```typescript
// 和 JavaScript 中一样 任意读取或操作他
console.log('第一个人的名字:', group.people[0].name)
// LOG: 第一个人的名字: Henry

console.log('修改 group 的 id 为 group-2')
group.id = 'group-2'
// LOG: 修改 group 的 id 为 group-2
// LOG: group.subscribeKey id update :  group-1 -> group-2
// LOG: group.subscribeDeep ['id'] update :  group-1 -> group-2

console.log('删除第一个的 description 属性')
delete group.people[0].description
// LOG: 删除第一个的 description 属性
// LOG: group.subscribeDeep ['people', 0, 'description'] delete :  A young man. -> undefined
```

```typescript
// 像操作 Array 一样操作 RhineVar
console.log('当前 group 中的人数为:', group.people.length)
// LOG: 当前 group 中的人数为: 2

console.log('添加一个新成员 Jessica')
group.people.push({ name: 'Jessica', age: 19 })
// LOG: 添加一个新成员 Jessica
// LOG: group.subscribeDeep ['people', 2] add :  undefined -> Proxy(RhineVarItem){xxx}
```

更多信息

```typescript
// 通过 .json() 更清晰的打印无代理信息的数据
console.log('当前 people 数据:', group.people.json())
// LOG: 当前 people 数据: [{…}, {…}, {…}]

// 注意，在 TypeScript 中通过 “ = ” 赋值一个对象时，可能出现类型校验不通过情况，可通过 as 修改类型
group.people[1] = { name: 'Jessica', age: 19 } as ProxiedRhineVarItem<Person> // 当然你也可以直接使用 “ as any ”
// LOG: group.subscribeDeep ['people', 1] delete :  {name: 'Emily', age: 22} -> undefined
// LOG: group.subscribeDeep ['people', 1] add :  undefined -> Proxy(RhineVarItem){}
```

<br/>

## Event System

RhineVar 及其内部所有节点，任意处都可添加订阅。使用示例可见上一板块的“订阅事件”部分。一共有三种订阅形式，具体如下。

| 类型   | 订阅函数        | 取消订阅函数      | 取消全部函数         | 回调函数类型   |
| ------ | --------------- | ----------------- | -------------------- | -------------- |
| Base   | subscribe       | unsubscribe       | unsubscribeAll       | Callback       |
| Key    | subscribeKey    | unsubscribeKey    | unsubscribeAllKey    | Callback       |
| Deep   | subscribeDeep   | unsubscribeDeep   | unsubscribeAllDeep   | DeepCallback   |
| Synced | subscribeSynced | unsubscribeSynced | unsubscribeAllSynced | SyncedCallback |

订阅函数及取消订阅函数需要传入一个对应类型的回调函数。

```
Base: 订阅当前节点直属属性的直接变化事件
Key: 订阅当前节点下指定属性的直接变化事件
Deep: 订阅当前节点内部所有属性及其子孙属性的变化事件
Synced: 与服务端同步状态变化事件
```

### Callback

订阅事件的回调函数可提供的信息如下，一般常用为前四项。

| 属性              | 类型                                          | 描述           |
| ----------------- | --------------------------------------------- | -------------- |
| key               | keyof T                                       | 变化属性的 key |
| value             | T[keyof T] \| ProxiedRhineVarItem<T[keyof T]> | 变化后的值     |
| oldValue          | T[keyof T]                                    | 变化前的值     |
| type              | ChangeType                                    | 事件类型       |
| nativeEvent       | YMapEvent<any> \| YArrayEvent<any>            | Yjs原生事件    |
| nativeTransaction | Transaction                                   | Yjs原生事务    |

### DeepCallback &nbsp; `extends Callback`

与 Callback 的唯一区别是 key 变为 path。其他属性不再重复列出。

| 属性 | 类型                 | 描述                                         |
| ---- | -------------------- | -------------------------------------------- |
| path | [string \| number]() | 变化属性的路径，从订阅的节点到变化的目标属性 |

### ChangeType

一个表示事件类型的 enum，具体如下。

| 属性   | 值     | 可触发对象     | 描述             |
| ------ | ------ | -------------- | ---------------- |
| Add    | add    | YMap \| YArray | 新增属性时触发   |
| Update | update | YMap           | 属性值更新时触发 |
| Delete | delete | YMap \| YArray | 移除属性时触发   |
| Sync   | sync   | RhineConnector | 首次连接时触发   |

注意，由于 Yjs 协同算法采用 Quill 的 Delta 协议。 数组元素更新值时，不会触发 Update 事件，而是会先触发 Delete 再触发 Add，组合完成。

### SyncedCallback

与服务端同步状态变化事件的回调。提供当前同步状态参数。

| 属性   | 类型    | 描述                       |
| ------ | ------- | -------------------------- |
| synced | boolean | 当前是否已与服务端同步状态 |

<br/>

## Config

### enableRhineVarLog(value: Boolean): void

启用/关闭RhineVar调试输出日志，默认为关闭。

```typescript
enableRhineVarLog(false)
```

### <s>enableRhineVarSyncHandshakeCheck(value: Boolean): void</s>

启用/关闭RhineVar二次握手检查协同成功，默认为开启。已弃用，将在后续版本移除。

```typescript
enableRhineVarSyncHandshakeCheck(false)
```

<br/>

## More Functions

更多 RhineVar 对象及其任意节点 的内置公用方法。使用示例可见上上板块。

### json(): T

转换为 json 格式

```typescript
state.json()
```

### afterSynced(callback: () => void): void

首次同步数据后回调

```typescript
state.afterSynced(() => {})
```

### waitSynced(): Promise\<void\>

首次同步数据后触发的 Promise

```typescript
await state.waitSynced()
```

### isRoot(): boolean

是否为根节点

```typescript
state.isRoot()
```

### root(): RhineVar

获取到根节点

```typescript
state.root()
```

### parent(): RhineVar | null

获取到父节点

```typescript
state.parent()
```

### frozenJson(): T

即使在 Yjs 对象从上下文移除后，也可通过该函数获取到最后的数据内容。

```typescript
state.frozenJson()
```

### string(indent: number = 2): string

转换成Json文本，可传入缩进空格数，默认为2.

```typescript
state.string()
```

### getConnector(): WebsocketConnector | null

获取当前对象所属RhineVar的连接器。

```typescript
state.getConnector()
```

<br/>

## 内置属性及函数

### origin

### connector

### initialize()

### emitSynced()

### emit()

### emitDeep()

### observer

### syncedObserver

### observe()

### unobserve()
