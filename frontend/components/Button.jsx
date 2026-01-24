export default function Button({ children, disabled, type = "button", onClick, variant = "primary" }) {
  const baseStyles = "w-full py-4 text-base font-medium rounded-xl transition-all duration-200";
  
  const variants = {
    primary: disabled
      ? "text-slate-500 bg-slate-700 cursor-not-allowed"
      : "text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/30",
    secondary: "text-white bg-slate-700 hover:bg-slate-600",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

