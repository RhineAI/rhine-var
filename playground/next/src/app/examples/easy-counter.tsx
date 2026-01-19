import { rhineProxy, enableRhineVarLog } from 'rhine-var'
import { useRhine } from 'rhine-var/react'

enableRhineVarLog(true)

const defaultValue = {
  data: {
    count: 0,
    item: {
      text: 'aaa',
    },
  },
}
const url = 'room-1'
const state = rhineProxy(defaultValue, url, { overwrite: false })

state.subscribeDeep(() => {
  console.log('root subscribeDeep', state.json())
})

state.data.item.subscribe(() => {
  console.log('self subscribe', state.data.item.json())
})

state.data.item.subscribeDeep(() => {
  console.log('self subscribeDeep', state.data.item.json())
})

function Counter() {
  const snap = useRhine(state)

  return (
    <div
      className='page'
      onClick={() => {
        console.log(state.json())
      }}
    >
      <button onClick={() => state.data.count--}> - 1 </button>
      <span onClick={() => (state.data.count = 0)}>{snap.data.count}</span>
      <button onClick={() => state.data.count++}> + 1 </button>
      {/*<input value={snap.data.item.text} onChange={e => state.data.item.text = e.target.value}/>*/}
    </div>
  )
}

export default Counter
