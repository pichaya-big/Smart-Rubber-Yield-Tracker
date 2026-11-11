import { Router } from 'express'
import * as userController from '../controllers/user.controller.js'
import { validate } from '../middlewares/validate.middleware.js'
import { createUserSchema } from '../schemas/user.schema.js'

export const userRouter = Router()

userRouter.get('/', userController.list)
userRouter.post('/', validate(createUserSchema), userController.create)
