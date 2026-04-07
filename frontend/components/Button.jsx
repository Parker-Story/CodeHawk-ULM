export default function Button({ children, disabled, type = "button", onClick, variant = "primary", theme = "default" }) {
    if (variant === "secondary") {
        return (
            <button
                type={type}
                disabled={disabled}
                onClick={onClick}
                className="w-full py-4 text-base font-medium rounded-xl transition-all duration-200 text-zinc-700 dark:text-white bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
            >
                {children}
            </button>
        );
    }

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className="w-full py-4 text-base font-medium rounded-xl transition-all duration-200 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: disabled ? "#3f3f46" : "#862633" }}
        >
            {children}
        </button>
    );
}