import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Button = ({ variant = "primary", size = "md", fullWidth = false, children, className = "", ...props }) => {
    const baseStyles = "rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variantStyles = {
        primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow focus:ring-emerald-500",
        outline: "border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 focus:ring-gray-400",
        text: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300",
    };
    const sizeStyles = {
        sm: "py-1 px-3 text-sm",
        md: "py-2.5 px-4",
        lg: "py-3 px-6 text-lg",
    };
    const widthClass = fullWidth ? "w-full" : "";
    return (_jsx("button", { className: `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthClass} ${className}`, ...props, children: children }));
};
export const Checkbox = ({ id, checked, onChange, label, disabled = false, className = "", }) => {
    return (_jsxs("div", { className: `flex items-start ${className}`, children: [_jsx("div", { className: "flex items-center h-5", children: _jsx("input", { id: id, "aria-describedby": `${id}-description`, type: "checkbox", checked: checked, onChange: onChange, disabled: disabled, className: `h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}` }) }), label && (_jsx("div", { className: "ml-2 text-sm", children: _jsx("label", { htmlFor: id, className: `font-medium text-gray-700 ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`, children: label }) }))] }));
};
export const TextArea = ({ label, error, helper, className = "", rows = 3, ...props }) => {
    return (_jsxs("div", { className: `w-full ${className}`, children: [label && (_jsx("label", { htmlFor: props.id || props.name, className: "block text-sm font-medium text-gray-700 mb-1", children: label })), _jsx("textarea", { rows: rows, className: `w-full px-4 py-3 border rounded-lg text-gray-800 transition-colors duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${error
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-300 hover:border-gray-400 focus:ring-emerald-200"}`, id: props.id || props.name, ...props }), error && _jsx("p", { className: "mt-1.5 text-sm text-red-600", children: error }), helper && !error && (_jsx("p", { className: "mt-1.5 text-xs text-gray-500", children: helper }))] }));
};
export const Input = ({ label, error, className = "", ...props }) => {
    return (_jsxs("div", { className: `w-full ${className}`, children: [label && (_jsx("label", { htmlFor: props.id || props.name, className: "block text-sm font-medium text-gray-700 mb-1", children: label })), _jsx("div", { className: "relative", children: _jsx("input", { className: `w-full px-4 py-2.5 bg-white border rounded-lg text-gray-800 transition-colors duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${error
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 hover:border-gray-400 focus:ring-emerald-200"}`, id: props.id || props.name, ...props }) }), error && _jsx("p", { className: "mt-1.5 text-sm text-red-600", children: error })] }));
};
export const Form = ({ children, className = "", ...props }) => {
    return (_jsx("form", { className: `w-full ${className}`, ...props, children: children }));
};
export const Select = ({ label, options, error, className = "", ...props }) => {
    return (_jsxs("div", { className: `w-full ${className}`, children: [label && (_jsx("label", { className: "block text-sm font-medium mb-1", children: label })), _jsx("select", { className: `w-full px-3 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${error ? "border-red-500" : "border-gray-300"}`, ...props, children: options.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) }), error && _jsx("p", { className: "mt-1 text-sm text-red-500", children: error })] }));
};
export const Toggle = ({ label, checked, onChange, disabled = false, }) => {
    return (_jsx("div", { className: "flex items-center", children: _jsxs("label", { className: "inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", className: "sr-only", checked: checked, onChange: onChange, disabled: disabled }), _jsx("div", { className: `relative w-11 h-6 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out ${checked ? "bg-emerald-600" : ""} ${disabled ? "opacity-60" : ""}`, children: _jsx("div", { className: `absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ease-in-out ${checked ? "transform translate-x-5" : ""}` }) }), _jsx("span", { className: "ml-3 text-sm font-medium text-gray-900", children: label })] }) }));
};
export const Card = ({ children, className = "", hoverable = false, bordered = true, }) => {
    return (_jsx("div", { className: `bg-white rounded-xl p-6 ${bordered ? "border border-gray-200" : ""} ${hoverable ? "transition-all duration-200 hover:shadow-md" : "shadow-sm"} ${className}`, children: children }));
};
export const Alert = ({ type, children, className = "", }) => {
    const typeStyles = {
        success: "bg-green-50 text-green-800 border-green-200",
        error: "bg-red-50 text-red-800 border-red-200",
        warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
        info: "bg-blue-50 text-blue-800 border-blue-200",
    };
    return (_jsx("div", { className: `p-4 rounded-lg border ${typeStyles[type]} ${className}`, children: children }));
};
export const Spinner = ({ size = "md", className = "", }) => {
    const sizeStyles = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
    return (_jsx("div", { className: `inline-block ${sizeStyles[size]} ${className}`, children: _jsxs("svg", { className: "animate-spin text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }) }));
};
export const Badge = ({ children, color = "gray", className = "", }) => {
    const colorStyles = {
        green: "bg-green-100 text-green-800",
        red: "bg-red-100 text-red-800",
        yellow: "bg-yellow-100 text-yellow-800",
        blue: "bg-blue-100 text-blue-800",
        gray: "bg-gray-100 text-gray-800",
        purple: "bg-purple-100 text-purple-800",
        gold: "bg-amber-100 text-amber-800",
    };
    return (_jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorStyles[color]} ${className}`, children: children }));
};
export const Tabs = ({ tabs, activeTab, onChange }) => {
    return (_jsx("div", { className: "border-b border-gray-200", children: _jsx("nav", { className: "-mb-px flex space-x-8", children: tabs.map((tab) => (_jsx("button", { onClick: () => onChange(tab.id), className: `pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`, children: tab.label }, tab.id))) }) }));
};
export const Tab = ({ children }) => (_jsx("div", { children: children }));
