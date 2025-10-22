import React, { useState, useRef, useContext, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { Html5Qrcode } from "html5-qrcode";

function QRScanner() {
    const { addToCart } = useContext(CartContext);
    const [error, setError] = useState(null);
    const [scannedCode, setScannedCode] = useState("");
    const scannerRef = useRef(null);
    const [scannerStarted, setScannerStarted] = useState(false);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (scannerRef.current && scannerStarted) {
                scannerRef.current.stop().catch(() => {});
            }
        };
    }, [scannerStarted]);

    const startScanner = () => {
        if (scannerStarted) return; // prevent multiple starts

        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        html5QrCode.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: 300,
                aspectRatio: 1.0
            },
            async (decodedText) => {
                setScannedCode(decodedText);
                try {
                    console.log("Whats in decodedtext: ",decodedText);
                    await addToCart({ qr_code: decodedText });
                } catch (err) {
                    console.error(err);
                    setError("Failed to add product");
                }
            },
            (errorMessage) => {
                // optional: console.log(errorMessage);
            }
        ).then(() => setScannerStarted(true))
         .catch((err) => {
            console.error("QR start error:", err);
            setError("Unable to start scanner");
        });
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>
            {error && <p className="text-red-500">{error}</p>}

            <div id="qr-reader" style={{ width: "40vw", maxWidth: "40vw", height:"400px", margin:"auto" }}></div>
            {!scannerStarted && (
                <button
                    onClick={startScanner}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Start Scanner
                </button>
            )}

            {scannedCode && <p className="mt-2">Scanned Code: {scannedCode}</p>}
        </div>
    );
}

export default QRScanner;
