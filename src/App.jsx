import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./assets/home/Page";
import CreateUser from "./assets/create-user/CreateUser";
import UserDetailsEdit from "./assets/user-form/user";
import PostDetails from "./assets/common-component/PostDetails";
import PostCreateForm from "./assets/common-component/PostCreateForm ";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} /> 
      <Route path="/create/new-user" element={<CreateUser />} />
      <Route path="post-details/:id" element={<PostDetails />} />
      <Route path="/user-details/:id" element={<UserDetailsEdit />} />
      <Route path="/create-post" element={<PostCreateForm />} />
      <Route path="/create-post/:id" element={<PostCreateForm />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
