import React from "react";
import QRScanner from "../components/QrScannerComp";

function ScanPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <QRScanner />
            </div>
        </div>
    );
}

export default ScanPage;