import React, { useState } from "react";
import {
  Upload,
  FileCheck,
  QrCode,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  connectWallet as aptosConnectWallet,
  getConnectedAccount,
} from "../utils/aptos";
import QRService from "../services/qrService";
import { PetraWalletGuide } from "./PetraWalletGuide";

interface VATRefundSectionProps {
  refreshKey?: number;
}

export const VATRefundSection: React.FC<VATRefundSectionProps> = ({
  refreshKey = 0, // underscore to indicate usage in effect dependency
}) => {
  const [step, setStep] = useState<
    "upload" | "review" | "sign" | "confirmation" | "error"
  >("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [qrValue, setQrValue] = useState<string>("");
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [showGuide, setShowGuide] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Simulate VAT calculation based on file - limited to 0.01 maximum
      setRefundAmount(0.01);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Simulate document processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("review");
    } catch (error) {
      setErrorMessage("Failed to process document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      // Generate real QR code for VAT refund transaction
      const vatRegNo = "VAT123456"; // This would come from user input or form
      const receiptNo = selectedFile?.name.split(".")[0] || `RCP${Date.now()}`;
      const vatAmount = refundAmount * 0.2; // Assume 20% VAT rate

      const qrData = await QRService.generateVATRefundQR(
        vatRegNo,
        receiptNo,
        refundAmount,
        vatAmount
      );

      setQrValue(qrData.uri);
      setQrCodeDataURL(qrData.qrCodeDataURL);
      setSessionId(qrData.sessionId);
      setStep("sign");
    } catch (error) {
      setErrorMessage("Failed to generate QR code. Please try again.");
      console.error("QR generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async () => {
    setIsLoading(true);
    try {
      // Check if we have a valid session
      if (!sessionId || !QRService.isSessionValid()) {
        throw new Error(
          "QR code session has expired. Please generate a new one."
        );
      }

      // In a real implementation, you would wait for the wallet response
      // For now, we'll simulate the process
      try {
        // Wait for wallet response (this would be handled by WalletConnect in production)
        const response = await QRService.waitForWalletResponse(
          sessionId,
          30000
        ); // 30 second timeout

        if (response.result.success) {
          setStep("confirmation");
        } else {
          throw new Error("Transaction was rejected by the wallet");
        }
      } catch (timeoutError) {
        // Fallback to direct wallet connection if QR scanning times out
        if (!getConnectedAccount()) {
          await aptosConnectWallet();
        }

        // Simulate transaction signing with connected wallet
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setStep("confirmation");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to complete transaction"
      );
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setSelectedFile(null);
    setErrorMessage(null);
    setQrValue("");
    setQrCodeDataURL("");
    setSessionId("");
    QRService.clearSession();
  };

  const renderStep = () => {
    switch (step) {
      case "upload":
        return (
          <div className="space-y-4">
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-gray-700 mb-2">
                Upload your VAT receipt document
              </p>
              <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm">
                Select File
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </label>
              {selectedFile && (
                <div className="mt-3 flex items-center text-sm text-gray-600">
                  <FileCheck className="w-4 h-4 mr-1" />
                  {selectedFile.name}
                </div>
              )}
            </div>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isLoading}
              className={`w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm ${
                !selectedFile || isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isLoading ? "Processing..." : "Upload Document"}
            </button>
          </div>
        );

      case "review":
        return (
          <div className="space-y-4">
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                VAT Refund Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Document:</span>
                  <span className="text-gray-900 font-medium">
                    {selectedFile?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT Amount:</span>
                  <span className="text-gray-900 font-medium">
                    ${refundAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="text-gray-900 font-medium">$5.00</span>
                </div>
                <div className="border-t border-gray-200 my-2 pt-2 flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">
                    Total Refund:
                  </span>
                  <span className="text-green-600 font-bold">
                    ${(refundAmount - 5).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className={`w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Processing..." : "Approve & Continue"}
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
            >
              Cancel
            </button>
          </div>
        );

      case "sign":
        return (
          <div className="space-y-4">
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center">
              <div className="flex items-center justify-between w-full mb-2">
                <QrCode className="w-8 h-8 text-blue-500" />
                <button
                  onClick={() => setShowGuide(true)}
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                >
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Help
                </button>
              </div>
              <p className="text-sm text-gray-700 mb-3 text-center">
                Scan with Petra Wallet Mobile App
              </p>
              <div className="bg-white p-2 rounded-lg flex items-center justify-center">
                <div className="border-2 border-gray-300 rounded-lg p-4 w-[200px] h-[200px] flex items-center justify-center">
                  {qrCodeDataURL ? (
                    <img
                      src={qrCodeDataURL}
                      alt="WalletConnect QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <QrCode className="w-12 h-12 mx-auto mb-2 text-gray-700" />
                      <div className="text-xs text-gray-600">
                        Generating QR Code...
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center mt-3 space-y-2">
                <p className="text-xs text-gray-600 font-medium">
                  Quick Instructions:
                </p>
                <ol className="text-xs text-gray-500 text-left space-y-1">
                  <li>1. Open Petra Wallet mobile app</li>
                  <li>2. Look for WalletConnect or scan option</li>
                  <li>3. Scan the QR code above</li>
                  <li>4. Approve connection & sign transaction</li>
                </ol>
                {sessionId && (
                  <p className="text-xs text-gray-400 mt-1">
                    Session: {sessionId.slice(-8)}
                  </p>
                )}
                {/* Debug info - remove in production */}
                {qrValue && (
                  <details className="mt-2">
                    <summary className="text-xs text-blue-500 cursor-pointer">
                      Debug: Show URI (tap to expand)
                    </summary>
                    <div className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded border break-all">
                      {qrValue}
                    </div>
                  </details>
                )}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-800 text-sm mb-2">
                Transaction Details
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-700">VAT Refund:</span>
                  <span className="font-medium text-blue-900">
                    ${(refundAmount - 5).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-700">Processing Fee:</span>
                  <span className="font-medium text-blue-900">$5.00</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-700">Network:</span>
                  <span className="font-medium text-blue-900">
                    Aptos Testnet
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSign}
              disabled={isLoading}
              className={`w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Waiting for Wallet..." : "I've Connected & Signed"}
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
            >
              Cancel
            </button>

            {/* Help Guide Modal */}
            {showGuide && (
              <PetraWalletGuide onClose={() => setShowGuide(false)} />
            )}
          </div>
        );

      case "confirmation":
        return (
          <div className="space-y-4">
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">
                VAT Refund Submitted
              </h4>
              <p className="text-sm text-gray-600 text-center mb-3">
                Your VAT refund request has been successfully submitted
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-3 w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Refund Amount:</span>
                  <span className="text-gray-900 font-medium">
                    ${(refundAmount - 5).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expected Date:</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(
                      Date.now() + 7 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
            >
              Submit Another Refund
            </button>
          </div>
        );

      case "error":
        return (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Error</h4>
              <p className="text-sm text-gray-600 text-center">
                {errorMessage ||
                  "An unexpected error occurred. Please try again."}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
            >
              Try Again
            </button>
          </div>
        );
    }
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          VAT Refund
        </h3>
      </div>
      {renderStep()}
    </div>
  );
};
