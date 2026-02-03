export default function Button({ children, disabled, type = "button", onClick, variant = "primary", theme = "default" }) {
  const baseStyles = "w-full py-4 text-base font-medium rounded-xl transition-all duration-200";
  
  const themes = {
    default: {
      primary: disabled
        ? "text-slate-500 bg-slate-700 cursor-not-allowed"
        : "text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/30",
      secondary: "text-white bg-slate-700 hover:bg-slate-600",
    },
    student: {
      primary: disabled
        ? "text-slate-500 bg-slate-700 cursor-not-allowed"
        : "text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/30",
      secondary: "text-white bg-slate-700 hover:bg-slate-600",
    },
    faculty: {
      primary: disabled
        ? "text-slate-500 bg-slate-700 cursor-not-allowed"
        : "text-white bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-600/30",
      secondary: "text-white bg-slate-700 hover:bg-slate-600",
    },
  };

  const currentTheme = themes[theme] || themes.default;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${currentTheme[variant]}`}
    >
      {children}
    </button>
  );
}
