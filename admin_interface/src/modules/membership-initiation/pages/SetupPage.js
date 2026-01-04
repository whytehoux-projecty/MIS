import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Container } from "../components/setup/Container";
import { Card, Button, Alert, Spinner, Badge } from "../components/ui";
export const SetupPage = () => {
    const navigate = useNavigate();
    const [membershipKey, setMembershipKey] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [userName, setUserName] = useState("Member");
    const [connectedPlatforms, setConnectedPlatforms] = useState([]);
    useEffect(() => {
        const linkCreationTime = localStorage.getItem("setupLinkCreatedAt");
        if (!linkCreationTime) {
            const currentTime = Math.floor(Date.now() / 1000);
            localStorage.setItem("setupLinkCreatedAt", currentTime.toString());
            setTimeRemaining(3600);
            const interval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev === null || prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
        else {
            const creationTime = parseInt(linkCreationTime, 10);
            const currentTime = Math.floor(Date.now() / 1000);
            const elapsed = currentTime - creationTime;
            const linkExpiryTime = 60 * 60;
            if (elapsed >= linkExpiryTime)
                setTimeRemaining(0);
            else {
                setTimeRemaining(linkExpiryTime - elapsed);
                const interval = setInterval(() => {
                    setTimeRemaining((prev) => {
                        if (prev === null || prev <= 1) {
                            clearInterval(interval);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
                return () => clearInterval(interval);
            }
        }
    }, []);
    useEffect(() => {
        const storedKey = localStorage.getItem("membershipKey");
        if (storedKey) {
            setMembershipKey(storedKey);
            setUserName("Space Member");
            const storedPlatforms = localStorage.getItem("connectedPlatforms");
            if (storedPlatforms)
                setConnectedPlatforms(JSON.parse(storedPlatforms));
        }
        else {
            navigate("/");
        }
    }, [navigate]);
    const savePlatforms = (next) => {
        setConnectedPlatforms(next);
        localStorage.setItem("connectedPlatforms", JSON.stringify(next));
    };
    const formatTimeRemaining = (seconds) => {
        if (seconds === null)
            return "--:--";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    };
    const connectTelegram = async () => {
        setIsLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 600));
            toast.success("Telegram connection initiated. Check your Telegram app.");
            navigate("/membership/telegram-connect");
        }
        finally {
            setIsLoading(false);
        }
    };
    const connectWebBot = async () => {
        setIsLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 500));
            toast.success("Web interface connected");
            if (!connectedPlatforms.includes("web"))
                savePlatforms([...connectedPlatforms, "web"]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const connectMobileApp = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate("/membership/mobile-connect", { state: { membershipKey } });
        }, 800);
    };
    const connectBrowserExtension = async () => {
        setIsLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 500));
            toast.success("Browser extension connection initiated!");
            if (!connectedPlatforms.includes("browser-extension"))
                savePlatforms([...connectedPlatforms, "browser-extension"]);
            setTimeout(() => {
                window.open("https://chromewebstore.google.com/detail/space-browser-extension/abcdefghijklmnopqrstuvwxyz", "_blank");
            }, 600);
        }
        finally {
            setIsLoading(false);
        }
    };
    const copyMembershipKey = () => {
        if (membershipKey) {
            navigator.clipboard.writeText(membershipKey);
            toast.success("Membership key copied to clipboard");
        }
    };
    return (_jsx(Container, { currentPage: "Setup", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [timeRemaining !== null && (_jsx("div", { className: "mb-8 text-center", children: _jsxs("div", { className: "inline-flex items-center px-4 py-2 bg-amber-50 border border-amber-300 rounded-lg", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-amber-500 mr-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("span", { className: "font-medium text-amber-800", children: timeRemaining > 0
                                    ? `This setup link expires in ${formatTimeRemaining(timeRemaining)}`
                                    : "This setup link has expired. Contact admin for a new link." })] }) })), _jsxs(Card, { className: "mb-8 shadow-elevated", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsxs("h2", { className: "text-3xl font-bold mb-4 text-gray-800", children: ["Welcome to Space, ", userName, "!"] }), _jsx("p", { className: "text-lg text-gray-600", children: "Follow the steps below to complete your setup and connect your preferred platforms." })] }), _jsxs("div", { className: "bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8", children: [_jsx("h3", { className: "text-lg font-semibold text-emerald-700 mb-4", children: "Your Membership Key" }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between mb-2", children: [_jsx("code", { className: "text-gray-800 font-mono", children: membershipKey || "ARK-XXXXX-XXXXX-XXXXX-XXXX" }), _jsx("button", { onClick: copyMembershipKey, className: "text-emerald-600 hover:text-emerald-700", title: "Copy to clipboard", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" }) }) })] }), _jsx("p", { className: "text-sm text-emerald-700", children: "This is your unique membership key. You'll need it to authenticate with all Space systems." })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-xl font-bold mb-4 text-center", children: "Connect Your Platforms" }), _jsx("p", { className: "text-gray-600 mb-6 text-center", children: "Choose how you want to interact with the Space system. You can connect multiple platforms." }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "border border-gray-200 rounded-xl p-6 transition-all hover:border-blue-300 hover:shadow-md", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx("div", { className: "h-8 w-8 mr-3 flex-shrink-0", children: _jsx("svg", { viewBox: "0 0 32 32", xmlns: "http://www.w3.org/2000/svg", className: "text-blue-500", children: _jsx("path", { d: "M16 0.5c-8.563 0-15.5 6.937-15.5 15.5s6.937 15.5 15.5 15.5c8.563 0 15.5-6.937 15.5-15.5s-6.937-15.5-15.5-15.5zM23.613 11.119l-2.544 11.988c-0.188 0.85-0.694 1.056-1.4 0.656l-3.875-2.856-1.869 1.8c-0.206 0.206-0.381 0.381-0.781 0.381l0.275-3.944 7.181-6.488c0.313-0.275-0.069-0.431-0.482-0.156l-8.875 5.587-3.825-1.194c-0.831-0.262-0.85-0.831 0.175-1.231l14.944-5.763c0.694-0.25 1.3 0.169 1.075 1.219z", fill: "currentColor" }) }) }), _jsx("h4", { className: "text-lg font-medium", children: "Telegram Bot" }), connectedPlatforms.includes("telegram-bot") && (_jsx(Badge, { color: "green", className: "ml-2", children: "Connected" }))] }), _jsx("p", { className: "text-gray-600 text-sm mb-4", children: "Connect with our Telegram bot for seamless communication with Space AI." }), _jsxs(Button, { onClick: connectTelegram, fullWidth: true, variant: connectedPlatforms.includes("telegram-bot")
                                                        ? "outline"
                                                        : "primary", disabled: isLoading, children: [isLoading ? _jsx(Spinner, { size: "sm", className: "mr-2" }) : null, connectedPlatforms.includes("telegram-bot")
                                                            ? "Reconnect Telegram"
                                                            : "Connect Telegram"] })] }), _jsxs("div", { className: "border border-gray-200 rounded-xl p-6 transition-all hover:border-emerald-300 hover:shadow-md", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx("div", { className: "h-8 w-8 mr-3 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }) }), _jsx("h4", { className: "text-lg font-medium", children: "Web Interface" }), connectedPlatforms.includes("web") && (_jsx(Badge, { color: "green", className: "ml-2", children: "Connected" }))] }), _jsx("p", { className: "text-gray-600 text-sm mb-4", children: "Use our web interface to interact with Space AI directly from your browser." }), _jsxs(Button, { onClick: connectWebBot, variant: connectedPlatforms.includes("web") ? "outline" : "primary", fullWidth: true, disabled: isLoading, children: [isLoading ? _jsx(Spinner, { size: "sm", className: "mr-2" }) : null, connectedPlatforms.includes("web")
                                                            ? "Reconnect Web Interface"
                                                            : "Connect Web Interface"] })] }), _jsxs("div", { className: "border border-gray-200 rounded-xl p-6 transition-all hover:border-indigo-300 hover:shadow-md", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx("div", { className: "h-8 w-8 mr-3 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" }) }) }), _jsx("h4", { className: "text-lg font-medium", children: "Mobile App" }), connectedPlatforms.includes("mobile-app") && (_jsx(Badge, { color: "green", className: "ml-2", children: "Connected" }))] }), _jsx("p", { className: "text-gray-600 text-sm mb-4", children: "Install our mobile app for iOS or Android to access Space AI on the go." }), _jsxs(Button, { onClick: connectMobileApp, variant: connectedPlatforms.includes("mobile-app")
                                                        ? "outline"
                                                        : "primary", fullWidth: true, disabled: isLoading, children: [isLoading ? _jsx(Spinner, { size: "sm", className: "mr-2" }) : null, connectedPlatforms.includes("mobile-app")
                                                            ? "Reconnect Mobile App"
                                                            : "Connect Mobile App"] })] }), _jsxs("div", { className: "border border-gray-200 rounded-xl p-6 transition-all hover:border-amber-300 hover:shadow-md", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx("div", { className: "h-8 w-8 mr-3 bg-amber-100 rounded-full flex items-center justify-center text-amber-600", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }) }), _jsx("h4", { className: "text-lg font-medium", children: "Browser Extension" }), connectedPlatforms.includes("browser-extension") && (_jsx(Badge, { color: "green", className: "ml-2", children: "Connected" }))] }), _jsx("p", { className: "text-gray-600 text-sm mb-4", children: "Install our browser extension to save content directly to Space." }), _jsxs(Button, { onClick: connectBrowserExtension, variant: connectedPlatforms.includes("browser-extension")
                                                        ? "outline"
                                                        : "primary", fullWidth: true, disabled: isLoading, children: [isLoading ? _jsx(Spinner, { size: "sm", className: "mr-2" }) : null, connectedPlatforms.includes("browser-extension")
                                                            ? "Reinstall Extension"
                                                            : "Add Browser Extension"] })] })] })] }), _jsx(Alert, { type: "info", className: "mb-6", children: _jsxs("div", { className: "flex items-start", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-blue-600 mr-2 mt-0.5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("div", { children: _jsx("p", { className: "text-blue-700 text-sm", children: "You can connect multiple platforms and manage them from your dashboard." }) })] }) })] })] }) }));
};
export default SetupPage;
