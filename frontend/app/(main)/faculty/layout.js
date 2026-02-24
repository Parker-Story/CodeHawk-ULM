"use client";

import PortalLayout from "@/components/PortalLayout";
import { FacultyClassesProvider } from "@/contexts/FacultyClassesContext";

export default function FacultyLayout({ children }) {
  return (
    <PortalLayout variant="faculty" Provider={FacultyClassesProvider}>
      {children}
    </PortalLayout>
  );
}
