import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { Container } from "../components/setup/Container"
import { Card, Button, Badge } from "../components/ui"

export const TelegramConnectPage: React.FC = () => {
  const navigate = useNavigate()
  const [connectionCode, setConnectionCode] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(300)
  const [copied, setCopied] = useState<boolean>(false)

  useEffect(() => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setConnectionCode(code)
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const copyConnectionCode = () => {
    if (!connectionCode) return
    navigator.clipboard.writeText(connectionCode)
    setCopied(true)
    toast.success("Connection code copied to clipboard")
    setTimeout(() => setCopied(false), 3000)
  }

  const handleBack = () => navigate("/membership/setup")
  const handleRegenerateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setConnectionCode(code)
    setTimeRemaining(300)
  }

  return (
    <Container currentPage="Telegram Connect">
      <div className="max-w-2xl mx-auto">
        <Button variant="text" className="mb-6" onClick={handleBack}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Setup
        </Button>

        <Card className="shadow-elevated">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="text-blue-500 h-8 w-8"><path d="M16 0.5c-8.563 0-15.5 6.937-15.5 15.5s6.937 15.5 15.5 15.5c8.563 0 15.5-6.937 15.5-15.5s-6.937-15.5-15.5-15.5zM23.613 11.119l-2.544 11.988c-0.188 0.85-0.694 1.056-1.4 0.656l-3.875-2.856-1.869 1.8c-0.206 0.206-0.381 0.381-0.781 0.381l0.275-3.944 7.181-6.488c0.313-0.275-0.069-0.431-0.482-0.156l-8.875 5.587-3.825-1.194c-0.831-0.262-0.85-0.831 0.175-1.231l14.944-5.763c0.694-0.25 1.3 0.169 1.075 1.219z" fill="currentColor"/></svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold">Connect Telegram Bot</h2>
          </div>

          {timeRemaining <= 0 ? (
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 className="font-medium text-lg text-red-800">Connection Timed Out</h3>
              <p className="text-red-700 mt-1">The connection code has expired. Please generate a new code and try again.</p>
              <Button onClick={handleRegenerateCode} fullWidth>Generate New Code</Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Connection Code:</h3>
                  <Badge color="gold">Expires in {formatTimeRemaining()}</Badge>
                </div>
                <div className="flex bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <code className="font-mono text-gray-800 flex-1">{connectionCode}</code>
                  <Button variant="outline" onClick={copyConnectionCode}>{copied ? "Copied" : "Copy"}</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-xl p-6">
                  <h4 className="font-medium mb-2">Connect via Bot Command</h4>
                  <p className="text-gray-600 text-sm mb-3">Open Telegram and start a conversation with @SpaceNewBot, then send:</p>
                  <code className="block bg-gray-50 border border-gray-200 rounded-md p-2">/start {connectionCode}</code>
                </div>
                <div className="border border-gray-200 rounded-xl p-6">
                  <h4 className="font-medium mb-2">Troubleshooting</h4>
                  <p className="text-gray-600 text-sm">Ensure you are using the official Space bot and the code hasn’t expired.</p>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </Container>
  )
}

export default TelegramConnectPage

