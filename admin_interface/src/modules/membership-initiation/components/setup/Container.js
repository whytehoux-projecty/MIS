import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
export const Container = ({ children, currentPage, className = "", }) => {
    return (_jsx("div", { className: cn("min-h-screen bg-muted/30", className), children: _jsxs("div", { className: "max-w-5xl mx-auto px-4 py-8", children: [_jsxs("header", { className: "flex items-center justify-between mb-8 pb-4 border-b border-border", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("h1", { className: "text-xl font-bold tracking-tight text-foreground", children: "Space" }), currentPage && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-muted-foreground", children: "/" }), _jsx("span", { className: "text-sm font-medium text-muted-foreground", children: currentPage })] }))] }), _jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Whyte Houx" })] }), _jsx("main", { children: children })] }) }));
};
