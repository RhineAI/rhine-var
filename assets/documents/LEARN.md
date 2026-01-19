<div align="center">

# RHINE-VAR &nbsp; Document

[English](LEARN.md) &nbsp; | &nbsp; [中文](LEARN_zh.md)

</div>

## Simplest Usage Example

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

When building a collaborative application using RHINE-VAR, typically, there will only be a single shared RhineVar object in your project.

It can be a complex and large JSON data structure to store all the collaborative information of your project.

## rhineProxy

The core function used to create a RhineVar object, whose internal data will automatically synchronize with others.

Typically, a project will use it only once, as only one root RhineVar object is needed.

```typescript jsx
function rhineProxy<T>(defaultValue, connector, overwrite)
```

| Parameter    | Type                     | Default | Description                                                                                                                                                                                                             |
| ------------ | ------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| defaultValue | T                        |         | Default Value <br/>If there is no data for this room on the server, this default value is used as the project's initial value.                                                                                          |
| connector    | RhineConnector \| string |         | Connector<br/>Pass in a connector object, a WebSocket link, or a simple room name.<br/>When a simple room name is provided, our public server will be used.<br/>For server-related information, please refer to README. |
| overwrite    | boolean                  | false   | Overwrite Mode <br/>Even if there is data on the server, the default value will overwrite the server data. This is mainly used for debugging purposes.                                                                  |
| return       | RhineVar\<T\>            | /       | Root RhineVar <br/>Collaborative variable object, which contains not only collaborative data but also connection-related features.                                                                                      |

Default Value will also be returned temporarily before the first connection to the server is established.

The public server can be used for testing, but it does not guarantee performance or security. It is equivalent to accessing the link `wss://rwq.rhineai.com/<room-id>`.

## useRhine

A React-specific Hook function used to create snapshots that automatically update the content on the page when the data changes.

Whenever someone modifies this value, the information will be `updated on everyone's screen` in real-time.

```typescript jsx
function useRhine<T>(proxy)
```

| Parameter | Type                     | Default | Description                                                                                     |
| --------- | ------------------------ | ------- | ----------------------------------------------------------------------------------------------- |
| proxy     | RhineVar\<T\>            |         | The RhineVar collaborative variable that needs to subscribe for updates, or any node inside it. |
| return    | Snapshot\<RhineVar\<T\>> | /       | The snapshot corresponding to the RhineVar.                                                     |

Note: The returned snapshot is read-only. Please do not perform any operations on it! The snapshot is only for reading data within React's XML. For all other operations (such as assignment or subscription), please operate on the original RhineVar object.

<br/>

## Advanced Guide

Interface for Example

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

Create RhineVar object

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

Event System

```typescript
// Basic subscription for changes in the direct properties of the current node
const subscriber: Callback = (key, value, oldValue, type) => {
  console.log('group.subscribe', key, type, ': ', oldValue, '->', value)
}
group.subscribe(subscriber) // Subscribe
group.unsubscribe(subscriber) // Unsubscribe
group.unsubscribeAll() // Unsubscribe all from the current node

// Subscribe to changes for a specific property
group.subscribeKey('id', (key, value, oldValue, type) => {
  console.log('group.subscribeKey', key, type, ': ', oldValue, '->', value)
})

// Subscribe to changes in all properties and their descendants
group.subscribeDeep((path, value, oldValue, type) => {
  console.log('group.subscribeDeep', path, type, ': ', oldValue, '->', value)
})

// Subscriptions can be added to any object or array
group.people[1].subscribe(() => {
  // xxx
})
```

Operation

```typescript
// Access or modify it just like in JavaScript
console.log("The first person's name:", group.people[0].name)
// LOG: The first person's name: Henry

console.log('Changing group id to group-2')
group.id = 'group-2'
// LOG: Changing group id to group-2
// LOG: group.subscribeKey id update :  group-1 -> group-2
// LOG: group.subscribeDeep ['id'] update :  group-1 -> group-2

console.log('Deleting the description property of the first person')
delete group.people[0].description
/**
 * Deleting the description property of the first person
 * group.subscribeDeep ['people', 0, 'description'] delete :  A young man. -> undefined
 */
```

```typescript
// Operate on a RhineVar like an Array
console.log('Current number of people in group:', group.people.length)
// LOG: Current number of people in group: 2

console.log('Adding a new member, Jessica')
group.people.push({ name: 'Jessica', age: 19 })
// LOG: Adding a new member, Jessica
// LOG: group.subscribeDeep ['people', 2] add :  undefined -> Proxy(RhineVarItem){xxx}
```

Additional

```typescript
// Use .json() to print data without proxy information more clearly
console.log('Current people data:', group.people.json())
// LOG: Current people data: [{…}, {…}, {…}]

// Note, when assigning a new object with " = " in TypeScript, there may be type-checking issues. You can use "as" to modify the type.
group.people[1] = { name: 'Jessica', age: 19 } as ProxiedRhineVarItem<Person> // You can also use "as any"
// LOG: group.subscribeDeep ['people', 1] delete :  {name: 'Emily', age: 22} -> undefined
// LOG: group.subscribeDeep ['people', 1] add :  undefined -> Proxy(RhineVarItem){}
```

<br/>

## Event System

RhineVar and all its internal nodes can add subscriptions anywhere. Examples of usage can be seen in the "Subscribe to Events" section of the previous block. There are three forms of subscription, detailed as follows.

| Type   | Subscribe Function | Unsubscribe Function | Unsubscribe All Function | Callback Function Type |
| ------ | ------------------ | -------------------- | ------------------------ | ---------------------- |
| Base   | subscribe          | unsubscribe          | unsubscribeAll           | Callback               |
| Key    | subscribeKey       | unsubscribeKey       | unsubscribeAllKey        | Callback               |
| Deep   | subscribeDeep      | unsubscribeDeep      | unsubscribeAllDeep       | DeepCallback           |
| Synced | subscribeSynced    | unsubscribeSynced    | unsubscribeAllSynced     | SyncedCallback         |

The subscription and unsubscription functions require passing a corresponding type of callback function.

```
Base: Subscribe to direct change events of the current node's direct properties
Key: Subscribe to direct change events of a specified property under the current node
Deep: Subscribe to change events of all properties and their descendants within the current node
Synced: Events of state changes synchronized with the server
```

### Callback

The information that the callback function for subscription events can provide is as follows, with the first four items being the most commonly used.

| Property          | Type                                          | Description                     |
| ----------------- | --------------------------------------------- | ------------------------------- |
| key               | keyof T                                       | The key of the changed property |
| value             | T[keyof T] \| ProxiedRhineVarItem<T[keyof T]> | The new value                   |
| oldValue          | T[keyof T]                                    | The old value                   |
| type              | ChangeType                                    | The event type                  |
| nativeEvent       | YMapEvent<any> \| YArrayEvent<any>            | Native Yjs event                |
| nativeTransaction | Transaction                                   | Native Yjs transaction          |

### DeepCallback &nbsp; `extends Callback`

The only difference from Callback is that key changes to path. Other properties are not repeated.

| Property | Type                 | Description                                                                       |
| -------- | -------------------- | --------------------------------------------------------------------------------- |
| path     | [string \| number]() | The path of the changed property, from the subscribed node to the target property |

### ChangeType

An enum representing event types, detailed as follows.

| Property | Value  | Trigger Object | Description                                |
| -------- | ------ | -------------- | ------------------------------------------ |
| Add      | add    | YMap \| YArray | Triggered when a new property is added     |
| Update   | update | YMap           | Triggered when a property value is updated |
| Delete   | delete | YMap \| YArray | Triggered when a property is removed       |
| Sync     | sync   | RhineConnector | Triggered upon the first connection        |

Note that due to Yjs's collaborative algorithm adopting Quill's Delta protocol, when array elements update their values, it will not trigger the Update event. Instead, it will first trigger Delete and then Add, completing the combination.

### SyncedCallback

Callback for state change events synchronized with the server. Provides current synchronization state parameters.

| Property | Type    | Description                                               |
| -------- | ------- | --------------------------------------------------------- |
| synced   | boolean | Whether the current state is synchronized with the server |

<br/>

## Config

### enableRhineVarLog(value: Boolean): void

Enable/disable RhineVar debug output logs. Disabled by default.

```typescript
enableRhineVarLog(false)
```

### <s>enableRhineVarSyncHandshakeCheck(value: Boolean): void</s>

Deprecated, will be removed in a future version.

Enable/disable the RhineVar secondary handshake synchronization check. Enabled by default.

```typescript
enableRhineVarSyncHandshakeCheck(false)
```

<br/>

## More Functions

Additional common methods for RhineVar objects and their internal nodes. Examples of usage can be found in the sections above.

### json(): T

Converts the data to JSON format.

```typescript
state.json()
```

### afterSynced(callback: () => void): void

Callback triggered after the first data synchronization.

```typescript
state.afterSynced(() => {})
```

### waitSynced(): Promise\<void\>

A Promise that triggers after the first data synchronization.

```typescript
await state.waitSynced()
```

### isRoot(): boolean

Determines if the current node is the root node.

```typescript
state.isRoot()
```

### root(): RhineVar

Gets the root node.

```typescript
state.root()
```

### parent(): RhineVar | null

Gets the parent node.

```typescript
state.parent()
```

### frozenJson(): T

Even after the Yjs object is removed from the context, the last data can still be retrieved through this function.

```typescript
state.frozenJson()
```

### string(indent: number = 2): string

```typescript
state.string()
```

### getConnector(): WebsocketConnector | null

```typescript
state.getConnector()
```

<br/>

## Built-in Functions and Properties

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
