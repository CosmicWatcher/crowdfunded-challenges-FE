import { Route } from "wouter";
import {TaskPage} from "./TaskPage";
import {SignupPage, LoginPage} from "./Auth";

export default function App() {
  return (
    <>
      <Route path="/">HOME</Route>
      <Route path="/signup"><SignupPage/></Route>
      <Route path="/login"><LoginPage/></Route>
      <Route path="/task">
        <TaskPage/>
      </Route>
    </>
  );
}