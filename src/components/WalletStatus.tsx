import React from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { CheckCircle, AlertCircle, Copy } from "lucide-react";
import { formatAddress } from "../utils/aptos";

export const WalletStatus: React.FC = () => {
  const { connected, account, network, wallet } = useWallet();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!connected) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
        <AlertCircle className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700">Wallet not connected</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="font-medium text-green-800">
          Connected to {wallet?.name || "Petra"} Wallet
        </span>
      </div>

      {account?.address && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Address:</span>
            <div className="flex items-center space-x-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {formatAddress(account.address)}
              </code>
              <button
                onClick={() => copyToClipboard(account.address)}
                className="p-1 hover:bg-gray-200 rounded"
                title="Copy address"
              >
                <Copy className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          </div>

          {network?.name && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Network:</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {network.name}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
