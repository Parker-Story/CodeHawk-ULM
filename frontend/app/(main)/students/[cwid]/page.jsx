"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function UserPage() {
  const router = useRouter();
  const params = useParams();
  const { cwid } = params; // safe now

  // Keep controlled inputs always as strings
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "" // will be sent as passwordHash
  });

  // Fetch user data once
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`https://codehawk-ulm-2.onrender.com/api/users/${cwid}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();

        setUser({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          password: "" // do NOT prefill password for security
        });
      } catch (err) {
        console.error(err);
        alert("Could not load user data");
      }
    }

    fetchUser();
  }, [cwid]);

  // Update user
  const handleUpdate = async () => {
    try {
      const res = await fetch(`https://codehawk-ulm-2.onrender.com/api/users/${cwid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          passwordHash: user.password // map password input to passwordHash
        })
      });

      if (res.ok) {
        alert("User updated!");
        setUser(prev => ({ ...prev, password: "" })); // clear password field
      } else {
        alert("Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  // Delete user
  const handleDelete = async () => {
    try {
      const res = await fetch(`https://codehawk-ulm-2.onrender.com/api/users/${cwid}`, {
        method: "DELETE"
      });

      if (res.ok) {
        alert("User deleted!");
        router.push("/"); // redirect home
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>

      <input
        type="text"
        placeholder="First Name"
        value={user.firstName}
        onChange={e => setUser({ ...user, firstName: e.target.value })}
        className="w-full p-3 mb-4 border border-slate-700 rounded-lg bg-slate-800 text-white"
      />

      <input
        type="text"
        placeholder="Last Name"
        value={user.lastName}
        onChange={e => setUser({ ...user, lastName: e.target.value })}
        className="w-full p-3 mb-4 border border-slate-700 rounded-lg bg-slate-800 text-white"
      />

      <input
        type="email"
        placeholder="Email"
        value={user.email}
        onChange={e => setUser({ ...user, email: e.target.value })}
        className="w-full p-3 mb-4 border border-slate-700 rounded-lg bg-slate-800 text-white"
      />

      <input
        type="password"
        placeholder="Password"
        value={user.password}
        onChange={e => setUser({ ...user, password: e.target.value })}
        className="w-full p-3 mb-4 border border-slate-700 rounded-lg bg-slate-800 text-white"
      />

      <div className="flex gap-2">
        <button
          onClick={handleUpdate}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg"
        >
          Update
        </button>

        <button
          onClick={handleDelete}
          className="flex-1 bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
