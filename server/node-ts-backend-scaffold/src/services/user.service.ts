import { AppError } from '../lib/errors.js'
import { logger } from '../lib/logger.js'
import * as userRepo from '../repositories/user.repository.js'
import type { CreateUserInput } from '../schemas/user.schema.js'

export async function listUsers() {
  return userRepo.findAll()
}

export async function createUser(input: CreateUserInput) {
  const exists = await userRepo.findByEmail(input.email)
  if (exists) {
    throw new AppError(409, 'Email already in use')
  }
  const user = await userRepo.create(input)
  logger.info({ userId: user.id }, 'User created')
  return user
}
