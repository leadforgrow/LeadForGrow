'use client';

import { useState, useEffect } from 'react';
import LiveDialer from './LiveDialer';

export default function GlobalDialer() {
    const [activeCall, setActiveCall] = useState(null);

    useEffect(() => {
        const handleInitiateCall = (e) => {
            console.log('GlobalDialer: Initiating call', e.detail);
            setActiveCall(e.detail);
        };

        window.addEventListener('lfg-initiate-call', handleInitiateCall);
        return () => window.removeEventListener('lfg-initiate-call', handleInitiateCall);
    }, []);

    if (!activeCall) return null;

    return (
        <LiveDialer
            callData={activeCall}
            onHangup={() => {
                setActiveCall(null);
                // Dispatch event so other components know call ended if needed
                window.dispatchEvent(new CustomEvent('lfg-call-ended'));
            }}
        />
    );
}
