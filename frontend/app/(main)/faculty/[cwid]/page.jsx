"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE } from "@/lib/apiBase";

export default function UserPage() {
  const router = useRouter();
  const params = useParams();
  const { cwid } = params;

  const [user, setUser] = useState({ firstName: "", lastName: "", email: "", password: "" });

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${API_BASE}/api/users/${cwid}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser({ firstName: data.firstName || "", lastName: data.lastName || "", email: data.email || "", password: "" });
      } catch (err) {
        console.error(err);
        alert("Could not load user data");
      }
    }
    fetchUser();
  }, [cwid]);

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${cwid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: user.firstName, lastName: user.lastName, email: user.email, passwordHash: user.password })
      });
      if (res.ok) { alert("User updated!"); setUser(prev => ({ ...prev, password: "" })); }
      else alert("Update failed");
    } catch (err) { console.error(err); alert("Update failed"); }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${cwid}`, { method: "DELETE" });
      if (res.ok) { alert("User deleted!"); router.push("/"); }
      else alert("Delete failed");
    } catch (err) { console.error(err); alert("Delete failed"); }
  };

  const inputClass = "w-full p-3 mb-4 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 transition-colors";

  return (
      <div className="p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Edit User</h1>
        <input type="text" placeholder="First Name" value={user.firstName} onChange={e => setUser({ ...user, firstName: e.target.value })} className={inputClass} />
        <input type="text" placeholder="Last Name" value={user.lastName} onChange={e => setUser({ ...user, lastName: e.target.value })} className={inputClass} />
        <input type="email" placeholder="Email" value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} className={inputClass} />
        <input type="password" placeholder="Password" value={user.password} onChange={e => setUser({ ...user, password: e.target.value })} className={inputClass} />
        <div className="flex gap-2">
          <button onClick={handleUpdate} className="flex-1 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-colors" style={{ background: "#862633" }}>Update</button>
          <button onClick={handleDelete} className="flex-1 bg-red-800 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">Delete</button>
        </div>
      </div>
  );
}