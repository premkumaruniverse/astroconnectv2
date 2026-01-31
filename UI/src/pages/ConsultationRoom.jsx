import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClockIcon, CurrencyRupeeIcon } from '@heroicons/react/24/solid';
import VideoCall from '../components/VideoCall';
import Chat from '../components/Chat';
import { chat, sessions, wallet, astrologer as astrologerApi } from '../services/api';

const ConsultationRoom = () => {
  const { id, sessionId: routeSessionId } = useParams();
  const navigate = useNavigate();
  const [callDuration, setCallDuration] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [callActive, setCallActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [partnerData, setPartnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: `Connecting to server...`, sender: 'System', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  
  const [incomingSignal, setIncomingSignal] = useState(null);
  const ws = useRef(null);
  const sessionIdRef = useRef(null);
  const initialBalanceRef = useRef(0);
  const myUserId = localStorage.getItem('user_id');
  const myName = localStorage.getItem('user_name') || 'User';
  const myRole = localStorage.getItem('role');

  useEffect(() => {
    if (sessionId) {
      sessionIdRef.current = sessionId;
    }
  }, [sessionId]);

  // WebSocket Connection
  useEffect(() => {
    if (sessionId && myUserId) {
        // Use dynamically determined API URL but switch protocol to ws/wss
        const apiUrl = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '');
        const wsBase = apiUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
        const wsUrl = `${wsBase}/ws/${sessionId}/${myUserId}`;
        
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log("WebSocket Connected");
            setMessages(prev => [...prev, { id: Date.now(), text: "System: Connected to signaling server.", sender: 'System', timestamp: new Date().toLocaleTimeString() }]);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'chat') {
                    setMessages(prev => [...prev, { 
                        id: Date.now(), 
                        text: data.content, 
                        sender: data.sender_name || 'Partner', 
                        timestamp: new Date().toLocaleTimeString() 
                    }]);
                } else if (['offer', 'answer', 'candidate'].includes(data.type)) {
                    setIncomingSignal(data);
                } else if (data.type === 'user_disconnected') {
                     setMessages(prev => [...prev, { id: Date.now(), text: "Partner disconnected.", sender: 'System', timestamp: new Date().toLocaleTimeString() }]);
                }
            } catch (e) {
                console.error("Error parsing WS message", e);
            }
        };
        
        socket.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        socket.onclose = () => {
            console.log("WebSocket Disconnected");
        };

        ws.current = socket;

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }
  }, [sessionId, myUserId]);

  const sendSignal = (data) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(data));
      }
  };

  const sendMessage = (text) => {
      const msg = { type: 'chat', content: text, sender_name: myName };
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(msg));
          // Optimistic update
          setMessages(prev => [...prev, { 
              id: Date.now(), 
              text: text, 
              sender: myName, 
              timestamp: new Date().toLocaleTimeString() 
          }]);
      } else {
          console.error("WebSocket not connected");
      }
  };

  useEffect(() => {
    const initializeSession = async () => {
      try {
        if (routeSessionId) {
             // Mode: Joining Existing Session (Astrologer or Re-joining User)
             console.log("Joining existing session:", routeSessionId);
             const sessionRes = await sessions.getById(routeSessionId);
             const session = sessionRes.data;
             setSessionId(session.id);
             sessionIdRef.current = session.id;
             setIsFreeTrial(session.is_free_trial || false);

             // Determine Partner
             // We need to be careful with types (string vs int)
             let partner = { name: 'Partner' };
             
             // If I am the user
             if (String(myUserId) === String(session.user_id)) {
                 partner = session.astrologer || { name: 'Astrologer' };
             } 
             // If I am the astrologer (via user_id relation)
             // Note: Astrologer object has user_id. 
             // We assume session.astrologer is populated.
             else if (session.astrologer && String(myUserId) === String(session.astrologer.user_id)) {
                 partner = session.user || { name: 'Client' };
             }
             // Fallback if IDs don't match directly (e.g. admin or direct access)
             else {
                 partner = { name: 'Participant' };
             }
             
             setPartnerData(partner);
             
             // Check if session is active
             if (session.status !== 'active') {
                 setMessages(prev => [...prev, { id: Date.now(), text: "This session has ended.", sender: 'System' }]);
                 // setCallActive(false); // Let them see chat history? No history API yet.
             } else {
                 setCallActive(true);
                 setMessages(prev => [...prev, { id: Date.now(), text: `Connected with ${partner.name}.`, sender: 'System' }]);
             }
             
             if (myRole === 'user') {
                 const walletResponse = await wallet.getBalance();
                 setWalletBalance(walletResponse.data.balance);
                 initialBalanceRef.current = walletResponse.data.balance;
             }

        } else if (id) {
            // Mode: New Session (User initiating)
            console.log("Starting new session with astrologer:", id);
            
            // 1. Fetch Astrologer Details
            const astroResponse = await astrologerApi.getById(id);
            setPartnerData(astroResponse.data);

            // 2. Fetch Wallet Balance
            const walletResponse = await wallet.getBalance();
            setWalletBalance(walletResponse.data.balance);
            initialBalanceRef.current = walletResponse.data.balance;

            // 3. Start Session (Server handles balance check and free trial logic)
            try {
                const sessionResponse = await sessions.start(id);
                setSessionId(sessionResponse.data.id);
                sessionIdRef.current = sessionResponse.data.id;
                setIsFreeTrial(sessionResponse.data.is_free_trial || false);
                setCallActive(true);
                setMessages(prev => [...prev, { id: Date.now(), text: `Connected with ${astroResponse.data.name}.`, sender: 'System' }]);
            } catch (startErr) {
                 if (startErr.response && startErr.response.status === 400 && startErr.response.data.detail === "Insufficient balance") {
                    setMessages(prev => [...prev, { id: Date.now(), text: "Insufficient balance to start call.", sender: 'System' }]);
                 } else {
                    throw startErr;
                 }
                 setLoading(false);
                 return;
            }
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setMessages(prev => [...prev, { id: Date.now(), text: "Failed to connect. Please try again.", sender: 'System' }]);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    // Cleanup on unmount
    return () => {
        // Only end session if User leaves? 
        // If Astrologer leaves, maybe we keep it open for reconnect?
        // For now, let's strictly end it to prevent zombie sessions.
        // But if I refresh, it ends.
        // Ideally, we handle this better. 
        // Let's NOT auto-end on unmount for now if it's just a refresh.
        // But we have no way to know.
        // User explicitly ends via button.
    };
  }, [id, routeSessionId, myUserId, myRole]);

  useEffect(() => {
    let interval;
    if (callActive && sessionId) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callActive, sessionId]);

  // Real-time wallet deduction simulation
  useEffect(() => {
      if (myRole === 'user' && partnerData?.rate && callActive) {
          let billableSeconds = 0;
          if (isFreeTrial) {
              if (callDuration > 300) {
                  billableSeconds = callDuration - 300;
              }
          } else {
              billableSeconds = callDuration;
          }
          
          if (billableSeconds > 0) {
               const cost = (billableSeconds / 60) * partnerData.rate;
               const newBalance = Math.max(0, initialBalanceRef.current - cost);
               setWalletBalance(newBalance.toFixed(2));
          }
      }
  }, [callDuration, isFreeTrial, partnerData, myRole, callActive]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const endCall = async () => {
    if (!sessionId) return;
    
    try {
        setCallActive(false);
        if (ws.current) {
            ws.current.close();
        }
        await sessions.end(sessionId);
        setMessages(prev => [...prev, { id: Date.now(), text: "Call ended.", sender: 'System' }]);
        setTimeout(() => {
            // Redirect based on role
            if (myRole === 'astrologer') {
                navigate('/astro-dashboard');
            } else {
                navigate('/dashboard');
            }
        }, 2000);
    } catch (err) {
        console.error("Error ending session:", err);
        navigate('/');
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
      );
  }

  return (
    <div className="h-[100dvh] bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-none p-2 lg:p-8 pb-0 lg:pb-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center bg-white dark:bg-[#1e293b] p-3 lg:p-4 rounded-xl shadow-lg gap-2 lg:gap-0">
            <div className="flex items-center space-x-3 lg:space-x-4 w-full md:w-auto">
                <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-lg lg:text-xl shrink-0">
                    {partnerData?.name?.charAt(0) || 'P'}
                </div>
                <div>
                    <h1 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white truncate">{partnerData?.name || 'Partner'}</h1>
                    <p className="text-xs lg:text-sm text-slate-500 dark:text-gray-400">
                        {partnerData?.specialties ? 'Vedic Astrologer' : 'Client'}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center justify-between w-full md:w-auto space-x-3 lg:space-x-6">
                <div className={`flex items-center space-x-2 ${isFreeTrial && callDuration <= 300 ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 'bg-slate-100 dark:bg-slate-700'} px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg flex-1 md:flex-none justify-center`}>
                    <ClockIcon className={`h-4 w-4 lg:h-5 lg:w-5 ${isFreeTrial && callDuration <= 300 ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-300'}`} />
                    <span className={`font-mono text-base lg:text-lg font-semibold ${isFreeTrial && callDuration <= 300 ? 'text-green-700 dark:text-green-300' : 'text-slate-700 dark:text-white'}`}>
                        {formatDuration(callDuration)}
                    </span>
                    {isFreeTrial && callDuration <= 300 && (
                        <span className="ml-2 text-xs font-bold text-green-600 dark:text-green-400 uppercase px-2 py-0.5 bg-green-200 dark:bg-green-800 rounded-full">Free</span>
                    )}
                </div>
                {myRole === 'user' && (
                    <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg border border-amber-200 dark:border-amber-800 flex-1 md:flex-none justify-center">
                        <CurrencyRupeeIcon className="h-4 w-4 lg:h-5 lg:w-5 text-amber-600 dark:text-amber-400" />
                        <span className="font-bold text-amber-700 dark:text-amber-300 text-sm lg:text-base">{walletBalance}</span>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 p-2 lg:p-8 pt-2 lg:pt-0">
        <div className="max-w-7xl mx-auto h-full flex flex-col lg:grid lg:grid-cols-3 gap-2 lg:gap-6">
            {/* Video Area */}
            <div className="flex-none h-[35vh] min-h-[200px] lg:h-full lg:col-span-2">
                <VideoCall onEndCall={endCall} incomingSignal={incomingSignal} sendSignal={sendSignal} />
            </div>

            {/* Chat Area */}
            <div className="flex-1 min-h-0 lg:h-full lg:col-span-1">
                <Chat user={myName} messages={messages} onSendMessage={sendMessage} onEndChat={endCall} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;
