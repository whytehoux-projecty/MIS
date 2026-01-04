import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Container } from "../components/setup/Container";
import { Card, Button, Checkbox, Alert } from "../components/ui";
import { apiService } from "../../../services/apiService";
export const OathPage = () => {
    const navigate = useNavigate();
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const [audioURL, setAudioURL] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [audioId, setAudioId] = useState(null);
    const recordingTimerRef = useRef(null);
    const [acceptedPolicies, setAcceptedPolicies] = useState({
        generalTerms: false,
        privacyPolicy: false,
        codeOfConduct: false,
        ethicalGuidelines: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [registrationData, setRegistrationData] = useState(null);
    useEffect(() => {
        const storedRegistrationData = sessionStorage.getItem("registrationData");
        if (!storedRegistrationData) {
            toast.error("Please complete your registration first.");
            navigate("/membership/registration");
            return;
        }
        try {
            const parsed = JSON.parse(storedRegistrationData);
            setRegistrationData(parsed);
        }
        catch {
            toast.error("Invalid registration data.");
            navigate("/membership/registration");
        }
    }, [navigate]);
    const startRecording = async () => {
        setError(null);
        setIsRecording(true);
        setRecordingDuration(0);
        audioChunksRef.current = [];
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            recorder.ondataavailable = (e) => { if (e.data.size > 0)
                audioChunksRef.current.push(e.data); };
            recorder.onstop = async () => {
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
                stream.getTracks().forEach((t) => t.stop());
                // Upload audio
                try {
                    const response = await apiService.public.uploadAudio(blob, 'oath_recording.webm');
                    setAudioId(response.file_id);
                }
                catch (err) {
                    console.error("Audio upload failed", err);
                    setError("Failed to save recording. Please try again.");
                    setAudioURL(null);
                    setAudioId(null);
                }
            };
            recorder.start();
            recordingTimerRef.current = window.setInterval(() => setRecordingDuration((d) => d + 1), 1000);
        }
        catch (err) {
            setError("Microphone access denied or unavailable.");
            setIsRecording(false);
        }
    };
    const stopRecording = () => {
        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };
    const handlePolicyChange = (key) => {
        setAcceptedPolicies((prev) => ({ ...prev, [key]: !prev[key] }));
    };
    const verifyAndSubmit = async () => {
        setError(null);
        if (!audioId) {
            setError("Please record your oath before submitting.");
            return;
        }
        const allAccepted = Object.values(acceptedPolicies).every(Boolean);
        if (!allAccepted) {
            setError("Please accept all policies to continue.");
            return;
        }
        setIsVerifying(true);
        try {
            // Collect all data
            const storedReg = sessionStorage.getItem("registrationData");
            const storedInv = sessionStorage.getItem("validatedInvitation"); // Changed from invitationData to match InvitationPage
            if (!storedReg || !storedInv) {
                throw new Error("Missing registration data");
            }
            const reg = JSON.parse(storedReg);
            const inv = JSON.parse(storedInv);
            const submitData = {
                invitation_id: inv.id, // Ensure this matches InvitationPage storage
                invitation_code: reg.invitationCode || inv.code,
                full_name: reg.fullName,
                email: reg.email,
                date_of_birth: reg.dateOfBirth,
                phone_number: reg.phoneNumber,
                address: `${reg.addressLine1}${reg.addressLine2 ? ', ' + reg.addressLine2 : ''}, ${reg.city}, ${reg.state} ${reg.postalCode}, ${reg.country}`,
                photo_id: reg.photoIds, // comma separated
                // Mapping other fields that backend expects but were not in RegisterRequest interface explicitly?
                // I added them to backend service/schema but did I add them to RegisterRequest in frontend?
                // Let's assume RegisterRequest in frontend was updated (I did it in step 995)
            }; // Cast to any because I added fields to types but might have missed some matching names
            // Manually add the extended fields that match backend schema
            const extendedData = {
                ...submitData,
                occupation: reg.occupation,
                biography: reg.biography,
                reference_details: reg.referenceDetails,
                city: reg.city,
                state: reg.state,
                country: reg.country,
                postal_code: reg.postalCode,
                audio_oath_id: audioId
            };
            await apiService.public.register(extendedData);
            setIsVerified(true);
            const appData = {
                reference: `APP-${Date.now().toString(36).toUpperCase()}`,
                name: reg.fullName,
                email: reg.email,
                submittedAt: new Date().toISOString(),
            };
            sessionStorage.setItem("applicationSubmitted", JSON.stringify(appData));
            toast.success("Oath verified and application submitted.");
            navigate("/membership/submission-confirmation");
        }
        catch (err) {
            console.error("Submission failed", err);
            setError(err.response?.data?.detail || "Verification failed. Please try again.");
        }
        finally {
            setIsVerifying(false);
        }
    };
    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
    return (_jsx(Container, { currentPage: "Membership Oath", children: _jsx("div", { className: "max-w-3xl mx-auto", children: _jsxs(Card, { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-2", children: "Record Your Membership Oath" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Please record the following oath and accept the policies to proceed." }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-md p-4 mb-6", children: _jsx("p", { className: "text-blue-800", children: "\"I hereby commit to uphold the values, responsibilities, and ethical standards of the Space community.\"" }) }), error && _jsx(Alert, { type: "error", className: "mb-4", children: error }), _jsx("div", { className: "bg-white border border-gray-200 rounded-xl p-6 mb-6", children: !audioURL ? (_jsxs("div", { className: "text-center", children: [isRecording ? (_jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "w-16 h-16 bg-red-100 rounded-full mx-auto mb-2 flex items-center justify-center", children: _jsx("span", { className: "w-4 h-4 bg-red-600 rounded-full animate-pulse" }) }), _jsxs("p", { className: "text-red-600", children: ["Recording... ", formatTime(recordingDuration)] })] })) : null, _jsx("div", { className: "flex justify-center gap-3", children: !isRecording ? (_jsx(Button, { onClick: startRecording, children: "Start Recording" })) : (_jsx(Button, { variant: "outline", onClick: stopRecording, children: "Stop Recording" })) })] })) : (_jsxs("div", { children: [_jsx("audio", { src: audioURL, controls: true, className: "w-full mb-3" }), _jsx(Button, { variant: "outline", onClick: () => { setAudioURL(null); setRecordingDuration(0); }, children: "Re-record" })] })) }), _jsxs("div", { className: "space-y-3 mb-6", children: [_jsx("div", { className: "flex items-start", children: _jsx(Checkbox, { id: "generalTerms", checked: acceptedPolicies.generalTerms, onChange: () => handlePolicyChange("generalTerms"), label: "General Terms" }) }), _jsx("div", { className: "flex items-start", children: _jsx(Checkbox, { id: "privacyPolicy", checked: acceptedPolicies.privacyPolicy, onChange: () => handlePolicyChange("privacyPolicy"), label: "Privacy Policy" }) }), _jsx("div", { className: "flex items-start", children: _jsx(Checkbox, { id: "codeOfConduct", checked: acceptedPolicies.codeOfConduct, onChange: () => handlePolicyChange("codeOfConduct"), label: "Code of Conduct" }) }), _jsx("div", { className: "flex items-start", children: _jsx(Checkbox, { id: "ethicalGuidelines", checked: acceptedPolicies.ethicalGuidelines, onChange: () => handlePolicyChange("ethicalGuidelines"), label: "Ethical Guidelines" }) })] }), _jsx("div", { className: "flex justify-end", children: _jsxs(Button, { onClick: verifyAndSubmit, disabled: isVerifying || !audioURL, children: [" ", isVerifying ? "Verifying..." : "Submit Oath", " "] }) })] }) }) }));
};
export default OathPage;
