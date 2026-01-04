import { Routes, Route, Navigate } from 'react-router-dom';
import { ICVP } from './pages/ICVP';
import { RFP } from './pages/RFP';
import { ATIPP } from './pages/ATIPP';
import { ARFSP } from './pages/ARFSP';

function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900">
            <Routes>
                {/* Default route - redirect to invitation */}
                <Route path="/" element={<Navigate to="/invitation" replace />} />

                {/* Registration flow */}
                <Route path="/invitation" element={<ICVP />} />
                <Route path="/register" element={<RFP />} />
                <Route path="/oath" element={<ATIPP />} />
                <Route path="/complete" element={<ARFSP />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/invitation" replace />} />
            </Routes>
        </div>
    );
}

export default App;
