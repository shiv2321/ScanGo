import React, { useState, useRef, useContext, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { Html5Qrcode } from "html5-qrcode";

function QRScanner() {
    const { addToCart } = useContext(CartContext);
    const [error, setError] = useState(null);
    const [scannedCode, setScannedCode] = useState("");
    const scannerRef = useRef(null);
    const [scannerStarted, setScannerStarted] = useState(false);
    const processingScan = useRef(false);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            const scanner = scannerRef.current;
            if (scanner) {
                scanner.stop().then(() => {
                    if (typeof scanner.clear === 'function') {
                        return scanner.clear();
                    }
                }).then(() => {
                    console.log("Scanner resources cleared on unmount.");
                }).catch(err => {
                    console.warn("Ignoring error during cleanup (scanner might already be stopped/cleared):", err);
                }).finally(() => {
                    scannerRef.current = null;
                    console.log("Scanner ref nulled on unmount.");
                });
                
            }else {
                console.log("No scanner instance found in ref on unmount.");
            }
        };
    }, []);

    const startScanner = async () => {
        if (scannerStarted || processingScan.current ) return; // prevent multiple starts
        const readerElement = document.getElementById("qr-reader");
        if (!readerElement) {
             setError("Scanner UI element not found.");
             return;
        }
         // Clear previous content if any
         readerElement.innerHTML = ""; 

        // Initialize scanner if needed
        if (!scannerRef.current) {
             try {
                scannerRef.current = new Html5Qrcode("qr-reader", { verbose: false });
                console.log("Html5Qrcode instance initialized.");
             } catch (initErr) {
                 console.error("Failed to initialize Html5Qrcode:", initErr);
                 setError("Failed to init scanner library.");
                 return;
             }
        }

        // Reset state before attempting to start
        setError(null);
        setScannedCode("");
        processingScan.current = false; // Reset processing flag

        // Define config (kept original settings + remember camera)
        const config = {
            fps: 10,
            qrbox: { width: 300, height: 300 }, // Ensure object format if library requires
            aspectRatio: 1.0,
            rememberLastUsedCamera: true
        };

        // --- Success Callback (with Auto-Stop) ---
        const handleScanSuccess = async (decodedText) => {
             // Prevent multiple calls for the same scan
            if (processingScan.current) {
                 console.log("Ignoring scan - already processing.");
                return; 
            }
            processingScan.current = true; // Set flag immediately

            console.log(`Scan successful: ${decodedText}`);
            setScannedCode(decodedText); // Update UI
            setError(null);

            // --- Automatically Stop the Scanner ---
            const scanner = scannerRef.current;
            if (scanner) {
                try {
                     // Check state before stopping is safer
                     const state = await scanner.getState();
                     // Use numeric state if enum isn't reliable
                     if (state === 2) { // 2 = SCANNING 
                         console.log("Attempting auto-stop...");
                        await scanner.stop();
                        console.log("Scanner stopped automatically after success.");
                        setScannerStarted(false); // Update state after stop
                     } else {
                          console.log("Auto-stop skipped: Scanner not in scanning state.");
                          setScannerStarted(false); // Sync state
                     }
                } catch (err) {
                    console.error("Failed to stop scanner automatically after success.", err);
                    setError("Scan OK, but failed stopping camera.");
                    setScannerStarted(false); // Update state even on error
                }
            } else {
                 console.error("Scanner ref missing during auto-stop!");
                 setScannerStarted(false); // Assume stopped
            }
            // ------------------------------------

            // Add to cart *after* stopping attempt
            try {
                console.log("Adding to cart with QR code:", decodedText);
                await addToCart({ qr_code: decodedText });
                 // Optionally clear scanned code here if you want immediate rescan ability
                 // setScannedCode(""); 
                 // processingScan.current = false; // Allow next scan only after cart success?
            } catch (err) {
                console.error("Failed to add product via QR code:", err);
                setError("Scan OK, but failed adding to cart.");
                 setScannedCode(""); // Clear code to allow re-scan on error
                 processingScan.current = false; // Allow retry immediately on error
            } 
            // Note: processingScan remains true after successful add unless reset
        };

        // --- Failure Callback (kept original) ---
        const handleScanFailure = (errorMessage) => {
            // optional: console.log(errorMessage);
        };

        // --- Start Attempt ---
        try {
             // Get cameras and prefer 'environment' (back camera)
             const cameras = await Html5Qrcode.getCameras();
             let cameraId = null;
             if (cameras && cameras.length) {
                 const backCamera = cameras.find(camera => camera.label.toLowerCase().includes('back'));
                 cameraId = backCamera ? backCamera.id : cameras[0].id; 
             } else {
                 throw new Error("No cameras detected.");
             }

             console.log(`Starting scanner with camera: ${cameraId}`);
            await scannerRef.current.start(
                cameraId,
                config,
                handleScanSuccess, 
                handleScanFailure
            );
            setScannerStarted(true); // Set state after successful start
            console.log("Scanner started successfully.");

        } catch (err) {
            console.error("Error starting QR scanner:", err);
            setError(`Failed to start scanner: ${err.message || err.name}`);
            setScannerStarted(false); // Ensure state is false on failure
            processingScan.current = false; // Reset flag on start failure
             // Attempt cleanup if start fails
             if (scannerRef.current && typeof scannerRef.current.clear === 'function') {
                scannerRef.current.clear().catch(()=>{}); 
             }
        }
    };

    // --- Original Stop Scanner Function (for manual stop) ---
     // Added async and improved state checking
    const stopScanner = async () => {
        const scanner = scannerRef.current;
        if (!scanner) {
            console.warn("Manual stop: No Scanner instance found");
            setScannerStarted(false); // Sync state
            processingScan.current = false; // Reset processing flag
            return;
        }

        // Check if component thinks it's started
        if (scannerStarted) { 
            try {
                 // Check internal state before stopping
                 const state = await scanner.getState();
                 if (state === 2) { // 2 = SCANNING
                    console.log("Attempting manual stop...");
                    await scanner.stop();
                    console.log("Scanner stopped manually.");
                 } else {
                     console.log("Manual stop: Scanner was not internally in scanning state.");
                 }
            } catch (err) {
                console.error("Error during manual stop:", err);
                setError("Failed to stop scanner cleanly.");
            } finally {
                 // Always update state and flags after stop attempt
                setScannerStarted(false);
                processingScan.current = false; 
                // Keep scannedCode displayed after manual stop
            }
        } else {
            console.log("Manual stop: Component state was already 'stopped'.");
             // Reset flags just in case
             processingScan.current = false; 
        }
    };
    return (
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto flex flex-col items-center my-4 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Scan QR Code</h2>
            {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}

            <div id="qr-reader" 
                 className="w-full aspect-square mb-4 border border-gray-300 rounded overflow-hidden bg-gray-100" 
                 style={{ minHeight: "300px" /* Ensure minimum size */ }}>
                 {/* Optional: Add a placeholder message here if needed */}
            </div>

            {/* Simplified button logic based on original */}
            {!scannerStarted ? (
                <button
                    // Disable start button if a code was just processed successfully
                    disabled={!!scannedCode && !error} 
                    onClick={startScanner}
                    className={`w-full px-4 py-2 text-white font-semibold rounded transition ${
                        scannedCode && !error 
                        ? 'bg-gray-400 cursor-not-allowed' // Disabled look after success
                        : 'bg-indigo-600 hover:bg-indigo-700' // Normal start look
                    }`}
                >
                    {scannedCode && !error ? "Scan Successful!" : "Start Scanner"} 
                     {/* Change text after successful scan */}
                </button>
            ) : (
                <button
                    onClick={stopScanner}
                    className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition"
                >
                    Stop Scanner
                </button>
            )}

            {/* Button to allow scanning again after success or error */}
            {(!scannerStarted && (scannedCode || error)) && (
                 <button
                    onClick={() => { setScannedCode(""); setError(null); processingScan.current = false; startScanner(); }} 
                    className="w-full mt-2 px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition"
                >
                    Scan Another Product
                </button>
            )}

            {/* Display scanned code only after successful scan & stop */}
            {scannedCode && !scannerStarted && !error && (
                 <p className="mt-3 text-sm text-gray-700">
                     Last scan: <span className="font-mono text-xs break-all">{scannedCode}</span>
                 </p>
            )}
        </div>
    );
}

export default QRScanner;
    // --- Original Render Logic ---
