import React from "react";
import QRScanner from "../components/QrScannerComp";

function ScanPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <QRScanner />
        </div>
    );
}

export default ScanPage;