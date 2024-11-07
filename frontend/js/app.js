import { API_URL } from '../config.js';
///////////////////////////////////////
// Variables///////////////////////////
const todoForm = document.querySelector('.todo-form');
const textInput = document.querySelector('.text-input');
const priorityInput = document.querySelector('#priority-input');
const container = document.querySelector('#root');
const errMsgContainer = document.querySelector('.error-msg-container');
const toFormLink = document.querySelector('.to-form-link');
let token;

const state = {
  allTodos: [],
  renderdTodos: 'all',
};
///////////////////////////////////////
// Functions///////////////////////////
////////// Render Todos
window.addEventListener('load', async () => {
  try {
    // Check if token in local storage is expired
    token = JSON.parse(localStorage.getItem('todo-app-token'));
    if (!token) {
      return toFormLink.click();
    }
    const res = await fetch(`${API_URL}/checkAuth`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });
    const data = await res.json();
    ckeckAuthorization(data.statusCode);
    // Check if todos is not stored in local storage
    if (localStorage.getItem('todos') == null) {
      console.log('from server');
      // fetch todos from server
      const response = await fetch(`${API_URL}/todo`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });
      let data = await response.json();
      if (data.statusCode !== 200) {
        throw new Error(data.message);
      }
      state.allTodos = [...data.data];
      state.renderdTodos = 'all';
      localStorage.setItem('todos', JSON.stringify(data.data));
      renderTodosArr(state.allTodos);
    } else {
      console.log('from local storage');
      // get todos from local storage
      state.allTodos = JSON.parse(localStorage.getItem('todos'));
      renderTodosArr(state.allTodos);
    }
  } catch (err) {
    console.log(err);
    errMsgContainer.innerText = '';
    errMsgContainer.insertAdjacentText('afterbegin', err.message);
  }
});

////////// Create Todo
todoForm.addEventListener('submit', async e => {
  try {
    e.preventDefault();
    const response = await fetch(`${API_URL}/todo`, {
      method: 'POST',
      body: JSON.stringify({
        text: textInput.value,
        priorityLevel: priorityInput.value,
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });
    let data = await response.json();
    ckeckAuthorization(data.statusCode);
    if (data.statusCode !== 200) {
      throw new Error(data.message);
    }
    textInput.value = '';
    errMsgContainer.innerText = '';
    state.allTodos.push(data.data);
    localStorage.setItem('todos', JSON.stringify(state.allTodos));
    renderNewTodo(data.data);
  } catch (err) {
    errMsgContainer.innerText = '';
    errMsgContainer.insertAdjacentText('afterbegin', err.message);
  }
});

////////// Delete Todo
document.body.addEventListener('click', async e => {
  try {
    if (
      (e.target.classList.contains('delete-btn') &&
        !e.target.querySelector('svg')) ||
      Boolean(e.target.closest('.trash-icon'))
    ) {
      const todoId = e.target.closest('li').getAttribute('data-id');
      const res = await fetch(`${API_URL}/todo`, {
        method: 'DELETE',
        body: JSON.stringify({
          todoId: todoId,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });
      let data = await res.json();
      ckeckAuthorization(data.statusCode);
      if (data.statusCode !== 200) {
        throw new Error(data.message);
      }

      let newStateTodos = state.allTodos.filter(
        (el, i, arr) => el._id !== todoId
      );
      errMsgContainer.innerText = '';
      state.allTodos = [...newStateTodos];
      localStorage.setItem('todos', JSON.stringify(state.allTodos));
      renderTodosArr(state.allTodos);
    }
  } catch (err) {
    console.log(err);
    errMsgContainer.innerText = '';
    errMsgContainer.insertAdjacentText('afterbegin', err.message);
  }
});

////////// Enable Todo Editing
document.body.addEventListener('click', async e => {
  try {
    let clickedBtn = e.target;
    // For PC Screens
    if (
      clickedBtn.classList.contains('edit-btn') &&
      !clickedBtn.classList.contains('edit-icon-btn')
    ) {
      console.log('shouldnot go here');
      const todoEl = e.target.closest('li');
      let todoTextEl = todoEl.querySelector('input');
      let todoPriorityEl = todoEl.querySelector('select');

      if (clickedBtn.innerText.toLowerCase() === 'edit') {
        clickedBtn.innerText = 'SAVE';
        todoPriorityEl.removeAttribute('disabled');
        todoPriorityEl.classList.toggle('select-disabled');
        todoPriorityEl.classList.toggle('select-enabled');
        todoTextEl.removeAttribute('readonly');
        todoTextEl.focus();
      } else {
        clickedBtn.innerText = 'EDIT';
        todoPriorityEl.setAttribute('disabled', 'disabled');
        todoPriorityEl.classList.toggle('select-disabled');
        todoPriorityEl.classList.toggle('select-enabled');
        todoTextEl.setAttribute('readonly', 'readonly');

        const todoId = todoEl.getAttribute('data-id');
        const newText = todoTextEl.value;
        const newPriority = todoPriorityEl.value;
        editTodo(todoId, newText, newPriority);
      }
    }
    // For Mobile Screens
    if (clickedBtn.classList.contains('edit-icon')) {
      const todoEl = e.target.closest('li');
      let todoTextEl = todoEl.querySelector('input');
      let todoPriorityEl = todoEl.querySelector('select');
      if (clickedBtn.classList.contains('edit-mode')) {
        clickedBtn.classList.remove('edit-mode');
        clickedBtn.classList.add('save-mode');
        todoPriorityEl.removeAttribute('disabled');
        todoPriorityEl.classList.toggle('select-disabled');
        todoPriorityEl.classList.toggle('select-enabled');
        todoTextEl.removeAttribute('readonly');
        todoTextEl.focus();
      } else {
        clickedBtn.classList.add('edit-mode');
        clickedBtn.classList.remove('save-mode');
        todoPriorityEl.setAttribute('disabled', 'disabled');
        todoPriorityEl.classList.toggle('select-disabled');
        todoPriorityEl.classList.toggle('select-enabled');
        todoTextEl.setAttribute('readonly', 'readonly');

        const todoId = todoEl.getAttribute('data-id');
        const newText = todoTextEl.value;
        const newPriority = todoPriorityEl.value;
        editTodo(todoId, newText, newPriority);
      }
    }
  } catch (err) {
    console.log(err);
    errMsgContainer.innerText = '';
    errMsgContainer.insertAdjacentText('afterbegin', err.message);
  }
});

////////// Edit Todo
async function editTodo(todoId, newText, newPriority) {
  try {
    // Update in server
    const res = await fetch(`${API_URL}/todo`, {
      method: 'PATCH',
      body: JSON.stringify({
        todoId: todoId,
        newText: newText,
        newPriority: newPriority,
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });
    let data = await res.json();
    ckeckAuthorization(data.statusCode);
    if (data.statusCode !== 200) {
      throw new Error(data.message);
    }
    // Update in local storage and render
    let stateTodoIndex = state.allTodos.findIndex(
      (el, i, arr) => el._id === todoId
    );
    errMsgContainer.innerText = '';
    state.allTodos[stateTodoIndex].text = newText;
    state.allTodos[stateTodoIndex].priorityLevel = newPriority;
    localStorage.setItem('todos', JSON.stringify(state.allTodos));
    renderTodosArr(state.allTodos);
  } catch (err) {
    console.log(err);
    errMsgContainer.innerText = '';
    errMsgContainer.insertAdjacentText('afterbegin', err.message);
  }
}

////////// Complete & Pend Todo
window.addEventListener('click', async e => {
  try {
    if (!e.target.classList.contains('list-item')) return;
    // Complete Todo
    if (!e.target.classList.contains('completed')) {
      const todoId = e.target.getAttribute('data-id');
      // Update in server
      const res = await fetch(`${API_URL}/todo/complete`, {
        method: 'PATCH',
        body: JSON.stringify({
          todoId: todoId,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });
      let data = await res.json();
      ckeckAuthorization(data.statusCode);
      if (data.statusCode !== 200) {
        throw new Error(data.message);
      }
      // Update in local storage
      e.target.classList.add('completed');
      e.target.classList.remove('pending');
      const todoIndex = state.allTodos.findIndex((el, i) => el._id === todoId);
      state.allTodos[todoIndex].todoStatus = 'completed';
      localStorage.setItem('todos', JSON.stringify(state.allTodos));
      // return renderTodosArr(state.allTodos);

      // Pend Todo
    } else if (e.target.classList.contains('completed')) {
      const todoId = e.target.getAttribute('data-id');
      // Update in server
      const res = await fetch(`${API_URL}/todo/pend`, {
        method: 'PATCH',
        body: JSON.stringify({
          todoId: todoId,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });
      let data = await res.json();
      ckeckAuthorization(data.statusCode);
      if (data.statusCode !== 200) {
        throw new Error(data.message);
      }
      // Update in local storage
      e.target.classList.remove('completed');
      e.target.classList.add('pending');
      const todoIndex = state.allTodos.findIndex((el, i) => el._id === todoId);
      state.allTodos[todoIndex].todoStatus = 'pending';
      localStorage.setItem('todos', JSON.stringify(state.allTodos));
      errMsgContainer.innerText = '';
      // renderTodosArr(state.allTodos);
    }
  } catch (err) {
    console.log('My error: ', err);
    errMsgContainer.innerText = '';
    errMsgContainer.insertAdjacentText('afterbegin', err.message);
  }
});

////////// Filter events
const filterInput = document.querySelector('#filter-select');
filterInput.addEventListener('change', () => {
  let filter = filterInput.value;
  if (filter === 'all') {
    state.renderdTodos = 'all';
    return renderTodosArr(state.allTodos);
  }
  if (filter === 'pending') {
    let pendingTodos = state.allTodos.filter(
      (el, i) => el.todoStatus === 'pending'
    );
    state.renderdTodos = 'pending';
    return renderTodosArr(pendingTodos);
  }
  if (filter === 'completed') {
    let completedTodos = state.allTodos.filter(
      (el, i) => el.todoStatus === 'completed'
    );
    state.renderdTodos = 'completed';
    return renderTodosArr(completedTodos);
  }
});

////////// Sorting events
const sortSelect = document.querySelector('#sort-select');
sortSelect.addEventListener('change', e => {
  let sortValue = sortSelect.value;
  let renderedArr = [];
  // Sorting by Date: Oldest-to-Newest
  if (sortValue === 'oldest-to-newest') {
    if (state.renderdTodos === 'all') {
      renderTodosArr(state.allTodos);
    } else if (state.renderdTodos === 'completed') {
      let completedTodos = getCompletedTodos();
      renderTodosArr(completedTodos);
    } else if (state.renderdTodos === 'pending') {
      let pendingTodos = getPendingTodos();
      renderTodosArr(pendingTodos);
    }
  }
  // Sorting by Date: Newest-to-Oldest
  if (sortValue === 'newest-to-oldest') {
    if (state.renderdTodos === 'all') {
      for (let i = state.allTodos.length - 1; i >= 0; i--) {
        renderedArr.push(state.allTodos[i]);
      }
      renderTodosArr(renderedArr);
    } else if (state.renderdTodos === 'completed') {
      let completedTodos = getCompletedTodos();
      for (let i = completedTodos.length - 1; i >= 0; i--) {
        renderedArr.push(completedTodos[i]);
      }
      renderTodosArr(renderedArr);
    } else if (state.renderdTodos === 'pending') {
      let pendingTodos = getPendingTodos();
      for (let i = pendingTodos.length - 1; i >= 0; i--) {
        renderedArr.push(pendingTodos[i]);
      }
      renderTodosArr(renderedArr);
    }
  }
  // Sorting by Priority
  if (sortValue === 'priority') {
    // Render High priority first then Medium then Low
    if (state.renderdTodos === 'all') {
      let highPriority = state.allTodos.filter(
        el => el.priorityLevel === 'high'
      );
      let mediumPriority = state.allTodos.filter(
        el => el.priorityLevel === 'medium'
      );
      let lowPriority = state.allTodos.filter(el => el.priorityLevel === 'low');
      renderTodosArr(highPriority);
      for (let i = 0; i < mediumPriority.length; i++) {
        renderNewTodo(mediumPriority[i]);
      }
      for (let i = 0; i < lowPriority.length; i++) {
        renderNewTodo(lowPriority[i]);
      }
    }
    if (state.renderdTodos === 'pending') {
      let highPriority = state.allTodos.filter(
        el => el.priorityLevel === 'high' && el.todoStatus === 'pending'
      );
      let mediumPriority = state.allTodos.filter(
        el => el.priorityLevel === 'medium' && el.todoStatus === 'pending'
      );
      let lowPriority = state.allTodos.filter(
        el => el.priorityLevel === 'low' && el.todoStatus === 'pending'
      );
      renderTodosArr(highPriority);
      for (let i = 0; i < mediumPriority.length; i++) {
        renderNewTodo(mediumPriority[i]);
      }
      for (let i = 0; i < lowPriority.length; i++) {
        renderNewTodo(lowPriority[i]);
      }
    }
    if (state.renderdTodos === 'completed') {
      let highPriority = state.allTodos.filter(
        el => el.priorityLevel === 'high' && el.todoStatus === 'completed'
      );
      let mediumPriority = state.allTodos.filter(
        el => el.priorityLevel === 'medium' && el.todoStatus === 'completed'
      );
      let lowPriority = state.allTodos.filter(
        el => el.priorityLevel === 'low' && el.todoStatus === 'completed'
      );
      renderTodosArr(highPriority);
      for (let i = 0; i < mediumPriority.length; i++) {
        renderNewTodo(mediumPriority[i]);
      }
      for (let i = 0; i < lowPriority.length; i++) {
        renderNewTodo(lowPriority[i]);
      }
    }
  }
});

////// Open Date Container
const showDateBtn = document.querySelector('.show-date-btn');
showDateBtn.addEventListener('click', () => {
  const todoItems = document.querySelectorAll('.list-item');
  const todosContainer = document.querySelector('.todos__list');
  // const dateContainer = document.querySelectorAll('.date-container');
  if (!todoItems) return;
  todoItems.forEach(el => {
    el.classList.toggle('open-date');
    el.querySelector('.date-container').classList.toggle('open');
  });
  todosContainer.firstElementChild.classList.remove('open-date');
});
///////////////////////////////////////////////////////////////
// Helper Functions
function renderNewTodo(data) {
  let html;
  let todosList = container.querySelector('.todos__list');
  let createdAt = new Date(data.createdAt);
  // let updatedAt = new Date(data.updatedAt);
  // let priority = data.priorityLevel;
  let options = {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  data.dateFormat = new Intl.DateTimeFormat('en-us', options).format(createdAt);
  let screenWidth = document
    .querySelector('#root')
    .getBoundingClientRect().width;
  if (Boolean(todosList) && screenWidth > 440) {
    data.isOpenDate = todosList.firstElementChild
      .querySelector('span')
      .classList.contains('open');
    html = getHtmlTodoPC(false, data);
    todosList.insertAdjacentHTML('beforeend', html);
  } else if (!Boolean(todosList) && screenWidth > 440) {
    html = getHtmlTodoPC(true, data);
    container.insertAdjacentHTML('beforeend', html);
  } else if (Boolean(todosList) && screenWidth <= 440) {
    data.isOpenDate = todosList.firstElementChild
      .querySelector('span')
      .classList.contains('open');
    let html = getHtmlTodoMobile(false, data);
    todosList.insertAdjacentHTML('beforeend', html);
  } else if (!Boolean(todosList) && screenWidth <= 440) {
    let html = getHtmlTodoMobile(true, data);
    container.insertAdjacentHTML('beforeend', html);
  }
}

function renderTodosArr(todosArr) {
  let todosList = container.querySelector('.todos__list');
  if (todosList) {
    todosList.parentNode.removeChild(todosList);
  }
  todosArr.forEach(dataObj => {
    renderNewTodo(dataObj);
  });
}
function getPendingTodos() {
  let pendingTodos = state.allTodos.filter(
    (el, i) => el.todoStatus === 'pending'
  );
  return pendingTodos;
}
function getCompletedTodos() {
  let completedTodos = state.allTodos.filter(
    (el, i) => el.todoStatus === 'completed'
  );
  return completedTodos;
}

function getHtmlTodoPC(firstTodoBool, todoData) {
  let starting = `<ul class="todos__list">`;
  let ending = `</ul>`;
  let todoListItem = `
        <li data-id="${todoData._id}" class="list-item ${todoData.todoStatus} ${
    !firstTodoBool && todoData.isOpenDate ? 'open-date' : null
  }">
          <input readonly value="${todoData.text}" />
          <div class="todo-list-container">
            <select
              disabled
              class="select-disabled"
              title="priority-input"
              id="priority-input-list"
            >
              <option value="high" ${
                todoData.priorityLevel === 'high' ? 'selected' : null
              }>High</option>
              <option value="medium" ${
                todoData.priorityLevel === 'medium' ? 'selected' : null
              }>Medium</option>
              <option value="low" ${
                todoData.priorityLevel === 'low' ? 'selected' : null
              }>Low</option>
            </select>
            <div class="todo__actions">
              <button class="edit-btn">Edit</button>
              <button class="delete-btn">Delete</button>
            </div>
          </div>
          <span class="date-container ${
            !firstTodoBool && todoData.isOpenDate ? 'open' : null
          }">${todoData.dateFormat}</span>
        </li>
    `;
  if (firstTodoBool) return starting + todoListItem + ending;
  else return todoListItem;
}

function getHtmlTodoMobile(firstTodoBool, todoData) {
  let starting = `<ul class="todos__list">`;
  let ending = `</ul>`;
  let todoListItem = `
  <li data-id="${todoData._id}" class="list-item ${todoData.todoStatus} ${
    !firstTodoBool && todoData.isOpenDate ? 'open-date' : null
  }">
  <input readonly value="${todoData.text}" />
  <div class="todo-list-container">
    <select
      disabled
      class="select-disabled"
      title="priority-input"
      id="priority-input-list"
    >
    <option value="high" ${
      todoData.priorityLevel === 'high' ? 'selected' : null
    }>High</option>
    <option value="medium" ${
      todoData.priorityLevel === 'medium' ? 'selected' : null
    }>Medium</option>
    <option value="low" ${
      todoData.priorityLevel === 'low' ? 'selected' : null
    }>Low</option>
    </select>
    <div class="todo__actions">
      <button class="edit-icon-btn edit-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="edit-icon edit-mode"
        >
          <defs>
            <clipPath id="mask">
           
              <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
              />
            </clipPath>
          </defs>
        </svg>
      </button>
      <button class="delete-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="trash-icon"
        >
          <path
            fill-rule="evenodd"
            d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
  <span class="date-container ${
    !firstTodoBool && todoData.isOpenDate ? 'open' : null
  }">${todoData.dateFormat}</span>
</li>`;

  if (firstTodoBool) return starting + todoListItem + ending;
  else return todoListItem;
}

function ckeckAuthorization(statusCode) {
  if (statusCode === 401) {
    localStorage.removeItem('todo-app-token');
    localStorage.removeItem('todos');
    return toFormLink.click();
  }
}
