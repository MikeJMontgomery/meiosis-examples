import { view } from "./view.jsx";
import { TodoForm } from "../../todoForm";

export const TodoItem = {
  dependencies: { todoForm: TodoForm },
  view
};
