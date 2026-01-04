import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { Container } from "../components/setup/Container"
import { Card, Button, Input, Checkbox, Alert, Spinner } from "../components/ui"
import { apiService } from "../../../services/apiService"

const SESSION_DURATION = 3 * 60 * 60

export const InvitationPage: React.FC = () => {
  const navigate = useNavigate()
  const { invitationId } = useParams<{ invitationId?: string }>()

  const [invitationCode, setInvitationCode] = useState("")
  const [pin, setPin] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [step, setStep] = useState<"code" | "pin">("code")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)

  // Session timer logic
  useEffect(() => {
    const sessionStartTime = sessionStorage.getItem("invitationSessionStart")
    if (sessionStartTime) {
      const startTime = parseInt(sessionStartTime, 10)
      const currentTime = Math.floor(Date.now() / 1000)
      const elapsed = currentTime - startTime

      if (elapsed >= SESSION_DURATION) {
        expireSession()
        return
      }

      setTimeRemaining(SESSION_DURATION - elapsed)
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval)
            expireSession()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    } else if (invitationId) {
      // Auto-start session if ID is in URL
      startSession(invitationId)
    }
  }, [invitationId])

  const startSession = (code?: string) => {
    const startTime = Math.floor(Date.now() / 1000)
    sessionStorage.setItem("invitationSessionStart", startTime.toString())
    setTimeRemaining(SESSION_DURATION)
    if (code) {
      setInvitationCode(code)
    }
  }

  const expireSession = () => {
    setSessionExpired(true)
    sessionStorage.removeItem("invitationSessionStart")
    sessionStorage.removeItem("invitationCode")
    sessionStorage.removeItem("validatedInvitation")
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return [hours.toString().padStart(2, "0"), minutes.toString().padStart(2, "0"), secs.toString().padStart(2, "0")].join(":")
  }

  const handleInvitationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!invitationCode.trim()) { setError("Please enter your invitation code."); return }
    if (!acceptTerms) { setError("Please accept the terms to continue."); return }

    // Just move to PIN step - actual validation happens with PIN
    // This prevents enumeration of valid invitation codes
    setError(null)
    sessionStorage.setItem("invitationCode", invitationCode.trim())

    if (!sessionStorage.getItem("invitationSessionStart")) {
      startSession()
    }

    setStep("pin")
  }

  const handlePinSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!pin.trim() || pin.length !== 4) { setError("Please enter a valid 4-digit PIN."); return }

    setIsLoading(true)
    setError(null)

    try {
      const code = sessionStorage.getItem("invitationCode") || invitationCode

      const response = await apiService.public.verifyInvitation({
        invitation_code: code,
        pin: pin
      })

      if (response.valid) {
        // Store verified data for next steps
        sessionStorage.setItem("validatedInvitation", JSON.stringify({
          id: response.invitation_id,
          code: code,
          intendedFor: response.intended_for
        }))

        toast.success("Invitation verified successfully!")
        navigate("/membership/registration")
      } else {
        setError(response.message || "Invalid invitation code or PIN.")
      }
    } catch (err: any) {
      console.error("Verification error:", err)
      setError(err.response?.data?.detail || "Invalid invitation code or PIN. Please check and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (sessionExpired) {
    return (
      <Container currentPage="Invitation">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Session Expired</h2>
            <p className="text-gray-600 mb-6">Your invitation session has expired. The invitation link and code are valid for 3 hours from initial access.</p>
            <p className="text-gray-600 mb-6">Please contact your inviter to receive a new invitation if you still wish to join.</p>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </Card>
        </div>
      </Container>
    )
  }

  return (
    <Container currentPage="Invitation">
      <div className="max-w-md mx-auto">
        <Card>
          <h2 className="text-2xl font-bold mb-2 text-center">{step === "code" ? "Accept Your Invitation" : "Verify Your PIN"}</h2>
          <p className="mb-6 text-gray-600 text-center">{step === "code" ? "Enter your invitation code to begin the membership process." : "Please enter the 4-digit PIN sent with your invitation code."}</p>
          {timeRemaining !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 text-sm">Session Time Remaining:</span>
                <span className="font-mono text-blue-800 font-medium">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          )}
          {step === "code" ? (
            <form onSubmit={handleInvitationSubmit}>
              <Input label="Invitation Code" value={invitationCode} onChange={(e) => setInvitationCode(e.target.value)} placeholder="Enter your invitation code" className="mb-4" />
              <Checkbox id="accept" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} label={<span>I accept the terms and conditions</span>} className="mb-6" />
              {error && <Alert type="error" className="mb-4">{error}</Alert>}
              <Button type="submit" fullWidth disabled={isLoading || !acceptTerms}>{isLoading ? <Spinner size="sm" /> : "Continue"}</Button>
            </form>
          ) : (
            <form onSubmit={handlePinSubmit}>
              <Input label="PIN" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter your 4-digit PIN" className="mb-6" />
              {error && <Alert type="error" className="mb-4">{error}</Alert>}
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep("code")}>Back</Button>
                <Button type="submit" className="flex-1" disabled={isLoading || pin.length !== 4}>{isLoading ? <Spinner size="sm" /> : "Verify PIN"}</Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </Container>
  )
}

export default InvitationPage
