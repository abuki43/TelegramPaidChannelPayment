import { useTonAddress } from "@tonconnect/ui-react";
import { useEffect, useState } from "react";
import { FaWallet, FaCoins, FaLink } from 'react-icons/fa';

const Address = () => {
  const userFriendlyAddress = useTonAddress();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (userFriendlyAddress) {
      fetch(
        `https://toncenter.com/api/v2/getAddressInformation?address=${userFriendlyAddress}`
      )
        .then((res) => res.json())
        .then((res) =>
          setBalance((parseFloat(res?.result.balance) / 1e9).toFixed(4))
        )
        .catch((err) => console.log(err));
    }
  }, [userFriendlyAddress]);

  return (
    <div className="bg-gray-800/80 rounded-xl shadow-lg border border-blue-500/20 overflow-hidden transition-all duration-300 hover:shadow-blue-500/10 hover:border-blue-500/40 h-full">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
          <FaWallet className="w-5 h-5 mr-2" />
          Wallet Information
        </h2>
        
        <div className="rounded-lg bg-gray-900/50 p-4">
          {userFriendlyAddress ? (
            <div className="space-y-3">
              {/* <div className="flex items-center space-x-2 text-sm break-all">
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
                </svg>
                <span className="text-gray-400">{userFriendlyAddress}</span>
              </div> */}
              
              <div className="flex items-center justify-center">
                <div className="bg-blue-900/40 px-5 py-3 rounded-lg flex items-center">
                  <FaCoins className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-lg font-medium text-white">{balance} TON</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-3">
              <FaLink className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-gray-400">Please connect your wallet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Address;
