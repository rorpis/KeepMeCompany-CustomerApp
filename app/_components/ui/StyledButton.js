
export const Button = ({ className, children, variant = "default", ...props }) => {
  const baseStyles = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition";
  let variantStyles = "";

  switch (variant) {
    case "outline":
      variantStyles = "border border-gray-300 bg-white hover:bg-gray-100";
      break;
    case "primary":
      variantStyles = "bg-blue-600 text-white hover:bg-blue-700";
      break;
    case "danger":
      variantStyles = "bg-red-600 text-white hover:bg-red-700";
      break;
    default:
      variantStyles = "bg-gray-200 hover:bg-gray-300";
  }

  return (
    <button className={`${baseStyles} ${variantStyles} ${className || ""}`} {...props}>
      {children}
    </button>
  );
};
