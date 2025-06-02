import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EditorPage from "./pages/EditorPage";
import PageNotFound from "./pages/PageNotFound";

const App = () => {
  return (

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor/:roomId" element={<EditorPage />} />
        <Route path="*" element={<PageNotFound />}></Route>
      </Routes>
  );
};

export default App;
