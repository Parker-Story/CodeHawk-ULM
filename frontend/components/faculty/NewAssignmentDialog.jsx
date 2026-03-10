"use client";

import { API_BASE } from "@/lib/apiBase";
import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import Dialog from "@/components/Dialog";

const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 px-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-transparent";
const labelClass = "text-sm font-medium text-zinc-300 block mb-1.5";

export default function NewAssignmentDialog({ isOpen, onClose, crn, onAssignmentCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scoresVisible, setScoresVisible] = useState(false);
  const [inputMode, setInputMode] = useState("STDIN");
  const [inputFile, setInputFile] = useState(null);
  const [inputFileContent, setInputFileContent] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setInputFile(file);
    const reader = new FileReader();
    reader.onload = () => setInputFileContent(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setScoresVisible(false);
    setInputMode("STDIN");
    setInputFile(null);
    setInputFileContent(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/assignment/course/${crn}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          scoresVisible,
          inputMode,
          inputFileName: inputFile?.name ?? null,
          inputFileContent: inputMode === "FILE" ? inputFileContent : null,
        }),
      });
      if (!response.ok) throw new Error("Failed to create assignment");
      const savedAssignment = await response.json();
      onAssignmentCreated(savedAssignment);
      handleClose();
    } catch (error) { console.error("Error creating assignment:", error); }
  };

  return (
      <Dialog isOpen={isOpen} onClose={handleClose} title="New Assignment" size="xl">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="assignment-title" className={labelClass}>Assignment Title</label>
            <input id="assignment-title" type="text" placeholder="e.g., Binary Search Tree Implementation" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="assignment-description" className={labelClass}>Description</label>
            <textarea id="assignment-description" rows={4} placeholder="Provide clear instructions for students..." className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Input Mode */}
          <div className="space-y-3">
            <p className={labelClass}>Input Mode</p>
            <div className="grid grid-cols-2 gap-3">
              {["STDIN", "FILE"].map((mode) => (
                  <button
                      key={mode}
                      type="button"
                      onClick={() => { setInputMode(mode); setInputFile(null); setInputFileContent(null); }}
                      className="p-3 rounded-xl border text-sm font-medium transition-all text-left"
                      style={inputMode === mode
                          ? { background: "#7C1D2E22", borderColor: "#7C1D2E", color: "white" }
                          : { background: "transparent", borderColor: "#3f3f46", color: "#a1a1aa" }
                      }
                  >
                    <p className="font-medium">{mode === "STDIN" ? "Standard Input" : "File Input"}</p>
                    <p className="text-xs mt-0.5 opacity-70">{mode === "STDIN" ? "Test cases provide stdin" : "Program reads from a file"}</p>
                  </button>
              ))}
            </div>
            {inputMode === "FILE" && (
                <div>
                  <p className="text-xs text-zinc-400 mb-2">Upload the input file students' programs will read from.</p>
                  {inputFile ? (
                      <div className="flex items-center gap-3 p-3 bg-zinc-800 border border-zinc-700 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{inputFile.name}</p>
                          <p className="text-zinc-400 text-xs">{(inputFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button type="button" onClick={() => { setInputFile(null); setInputFileContent(null); }} className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                  ) : (
                      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-zinc-600 rounded-xl p-6 text-center cursor-pointer hover:border-zinc-400 transition-colors">
                        <Upload className="w-6 h-6 text-zinc-500 mx-auto mb-2" />
                        <p className="text-zinc-400 text-sm">Click to upload input file</p>
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                      </div>
                  )}
                </div>
            )}
          </div>

          {/* Scores Visible */}
          <div className="flex items-center justify-between p-4 bg-zinc-800 border border-zinc-700 rounded-xl">
            <div>
              <p className="text-sm font-medium text-zinc-300">Show Student Scores Upon Submission</p>
              <p className="text-xs text-zinc-500 mt-0.5">Students will see their score immediately after submitting.</p>
            </div>
            <button
                type="button"
                onClick={() => setScoresVisible((prev) => !prev)}
                className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
                style={scoresVisible ? { background: "#7C1D2E" } : { background: "#52525b" }}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${scoresVisible ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="flex gap-3 pt-4 border-t border-zinc-700">
            <button type="button" onClick={handleClose} className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors">Cancel</button>
            <button type="submit" disabled={inputMode === "FILE" && !inputFile} className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors disabled:opacity-50" style={{ background: "#7C1D2E" }}>Publish Assignment</button>
          </div>
        </form>
      </Dialog>
  );
}