import {
  Aptos,
  AptosConfig,
  Network,
  Account,
  Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";

// Initialize Aptos client
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

// Contract addresses - Update these after deployment
const VAT_REFUND_ADDRESS = "0x1"; // Replace with actual deployed address

// State management for wallet connection
let connectedAccount: string | null = null;

// Mock function for demo purposes - replace with actual Petra wallet integration
export const generateMockAddress = (): string => {
  const testAddresses = ["0x1", "0x2", "0x3", "0x4", "0x5"];

  // Return a random test address
  return testAddresses[Math.floor(Math.random() * testAddresses.length)];
};

// Utility functions
export const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

export const formatAPT = (amount: number): string => {
  return amount.toFixed(6);
};

export const formatUSDC = (amount: number): string => {
  return amount.toFixed(2);
};

// Validate Aptos address
export const isValidAptosAddress = (address: string): boolean => {
  try {
    if (!address || typeof address !== "string") {
      return false;
    }

    const trimmedAddress = address.trim();

    // Aptos addresses start with 0x and are 66 characters long (including 0x)
    if (!trimmedAddress.startsWith("0x") || trimmedAddress.length !== 66) {
      return false;
    }

    // Check if the rest are valid hex characters
    const hex = trimmedAddress.slice(2);
    return /^[0-9a-fA-F]+$/.test(hex);
  } catch (error) {
    return false;
  }
};

// Connect to Petra Wallet (mock implementation)
export const connectWallet = async (): Promise<{
  address: string;
  balance: number;
}> => {
  try {
    // Mock connection - replace with actual Petra wallet integration
    const mockAddress = generateMockAddress();

    if (!mockAddress) {
      throw new Error("No accounts found");
    }

    connectedAccount = mockAddress;

    // Mock balance
    const mockBalance = Math.random() * 1000;

    return {
      address: mockAddress,
      balance: mockBalance,
    };
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    throw new Error("Failed to connect to Petra wallet. Please try again.");
  }
};

// Disconnect wallet
export const disconnectWallet = async (): Promise<void> => {
  try {
    connectedAccount = null;
    console.log("Wallet disconnected successfully");
  } catch (error) {
    console.error("Failed to disconnect wallet:", error);
    throw error;
  }
};

// Reconnect wallet (for app refresh scenarios)
export const reconnectWallet = async (): Promise<{
  address: string;
  balance: number;
} | null> => {
  try {
    if (connectedAccount) {
      return {
        address: connectedAccount,
        balance: Math.random() * 1000, // Mock balance
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to reconnect wallet:", error);
    return null;
  }
};

// Check if wallet is connected
export const isWalletConnected = (): boolean => {
  return connectedAccount !== null;
};

// Get connected account
export const getConnectedAccount = (): string | null => {
  return connectedAccount;
};

// Get account balance (mock implementation)
export const getAccountBalance = async (): Promise<{
  apt: number;
  totalCoins: number;
  assets: Array<{
    assetId: string;
    amount: number;
    name: string;
    symbol: string;
  }>;
}> => {
  try {
    if (!connectedAccount) {
      throw new Error("No wallet connected");
    }

    // Mock balance data - replace with actual Aptos balance queries
    const mockAPT = Math.random() * 100;
    const mockAssets = [
      {
        assetId: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
        amount: mockAPT,
        name: "Aptos Coin",
        symbol: "APT",
      },
      {
        assetId: "0x1::coin::CoinStore<USDC>",
        amount: Math.random() * 1000,
        name: "USD Coin",
        symbol: "USDC",
      },
    ];

    return {
      apt: mockAPT,
      totalCoins: mockAssets.length,
      assets: mockAssets,
    };
  } catch (error) {
    console.error("Failed to get account balance:", error);
    throw error;
  }
};

// Send payment using smart contract (real implementation)
export const sendPayment = async (
  recipient: string,
  amount: number,
  _token: string = "APT", // Underscore prefix to indicate unused parameter
  walletSignAndSubmitTransaction?: any
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  try {
    if (!walletSignAndSubmitTransaction) {
      throw new Error(
        "Wallet transaction function not provided. Make sure Petra wallet is connected."
      );
    }

    if (!isValidAptosAddress(recipient)) {
      throw new Error("Invalid Aptos address");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Convert amount to proper units (APT uses 8 decimals)
    const amountInOctas = Math.floor(amount * 100000000);

    // Create direct APT transfer transaction payload
    const payload = {
      type: "entry_function_payload" as const,
      function: "0x1::coin::transfer",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: [recipient, amountInOctas.toString()],
    };

    console.log("Submitting real APT transfer transaction:", payload);

    // Submit transaction using connected wallet
    const response = await walletSignAndSubmitTransaction(payload);
    console.log("Transaction submitted:", response);

    // Wait for transaction confirmation
    if (response.hash) {
      const txnDetails = await aptos.waitForTransaction({
        transactionHash: response.hash,
      });

      console.log("Transaction confirmed:", txnDetails);

      return {
        success: true,
        txHash: response.hash,
      };
    } else {
      throw new Error("No transaction hash returned");
    }
  } catch (error) {
    console.error("Payment failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Send bulk payment using smart contract (real implementation)
export const sendBulkPayment = async (
  recipients: Array<{ address: string; amount: number }>,
  token: "APT" | "USDC" = "APT",
  walletSignAndSubmitTransaction?: any
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  try {
    if (!walletSignAndSubmitTransaction) {
      throw new Error(
        "Wallet transaction function not provided. Make sure Petra wallet is connected."
      );
    }

    if (!recipients || recipients.length === 0) {
      throw new Error("No recipients provided");
    }

    // Validate all addresses and amounts
    for (const recipient of recipients) {
      if (!isValidAptosAddress(recipient.address)) {
        throw new Error(`Invalid Aptos address: ${recipient.address}`);
      }

      if (recipient.amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }
    }

    console.log(
      `Sending bulk payment to ${recipients.length} recipients using ${token}`
    );
    console.log("Recipients:", recipients);

    // For bulk payments, we'll need to submit individual transactions
    // In a real implementation, you might want to use a batch transaction or smart contract
    let lastTxHash: string = "";

    for (const recipient of recipients) {
      const amountInOctas = Math.floor(recipient.amount * 100000000);

      const payload = {
        type: "entry_function_payload" as const,
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [recipient.address, amountInOctas.toString()],
      };

      console.log(`Submitting payment to ${recipient.address}:`, payload);

      const response = await walletSignAndSubmitTransaction(payload);

      if (response.hash) {
        await aptos.waitForTransaction({
          transactionHash: response.hash,
        });
        lastTxHash = response.hash;
        console.log(
          `Payment to ${recipient.address} confirmed: ${response.hash}`
        );
      } else {
        throw new Error(
          `Failed to get transaction hash for payment to ${recipient.address}`
        );
      }

      // Small delay between transactions to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return {
      success: true,
      txHash: lastTxHash, // Return the last transaction hash
    };
  } catch (error) {
    console.error("Bulk payment failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Opt-in to asset (mock implementation for USDC)
export const optInToAsset = async (
  assetId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!connectedAccount) {
      throw new Error("Wallet not connected");
    }

    console.log(`Opting in to asset: ${assetId}`);

    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return { success: true };
  } catch (error) {
    console.error("Opt-in failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Check if opted into asset
export const isOptedInToAsset = async (_assetId: string): Promise<boolean> => {
  try {
    if (!connectedAccount) {
      return false;
    }

    // Mock check - in real implementation, query Aptos account resources
    return Math.random() > 0.5; // Random for demo
  } catch (error) {
    console.error("Failed to check opt-in status:", error);
    return false;
  }
};

// Get transaction details
export const getTransactionDetails = async (txHash: string): Promise<any> => {
  try {
    // Try to get actual transaction from Aptos
    try {
      const txnDetails = await aptos.getTransactionByHash({
        transactionHash: txHash,
      });

      // Handle different transaction response types
      if ("success" in txnDetails) {
        return {
          hash: txHash,
          success: (txnDetails as any).success || true,
          timestamp: (txnDetails as any).timestamp || Date.now(),
          gas_used: (txnDetails as any).gas_used || "100",
          gas_unit_price: (txnDetails as any).gas_unit_price || "1",
        };
      }

      return {
        hash: txHash,
        success: true,
        timestamp: Date.now(),
        gas_used: "100",
        gas_unit_price: "1",
      };
    } catch (apiError) {
      console.warn("Failed to fetch real transaction, using mock:", apiError);
      // Mock transaction details fallback
      return {
        hash: txHash,
        success: true,
        timestamp: Date.now(),
        gas_used: "100",
        gas_unit_price: "1",
      };
    }
  } catch (error) {
    console.error("Failed to get transaction details:", error);
    throw error;
  }
};

// VAT Refund specific functions

// Submit VAT refund claim using smart contract (real implementation)
export const submitVATRefund = async (
  vatRegNo: string,
  receiptNo: string,
  billAmount: number,
  vatAmount: number,
  currency: string = "APT",
  documentHash: string = "",
  walletSignAndSubmitTransaction?: any
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  try {
    if (!walletSignAndSubmitTransaction) {
      throw new Error(
        "Wallet transaction function not provided. Make sure Petra wallet is connected."
      );
    }

    if (billAmount <= 0 || vatAmount <= 0) {
      throw new Error("Bill amount and VAT amount must be greater than 0");
    }

    if (vatAmount > billAmount) {
      throw new Error("VAT amount cannot be greater than bill amount");
    }

    // Convert amounts to proper units
    const billAmountInOctas = Math.floor(billAmount * 100000000);
    const vatAmountInOctas = Math.floor(vatAmount * 100000000);

    try {
      // Use smart contract for VAT refund submission
      const payload = {
        type: "entry_function_payload" as const,
        function: `${VAT_REFUND_ADDRESS}::vat_refund::submit_vat_refund`,
        type_arguments: [],
        arguments: [
          vatRegNo,
          receiptNo,
          billAmountInOctas.toString(),
          vatAmountInOctas.toString(),
          currency,
          documentHash || `hash_${Date.now()}`,
        ],
      };

      console.log("Submitting real VAT refund transaction:", payload);

      const response = await walletSignAndSubmitTransaction(payload);
      console.log("VAT refund transaction submitted:", response);

      if (response.hash) {
        const txnDetails = await aptos.waitForTransaction({
          transactionHash: response.hash,
        });

        console.log("VAT refund transaction confirmed:", txnDetails);

        return {
          success: true,
          txHash: response.hash,
        };
      } else {
        throw new Error("No transaction hash returned");
      }
    } catch (contractError) {
      console.error("VAT refund contract call failed:", contractError);

      // If the contract isn't deployed, we can still do a direct payment as a fallback
      // This would be a direct APT transfer to represent the VAT refund
      console.log("Falling back to direct APT transfer for VAT refund");

      throw new Error(
        "VAT refund smart contract not available. Please ensure the contract is deployed."
      );
    }
  } catch (error) {
    console.error("VAT refund submission failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Get VAT refund history using smart contract
export const getVATRefundHistory = async (): Promise<
  Array<{
    id: number;
    vatRegNo: string;
    receiptNo: string;
    billAmount: number;
    vatAmount: number;
    refundAmount: number;
    status: string;
    timestamp: number;
    transactionHash: string;
  }>
> => {
  try {
    if (!connectedAccount) {
      return [];
    }

    try {
      // Use smart contract view function to get refund history
      const refunds = await aptos.view({
        payload: {
          function: `${VAT_REFUND_ADDRESS}::vat_refund::view_refund_history`,
          typeArguments: [],
          functionArguments: [connectedAccount],
        },
      });

      // Transform contract data to expected format
      return ((refunds[0] as any[]) || []).map((refund: any) => ({
        id: parseInt(refund.id),
        vatRegNo: refund.vat_reg_no,
        receiptNo: refund.receipt_no,
        billAmount: parseInt(refund.bill_amount) / 100000000,
        vatAmount: parseInt(refund.vat_amount) / 100000000,
        refundAmount: parseInt(refund.refund_amount) / 100000000,
        status: refund.status,
        timestamp: parseInt(refund.timestamp),
        transactionHash: refund.transaction_hash,
      }));
    } catch (contractError) {
      console.warn(
        "Failed to fetch VAT refund history from contract, using mock:",
        contractError
      );

      // Mock VAT refund history
      return [
        {
          id: 1,
          vatRegNo: "VAT123456",
          receiptNo: "INV001",
          billAmount: 100,
          vatAmount: 20,
          refundAmount: 20,
          status: "completed",
          timestamp: Date.now() - 86400000, // 1 day ago
          transactionHash: "0xabc123...",
        },
        {
          id: 2,
          vatRegNo: "VAT789012",
          receiptNo: "INV002",
          billAmount: 250,
          vatAmount: 50,
          refundAmount: 50,
          status: "pending",
          timestamp: Date.now() - 172800000, // 2 days ago
          transactionHash: "",
        },
      ];
    }
  } catch (error) {
    console.error("Failed to get VAT refund history:", error);
    return [];
  }
};

// Calculate VAT amount from bill amount
export const calculateVATAmount = (
  billAmount: number,
  vatRate: number = 20
): number => {
  return (billAmount * vatRate) / (100 + vatRate);
};

export default aptos;
