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
const PAYMENT_PROCESSOR_ADDRESS = "0x1"; // Replace with actual deployed address
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

// Send payment using smart contract (updated implementation)
export const sendPayment = async (
  recipient: string,
  amount: number,
  token: string = "APT"
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  try {
    if (!connectedAccount) {
      throw new Error("Wallet not connected");
    }

    if (!isValidAptosAddress(recipient)) {
      throw new Error("Invalid Aptos address");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Convert amount to proper units (APT uses 8 decimals)
    const amountInOctas = Math.floor(amount * 100000000);

    try {
      // Try to use smart contract for payment tracking
      const payload = {
        type: "entry_function_payload",
        function: `${PAYMENT_PROCESSOR_ADDRESS}::payment_processor::process_payment`,
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [
          recipient,
          amountInOctas.toString(),
          token,
          "direct_payment",
          "manual_payment",
        ],
      };

      // For now, simulate the transaction since we need proper wallet integration
      console.log("Would submit transaction:", payload);

      // Mock transaction hash until proper wallet integration
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;

      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        success: true,
        txHash: mockTxHash,
      };
    } catch (contractError) {
      console.warn(
        "Contract call failed, falling back to direct transfer:",
        contractError
      );

      // Fallback to direct transfer
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        success: true,
        txHash: mockTxHash,
      };
    }
  } catch (error) {
    console.error("Payment failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Send bulk payment using smart contract (updated implementation)
export const sendBulkPayment = async (
  recipients: Array<{ address: string; amount: number }>,
  token: "APT" | "USDC" = "APT"
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  try {
    if (!connectedAccount) {
      throw new Error("Wallet not connected");
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

    // Prepare data for smart contract
    const addresses = recipients.map((r) => r.address);
    const amounts = recipients.map((r) => Math.floor(r.amount * 100000000)); // Convert to octas

    try {
      // Try to use smart contract for bulk payment
      const payload = {
        type: "entry_function_payload",
        function: `${PAYMENT_PROCESSOR_ADDRESS}::payment_processor::process_bulk_payment`,
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [addresses, amounts.map((a) => a.toString()), token],
      };

      console.log("Would submit bulk payment transaction:", payload);

      // Mock transaction hash until proper wallet integration
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;

      console.log(
        `Sending bulk payment to ${recipients.length} recipients using ${token}`
      );
      console.log("Recipients:", recipients);

      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        success: true,
        txHash: mockTxHash,
      };
    } catch (contractError) {
      console.warn(
        "Bulk contract call failed, falling back to individual transfers:",
        contractError
      );

      // Fallback to mock individual transfers
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        success: true,
        txHash: mockTxHash,
      };
    }
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

// Submit VAT refund claim using smart contract
export const submitVATRefund = async (
  vatRegNo: string,
  receiptNo: string,
  billAmount: number,
  vatAmount: number,
  currency: string = "APT",
  documentHash: string = ""
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  try {
    if (!connectedAccount) {
      throw new Error("Wallet not connected");
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
        type: "entry_function_payload",
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

      console.log("Would submit VAT refund transaction:", payload);

      // Mock transaction hash until proper wallet integration
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;

      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        success: true,
        txHash: mockTxHash,
      };
    } catch (contractError) {
      console.warn("VAT refund contract call failed:", contractError);
      return {
        success: false,
        error: "Failed to submit VAT refund claim",
      };
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
