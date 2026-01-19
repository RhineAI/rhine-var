import { enableRhineVarLog, rhineProxy } from '../../src'

console.log('\n\n=================== Rhine Var Playground ===================\n\n')

enableRhineVarLog(false)

const state = rhineProxy(
  {
    count: 0,
    name: 'Rhine Var',
    items: [1, 2, 3],
  },
  'ws://rvp.rhineai.com/task-common',
)

console.log('Initial state:', state.json())

// Test mutations
state.count++
console.log('After count++:', state.count)

state.name = 'Updated Name'
console.log('After name update:', state.name)

state.items.push(4)
console.log('After items.push(4):', state.items.json())

console.log('\nFinal state:', state.json())

console.log('\nPlayground test completed successfully!')

process.exit(0)
