import React from 'react'

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 border rounded-lg bg-white">
        <h1 className="text-xl font-semibold mb-2">Unauthorized</h1>
        <p className="text-gray-600">You do not have permission to access this page.</p>
      </div>
    </div>
  )
}

export default Unauthorized
