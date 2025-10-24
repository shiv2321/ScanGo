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
            const scanner = scannerRef.current;
            if (scanner && scanner.isScanning) {
                scanner.stop().catch(() => {});
                scanner.clear().catch(() => {});
            }
        };
    }, []);

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
    const stopScanner = async () => {
        const scanner = scannerRef.current;
        if (!scanner) {
            console.warn("No Scanner instance found");
            return;
        }
        try{
            if(scanner.isScanning) {
                console.log("Stopping Scanner..");
                await scanner.stop();
                await scanner.clear();
                console.log("Scanner stopped");
            }else {
                console.log("Scanner is not running.");
            }
        }catch (err) {
            console.error("Error while stopping scanner:", err);
        }finally {
            setScannerStarted(false);
            setScannedCode("");
        }
    };
    return (
        <div className="bg-white p-6 rounded-xl shadow-md w-full flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>
            {error && <p className="text-red-500">{error}</p>}

            <div id="qr-reader" 
            className="w-full h-96 mb-4" 
            style={{ maxWidth: "400px" }}></div>
            {!scannerStarted ? (
                <button
                    onClick={startScanner}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    Start Scanner
                </button>
            ) : (
                    <button
                        onClick={stopScanner}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                    Stop Scanner
                    </button>
                )
        }

            {scannedCode && <p className="mt-2">Scanned Code: {scannedCode}</p>}
        </div>
    );
}

export default QRScanner;
