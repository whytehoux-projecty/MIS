import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Container } from "../components/setup/Container";
import { Card, Button } from "../components/ui";
export const SubmissionConfirmationPage = () => {
    const navigate = useNavigate();
    const [applicationData, setApplicationData] = useState(null);
    useEffect(() => {
        const stored = sessionStorage.getItem("applicationSubmitted");
        if (!stored) {
            toast.error("No application submission found.");
            navigate("/membership/invitation");
            return;
        }
        try {
            setApplicationData(JSON.parse(stored));
        }
        catch {
            toast.error("Invalid application data.");
            navigate("/membership/invitation");
        }
    }, [navigate]);
    const formatDate = (dateString) => {
        if (!dateString)
            return "";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" }).format(date);
    };
    return (_jsx(Container, { currentPage: "Application Submitted", children: _jsx("div", { className: "max-w-2xl mx-auto", children: _jsxs(Card, { className: "text-center shadow-elevated border-0", children: [_jsx("div", { className: "flex justify-center mb-8", children: _jsx("div", { className: "w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 text-emerald-600", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }) }) }), _jsx("h2", { className: "text-3xl font-bold mb-2 text-gray-800", children: "Application Submitted" }), _jsxs("p", { className: "text-gray-600 mb-10 text-lg", children: ["Thank you, ", _jsx("span", { className: "font-medium text-emerald-700", children: applicationData?.name || "Applicant" }), ". Your membership application has been successfully submitted and will be reviewed by our membership board."] }), _jsxs("div", { className: "bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8 mb-8 text-left", children: [_jsx("h3", { className: "font-semibold text-xl mb-6 text-center text-gray-800", children: "Application Details" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center border-b border-gray-200 pb-3", children: [_jsx("span", { className: "text-gray-600", children: "Reference Number:" }), _jsx("span", { className: "font-medium bg-white px-3 py-1 rounded-md border border-gray-200 text-emerald-700", children: applicationData?.reference })] }), _jsxs("div", { className: "flex justify-between border-b border-gray-200 pb-3", children: [_jsx("span", { className: "text-gray-600", children: "Full Name:" }), _jsx("span", { className: "font-medium", children: applicationData?.name })] }), _jsxs("div", { className: "flex justify-between border-b border-gray-200 pb-3", children: [_jsx("span", { className: "text-gray-600", children: "Email:" }), _jsx("span", { children: applicationData?.email })] }), _jsxs("div", { className: "flex justify-between border-b border-gray-200 pb-3", children: [_jsx("span", { className: "text-gray-600", children: "Submission Date:" }), _jsx("span", { children: formatDate(applicationData?.submittedAt) })] })] })] }), _jsx("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-6 mb-10 text-left", children: _jsxs("div", { className: "flex items-start", children: [_jsx("div", { className: "flex-shrink-0 mr-4", children: _jsx("div", { className: "bg-amber-100 rounded-full p-2", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-amber-600", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }) }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-amber-800 text-lg mb-2", children: "What happens next?" }), _jsxs("ul", { className: "list-disc list-inside text-amber-700 space-y-2", children: [_jsx("li", { children: "Your application will be reviewed by the membership board" }), _jsx("li", { children: "The review process may take several days to weeks" }), _jsx("li", { children: "You will receive an email notification once a decision has been made" }), _jsx("li", { children: "Please keep your application reference number for future inquiries" })] })] })] }) }), _jsxs("div", { className: "flex flex-wrap justify-center gap-4", children: [_jsx(Button, { variant: "outline", className: "px-6 py-3", onClick: () => { if (applicationData?.reference) {
                                    navigator.clipboard.writeText(applicationData.reference);
                                    toast.success("Reference number copied to clipboard");
                                } }, children: "Copy Reference Number" }), _jsx(Button, { onClick: () => navigate("/"), className: "px-6 py-3", children: "Return to Home" })] })] }) }) }));
};
export default SubmissionConfirmationPage;
