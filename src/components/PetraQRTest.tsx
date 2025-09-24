import React, { useState } from "react";
import QRService from "../services/qrService";

export const PetraQRTest: React.FC = () => {
  const [qrData, setQrData] = useState<{
    uri: string;
    qrCodeDataURL: string;
    sessionId: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateTestQR = async () => {
    setIsLoading(true);
    try {
      const result = await QRService.generateVATRefundQR(
        "VAT123456",
        "RECEIPT001",
        100,
        20
      );
      setQrData(result);

      // Log the URI to console so you can check it
      console.log("Generated Petra URI:", result.uri);
    } catch (error) {
      console.error("Failed to generate QR:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateConnectionQR = async () => {
    setIsLoading(true);
    try {
      const result = await QRService.generateWalletConnectionQR();
      setQrData(result);

      // Log the URI to console so you can check it
      console.log("Generated Petra Connection URI:", result.uri);
    } catch (error) {
      console.error("Failed to generate connection QR:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Petra QR Code Test</h2>

      <div className="space-y-4">
        <button
          onClick={generateTestQR}
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {isLoading ? "Generating..." : "Generate VAT Refund QR"}
        </button>

        <button
          onClick={generateConnectionQR}
          disabled={isLoading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {isLoading ? "Generating..." : "Generate Connection QR"}
        </button>

        {qrData && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Generated QR Code:</h3>

            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="mb-4">
                <img
                  src={qrData.qrCodeDataURL}
                  alt="Petra Wallet QR Code"
                  className="mx-auto max-w-[200px] max-h-[200px]"
                />
              </div>

              <div className="text-xs text-gray-600 break-all">
                <strong>URI:</strong> {qrData.uri}
              </div>

              <div className="text-xs text-gray-500 mt-2">
                <strong>Session ID:</strong> {qrData.sessionId}
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Test Instructions:</strong>
              </p>
              <ol className="text-sm text-yellow-700 list-decimal list-inside mt-1">
                <li>Install Petra mobile wallet on your phone</li>
                <li>Scan this QR code with your phone's camera</li>
                <li>
                  It should open Petra wallet (not Lobstr or other wallets)
                </li>
                <li>Check the console for the generated URI format</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetraQRTest;
