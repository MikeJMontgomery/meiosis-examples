import O from "patchinko/constant"

import { ajaxServices } from "../util/ajax-services"
import { todoForm } from "./todoForm"
import { validateTodo } from "./validation"
import { clearMessage, showError, showMessage } from "../root/actions"

export const updateList = (todo, state) => {
  return {
    todos: O(todos => {
      if (todos.length === 0) {
        todos.push(todo)
      } else {
        const idx = todos.findIndex(t => t.id === todo.id)
        if (idx >= 0) {
          todos.splice(idx, 1)
        }
        if (todos.length === 0 || state.todos[todos.length - 1].priority <= todo.priority) {
          todos.push(todo)
        } else {
          for (let i = 0; i < todos.length; i++) {
            if (state.todos[i].priority > todo.priority) {
              todos.splice(i, 0, todo)
              break
            }
          }
        }
      }
      return todos
    })
  }
}

export const editTodo = todo =>
  Object.assign(
    {
      editing: true
    },
    todoForm.initialState(Object.assign({}, todo))
  )

export const clearForm = todo => (todo.id ? O : todoForm.initialState())

export const editingTodo = ({ field, value }) => ({ todo: O({ [field]: value }) })

export const saveTodo = ({ root, local, todo }) => {
  const validationErrors = validateTodo(todo)

  if (Object.keys(validationErrors).length === 0) {
    root.update(showMessage("Saving, please wait..."))

    return ajaxServices
      .saveTodo(todo)
      .then(updatedTodo => {
        root.update(Object.assign({}, updateList(updatedTodo, root.state), clearMessage()))
        local.update(clearForm(todo))
      })
      .catch(() =>
        root.update(
          Object.assign(
            {},
            clearMessage(),
            showError("Sorry, an error occurred. Please try again.")
          )
        )
      )
  } else {
    local.update({ validationErrors })
  }
}

export const deleteTodo = (update, todo) => {
  update(showMessage("Deleting, please wait..."))

  ajaxServices
    .deleteTodo(todo.id)
    .then(() => {
      update(
        Object.assign(
          {
            todos: O(todos => {
              todos.splice(todos.findIndex(t => t.id === todo.id), 1)
              return todos
            })
          },
          clearMessage()
        )
      )
    })
    .catch(() =>
      update(
        Object.assign({}, clearMessage(), showError("Sorry, an error occurred. Please try again."))
      )
    )
}

export const formActions = {
  editingTodo,
  saveTodo,
  clearForm
}
