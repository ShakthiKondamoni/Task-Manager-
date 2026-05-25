import express from 'express';
import Task from '../models/Task.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const filter = req.user.role === 'ADMIN' ? {} : { assignedTo: req.user._id };
  const tasks = await Task.find(filter);
  const now = new Date();

  res.json({
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
    overdue: tasks.filter(t => t.status !== 'DONE' && new Date(t.dueDate) < now).length
  });
});

export default router;
