import React, { useState, useRef, useContext, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { Html5Qrcode } from "html5-qrcode";

function QRScanner() {
    const { addToCart } = useContext(CartContext);

    const scannerRef = useRef(null);          // scanner instance
    const isRunningRef = useRef(false);       // track scanner running state
    const processingScan = useRef(false);     // prevent double processing

    const [scannerStarted, setScannerStarted] = useState(false);
    const [error, setError] = useState(null);
    const [scannedCode, setScannedCode] = useState("");

    // ------------ CLEANUP ON UNMOUNT ------------
    useEffect(() => {
        return () => {
            if (scannerRef.current && isRunningRef.current) {
                scannerRef.current
                    .stop()
                    .catch(() => {})
                    .finally(() => {
                        scannerRef.current = null;
                        isRunningRef.current = false;
                    });
            }
        };
    }, []);

    // ------------ START SCANNER ------------
    const startScanner = async () => {
        if (scannerStarted || isRunningRef.current) return;

        const readerEl = document.getElementById("qr-reader");
        readerEl.innerHTML = ""; // reset UI

        // Create instance if missing
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode("qr-reader");
        }

        setError(null);
        processingScan.current = false;
        setScannedCode("");

        let cameras = [];
        try {
            cameras = await Html5Qrcode.getCameras();
        } catch (err) {
            setError("No cameras found.");
            return;
        }

        const backCamera =
            cameras.find((c) => c.label.toLowerCase().includes("back")) || cameras[0];

        const config = { fps: 10, qrbox: 250 };

        const handleSuccess = async (decodedText) => {
            if (processingScan.current) return;
            processingScan.current = true;

            setScannedCode(decodedText);

            // Auto-stop safely
            if (scannerRef.current && isRunningRef.current) {
                try {
                    await scannerRef.current.stop();
                } catch {}
            }

            isRunningRef.current = false;
            setScannerStarted(false);

            // Add to cart
            try {
                await addToCart({ qr_code: decodedText });
            } catch {
                setError("Failed to add product to cart.");
            }
        };

        const handleFailure = () => {}; // ignore scan failures

        try {
            await scannerRef.current.start(
                backCamera.id,
                config,
                handleSuccess,
                handleFailure
            );

            isRunningRef.current = true;
            setScannerStarted(true);
        } catch (err) {
            setError("Failed to start scanner.");
            isRunningRef.current = false;
        }
    };

    // ------------ STOP SCANNER (BUTTON) ------------
    const stopScanner = async () => {
        if (!scannerRef.current || !isRunningRef.current) return;

        try {
            await scannerRef.current.stop();
        } catch {}

        isRunningRef.current = false;
        setScannerStarted(false);
        processingScan.current = false;
    };

    // -------------------------------------------------------------
    return (
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto flex flex-col items-center my-4 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Scan QR Code</h2>
            {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}

            <div
                id="qr-reader"
                className="w-full aspect-square mb-4 border border-gray-300 rounded overflow-hidden bg-gray-100"
                style={{ minHeight: "300px" }}
            ></div>

            {!scannerStarted ? (
                <button
                    onClick={startScanner}
                    className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700"
                >
                    Start Scanner
                </button>
            ) : (
                <button
                    onClick={stopScanner}
                    className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
                >
                    Stop Scanner
                </button>
            )}

            {scannedCode && !scannerStarted && (
                <button
                    onClick={startScanner}
                    className="w-full mt-2 px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
                >
                    Scan Another Product
                </button>
            )}

            {scannedCode && !scannerStarted && (
                <p className="mt-3 text-sm text-gray-700">
                    Last scan: <span className="font-mono">{scannedCode}</span>
                </p>
            )}
        </div>
    );
}

export default QRScanner;
