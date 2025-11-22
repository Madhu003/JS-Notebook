export const buttonStyles = {
    base: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow-sm uppercase tracking-wider",
    variants: {
        primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg transition-all duration-200",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300",
        success: "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-md hover:shadow-lg",
        neutral: "bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 shadow-md hover:shadow-lg",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        link: "text-blue-600 underline-offset-4 hover:underline",
        danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg",
    },
    sizes: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
    },
};

export const inputStyles = {
    wrapper: "relative w-full",
    base: "flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
    label: "absolute -top-2 left-2 bg-white px-1 text-xs font-medium text-gray-500 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:left-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-500",
    error: "border-red-500 focus:ring-red-500",
    helperText: "mt-1 text-xs text-gray-500",
    errorText: "mt-1 text-xs text-red-500",
};
