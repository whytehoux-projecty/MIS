import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container } from "../components/setup/Container";
import { Card, Button } from "../components/ui";
export const MobileConnectPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [qrCodeData, setQrCodeData] = useState(null);
    const membershipKey = location.state?.membershipKey;
    useEffect(() => {
        if (!membershipKey) {
            navigate("/membership/setup");
            return;
        }
        setQrCodeData(`SPACE:${membershipKey}`);
    }, [membershipKey, navigate]);
    const handleBack = () => navigate("/membership/setup");
    return (_jsx(Container, { currentPage: "Mobile Connect", children: _jsxs("div", { className: "max-w-xl mx-auto", children: [_jsxs(Button, { variant: "text", className: "mb-6", onClick: handleBack, children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }), "Back to Setup"] }), _jsxs(Card, { children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Connect Mobile App" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Open the Space mobile app and scan the QR below to link your membership." }), _jsx("div", { className: "border border-gray-200 rounded-xl p-8 flex items-center justify-center bg-white", children: _jsx("div", { className: "w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center", children: _jsx("span", { className: "text-xs text-gray-600", children: qrCodeData }) }) })] })] }) }));
};
export default MobileConnectPage;
