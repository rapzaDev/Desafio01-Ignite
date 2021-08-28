const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username );
  if (!user) return response.status(404).json({ error: "This user doesn't exists!"})

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const { name } = request.body;
  const { username } = request.headers;

  const checkUser = users.find((user) => user.username === username );
  if (checkUser) return response.status(400).json({ error: "This username already exists!"})

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []

  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const todos = user.todos;
  
  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const date = new Date(deadline); 

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: date,
    created_at: new Date()
  };

  const { user } = request;

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id );
  if (!todo) return response.status(404).json({ error: "Todo doesn't exists!"});

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = params;

  const todo = user.todos.find((todo) => todo.id === id );
  if (!todo) return response.status(404).json({ error: "Todo doesn't exists!"});

  todo.done = true;

  return response.status(200).send();
  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id );
  if (!todo) return response.status(404).json({ error: "Todo doesn't exists!"});

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;