import { describe, it, expect } from 'vitest'
import build from './index.js'

describe('Backend server', () => {
  it('should return hello world on GET /', async () => {
    const app = build()
    const response = await app.inject({
      method: 'GET',
      url: '/'
    })
    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.payload)).toEqual({ hello: 'world' })
    await app.close()
  })
})
