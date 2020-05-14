import express from 'express'
import { TaskModel } from "../models/task"
import { auth } from '../middleware/auth'

const router = express.Router()

router.post('/tasks', auth, async (req, res) => {
    const task = new TaskModel({...req.body, owner: req.user._id})
    try {
        await task.save()
        res.status(201).send(task)
    } catch(error) {
        res.sendStatus(400).send(error)
    }
})

router.get('/tasks', auth, async (req, res) => {
    try {
        await req.user.populate('tasks').execPopulate()
        res.send(req.user.tasks)
    } catch(error) {
        res.status(500).send(error)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await TaskModel.findOne({ _id, owner: req.user._id})
        if (!task) {
            return res.sendStatus(404)
        }
        res.send(task)
    } catch(error) {
        res.sendStatus(500).send(error)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(el => allowedUpdates.includes(el))

    if (!isValidOperation) {
        res.status(400).send({
            error: `Invalid updates, only allowed: ${allowedUpdates.join(', ')}`
        })
    }

    try {
        const task = await TaskModel.findOne({_id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.sendStatus(404)
        }

        updates.forEach(update => task.set(update, req.body[update]))
        await task.save()

        res.send(task)
    } catch(error) {
        res.status(500).send(error)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await TaskModel.findOne({_id: req.params.id, owner: req.user._id})
        if (!task) {
            return res.sendStatus(404)
        }
        await task.remove()
        res.sendStatus(204)
    } catch (error) {
        res.status(500).send(error)
    }
})

export default router