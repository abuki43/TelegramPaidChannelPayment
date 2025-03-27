import { TonConnectButton } from "@tonconnect/ui-react";

const Header = () => {
  return (
    <div className="flex justify-end w-full">
      <div className="z-10 relative transform hover:scale-105 transition-transform duration-200">
        <TonConnectButton />
      </div>
    </div>
  );
};

export default Header;
