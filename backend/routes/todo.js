const express = require('express');
const router = express.Router();

const isAuth = require('../routes-protection/is-auth');
const todoController = require('../controllers/todo');

router.get('/', isAuth, todoController.readAllTodos);
router.post('/', isAuth, todoController.createTodo);
router.delete('/', isAuth, todoController.deleteTodo);
router.patch('/', isAuth, todoController.updateTodo);
router.patch('/complete', isAuth, todoController.completeTodo);
router.patch('/pend', isAuth, todoController.pendTodo);

module.exports = router;
