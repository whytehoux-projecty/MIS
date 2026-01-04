import React, { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Container } from "../components/setup/Container"
import { Card, Button } from "../components/ui"

export const MobileConnectPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation() as any
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)

  const membershipKey = location.state?.membershipKey

  useEffect(() => {
    if (!membershipKey) {
      navigate("/membership/setup")
      return
    }
    setQrCodeData(`SPACE:${membershipKey}`)
  }, [membershipKey, navigate])

  const handleBack = () => navigate("/membership/setup")

  return (
    <Container currentPage="Mobile Connect">
      <div className="max-w-xl mx-auto">
        <Button variant="text" className="mb-6" onClick={handleBack}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Setup
        </Button>
        <Card>
          <h2 className="text-2xl font-bold mb-4">Connect Mobile App</h2>
          <p className="text-gray-600 mb-6">Open the Space mobile app and scan the QR below to link your membership.</p>
          <div className="border border-gray-200 rounded-xl p-8 flex items-center justify-center bg-white">
            <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-xs text-gray-600">{qrCodeData}</span>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  )
}

export default MobileConnectPage

