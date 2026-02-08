import {enableRhineVarLog, EventType, rhineProxy, RvPath, StoredRhineVar} from '../../src'

console.log('\n\n=================== Rhine Var Playground ===================\n\n')

enableRhineVarLog(false)

const state = rhineProxy(
  {
    count: 0,
    name: 'Rhine Var',
    items: [1, 2, 3],
  },
  'wss://rvp.rhineai.com/task-common',
)

console.log(state.json())

state.afterSynced(() => {

  state.subscribeDeep((
    type: EventType,
    path: RvPath,
    value: any | StoredRhineVar,
  ) => {
    console.log('subscribeDeep', type, path, value)
  })

  state.transact(() => {
    console.log('Change count to 2')
    state.count = 2
    console.log('Change count to 3')
    state.count = 3
    console.log('Push item 4')
    state.items.push(4)
  })

  console.log(state.json())

  console.log('\nPlayground test completed successfully!')

  process.exit(0)

})
