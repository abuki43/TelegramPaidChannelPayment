import React, { useState, useEffect } from 'react'
import api from "../api";

function Welcome({ user }) {
  const [userFromDb, setUserFromDb] = useState(null)
  const [userStatus, setUserStatus] = useState(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const user = await api.getUserStatus();
        setUserFromDb(user);
        if (user?.subscription?.isActive) {
          setUserStatus(true);
        }
      } catch (error) {
        console.error("Error checking user status:", error);
      }
    };
    checkUserStatus();
  }, []);

  return (
    <section className="w-full max-w-3xl mx-auto text-center mb-12">
      <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-6 drop-shadow-lg">
        Welcome to Our Premium Channel
      </h1>
      
      {user && (
        <p className="text-xl text-blue-300 font-medium mb-4">
          Hello, <span className="font-bold">{user.first_name || user.username || `Unknown`}</span>!
        </p>
      )}
      
      {userStatus && (
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6 shadow-lg backdrop-blur-sm">
          <p className="text-md text-blue-200">
            You have an active subscription until{' '}
            <span className="font-bold text-white">
              {new Date(userFromDb?.subscription.expirationDate).toLocaleDateString()}
            </span>
            . You can extend it for the next one month.
          </p>
        </div>
      )}

      {user && (
        <p className="text-lg text-gray-300 max-w-2xl mx-auto bg-gray-900/50 p-4 rounded-md">
          Connect your TON wallet and pay <span className="font-bold text-blue-400">0.01 TON</span> to access exclusive
          content on our private Telegram channel.
        </p>
      )}
    </section>
  )
}

export default Welcome