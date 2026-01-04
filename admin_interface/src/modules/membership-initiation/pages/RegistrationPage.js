import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Container } from "../components/setup/Container";
import { Card, Button, Input, TextArea, Alert } from "../components/ui";
import { apiService } from "../../../services/apiService";
const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE_MB = 5;
export const RegistrationPage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [invitationData, setInvitationData] = useState(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        occupation: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        biography: "",
        referenceDetails: "",
    });
    const [errors, setErrors] = useState({});
    const [photoErrors, setPhotoErrors] = useState([]);
    const [photoFiles, setPhotoFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    useEffect(() => {
        const invitationDataStr = sessionStorage.getItem("validatedInvitation");
        const sessionStartTime = sessionStorage.getItem("invitationSessionStart");
        if (!invitationDataStr || !sessionStartTime) {
            toast.error("No valid invitation found. Please complete the invitation process.");
            navigate("/membership/invitation");
            return;
        }
        try {
            const parsedData = JSON.parse(invitationDataStr);
            setInvitationData({
                id: parsedData.id,
                code: parsedData.code,
                intendedFor: parsedData.intendedFor
            });
            if (parsedData.intendedFor) {
                // intendedFor might be "First Last" or just "Name"
                const nameParts = parsedData.intendedFor.split(" ");
                setFormData((prev) => ({
                    ...prev,
                    firstName: nameParts[0] || "",
                    lastName: nameParts.slice(1).join(" ") || "",
                }));
            }
            const startTime = parseInt(sessionStartTime, 10);
            const currentTime = Math.floor(Date.now() / 1000);
            const sessionDuration = 3 * 60 * 60;
            const remaining = sessionDuration - (currentTime - startTime);
            if (remaining <= 0) {
                toast.error("Your session has expired. Please start over.");
                navigate("/membership/invitation");
                return;
            }
            setTimeRemaining(remaining);
            const interval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev === null || prev <= 1) {
                        clearInterval(interval);
                        toast.error("Your session has expired. Please start over.");
                        navigate("/membership/invitation");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
        catch {
            toast.error("Invalid invitation data. Please start over.");
            navigate("/membership/invitation");
        }
    }, [navigate]);
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return [hours.toString().padStart(2, "0"), minutes.toString().padStart(2, "0"), secs.toString().padStart(2, "0")].join(":");
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };
    const handlePhotoUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0)
            return;
        const newPhotoErrors = [];
        setIsUploading(true);
        // Process each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (photoFiles.length >= MAX_PHOTOS) {
                newPhotoErrors.push(`You can only upload a maximum of ${MAX_PHOTOS} photos.`);
                continue;
            }
            if (!file.type.startsWith("image/")) {
                newPhotoErrors.push(`File "${file.name}" is not an image.`);
                continue;
            }
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > MAX_PHOTO_SIZE_MB) {
                newPhotoErrors.push(`File "${file.name}" exceeds the maximum size of ${MAX_PHOTO_SIZE_MB}MB.`);
                continue;
            }
            try {
                // Upload to backend
                const response = await apiService.public.uploadPhoto(file);
                // Create local preview
                const reader = new FileReader();
                reader.readAsDataURL(file);
                await new Promise((resolve) => {
                    reader.onload = (ev) => {
                        const preview = ev.target?.result;
                        setPhotoFiles(prev => [...prev, { file, preview, id: response.file_id }]);
                        resolve();
                    };
                });
            }
            catch (err) {
                console.error("Upload failed", err);
                newPhotoErrors.push(`Failed to upload "${file.name}". Please try again.`);
            }
        }
        setPhotoErrors(newPhotoErrors);
        setIsUploading(false);
        if (fileInputRef.current)
            fileInputRef.current.value = "";
    };
    const handleRemovePhoto = (index) => {
        const next = [...photoFiles];
        next.splice(index, 1);
        setPhotoFiles(next);
    };
    const handleAddPhotoClick = () => {
        fileInputRef.current?.click();
    };
    const validateForm = () => {
        const newErrors = {};
        ["firstName", "lastName", "email", "phoneNumber", "dateOfBirth", "occupation", "addressLine1", "city", "state", "postalCode", "country"].forEach((field) => {
            const v = formData[field];
            if (!v)
                newErrors[field] = "This field is required";
        });
        if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email))
            newErrors.email = "Please enter a valid email address";
        if (formData.phoneNumber && !/^\+?[\d\s()-]{8,20}$/.test(formData.phoneNumber))
            newErrors.phoneNumber = "Please enter a valid phone number";
        if (formData.dateOfBirth) {
            const birthDate = new Date(formData.dateOfBirth);
            const now = new Date();
            const minAge = 18;
            if (isNaN(birthDate.getTime()))
                newErrors.dateOfBirth = "Please enter a valid date";
            else {
                const ageDate = new Date(now.getTime() - birthDate.getTime());
                const age = Math.abs(ageDate.getUTCFullYear() - 1970);
                if (age < minAge)
                    newErrors.dateOfBirth = `You must be at least ${minAge} years old`;
            }
        }
        if (photoFiles.length === 0)
            newErrors.profilePhotos = "Please upload at least one profile photo";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            const firstErrorField = document.querySelector("[data-error='true']");
            if (firstErrorField)
                firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        setIsSubmitting(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const registrationData = {
                ...formData,
                fullName: `${formData.firstName} ${formData.lastName}`,
                photoCount: photoFiles.length,
                photoIds: photoFiles.map(p => p.id).filter(id => !!id).join(','),
                invitationId: invitationData?.id,
                invitationCode: invitationData?.code,
                submittedAt: new Date().toISOString(),
            };
            sessionStorage.setItem("registrationData", JSON.stringify(registrationData));
            toast.success("Registration information saved successfully!");
            navigate("/membership/oath");
        }
        catch (err) {
            toast.error(err?.response?.data?.message || "An error occurred while submitting your registration. Please try again.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsx(Container, { currentPage: "Registration", children: _jsx("div", { className: "max-w-4xl mx-auto", children: _jsxs(Card, { className: "mb-8", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Complete Your Registration" }), timeRemaining !== null && (_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-md px-4 py-2", children: _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-blue-700 text-xs mr-2", children: "Time Remaining:" }), _jsx("span", { className: "font-mono text-blue-800 font-medium text-sm", children: formatTime(timeRemaining) })] }) }))] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-lg font-medium mb-4", children: "Personal Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(Input, { label: "First Name", name: "firstName", value: formData.firstName, onChange: handleInputChange, error: errors.firstName, required: true, "data-error": !!errors.firstName }), _jsx(Input, { label: "Last Name", name: "lastName", value: formData.lastName, onChange: handleInputChange, error: errors.lastName, required: true, "data-error": !!errors.lastName }), _jsx(Input, { label: "Email Address", name: "email", type: "email", value: formData.email, onChange: handleInputChange, error: errors.email, required: true, "data-error": !!errors.email }), _jsx(Input, { label: "Phone Number", name: "phoneNumber", value: formData.phoneNumber, onChange: handleInputChange, error: errors.phoneNumber, required: true, "data-error": !!errors.phoneNumber }), _jsx(Input, { label: "Date of Birth", name: "dateOfBirth", type: "date", value: formData.dateOfBirth, onChange: handleInputChange, error: errors.dateOfBirth, required: true, "data-error": !!errors.dateOfBirth }), _jsx(Input, { label: "Occupation", name: "occupation", value: formData.occupation, onChange: handleInputChange, error: errors.occupation, required: true, "data-error": !!errors.occupation })] })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-lg font-medium mb-4", children: "Address" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx("div", { className: "md:col-span-2", children: _jsx(Input, { label: "Address Line 1", name: "addressLine1", value: formData.addressLine1, onChange: handleInputChange, error: errors.addressLine1, required: true, "data-error": !!errors.addressLine1 }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Input, { label: "Address Line 2", name: "addressLine2", value: formData.addressLine2, onChange: handleInputChange, error: errors.addressLine2 }) }), _jsx(Input, { label: "City", name: "city", value: formData.city, onChange: handleInputChange, error: errors.city, required: true, "data-error": !!errors.city }), _jsx(Input, { label: "State/Province", name: "state", value: formData.state, onChange: handleInputChange, error: errors.state, required: true, "data-error": !!errors.state }), _jsx(Input, { label: "Postal Code", name: "postalCode", value: formData.postalCode, onChange: handleInputChange, error: errors.postalCode, required: true, "data-error": !!errors.postalCode }), _jsx(Input, { label: "Country", name: "country", value: formData.country, onChange: handleInputChange, error: errors.country, required: true, "data-error": !!errors.country })] })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-lg font-medium mb-4", children: "Additional Information" }), _jsxs("div", { className: "grid grid-cols-1 gap-4", children: [_jsx(TextArea, { label: "Biography", name: "biography", value: formData.biography, onChange: handleInputChange, rows: 4, placeholder: "Tell us about yourself, your background, interests, and aspirations.", helper: "This information helps us better understand your fit with our community." }), _jsx(TextArea, { label: "Reference Details", name: "referenceDetails", value: formData.referenceDetails, onChange: handleInputChange, rows: 4, placeholder: "Please provide any references or recommendations you may have.", helper: "Optional: Include names and contact information of references." })] })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-lg font-medium mb-4", children: "Profile Photos" }), _jsxs("p", { className: "text-gray-600 text-sm mb-4", children: ["Please upload up to ", MAX_PHOTOS, " clear photos of yourself. These will be used for identification purposes."] }), photoErrors.length > 0 && (_jsx(Alert, { type: "error", className: "mb-4", children: photoErrors.map((error, index) => (_jsx("div", { children: error }, index))) })), errors.profilePhotos && (_jsx(Alert, { type: "error", className: "mb-4", "data-error": "true", children: errors.profilePhotos })), _jsxs("div", { className: "flex flex-wrap gap-4 mb-4", children: [photoFiles.map((photo, index) => (_jsxs("div", { className: "w-32 h-32 relative rounded-md overflow-hidden border border-gray-300", children: [_jsx("img", { src: photo.preview, alt: `Profile photo ${index + 1}`, className: "w-full h-full object-cover" }), _jsx("button", { type: "button", className: "absolute top-1 right-1 bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-white", onClick: () => handleRemovePhoto(index), children: "\u00D7" })] }, index))), photoFiles.length < MAX_PHOTOS && (_jsx("button", { type: "button", onClick: handleAddPhotoClick, disabled: isUploading, className: "w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: isUploading ? (_jsx("span", { className: "text-sm", children: "Uploading..." })) : (_jsxs(_Fragment, { children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-8 w-8", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }), _jsx("span", { className: "mt-2 text-sm", children: "Add Photo" })] })) }))] }), _jsx("label", { htmlFor: "photo-upload", className: "sr-only", children: "Upload photos" }), _jsx("input", { id: "photo-upload", ref: fileInputRef, type: "file", accept: "image/*", multiple: true, onChange: handlePhotoUpload, className: "hidden" })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { type: "submit", disabled: isSubmitting, children: isSubmitting ? "Submitting..." : "Continue" }) })] })] }) }) }));
};
export default RegistrationPage;
