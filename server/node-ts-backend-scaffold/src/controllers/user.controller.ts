import type { Request, Response } from 'express'
import * as userService from '../services/user.service.js'

export async function list(_req: Request, res: Response) {
  res.json(await userService.listUsers())
}

export async function create(req: Request, res: Response) {
  const user = await userService.createUser(req.body)
  res.status(201).json(user)
}
