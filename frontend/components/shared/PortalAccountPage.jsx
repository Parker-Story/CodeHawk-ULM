"use client";

import AccountView from "@/components/shared/AccountView";
import { useAuth } from "@/contexts/AuthContext";

export default function PortalAccountPage({ variant }) {
  const { user } = useAuth();
  if (!user) return null;

  const displayName = `${user.firstName} ${user.lastName}`;
  const subtitle = variant === "faculty"
      ? "Faculty"
      : variant === "ta"
          ? "Teaching Assistant"
          : "Student";

  const academicInfo = {
    institution: "University of Louisiana at Monroe",
    ...(variant !== "faculty" && { cwid: user.cwid ?? "N/A" }),
    email: user.email ?? "",
  };

  return (
      <AccountView
          displayName={displayName}
          subtitle={subtitle}
          academicInfo={academicInfo}
          variant={variant}
      />
  );
}