# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 Important Workflow Rules (Read First)

**Before doing anything:**
1. **Documentation**: Check if similar docs exist before creating new ones. All new docs must be indexed in CLAUDE.md.
2. **Code Cleanliness**: Delete test files and debug code after use. Run `git status` before committing.
3. **File Creation**: Search for similar components/utilities before creating new files.
4. **Testing**: Use `test/` or `playground/` directories for temporary tests, then clean up.
5. **Commits**: Remove all console.logs, debugger statements, and commented code before committing.

See detailed workflow rules in the "Development Workflow Rules" section below.

## Project Overview

This is a **Dify Conversation App Template** - a Next.js-based chat interface that connects to Dify's workflow API. It's configured locally to work with a custom workflow and has been customized from the official Dify template.

### Planned Development Goals
1. **Custom Response Rendering**: Adapt the chat interface to handle specific response content formats from the workflow
2. **Simple User System**: Implement basic authentication where students log in with name (姓名), student ID (学号), and course ID (课程号) - security is not a priority
3. **Future Features**: Multi-student conversation management and tracking (to be discussed later)

## Development Commands

```bash
# Install dependencies
npm install
# or
pnpm install

# Run development server (default: http://localhost:3000)
npm run dev
# or
pnpm dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Fix linting issues automatically
npm run fix
# or
npm run eslint-fix

# Git hooks (automatically run on commit)
npm run lint-staged
```

The project uses **husky** for git hooks and **lint-staged** to automatically lint files before committing.

## Key Entry Points

Understanding these files will help you navigate the codebase quickly:

- **`app/layout.tsx`**: Root layout, sets up i18n and HTML structure
- **`app/page.tsx`**: Home page, renders the Main component
- **`app/components/index.tsx`**: Main orchestrator (lines 30-706) - handles all chat logic, state management, API calls
- **`service/base.ts`**: HTTP/SSE base utilities, error handling, streaming parser
- **`service/index.ts`**: Domain-specific API methods (chat, conversations, feedback)
- **`config/index.ts`**: Global app configuration (API keys, app info, i18n settings)
- **`i18n/server.ts`**: Server-side i18n initialization
- **`i18n/client.ts`**: Client-side i18n helpers
- **`hooks/use-conversation.ts`**: Conversation list and state management
- **`types/app.ts`**: Core type definitions (ChatItem, ConversationItem, etc.)

## Configuration

### Environment Setup
1. Copy `.env.example` to `.env.local`
2. Configure these required variables:
   - `NEXT_PUBLIC_APP_ID`: Your Dify app ID (from app detail URL)
   - `NEXT_PUBLIC_APP_KEY`: API key (from app's "API Access" page)
   - `NEXT_PUBLIC_API_URL`: API base URL (e.g., `https://api.dify.ai/v1`)

### App Configuration
Edit `config/index.ts` for app-level settings:
- `APP_INFO`: Title, description, copyright, privacy policy, default language
- `isShowPrompt`: Whether to show opening statement
- `promptTemplate`: Default prompt template
- `LOCALE_COOKIE_NAME`: Cookie name for locale storage

## Architecture

### Tech Stack
- **Next.js 15** with App Router (React 19)
- **TypeScript** (strict mode enabled)
- **Tailwind CSS** for styling
- **i18next** for internationalization
- **dify-client** for API communication
- **SSE (Server-Sent Events)** for streaming responses

### Key Architecture Patterns

**1. App Router Structure (Next.js 14/15)**
- Entry point: `app/layout.tsx` and `app/page.tsx`
- API routes: `app/api/**/route.ts` (server handlers)
- Server components by default; mark client components with `'use client'`

**2. State Management**
- React hooks with `zustand` for global state
- `immer` for immutable state updates
- `useConversation` hook manages conversation list and current conversation
- Chat state is local to the main component

**3. API Communication**
- **Base HTTP utilities**: `service/base.ts`
  - `get()`, `post()`, `put()`, `del()` for standard requests
  - `ssePost()` for streaming (SSE) responses
  - Automatic error toast notifications
  - Request bodies auto-stringified to JSON
- **Domain methods**: `service/index.ts`
  - `sendChatMessage()`: Pre-configured streaming chat
  - `fetchConversations()`, `fetchChatList()`, `fetchAppParams()`
  - `updateFeedback()`, `generationConversationName()`
- All requests proxy through `/api` prefix (configured in `config/index.ts`)

**4. Streaming Response Handling**
The app uses SSE for real-time streaming responses with multiple event types:
- `message`/`agent_message`: Incremental content chunks
- `agent_thought`: Agent reasoning steps
- `message_file`: File attachments
- `message_end`: Message completion
- `message_replace`: Content replacement
- `workflow_started`/`workflow_finished`: Workflow lifecycle
- `node_started`/`node_finished`: Individual workflow node execution

See `service/base.ts:handleStream()` for the streaming parser implementation.

**5. Component Organization**
```
app/components/
├── base/              # Reusable UI primitives (buttons, icons, inputs, toast, etc.)
├── chat/              # Chat-specific components (answer, question, thought)
│   ├── answer/        # Message response rendering (important for custom rendering)
│   ├── question/      # User message display
│   └── thought/       # Agent reasoning display
├── sidebar/           # Conversation list sidebar
├── workflow/          # Workflow visualization components
├── welcome/           # Welcome/intro screen
├── header.tsx         # App header
└── index.tsx          # Main app component (orchestrates everything)
```

**6. Chat Message Rendering**
- Questions: `app/components/chat/question/index.tsx`
- Answers: `app/components/chat/answer/index.tsx` - **This is where you'll modify response rendering**
  - Uses `StreamdownMarkdown` for streaming markdown rendering
  - Supports agent mode with `agent_thoughts`
  - Handles workflow process visualization
  - Renders suggested questions
  - Feedback system (like/dislike)

**7. i18n Architecture**
- Server locale: `getLocaleOnServer()` (reads cookie or negotiates from headers)
- Client locale: `getLocaleOnClient()` / `setLocaleOnClient()`
- Translation files: `i18n/lang/**` (en, zh, es, fr, ja, vi)
- Cookie name: `LOCALE_COOKIE_NAME` from config

### Important Files for Custom Development

**Response Rendering:**
- `app/components/chat/answer/index.tsx`: Main answer component - modify here for custom response formats
- `app/components/base/streamdown-markdown.tsx`: Streaming markdown renderer
- `types/app.ts`: Type definitions for `ChatItem`, `VisionFile`, etc.

**User Authentication (Future):**
- `app/api/**/route.ts`: Add authentication endpoints here
- `service/index.ts`: Add auth-related API methods
- `hooks/`: Create `use-auth.ts` for authentication state

**Conversation Management:**
- `app/components/index.tsx`: Main orchestrator (lines 30-706)
- `hooks/use-conversation.ts`: Conversation state management
- `service/index.ts`: API methods for conversations

## Development Workflow Rules

### Documentation Management

**Before creating new documentation:**
1. **Check existing documentation first**:
   - Search in project root for existing `.md` files
   - Check if similar documentation already exists
   - Review existing docs to see if your content fits there

2. **Only create documentation when necessary**:
   - Avoid redundant documentation
   - Don't document things that are obvious from code
   - Focus on "why" not "what" (code should be self-documenting for "what")

3. **Index all new documentation in CLAUDE.md**:
   - Add references to new docs in relevant sections
   - Update the "Key Entry Points" section if needed
   - Keep CLAUDE.md as the single source of truth for navigation

**Example workflow:**
```bash
# Before creating docs/api-guide.md
# 1. Check if similar docs exist
ls docs/
grep -r "API" *.md

# 2. If needed, create the doc
# 3. Index it in CLAUDE.md under relevant section
```

### Code Cleanliness and Testing

**Test file management:**
- **Create test files in appropriate locations**:
  - Temporary tests: Use `test/` or `playground/` directory
  - Component tests: Co-locate with components (e.g., `button.test.tsx` next to `button.tsx`)

- **Clean up after testing**:
  - Delete temporary test files after validation
  - Remove debug console.logs before committing
  - Remove commented-out code blocks

- **Before committing**:
  ```bash
  # Check for test files
  git status

  # Remove temporary files
  rm test/temp-*.ts
  rm playground/*.tsx

  # Clean up debug code
  # Search for console.log, debugger statements
  grep -r "console.log" app/
  ```

**Project cleanliness checklist:**
- [ ] No unused imports (ESLint will catch these)
- [ ] No commented-out code blocks
- [ ] No temporary test files
- [ ] No debug statements (console.log, debugger)
- [ ] No TODO comments without context
- [ ] No unused components or utilities

### File and Folder Organization

**Before creating new files:**
1. **Check if similar functionality exists**:
   - Search for similar component names
   - Check if utility functions already exist
   - Review the component structure in `app/components/`

2. **Follow existing patterns**:
   - Place components in appropriate directories (`base/`, `chat/`, etc.)
   - Use consistent naming conventions (PascalCase for components)
   - Co-locate related files (component + styles + types)

3. **Keep the structure flat when possible**:
   - Avoid deeply nested directories (max 3 levels)
   - Use feature-based organization for large features

**Example structure:**
```
app/components/
├── base/                 # Reusable primitives
│   └── button/
│       ├── index.tsx
│       └── style.module.css
├── chat/                 # Feature: chat
│   ├── index.tsx
│   ├── answer/
│   └── question/
└── auth/                 # Feature: auth (new)
    ├── index.tsx
    ├── login-form/
    └── types.ts
```

### Code Review Checklist (Before Committing)

Before committing your changes, verify:

**Functionality:**
- [ ] Code works as expected
- [ ] No console errors or warnings
- [ ] Tested in development environment
- [ ] Edge cases handled

**Code Quality:**
- [ ] Follows TypeScript strict mode (no `any`)
- [ ] Uses `@/*` path aliases
- [ ] Proper error handling with Toast
- [ ] i18n keys added for all user-facing text

**Cleanliness:**
- [ ] Removed all test files
- [ ] Removed all console.logs
- [ ] Removed commented code
- [ ] No unnecessary files added

**Documentation:**
- [ ] Complex logic has comments
- [ ] New utilities/hooks documented
- [ ] CLAUDE.md updated if architecture changed
- [ ] README updated if setup changed

### Git Commit Guidelines

**Commit message format:**
```
<type>: <subject>

[optional body]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `style`: Formatting, styling
- `docs`: Documentation changes
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat: add student login system"
git commit -m "fix: resolve streaming callback stale closure issue"
git commit -m "refactor: extract chat rendering logic to separate component"
git commit -m "docs: update CLAUDE.md with auth implementation guide"
```

### Debugging Workflow

**When encountering bugs:**
1. **Check recent changes**: `git diff` to see what changed
2. **Check browser console**: Look for errors and warnings
3. **Check Network tab**: For API/SSE issues
4. **Check React DevTools**: For component state issues
5. **Add strategic console.logs**: But remember to remove them!
6. **Consult CLAUDE.md**: Check "Common Pitfalls" section

**Common debug patterns:**
```typescript
// Temporary debug logs (REMOVE BEFORE COMMIT)
console.log('[DEBUG] chatList:', getChatList())
console.log('[DEBUG] conversationId:', currConversationId)

// Better: Use debugger for complex issues
if (someCondition) {
  debugger // REMOVE BEFORE COMMIT
}
```

### Dependency Management

**Before adding new dependencies:**
1. **Check if functionality already exists**:
   - Search existing `package.json` dependencies
   - Check if similar utility is already in the codebase
   - Consider if it can be implemented with existing tools

2. **Evaluate the dependency**:
   - Check bundle size impact (use bundlephobia.com)
   - Check last update date and maintenance status
   - Check for security vulnerabilities
   - Consider if it's really necessary

3. **Install and document**:
   ```bash
   # Install
   npm install <package-name>
   # or
   pnpm add <package-name>

   # Document why it was added (optional, in commit message)
   git commit -m "chore: add <package> for <specific reason>"
   ```

**Avoid adding dependencies for:**
- Simple utility functions (e.g., date formatting, string manipulation)
- Functions that can be done with existing libraries (lodash-es is already included)
- Large libraries when you only need a small part

### Performance Monitoring

**Check performance impact when:**
- Adding new components to chat rendering
- Modifying streaming logic
- Adding state updates in hot paths
- Importing large libraries

**Use React DevTools Profiler:**
```
1. Open React DevTools → Profiler
2. Click record
3. Interact with the app
4. Stop recording
5. Review flame graph for slow components
```

**Performance red flags:**
- Components rendering more than necessary
- Large bundle size increases (>100KB)
- Slow initial page load (>3s)
- Memory leaks in streaming callbacks

### Environment-Specific Configurations

**Development environment:**
- Use `.env.local` for local API keys (never commit!)
- Hot reload should work automatically
- Source maps enabled for debugging

**Production environment:**
- Use environment variables from hosting platform
- Source maps disabled (see `next.config.js`)
- Optimize images and assets
- Test build locally before deploying:
  ```bash
  npm run build
  npm start
  ```

**Environment file priority:**
```
.env.local          # Local overrides (never commit)
.env.development    # Development defaults
.env.production     # Production defaults
.env                # Global defaults
```

## Development Best Practices

### TypeScript Conventions

- **Strict mode**: `strict: true` in `tsconfig.json`. **Avoid `any` at all costs**
- **Explicit types**: Prefer explicit function signatures for all exported functions
- **Path aliases**: Always use `@/*` alias for absolute imports (configured in `tsconfig.json`)
  ```typescript
  // Good
  import Button from '@/app/components/base/button'

  // Avoid
  import Button from '../../../components/base/button'
  ```

### React Best Practices

- **Function components only**: Use function components (not class components)
- **React.memo usage**: Only use `React.memo` when you have measurable performance issues
  - Export default with `React.memo()` for leaf components
  - Example: `export default React.memo(MyComponent)`
- **Hooks**:
  - Co-locate custom hooks under `hooks/**` directory
  - Always prefix hook names with `use` (e.g., `useConversation`, `useBreakpoints`)
  - Keep hooks focused on a single responsibility

### Next.js App Router Conventions

- **Server components by default**: Components are server components unless you add `'use client'`
- **Client components**: Only mark components with `'use client'` when you need:
  - React state (`useState`, `useReducer`)
  - React effects (`useEffect`, `useLayoutEffect`)
  - Browser APIs (window, document, localStorage, etc.)
  - Event handlers (onClick, onChange, etc.)
- **Route handlers**: All API routes belong in `app/api/**/route.ts`
- **Server-only code**: Do NOT import server-only modules into client components
- **Environment variables**:
  - Keep environment variable access to server files
  - Never expose secrets to client components
  - Use `NEXT_PUBLIC_*` prefix only for client-safe variables

### Styling Conventions

- **Tailwind-first**: Always prefer Tailwind utility classes
- **SCSS/CSS Modules**: Use `style.module.css` only when Tailwind is insufficient
- **Conditional classes**: Use `classnames` or `tailwind-merge` for dynamic class names
  ```typescript
  import cn from 'classnames'

  <div className={cn('base-class', {
    'active-class': isActive,
    'disabled-class': isDisabled
  })}>
  ```
- **Global styles**: Place global styles in `app/styles/**`
- **Colocated styles**: Keep component-specific styles next to the component

### Code Quality Standards

- **Control flow**:
  - Use early returns to handle edge cases first
  - Avoid deep nesting (max 3 levels)
  - Extract complex conditions into well-named variables
  ```typescript
  // Good
  if (!data) return null
  if (error) return <Error />
  return <Success data={data} />

  // Avoid
  if (data) {
    if (!error) {
      return <Success data={data} />
    }
  }
  ```
- **Error handling**: Always handle errors gracefully with Toast notifications
- **Component organization**: One component per file, related components in same directory

## UI Components

**Base Components** (`app/components/base/**`)
- Buttons, inputs, icons, tooltips, toasts, spinners
- File uploaders (images and attachments)
- Image gallery and preview
- Auto-height textarea

**Feature Components**
- **Chat** (`app/components/chat/`): Core chat interface
- **Sidebar** (`app/components/sidebar/`): Conversation history
- **Workflow** (`app/components/workflow/`): Workflow visualization
- **ConfigScene** (`app/components/config-scence/`): Input configuration panel

**Toast Notifications**
Use `app/components/base/toast` for error/success messages:
```typescript
import Toast from '@/app/components/base/toast'
Toast.notify({ type: 'error', message: 'Error message' })
```

## Official Guidelines (from .cursor/rules)

### Project Structure Rules
- **App Router entry**: `app/layout.tsx`, `app/page.tsx`
- **API Routes**: Located under `app/api/**`. Server handlers live in `route.ts` files per folder
- **Components**: UI under `app/components/**` with feature folders (e.g., `chat`, `workflow`, `base`)
- **Services (API client)**: Client-side HTTP/SSE utilities in `service/base.ts` and domain methods in `service/index.ts`
- **Config**: Global config in `config/index.ts` and Next config in `next.config.js`
- **i18n**: Client/server helpers in `i18n/client.ts` and `i18n/server.ts`, with resources in `i18n/lang/**`
- **Styles**: Tailwind setup in `tailwind.config.js`, global styles under `app/styles/**`

### API Client Usage Rules

**HTTP Requests:**
- **Always use domain functions** in `service/index.ts` for app features
- **Prefer base methods**: Use `get/post/put/del` from `service/base.ts`:
  - They apply base options, timeout (100s), and automatic error toasts
  - Request bodies via `options.body` - will be JSON-stringified automatically
  - Query params via `options.params` on GET requests
- **Downloads**: Set `Content-type` header to `application/octet-stream`
- **Error handling**: Automatic toast notifications on errors (configured in `service/base.ts`)

**SSE Streaming:**
- For streaming responses, use `ssePost()` from `service/base.ts`
- Always supply these callbacks:
  - `onData`: Handle incremental message content
  - `onCompleted`: Called when stream finishes
  - `onThought`: Handle agent reasoning steps
  - `onFile`: Handle file attachments
  - `onMessageEnd`: Message completion metadata
  - `onMessageReplace`: Handle content replacement
  - `onWorkflowStarted`: Workflow initialization
  - `onNodeStarted`: Workflow node starts
  - `onNodeFinished`: Workflow node completes
  - `onWorkflowFinished`: Workflow completion
  - `onError`: Handle streaming errors
- **Chat helper**: `sendChatMessage()` in `service/index.ts` preconfigures streaming for chat messages

### i18n (Internationalization) Rules
- **Server-side locale**: Use `getLocaleOnServer()` - reads cookie or negotiates from headers (`i18n/server.ts`)
- **Client-side locale**: Use `getLocaleOnClient()` / `setLocaleOnClient()` in `i18n/client.ts`
- **Cookie storage**: Uses `LOCALE_COOKIE_NAME` from `config/index.ts`
- **Translation files**: Place in `i18n/lang/**` (supported: en, zh, es, fr, ja, vi)
- **Keep keys synchronized** across all locale files
- **HTML lang attribute**: Render `<html lang>` using resolved locale in `app/layout.tsx`

### Component Development Rules

**Component Organization:**
- Base primitives in `app/components/base/**` (buttons, icons, inputs, uploader, etc.)
- Larger features (chat, workflow) live in their own folders with `index.tsx` and submodules
- Prefer colocated `style.module.css` or Tailwind classes
- Global styles in `app/styles/**`

**Client Component Guidelines:**
- Avoid unnecessary client components
- Mark with `'use client'` only when needed:
  - State (useState, useReducer)
  - Effects (useEffect, browser APIs)
  - Event handlers (onClick, etc.)

**Notifications:**
- Use `app/components/base/toast` for error/display notifications
- Import: `import Toast from '@/app/components/base/toast'`
- Usage: `Toast.notify({ type: 'error', message: 'Error message' })`

## Common Patterns

**Adding a new chat message type:**
1. Update `types/app.ts` to add new `ChatItem` properties
2. Modify `app/components/chat/answer/index.tsx` to render the new format
3. Update streaming handler in `app/components/index.tsx` (around line 427-620)
4. Add any new SSE event types to `service/base.ts:handleStream()` if needed

**Adding API endpoints:**
1. Create `app/api/[endpoint]/route.ts` with GET/POST/PUT/DELETE handlers
2. Add corresponding domain method in `service/index.ts`
3. Import and use in components
4. Handle errors with Toast notifications

**Adding new component:**
1. Create under appropriate directory in `app/components/`
2. Use `'use client'` if it needs state/effects/browser APIs
3. Export default with `React.memo()` for performance (if it's a leaf component)
4. Co-locate styles with `style.module.css` if needed
5. Add to appropriate parent component

**Managing conversation state:**
- Use `useConversation` hook for conversation list and current conversation ID
- Local chat state managed in main component with `getChatList/setChatList`
- Use `immer` with `produce()` for immutable updates
- Always use the getter functions (`getChatList`, `getCurrConversationId`) in callbacks to avoid stale closures

**Adding translations:**
1. Add keys to all files in `i18n/lang/**` (en, zh, es, fr, ja, vi)
2. Keep keys synchronized across all locale files
3. Use `useTranslation()` hook in components: `const { t } = useTranslation()`
4. Access with dot notation: `t('app.errorMessage.valueOfVarRequired')`

## Common Pitfalls and Solutions

### State Management Issues

**Problem**: Stale closures in callbacks (especially in streaming callbacks)
```typescript
// ❌ Bad - will use stale chatList
const [chatList, setChatList] = useState([])
onData: (message) => {
  setChatList([...chatList, newItem]) // chatList is stale!
}

// ✅ Good - use getter function
const [chatList, setChatList, getChatList] = useGetState([])
onData: (message) => {
  setChatList([...getChatList(), newItem]) // Always fresh!
}
```

**Problem**: Mutating state directly with immer
```typescript
// ❌ Bad
responseItem.content = responseItem.content + message

// ✅ Good - immer handles it, but be aware setAutoFreeze(false) is set
// See app/components/index.tsx lines 58-62
responseItem.content = responseItem.content + message // OK with setAutoFreeze(false)
```

### Component Issues

**Problem**: Unnecessary re-renders
```typescript
// ❌ Bad - creates new object every render
<Component style={{ color: 'red' }} />

// ✅ Good - stable reference
const style = { color: 'red' }
<Component style={style} />
```

**Problem**: Client component in server component causing hydration errors
```typescript
// ❌ Bad - mixing server and client
// app/some-server-component.tsx (no 'use client')
import ClientButton from './client-button' // has 'use client'
// This can cause issues if not handled properly

// ✅ Good - clear separation
// Keep client components in their own files with 'use client'
// Import them into server components only when needed
```

### API and Streaming Issues

**Problem**: Not handling all streaming events
```typescript
// ❌ Bad - missing important callbacks
ssePost('chat-messages', {}, {
  onData: (message) => { /* handle */ }
  // Missing onError, onCompleted, etc.
})

// ✅ Good - handle all events
ssePost('chat-messages', {}, {
  onData: (message) => { /* handle */ },
  onError: (error) => { /* handle */ },
  onCompleted: () => { /* cleanup */ },
  onMessageEnd: (meta) => { /* finalize */ }
})
```

**Problem**: Forgetting to check conversation ID in streaming callbacks
```typescript
// ❌ Bad - updates wrong conversation if user switches
onData: (message) => {
  updateCurrentQA({ responseItem, ... })
}

// ✅ Good - check if still in same conversation
onData: (message) => {
  if (prevTempNewConversationId !== getCurrConversationId()) {
    setIsRespondingConCurrCon(false)
    return
  }
  updateCurrentQA({ responseItem, ... })
}
```

### i18n Issues

**Problem**: Hardcoded text instead of translations
```typescript
// ❌ Bad
<button>Submit</button>

// ✅ Good
const { t } = useTranslation()
<button>{t('common.operation.submit')}</button>
```

**Problem**: Missing translations in some locales
- Always update ALL locale files when adding new keys
- Use the same structure across all files
- Test with different locales to catch missing keys

## Debugging and Development Tips

### Debugging Streaming Issues
- Open browser DevTools → Network tab → filter by "chat-messages"
- Look for EventStream type requests
- Check the response preview to see SSE events in real-time
- Common issues:
  - Events not firing: Check event names in `service/base.ts:handleStream()`
  - Content not updating: Check if using stale state (use getter functions)
  - Wrong conversation updated: Check conversation ID validation in callbacks

### Debugging State Issues
- Use React DevTools to inspect component state
- Add console.logs in `useGetState` getter functions to track state access
- Check `app/components/index.tsx` for conversation state management
- Look for `produce()` calls to see where state is being updated

### Common Console Warnings
- **"Cannot update a component while rendering a different component"**:
  - Usually from calling setState in render
  - Move state updates to useEffect or event handlers
- **"Each child in a list should have a unique key prop"**:
  - Add unique `key` prop to mapped components
  - Use message ID or index as last resort
- **Hydration errors**:
  - Check for client/server mismatch (e.g., `Date.now()` called during render)
  - Ensure server and client render the same initial HTML

### Performance Tips
- Use React DevTools Profiler to identify slow components
- `React.memo()` is already used for most leaf components
- Avoid inline object/array creation in render (causes re-renders)
- Use `useCallback` for event handlers passed to child components
- Use `useMemo` for expensive calculations

### Hot Module Replacement (HMR)
- Changes to components should auto-refresh
- Changes to `config/index.ts` may require full page reload
- If HMR breaks, restart dev server with `npm run dev`

## Project-Specific Notes

### Immer Auto-Freeze
- `setAutoFreeze(false)` is called in main component (lines 58-62)
- This is required for streaming updates where we mutate `responseItem` directly
- Be careful with this pattern - it's intentional here for performance

### API Proxy Configuration
- All API requests go through `/api` prefix
- Configured in `service/base.ts` and `config/index.ts`
- Backend API routes in `app/api/**/route.ts` proxy to Dify API
- This keeps API keys secure on the server side

### Conversation ID "-1"
- Special ID "-1" means "new conversation"
- When first message is sent, real conversation ID is created by backend
- See `app/components/index.tsx:handleConversationIdChange()` for logic

### File Upload
- Images: handled by `app/components/base/image-uploader/`
- Documents: handled by `app/components/base/file-uploader-in-attachment/`
- Both use similar patterns but different upload endpoints
- Files are uploaded immediately when selected, before message send

## Docker Deployment

```bash
docker build . -t <DOCKER_HUB_REPO>/webapp-conversation:latest
docker run -p 3000:3000 <DOCKER_HUB_REPO>/webapp-conversation:latest
```

Access at http://localhost:3000

## Notes

- The project has ESLint and TypeScript errors ignored during build (see `next.config.js`)
- `husky` and `lint-staged` are configured for pre-commit hooks
- Vercel Hobby users: messages may be truncated due to platform limitations
- The app uses `server-only` package to prevent server code leaking to client
- Auto-freeze is disabled for `immer` in the main component to support streaming updates
