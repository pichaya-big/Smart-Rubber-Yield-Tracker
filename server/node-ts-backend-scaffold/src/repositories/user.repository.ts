import type { CreateUserInput } from '../schemas/user.schema.js'

export interface User extends CreateUserInput {
  id: string
}

// Replace with real DB calls when a database is added.
const users: User[] = []

export async function findAll(): Promise<User[]> {
  return users
}

export async function findByEmail(email: string): Promise<User | undefined> {
  return users.find((u) => u.email === email)
}

export async function create(input: CreateUserInput): Promise<User> {
  const user: User = { id: crypto.randomUUID(), ...input }
  users.push(user)
  return user
}
