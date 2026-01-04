import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { Container } from "../components/setup/Container"
import { Card, Button, Input, TextArea, Alert } from "../components/ui"
import { apiService } from "../../../services/apiService"

interface RegistrationFormData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  occupation: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  biography: string
  referenceDetails: string
}

interface InvitationData {
  id?: number
  code: string
  intendedFor?: string
}

const MAX_PHOTOS = 5
const MAX_PHOTO_SIZE_MB = 5

export const RegistrationPage: React.FC = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [invitationData, setInvitationData] = useState<InvitationData | null>(null)
  const [formData, setFormData] = useState<RegistrationFormData>({
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
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [photoErrors, setPhotoErrors] = useState<string[]>([])
  const [photoFiles, setPhotoFiles] = useState<{ file: File; preview: string; id?: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  useEffect(() => {
    const invitationDataStr = sessionStorage.getItem("validatedInvitation")
    const sessionStartTime = sessionStorage.getItem("invitationSessionStart")

    if (!invitationDataStr || !sessionStartTime) {
      toast.error("No valid invitation found. Please complete the invitation process.")
      navigate("/membership/invitation")
      return
    }

    try {
      const parsedData = JSON.parse(invitationDataStr)
      setInvitationData({
        id: parsedData.id,
        code: parsedData.code,
        intendedFor: parsedData.intendedFor
      })

      if (parsedData.intendedFor) {
        // intendedFor might be "First Last" or just "Name"
        const nameParts = parsedData.intendedFor.split(" ")
        setFormData((prev) => ({
          ...prev,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
        }))
      }

      const startTime = parseInt(sessionStartTime, 10)
      const currentTime = Math.floor(Date.now() / 1000)
      const sessionDuration = 3 * 60 * 60
      const remaining = sessionDuration - (currentTime - startTime)

      if (remaining <= 0) {
        toast.error("Your session has expired. Please start over.")
        navigate("/membership/invitation")
        return
      }

      setTimeRemaining(remaining)
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval)
            toast.error("Your session has expired. Please start over.")
            navigate("/membership/invitation")
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    } catch {
      toast.error("Invalid invitation data. Please start over.")
      navigate("/membership/invitation")
    }
  }, [navigate])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return [hours.toString().padStart(2, "0"), minutes.toString().padStart(2, "0"), secs.toString().padStart(2, "0")].join(":")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newPhotoErrors: string[] = []
    setIsUploading(true)

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (photoFiles.length >= MAX_PHOTOS) {
        newPhotoErrors.push(`You can only upload a maximum of ${MAX_PHOTOS} photos.`)
        continue
      }

      if (!file.type.startsWith("image/")) {
        newPhotoErrors.push(`File "${file.name}" is not an image.`)
        continue
      }

      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > MAX_PHOTO_SIZE_MB) {
        newPhotoErrors.push(`File "${file.name}" exceeds the maximum size of ${MAX_PHOTO_SIZE_MB}MB.`)
        continue
      }

      try {
        // Upload to backend
        const response = await apiService.public.uploadPhoto(file)

        // Create local preview
        const reader = new FileReader()
        reader.readAsDataURL(file)

        await new Promise<void>((resolve) => {
          reader.onload = (ev) => {
            const preview = ev.target?.result as string
            setPhotoFiles(prev => [...prev, { file, preview, id: response.file_id }])
            resolve()
          }
        })

      } catch (err) {
        console.error("Upload failed", err)
        newPhotoErrors.push(`Failed to upload "${file.name}". Please try again.`)
      }
    }

    setPhotoErrors(newPhotoErrors)
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleRemovePhoto = (index: number) => {
    const next = [...photoFiles]
    next.splice(index, 1)
    setPhotoFiles(next)
  }

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click()
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}
      ;["firstName", "lastName", "email", "phoneNumber", "dateOfBirth", "occupation", "addressLine1", "city", "state", "postalCode", "country"].forEach((field) => {
        const v = (formData as any)[field]
        if (!v) newErrors[field] = "This field is required"
      })
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Please enter a valid email address"
    if (formData.phoneNumber && !/^\+?[\d\s()-]{8,20}$/.test(formData.phoneNumber)) newErrors.phoneNumber = "Please enter a valid phone number"
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const now = new Date()
      const minAge = 18
      if (isNaN(birthDate.getTime())) newErrors.dateOfBirth = "Please enter a valid date"
      else {
        const ageDate = new Date(now.getTime() - birthDate.getTime())
        const age = Math.abs(ageDate.getUTCFullYear() - 1970)
        if (age < minAge) newErrors.dateOfBirth = `You must be at least ${minAge} years old`
      }
    }
    if (photoFiles.length === 0) newErrors.profilePhotos = "Please upload at least one profile photo"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) {
      const firstErrorField = document.querySelector("[data-error='true']")
      if (firstErrorField) firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const registrationData = {
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`,
        photoCount: photoFiles.length,
        photoIds: photoFiles.map(p => p.id).filter(id => !!id).join(','),
        invitationId: invitationData?.id,
        invitationCode: invitationData?.code,
        submittedAt: new Date().toISOString(),
      }
      sessionStorage.setItem("registrationData", JSON.stringify(registrationData))
      toast.success("Registration information saved successfully!")
      navigate("/membership/oath")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "An error occurred while submitting your registration. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container currentPage="Registration">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Complete Your Registration</h2>
            {timeRemaining !== null && (
              <div className="bg-blue-50 border border-blue-200 rounded-md px-4 py-2">
                <div className="flex items-center">
                  <span className="text-blue-700 text-xs mr-2">Time Remaining:</span>
                  <span className="font-mono text-blue-800 font-medium text-sm">{formatTime(timeRemaining)}</span>
                </div>
              </div>
            )}
          </div>


          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} error={errors.firstName} required data-error={!!errors.firstName} />
                <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} error={errors.lastName} required data-error={!!errors.lastName} />
                <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} required data-error={!!errors.email} />
                <Input label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} error={errors.phoneNumber} required data-error={!!errors.phoneNumber} />
                <Input label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} error={errors.dateOfBirth} required data-error={!!errors.dateOfBirth} />
                <Input label="Occupation" name="occupation" value={formData.occupation} onChange={handleInputChange} error={errors.occupation} required data-error={!!errors.occupation} />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input label="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} error={errors.addressLine1} required data-error={!!errors.addressLine1} />
                </div>
                <div className="md:col-span-2">
                  <Input label="Address Line 2" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} error={errors.addressLine2} />
                </div>
                <Input label="City" name="city" value={formData.city} onChange={handleInputChange} error={errors.city} required data-error={!!errors.city} />
                <Input label="State/Province" name="state" value={formData.state} onChange={handleInputChange} error={errors.state} required data-error={!!errors.state} />
                <Input label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleInputChange} error={errors.postalCode} required data-error={!!errors.postalCode} />
                <Input label="Country" name="country" value={formData.country} onChange={handleInputChange} error={errors.country} required data-error={!!errors.country} />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <TextArea label="Biography" name="biography" value={formData.biography} onChange={handleInputChange} rows={4} placeholder="Tell us about yourself, your background, interests, and aspirations." helper="This information helps us better understand your fit with our community." />
                <TextArea label="Reference Details" name="referenceDetails" value={formData.referenceDetails} onChange={handleInputChange} rows={4} placeholder="Please provide any references or recommendations you may have." helper="Optional: Include names and contact information of references." />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Profile Photos</h3>
              <p className="text-gray-600 text-sm mb-4">Please upload up to {MAX_PHOTOS} clear photos of yourself. These will be used for identification purposes.</p>
              {photoErrors.length > 0 && (
                <Alert type="error" className="mb-4">
                  {photoErrors.map((error, index) => (<div key={index}>{error}</div>))}
                </Alert>
              )}
              {errors.profilePhotos && (
                <Alert type="error" className="mb-4" data-error="true">{errors.profilePhotos}</Alert>
              )}
              <div className="flex flex-wrap gap-4 mb-4">
                {photoFiles.map((photo, index) => (
                  <div key={index} className="w-32 h-32 relative rounded-md overflow-hidden border border-gray-300">
                    <img src={photo.preview} alt={`Profile photo ${index + 1}`} className="w-full h-full object-cover" />
                    <button type="button" className="absolute top-1 right-1 bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-white" onClick={() => handleRemovePhoto(index)}>×</button>
                  </div>
                ))}
                {photoFiles.length < MAX_PHOTOS && (
                  <button type="button" onClick={handleAddPhotoClick} disabled={isUploading} className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isUploading ? (
                      <span className="text-sm">Uploading...</span>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span className="mt-2 text-sm">Add Photo</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <label htmlFor="photo-upload" className="sr-only">Upload photos</label>
              <input id="photo-upload" ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Continue"}</Button>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  )
}

export default RegistrationPage

