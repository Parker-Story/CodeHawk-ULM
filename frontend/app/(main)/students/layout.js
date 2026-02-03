import Navbar from "@/components/Navbar";

export default function StudentsLayout({ children }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar variant="student" />
      <main>{children}</main>
    </div>
  );
}
