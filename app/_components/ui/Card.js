
export const Card = ({ className, children, ...props }) => {
  return (
    <div className={`bg-white shadow-sm rounded-lg p-4 border ${className || ""}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => {
  return (
    <div className={`pb-4 border-b ${className || ""}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3 className={`text-lg font-semibold ${className || ""}`} {...props}>
      {children}
    </h3>
  );
};

export const CardContent = ({ className, children, ...props }) => {
  return (
    <div className={`pt-4 ${className || ""}`} {...props}>
      {children}
    </div>
  );
};
