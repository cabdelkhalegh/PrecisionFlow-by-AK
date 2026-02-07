import { describe, it, expect, vi } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Mock the createClient function
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
  })),
}))

describe('Supabase Client', () => {
  it('createClient is called during module import', async () => {
    // Import the module dynamically
    await import('../supabase')
    
    // Verify createClient was called
    expect(createClient).toHaveBeenCalled()
  })

  it('handles environment variables', () => {
    // Test that environment variables are available
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
  })

  it('exports supabase client', async () => {
    const supabaseModule = await import('../supabase')
    
    expect(supabaseModule).toHaveProperty('supabase')
    expect(supabaseModule.supabase).toBeDefined()
  })
})
