import QRCode from "qrcode";

export interface WalletConnectSession {
  uri: string;
  sessionId: string;
  expiry: number;
  metadata?: any;
  requiredNamespaces?: any;
  transactionData?: any;
}

export class QRService {
  private static instance: QRService;
  private currentSession: WalletConnectSession | null = null;

  static getInstance(): QRService {
    if (!QRService.instance) {
      QRService.instance = new QRService();
    }
    return QRService.instance;
  }

  // Generate a proper WalletConnect v2 URI for Petra wallet
  generateWalletConnectURI(transactionData?: {
    function: string;
    arguments: any[];
    type_arguments?: string[];
  }): WalletConnectSession {
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    const key = this.generateKey();

    // WalletConnect v2 URI format
    const topic = this.generateSessionId();
    const symKey = key;

    // Base WalletConnect v2 URI
    let uri = `wc:${topic}@2`;
    uri += `?relay-protocol=irn`;
    uri += `&symKey=${symKey}`;

    // Add Aptos-specific metadata
    const metadata = {
      name: "Orbix VAT Refund",
      description: "Process VAT refunds on Aptos blockchain",
      url: window.location.origin,
      icons: [`${window.location.origin}/favicon.ico`],
      redirect: {
        native: "orbix://",
        universal: window.location.origin,
      },
    };

    // For Petra wallet, we need to include Aptos chain info
    const requiredNamespaces = {
      aptos: {
        methods: [
          "aptos_connect",
          "aptos_account",
          "aptos_signAndSubmitTransaction",
          "aptos_signMessage",
        ],
        chains: ["aptos:1"], // Aptos mainnet, use 'aptos:2' for testnet
        events: ["accountsChanged", "chainChanged"],
      },
    };

    // If we have transaction data, encode it for later use
    if (transactionData) {
      const encodedTxData = encodeURIComponent(JSON.stringify(transactionData));
      uri += `&txData=${encodedTxData}`;
    }

    // Store metadata and namespaces for the session
    this.currentSession = {
      uri,
      sessionId: topic,
      expiry,
      metadata,
      requiredNamespaces,
      transactionData,
    };

    return this.currentSession;
  }

  // Generate QR code as data URL
  async generateQRCodeDataURL(uri: string): Promise<string> {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(uri, {
        width: 256,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw new Error("Failed to generate QR code");
    }
  }

  // Generate a session for VAT refund transaction
  async generateVATRefundQR(
    vatRegNo: string,
    receiptNo: string,
    billAmount: number,
    vatAmount: number
  ): Promise<{ uri: string; qrCodeDataURL: string; sessionId: string }> {
    try {
      // Create transaction payload for VAT refund
      const transactionData = {
        function: "0x1::vat_refund::submit_vat_refund",
        arguments: [
          vatRegNo,
          receiptNo,
          (billAmount * 100000000).toString(), // Convert to octas
          (vatAmount * 100000000).toString(),
          "APT",
          `hash_${Date.now()}`,
        ],
        type_arguments: [],
      };

      const session = this.generateWalletConnectURI(transactionData);
      const qrCodeDataURL = await this.generateQRCodeDataURL(session.uri);

      return {
        uri: session.uri,
        qrCodeDataURL,
        sessionId: session.sessionId,
      };
    } catch (error) {
      console.error("Error generating VAT refund QR code:", error);
      throw error;
    }
  }

  // Generate a session for simple wallet connection
  async generateWalletConnectionQR(): Promise<{
    uri: string;
    qrCodeDataURL: string;
    sessionId: string;
  }> {
    try {
      const session = this.generateWalletConnectURI();
      const qrCodeDataURL = await this.generateQRCodeDataURL(session.uri);

      return {
        uri: session.uri,
        qrCodeDataURL,
        sessionId: session.sessionId,
      };
    } catch (error) {
      console.error("Error generating wallet connection QR code:", error);
      throw error;
    }
  }

  // Generate a session for payment transaction
  async generatePaymentQR(
    recipient: string,
    amount: number,
    _token: string = "APT" // underscore to indicate unused parameter
  ): Promise<{ uri: string; qrCodeDataURL: string; sessionId: string }> {
    try {
      const transactionData = {
        function: "0x1::coin::transfer",
        arguments: [
          recipient,
          (amount * 100000000).toString(), // Convert to octas
        ],
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
      };

      const session = this.generateWalletConnectURI(transactionData);
      const qrCodeDataURL = await this.generateQRCodeDataURL(session.uri);

      return {
        uri: session.uri,
        qrCodeDataURL,
        sessionId: session.sessionId,
      };
    } catch (error) {
      console.error("Error generating payment QR code:", error);
      throw error;
    }
  }

  // Check if current session is valid
  isSessionValid(): boolean {
    if (!this.currentSession) return false;
    return Date.now() < this.currentSession.expiry;
  }

  // Get current session
  getCurrentSession(): WalletConnectSession | null {
    if (!this.isSessionValid()) {
      this.currentSession = null;
    }
    return this.currentSession;
  }

  // Clear current session
  clearSession(): void {
    this.currentSession = null;
  }

  // Generate a random session ID
  private generateSessionId(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate a random key for WalletConnect
  private generateKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  // Simulate listening for wallet response (in a real app, this would be handled by WalletConnect)
  async waitForWalletResponse(
    sessionId: string,
    timeout: number = 300000
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkForResponse = () => {
        // In a real implementation, this would check with WalletConnect bridge
        // For now, we'll simulate a response after some time
        if (Date.now() - startTime > timeout) {
          reject(new Error("Wallet response timeout"));
          return;
        }

        // Simulate random response for demo
        if (Math.random() > 0.7) {
          // 30% chance of "response" each check
          resolve({
            sessionId,
            method: "aptos_signAndSubmitTransaction",
            result: {
              hash: `0x${this.generateKey().substring(0, 64)}`,
              success: true,
            },
          });
        } else {
          setTimeout(checkForResponse, 2000);
        }
      };

      setTimeout(checkForResponse, 2000);
    });
  }
}

export default QRService.getInstance();
