import { useTonAddress } from "@tonconnect/ui-react";
import { useEffect, useState } from "react";

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
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
          </svg>
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
                  <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="text-lg font-medium text-white">{balance} TON</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-3">
              <svg className="w-8 h-8 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
              </svg>
              <p className="text-gray-400">Please connect your wallet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Address;
