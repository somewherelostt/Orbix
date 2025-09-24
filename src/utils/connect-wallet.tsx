import { Wallet, LogOut } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "../ui";

export default function ConnectButton() {
  const { connect, disconnect, connected, account } = useWallet();

  const handleConnect = async () => {
    try {
      if (!connected) {
        await connect("Petra" as any);
      } else {
        await disconnect();
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  if (connected && account) {
    return (
      <Button
        onClick={handleConnect}
        size="large"
        variant="destructive-primary"
        icon={<LogOut size={16} />}
        className="px-4 py-2 shadow-lg bg-[#262626] hover:bg-[#1a1a1a] transition-all duration-300"
      >
        Disconnect
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      size="large"
      variant="destructive-primary"
      icon={<Wallet size={16} />}
      className="px-4 py-2 shadow-lg bg-[#262626] hover:bg-[#1a1a1a] transition-all duration-300"
    >
      Connect Petra
    </Button>
  );
}
