import Navbar from "@/components/Navbar";

export default function FacultyLayout({ children }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar variant="faculty" />
      <main>{children}</main>
    </div>
  );
}
