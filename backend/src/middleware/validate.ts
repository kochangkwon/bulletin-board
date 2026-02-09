import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

/**
 * Zod validation middleware factory
 * Validates request body, params, or query against a Zod schema
 */
export function validate(schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source]
      const validated = schema.parse(data)

      // Replace original data with validated data (includes transformations)
      req[source] = validated

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        })
      }

      // Unexpected error
      next(error)
    }
  }
}

/**
 * Async Zod validation for request handlers
 * Returns Result<T, ValidationError>
 */
export function validateAsync<T>(schema: ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))

    return {
      success: false as const,
      errors
    }
  }

  return {
    success: true as const,
    data: result.data
  }
}
