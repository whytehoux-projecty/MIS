import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ICVP } from './pages/ICVP';
import { RFP } from './pages/RFP';
import { ATIPP } from './pages/ATIPP';
import { ARFSP } from './pages/ARFSP';

/**
 * Simple redirect component for encrypted URL tokens
 * Redirects /r/:token to /invitation?token=TOKEN
 */
const EncryptedUrlRedirect = () => {
    const { urlToken } = useParams<{ urlToken: string }>();
    // Redirect to invitation page with token as query param
    return <Navigate to={`/invitation?token=${urlToken}`} replace />;
};

function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900">
            <Routes>
                {/* Encrypted URL entry point */}
                <Route path="/r/:urlToken" element={<EncryptedUrlRedirect />} />

                {/* Default route - redirect to invitation */}
                <Route path="/" element={<Navigate to="/invitation" replace />} />

                {/* Registration flow */}
                <Route path="/invitation" element={<ICVP />} />
                <Route path="/register" element={<RFP />} />
                <Route path="/oath" element={<ATIPP />} />
                <Route path="/complete" element={<ARFSP />} />

                {/* Interest submission - redirect to invitation for now */}
                <Route path="/interest" element={<Navigate to="/invitation" replace />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/invitation" replace />} />
            </Routes>
        </div>
    );
}

export default App;
