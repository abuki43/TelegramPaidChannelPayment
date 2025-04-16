import { useTonConnectUI,useTonAddress } from "@tonconnect/ui-react";
import { useState, useEffect } from "react";
import api from "../api";
import { beginCell } from "@ton/core"; 
import { FaCheckCircle, FaCreditCard, FaExclamationTriangle, FaCoins, FaBolt, FaLink } from 'react-icons/fa';


const Payment = ({ user }) => {
   const userFriendlyAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [userStatus, setUserStatus] = useState(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const status = await api.getUserStatus(user?.id);
        setUserStatus(status);
        if (status?.subscription?.isActive) {
          setPaymentStatus("success");
        }
      } catch (error) {
        console.error("Error checking user status:", error);
      }
    };
    checkUserStatus();
  }, [user?.id]);

  

  const handlePayment = async () => {
    if (!tonConnectUI.connected) {
      await tonConnectUI.openModal();
      return;
    }

    setPaymentStatus("pending");
    const recipientAddress = import.meta.env.VITE_TON_WALLET_ADDRESS || "0QBbRPzN2_uDUdfrzQGK1PBiXSydqMmmjuMvSKgcnruqkR1K" 
    const amountNano = import.meta.env.VITE_TON_AMOUNT || "1000000"; 

    const transactionId = `sub_${Date.now()}`;
    const commentCell = beginCell()
    .storeUint(0, 32) // 0x00000000 prefix for comment
    .storeStringTail(`subscription:${transactionId}`) // Store the string
    .endCell();

    console.log(commentCell.toBoc().toString('base64'))

    const tx = {
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages: [{
        address: recipientAddress,
        amount: amountNano,
        payload: commentCell.toBoc().toString('base64') // Convert cell to base64
      }],
    };

    try {
      const result = await tonConnectUI.sendTransaction(tx);
      if (result) {
        const verification = await api.verifyPayment(user?.id, transactionId, 0.01);
        if (verification.success) {
          setPaymentStatus("success");
          setUserStatus(verification.user);
          window.Telegram.WebApp.MainButton.hide();
        } else {
          setPaymentStatus("error");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("error");
    }
  };

  if(!user){
    <div>
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-xl">Could not find error!</p>
      </main>
    </div>
  }

  if (paymentStatus === "success" && userStatus?.subscription?.isActive) {
    const expiry = new Date(userStatus.subscription.expirationDate);
    return (
      <div className="bg-gray-800/80 rounded-xl shadow-lg border border-blue-500/20 overflow-hidden transition-all duration-300 hover:shadow-blue-500/10 hover:border-blue-500/40 h-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
            <FaCheckCircle className="w-5 h-5 mr-2" />
            Subscription Status
          </h2>
          
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4 text-center">
            <FaCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-lg text-green-400 font-medium mb-1">
              Subscribed until {expiry.toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-400 mb-4">Your premium access is active</p>
            
            <button 
              onClick={handlePayment}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg"
            >
              Extend Subscription
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/80 rounded-xl shadow-lg border border-blue-500/20 overflow-hidden transition-all duration-300 hover:shadow-blue-500/10 hover:border-blue-500/40 h-full">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
          <FaCreditCard className="w-5 h-5 mr-2" />
          Payment
        </h2>
        
        <div className="rounded-lg bg-gray-900/50 p-6 text-center">
          {paymentStatus === "pending" ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-blue-300 text-lg">Processing your payment...</p>
            </div>
          ) : paymentStatus === "error" ? (
            <div className="space-y-4">
              <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto" />
              <p className="text-red-400 text-lg font-medium">Payment failed</p>
              <p className="text-gray-400 mb-4">If you think there is a problem contact the admins.</p>
              <button 
                onClick={handlePayment}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center items-center mb-2">
                <div className="bg-blue-900/30 px-4 py-2 rounded-lg inline-flex items-center">
                  <FaCoins className="w-6 h-6 text-blue-400 mr-2" />
                  <span className="text-lg font-medium text-white">0.01 TON for membership</span>
                </div>
              </div>
              <button 
                onClick={handlePayment}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg w-full"
              >
                {userFriendlyAddress ? (
                  <span className="flex items-center justify-center">
                    <FaBolt className="w-5 h-5 mr-2" />
                    Pay Now
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <FaLink className="w-5 h-5 mr-2" />
                    Connect Wallet
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default Payment;