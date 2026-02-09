import { z } from 'zod'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Environment schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  DATABASE_PATH: z.string().default('./database.sqlite')
})

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsedEnv.error.format())
  throw new Error('Invalid environment variables')
}

// Export validated environment variables
export const env = parsedEnv.data

// Type export
export type Env = z.infer<typeof envSchema>
