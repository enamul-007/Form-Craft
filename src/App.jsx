import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./assets/home/Page";
import CreateUser from "./assets/create-user/CreateUser";
import UserDetailsEdit from "./assets/user-form/user";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create/new-user" element={<CreateUser />} />
      <Route path="/user-details/:id" element={<UserDetailsEdit />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
