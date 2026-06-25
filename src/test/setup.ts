import { vi } from 'vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../mocks/node'

HTMLCanvasElement.prototype.getContext = vi.fn()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
