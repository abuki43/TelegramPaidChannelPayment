import { useEffect, useState } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { FaExclamationTriangle } from 'react-icons/fa';
import Header from "./components/header";
import Address from "./components/Address";
import Payment from "./components/Payment";
import Welcome from "./components/Welcome";
import api from "./api";



function App() {
  const [telegramUser, setTelegramUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    const initializeTelegram = async () => {
      try {
        const tg = window.Telegram?.WebApp;
        if (!tg) {
          throw new Error("Telegram WebApp not available");
        }
        
        await tg.ready();
        const initDataString = tg.initData;
        
        if (initDataString) {
          const urlParams = new URLSearchParams(initDataString);
          const user = JSON.parse(urlParams.get('user') || '{}');
          if (user?.id) {
            setTelegramUser(user);
          }
        }

        

      } catch (error) {
        console.error('Telegram initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeTelegram();

    // setTelegramUser({id:"12345678"})

  }, []);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-xl text-blue-400 font-medium">Loading...</p>
        </div>
      </main>
    );
  }

   

  if (!telegramUser) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-900 to-black">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-blue-500/30 max-w-md text-center">
          <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-xl text-gray-200 font-medium">Please open this app within Telegram</p>
        </div>
      </main>
    );
  }

  return (
    <TonConnectUIProvider manifestUrl="https://telegrampaidchannelpayment.onrender.com/tonconnect-manifest.json" network="testnet">
      <div className="min-h-screen bg-gradient-radial from-blue-950 to-gray-950 text-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex justify-end mb-8">
            <Header />
          </header>
          <main className="flex flex-col items-center">
            <Welcome user={telegramUser} />
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <section className="w-full">
                <Address />
              </section>
              <section className="w-full">
                <Payment user={telegramUser} />
              </section>
            </div>
          </main>
        </div>
      </div>
    </TonConnectUIProvider>
  );
}

export default App;
