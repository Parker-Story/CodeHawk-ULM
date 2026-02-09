export default function Button({ children, disabled, type = "button", onClick, variant = "primary", theme = "default" }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`w-full py-4 text-base font-medium rounded-xl transition-all duration-200 ${
        variant === "secondary"
          ? "text-white bg-slate-700 hover:bg-slate-600"
          : disabled
            ? "text-slate-500 bg-slate-700 cursor-not-allowed"
            : theme === "student"
              ? "text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/30"
              : theme === "faculty"
                ? "text-white bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-600/30"
                : "text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/30"
      }`}
    >
      {children}
    </button>
  );
}
