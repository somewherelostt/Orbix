import React, { useState } from "react";
import QRService from "../services/qrService";

export const QRTest: React.FC = () => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generateTestQR = async () => {
    setLoading(true);
    try {
      const qrData = await QRService.generateWalletConnectionQR();
      setQrCodeDataURL(qrData.qrCodeDataURL);
      setSessionId(qrData.sessionId);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateVATQR = async () => {
    setLoading(true);
    try {
      const qrData = await QRService.generateVATRefundQR(
        "VAT123456",
        "RCP001",
        100,
        20
      );
      setQrCodeDataURL(qrData.qrCodeDataURL);
      setSessionId(qrData.sessionId);
    } catch (error) {
      console.error("Failed to generate VAT QR code:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">QR Code Test</h2>

      <div className="space-y-4">
        <button
          onClick={generateTestQR}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Connection QR"}
        </button>

        <button
          onClick={generateVATQR}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate VAT QR"}
        </button>

        {qrCodeDataURL && (
          <div className="mt-4 text-center">
            <img
              src={qrCodeDataURL}
              alt="Generated QR Code"
              className="w-48 h-48 mx-auto border-2 border-gray-300 rounded-lg"
            />
            {sessionId && (
              <p className="text-sm text-gray-500 mt-2">
                Session: {sessionId.slice(-8)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
