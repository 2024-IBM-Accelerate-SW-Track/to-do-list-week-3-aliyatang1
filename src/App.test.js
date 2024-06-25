import { render, screen, fireEvent } from '@testing-library/react';
import { unmountComponentAtNode } from 'react-dom';
import App from './App';

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

test('test that App component renders', () => {
  render(<App />, container);
 });

test('test that new-item-button is a button', () => {
  render(<App/>, container);
  const element = screen.getByTestId('new-item-button');
  expect(element.innerHTML.toLowerCase().includes("button")).toBe(true)
});

test('test that new-item-input is an input ', () => {
  render(<App/>, container);
  const element = screen.getByTestId('new-item-input');
  expect(element.innerHTML.toLowerCase().includes("input")).toBe(true)
});

test('test preventing duplicate tasks', () => {
  render(<App />);
  const inputTask = screen.getByRole('textbox', { name: /Add New Item/i });
  const inputDate = screen.getByPlaceholderText('mm/dd/yyyy');
  const addButton = screen.getByRole('button', { name: /Add/i });

  const dueDate = '05/30/2023';
  fireEvent.change(inputTask, { target: { value: 'History Test' } });
  fireEvent.change(inputDate, { target: { value: dueDate } });
  fireEvent.click(addButton);

  // Try adding the same task again
  fireEvent.change(inputTask, { target: { value: 'History Test' } });
  fireEvent.change(inputDate, { target: { value: dueDate } });
  fireEvent.click(addButton);
  const tasks = screen.getAllByText(/History Test/i);
  const dates = screen.getAllByText(new RegExp(dueDate, 'i'));

  expect(tasks.length).toBe(1); 
  expect(dates.length).toBe(1); 
});

test('submitting a task with no due date', () => {
  render(<App />);
  const inputTask = screen.getByRole('textbox', { name: /Add New Item/i });
  const addButton = screen.getByRole('button', { name: /Add/i });

  const taskName = 'Task with no due date';
  fireEvent.change(inputTask, { target: { value: taskName } });
  fireEvent.click(addButton);
  const checkTask = screen.getByText(taskName);
  const noDueDateText = 'No Due Date'; 

  expect(checkTask).toBeInTheDocument();
  expect(screen.getByText(noDueDateText)).toBeInTheDocument();
});

test('test input validation for task name', () => {
  render(<App />);
  const inputDate = screen.getByPlaceholderText('mm/dd/yyyy');
  const addButton = screen.getByRole('button', { name: /Add/i });

  const dueDate = '05/30/2023';
  fireEvent.change(inputDate, { target: { value: dueDate } });
  fireEvent.click(addButton);

  const errorElement = screen.getByText(/task name is required/i);

  expect(errorElement).toBeInTheDocument();
});


test('late tasks have different colors', () => {
  render(<App />, container);
  const historyCheck = screen.getByTestId(/History Test/i).style.background;
  expect(historyCheck).not.toBe('White');
});


test('delete task using checkbox', () => {
  const tasks = [
    { id: 1, name: 'Task 1' },
    { id: 2, name: 'Task 2' },
    { id: 3, name: 'Task 3' },
  ];
  const handleDelete = jest.fn();

  render(<App tasks={tasks} onDelete={handleDelete} />); 

  const checkboxTask2 = screen.getByTestId('checkbox-2');
  fireEvent.click(checkboxTask2);
  expect(handleDelete).toHaveBeenCalledWith(2);
  const deletedTask = screen.queryByText('Task 2');
  expect(deletedTask).not.toBeInTheDocument();
});


 