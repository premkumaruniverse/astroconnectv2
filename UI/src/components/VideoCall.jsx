import React, { useState, useRef, useEffect } from 'react';
import { PhoneIcon, PhoneXMarkIcon, MicrophoneIcon, VideoCameraIcon, VideoCameraSlashIcon, UserCircleIcon, PlayIcon } from '@heroicons/react/24/solid';

const VideoCall = ({ onEndCall, incomingSignal, sendSignal }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('new'); // new, connecting, connected, disconnected
  const [incomingCall, setIncomingCall] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    // Init PeerConnection
    const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            sendSignal({ type: 'candidate', candidate: event.candidate });
        }
    };

    pc.ontrack = (event) => {
        console.log("Remote track received", event.streams[0]);
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
        }
    };

    pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
        setConnectionStatus(pc.connectionState);
    };

    peerConnection.current = pc;

    // Get Media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });
        })
        .catch(err => console.error("Media Error:", err));

    return () => {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
            localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        pc.close();
    };
  }, []);

  useEffect(() => {
      if (remoteVideoRef.current && remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
      }
  }, [remoteStream]);

  useEffect(() => {
    if (incomingSignal) {
        if (incomingSignal.type === 'offer') {
             setIncomingCall(incomingSignal);
        } else {
             handleSignal(incomingSignal);
        }
    }
  }, [incomingSignal]);

  const handleSignal = async (data) => {
      const pc = peerConnection.current;
      if (!pc) return;

      try {
        if (data.type === 'answer') {
            console.log("Received Answer");
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } else if (data.type === 'candidate') {
            console.log("Received Candidate");
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (err) {
          console.error("Error handling signal:", err);
      }
  };

  const acceptCall = async () => {
      const pc = peerConnection.current;
      if (!pc || !incomingCall) return;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({ type: 'answer', sdp: answer });
        setIncomingCall(null);
      } catch (err) {
          console.error("Error accepting call:", err);
      }
  };

  const rejectCall = () => {
      setIncomingCall(null);
      // Optional: send reject signal
  };

  const startCall = async () => {
      const pc = peerConnection.current;
      if (!pc) return;
      
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal({ type: 'offer', sdp: offer });
        console.log("Sent Offer");
      } catch (err) {
          console.error("Error creating offer:", err);
      }
  };

  const toggleMute = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden shadow-2xl transition-colors duration-300">
      {/* Top Left End Call Button */}
      <div className="absolute top-4 left-4 z-30">
          <button 
              onClick={onEndCall} 
              className="flex items-center space-x-2 px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg backdrop-blur-sm shadow-lg transition-all transform hover:scale-105"
          >
              <PhoneXMarkIcon className="h-5 w-5" />
              <span className="font-medium">End Call</span>
          </button>
      </div>

      {/* Remote Video */}
      <div className="absolute top-0 left-0 w-full h-full">
        {!remoteStream ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-800 transition-colors duration-300">
                <UserCircleIcon className="h-48 w-48 text-gray-400 dark:text-gray-600 transition-colors duration-300" />
                <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse">Waiting for connection...</p>
            </div>
        ) : (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        )}
      </div>

      {/* Incoming Call Overlay */}
      {incomingCall && !remoteStream && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center transform transition-all scale-105">
                   <div className="animate-bounce mb-4">
                       <PhoneIcon className="h-16 w-16 text-green-500 mx-auto" />
                   </div>
                   <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Incoming Call...</h3>
                   <div className="flex space-x-8 justify-center">
                       <button onClick={acceptCall} className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-colors">
                           <PhoneIcon className="h-8 w-8" />
                       </button>
                       <button onClick={rejectCall} className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-colors">
                           <PhoneXMarkIcon className="h-8 w-8" />
                       </button>
                   </div>
              </div>
          </div>
      )}

      {/* Local Video */}
      <div className="absolute top-4 right-4 w-32 h-24 md:w-48 md:h-36 bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-white dark:border-gray-600 transition-colors duration-300 shadow-lg z-10">
         <div className="relative w-full h-full">
             <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`} />
             {isVideoOff && (
                 <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                     <UserCircleIcon className="h-12 w-12 text-gray-500" />
                 </div>
             )}
         </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent z-20">
        <div className="flex justify-center items-center space-x-4">
          <button onClick={toggleMute} className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-700/50 text-white hover:bg-gray-600/70'}`}>
            {isMuted ? <MicrophoneIcon className="h-6 w-6 text-slate-300" /> : <MicrophoneIcon className="h-6 w-6" />}
          </button>
          <button onClick={toggleVideo} className={`p-3 rounded-full transition-colors ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700/50 text-white hover:bg-gray-600/70'}`}>
            {isVideoOff ? <VideoCameraSlashIcon className="h-6 w-6" /> : <VideoCameraIcon className="h-6 w-6" />}
          </button>
          {connectionStatus === 'new' && !incomingCall && (
            <button onClick={startCall} className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-lg">
              <PhoneIcon className="h-6 w-6" />
            </button>
          )}
          <button onClick={onEndCall} className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg">
            <PhoneXMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
