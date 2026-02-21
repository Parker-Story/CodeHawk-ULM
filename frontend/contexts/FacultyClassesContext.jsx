"use client";

import { createContext, useContext, useState } from "react";

const FacultyClassesContext = createContext(null);

export function FacultyClassesProvider({ children }) {
  const [classes, setClasses] = useState([]);
  return (
    <FacultyClassesContext.Provider value={{ classes, setClasses }}>
      {children}
    </FacultyClassesContext.Provider>
  );
}

export function useFacultyClasses() {
  const ctx = useContext(FacultyClassesContext);
  if (!ctx) throw new Error("useFacultyClasses must be used within FacultyClassesProvider");
  return ctx;
}
