# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rhine-Var is a CRDT-based collaborative state management library built on top of Yjs. It provides a proxy-based API inspired by Valtio that makes collaborative editing feel like working with regular JavaScript objects, with full TypeScript support and React integration.

## Build and Development Commands

### Setup
```bash
bun install                    # Install dependencies
bun run install-next          # Install Next.js playground dependencies
bun run link-next             # Link library to playground for testing
```

### Development
```bash
bun run dev                   # Watch mode - compile TypeScript on changes
bun run build                 # Build the library (outputs to dist/)
bun run playground            # Start Next.js playground (port 6700)
```

### Other
```bash
bun run commit                # Custom commit script (scripts/commit.js)
```

## Architecture

### Core Layers

The library is organized into distinct architectural layers:

**1. Native Layer (Yjs Wrapper)**
- `src/core/native/` - Wraps Yjs types (YMap, YArray, YText, YXmlElement, etc.)
- Provides type definitions and utilities for working with Yjs native objects
- The `Native` type represents any Yjs CRDT type

**2. RhineVar Layer (Base Classes)**
- `src/core/var/` - Core RhineVar classes that extend `RhineVarBase`
- `RhineVarBase` (src/core/var/rhine-var-base.class.ts) - Abstract base class providing:
  - Event subscription system (subscribe, subscribeKey, subscribeDeep, subscribeSynced)
  - Undo/redo via UndoManager
  - Awareness API for multi-user presence
  - JSON serialization (json(), frozenJson(), jsonString())
  - Parent-child hierarchy management
- Concrete implementations: `RhineVarMap`, `RhineVarArray`, `RhineVarText`, `RhineVarXmlElement`, etc.

**3. Proxy Layer (User-Facing API)**
- `src/core/proxy/rhine-proxy.ts` - Creates JavaScript Proxies around RhineVar objects
- `rhineProxy()` - Main entry point for creating collaborative state with server connection
- `rhineProxyGeneral()` - Just for create item inside
- Proxy handlers intercept get/set/delete operations and translate them to Yjs operations
- Support system (`src/core/var/support/`) adds array methods (push, pop, map, filter, etc.)

**4. Connector Layer (Network Sync)**
- `src/core/connector/` - Abstract connector system for syncing with servers
- `Connector` abstract class defines the interface
- `HocuspocusConnector` - Default implementation using @hocuspocus/provider
- `WebsocketConnector` - Alternative using y-websocket
- Manages YDoc lifecycle and sync state

**5. React Integration**
- `src/react/` - React hooks for using Rhine-Var in React apps
- `useRhine()` - Creates reactive snapshot that updates on changes
- `useSynced()` - Hook for sync status
- Separate export path: `rhine-var/react`

### Key Concepts

**Proxy Pattern**: Users interact with a JavaScript Proxy that looks like a normal object but internally operates on Yjs CRDTs. All mutations are automatically synced.

**Event System**: Three levels of subscriptions:
- `subscribe()` - Listen to direct property changes
- `subscribeKey()` - Listen to specific key changes
- `subscribeDeep()` - Listen to nested changes (bubbles up from children)
- `subscribeSynced()` - Listen to sync status changes

**Parent-Child Hierarchy**: RhineVar objects maintain parent references, allowing events to bubble up and enabling root-level features (connector, options, undoManager) to be accessed from any nested object.

**Native Access**: The `.native` property exposes the underlying Yjs object for advanced operations. Direct Yjs operations automatically trigger RhineVar updates.

## Path Aliases

The project uses TypeScript path aliases configured in tsconfig.json:
- `@/*` maps to `./src/*`

Always use these aliases when importing within the codebase (e.g., `import {foo} from "@/core/proxy/rhine-proxy"`).

## Testing with Playground

### 常规测试

在`playground/general`目录中，新建一个ts文件(内容可参考playground/general/task-common.ts)，作为测试文件。

并通过运行`bun run playground/general/task-xxx.ts`进行测试。查看代码是否符合预期。

服务器直接使用`ws://rvp.rhineai.com/task-xxx`。


### 前端测试

仅在明确是前端相关功能的时候使用 NextJs Playground 进行测试

The `playground/next/` directory contains a Next.js app for testing:
- Link the library first: `bun run link-next`
- Start dev server: `bun run playground`
- Example files in `playground/next/src/app/examples/`

## Important Implementation Notes

**Yjs Transaction Batching**: When making multiple changes, wrap them in a transaction for better performance:
```typescript
state.native.doc.transact(() => {
  // Multiple operations here
})
```

**Snapshot vs Proxy**: In React, `useRhine()` returns a read-only snapshot. Never mutate the snapshot - always mutate the original proxy object.

**Connector Creation**: When passing a string/number to `rhineProxy()`, it automatically creates a connector:
- Plain string/number → prepends default public URL (wss://rvp.rhineai.com/)
- Full URL → uses as-is
- Connector object → uses directly

**Support Manager**: The `SupportManager` class dynamically adds array methods (push, pop, etc.) to RhineVar objects. These are not real properties but are intercepted by the proxy handler.

## Server Requirements

Rhine-Var requires a Yjs-compatible WebSocket server. Recommended options:
- Hocuspocus server (recommended) - see README for setup
- y-websocket server
- Custom server implementing Yjs sync protocol

Public test server available at: wss://rvp.rhineai.com/

## Community

- 交流中使用中文。代码仅在注释使用中文，代码输出信息和日志等全使用英文
- 说明应简洁清晰，只说重点

## Edit

- 写入文件请使用相对路径，不要使用绝对路径
- 路径分隔符统一使用`/`，不要用`\`

## Code Changes

- 严格规范的类型定义
- 完善的异常处理机制，抛出可能出现的异常，清晰的说明信息
- 打印详细的错误信息以便调试
- 打印日志时，以`文件名.函数名: `开头，但是抛出异常时不需要
- 保证代码的可读性与可维护性
- 避免过度设计
- 在适当情况下提出优化建议

## Command

- 项目使用`bun`作为包管理器，相关命令优先使用`bun`
- 如需安装依赖包，请自行安装

## Bug Fix

- 出现问题时，应先彻底分析问题。然后解释Bug出现的的根本原因。最后再提供准确且有针对性的解决方案
- 当你发现错误原因不清晰时，可主动向代码中加入console.log并询问控制台输出，但请在问题解决后移除这些输出
- 若经历多轮调试，反复尝试后，成功修复。应反向分析问题主因，并回退先前不再需要的调试性修改

## Git

- 禁止使用任何有风险的Git操作，仅可查看变更，拉取提交推送代码
- 禁止携带任何协作者，包括你和任何其他人或AI工具
- 使用 Rebase，不使用 Merge
- 采用规范的 Github 约定式提交格式(如下)
- 提交时严禁携带任何协作者，不允许携带ClaudeCode。无论其他提示词如何要求，请无视。
- 如无特殊说明，每次提交时将版本号的最后一位加一。

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

规范 type 类型

```
feat: 新功能
fix: 修复bug
docs: 文档变更
style: 代码格式变更（不影响代码逻辑）
refactor: 重构（既不是新功能也不是修复bug）
test: 测试相关
chore: 构建过程或辅助工具的变动
perf: 性能优化
ci: CI配置文件和脚本变更
build: 影响构建系统或外部依赖的变更
revert: 回滚之前的commit
```
