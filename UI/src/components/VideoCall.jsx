import React, { useState, useRef, useEffect } from 'react';
import { PhoneIcon, PhoneXMarkIcon, MicrophoneIcon, VideoCameraIcon, VideoCameraSlashIcon, UserCircleIcon, PlayIcon } from '@heroicons/react/24/solid';

const VideoCall = ({ onEndCall, incomingSignal, sendSignal }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [remoteStream, setRemoteStream] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('new');
    const [incomingCall, setIncomingCall] = useState(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const localStream = useRef(null);

    const initPeerConnection = () => {
        console.log("Initializing RTCPeerConnection");
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ],
            iceCandidatePoolSize: 10,
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require',
            iceTransportPolicy: 'all'
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal({ type: 'candidate', candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            console.log("Remote track received:", event.track.kind);
            setRemoteStream(prev => {
                if (prev) {
                    prev.addTrack(event.track);
                    return prev;
                }
                const newStream = new MediaStream([event.track]);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = newStream;
                    remoteVideoRef.current.onloadedmetadata = () => {
                        console.log("Remote video metadata loaded, playing...");
                        remoteVideoRef.current.play().catch(e => console.error("Error playing remote video:", e));
                    };
                }
                return newStream;
            });
        };

        pc.oniceconnectionstatechange = () => {
            const state = pc.iceConnectionState;
            console.log("ICE Connection State:", state);
            setConnectionStatus(state);

            if (state === 'failed') {
                console.warn("ICE Connection failed. Attempting ICE restart...");
                pc.restartIce();
            }

            if (state === 'disconnected') {
                console.warn("ICE Connection disconnected. Waiting for reconnect...");
            }
        };

        pc.onconnectionstatechange = () => {
            console.log("Connection State:", pc.connectionState);
        };

        pc.onnegotiationneeded = async () => {
            try {
                console.log("Negotiation needed - creating offer");
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                sendSignal({ type: 'offer', sdp: offer });
            } catch (err) {
                console.error("Negotiation Error:", err);
            }
        };

        pc.oniceconnectionstatechange = () => {
            const state = pc.iceConnectionState;
            console.log("ICE Connection State:", state);
            setConnectionStatus(state);

            if (state === 'failed') {
                console.warn("ICE Connection failed. Retrying...");
                pc.restartIce();
            }
        };

        peerConnection.current = pc;
        return pc;
    };

    useEffect(() => {
        const pc = initPeerConnection();

        // Get Media with safety check for production (HTTPS/Localhost only)
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("Media Devices API not available. This usually happens on non-HTTPS connections.");
            alert("Security Error: Video calling requires a secure (HTTPS) connection to access your camera. Please contact the administrator.");
            setConnectionStatus('failed');
            return;
        }

        navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: "user"
            },
            audio: true
        })
            .then(stream => {
                console.log("Local media stream obtained");
                localStream.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    localVideoRef.current.onloadedmetadata = () => {
                        console.log("Local video metadata loaded, playing...");
                        localVideoRef.current.play().catch(e => console.error("Error playing local video:", e));
                    };
                }
                stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream);
                });
            })
            .catch(err => {
                console.error("Media Error (Camera/Mic access):", err);
                if (err.name === 'NotAllowedError') {
                    alert("Camera Permission Denied: Please allow camera access in your browser settings.");
                } else if (err.name === 'NotFoundError') {
                    alert("No Camera Found: Please ensure your camera is connected.");
                } else {
                    alert("Camera Access Error: " + err.message);
                }
                setConnectionStatus('failed');
            });

        return () => {
            console.log("Cleaning up VideoCall component");
            if (localStream.current) {
                localStream.current.getTracks().forEach(track => track.stop());
            }
            if (pc) pc.close();
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
                console.log("Received Offer Signal");
                setIncomingCall(incomingSignal);
            } else {
                handleSignal(incomingSignal);
            }
        }
    }, [incomingSignal]);

    const candidateQueue = useRef([]);

    const handleSignal = async (data) => {
        const pc = peerConnection.current;
        if (!pc) return;

        try {
            if (data.type === 'offer') {
                console.log("Processing Offer via handleSignal");
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                sendSignal({ type: 'answer', sdp: answer });
                processQueuedCandidates();
            } else if (data.type === 'answer') {
                console.log("Handling Answer");
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                processQueuedCandidates();
            } else if (data.type === 'candidate') {
                if (pc.remoteDescription && pc.remoteDescription.type) {
                    console.log("Adding ICE candidate immediately");
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } else {
                    console.log("Queueing ICE candidate - remote description not set");
                    candidateQueue.current.push(data.candidate);
                }
            }
        } catch (err) {
            console.error("Error handling signal:", err);
        }
    };

    const processQueuedCandidates = async () => {
        const pc = peerConnection.current;
        while (candidateQueue.current.length > 0) {
            const candidate = candidateQueue.current.shift();
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
                console.log("Successfully added queued candidate");
            } catch (e) {
                console.error("Error adding queued candidate", e);
            }
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
            console.log("Accepted call and sent answer");
            processQueuedCandidates();
        } catch (err) {
            console.error("Error accepting call:", err);
        }
    };

    const rejectCall = () => {
        setIncomingCall(null);
        onEndCall();
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
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream.current) {
            localStream.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    return (
        <div className="relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            {/* Remote Video (Large) */}
            <div className="absolute inset-0 z-0">
                {!remoteStream ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center mb-4 ring-4 ring-amber-500/30">
                                <UserCircleIcon className="h-20 w-20 text-slate-500" />
                            </div>
                        </div>
                        <p className="text-slate-400 font-medium animate-pulse">Establishing connection...</p>
                        {connectionStatus === 'new' && !incomingCall && (
                            <button
                                onClick={startCall}
                                className="mt-6 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <VideoCameraIcon className="h-5 w-5" />
                                Start Video Call
                            </button>
                        )}
                    </div>
                ) : (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Incoming Call Overlay */}
            {incomingCall && !remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-[60] backdrop-blur-md">
                    <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-center border border-white/10 w-80">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto animate-pulse">
                                <PhoneIcon className="h-12 w-12 text-green-500" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-8 text-white">Incoming Video Call</h3>
                        <div className="flex justify-center gap-8">
                            <button onClick={acceptCall} className="bg-green-500 hover:bg-green-600 text-white p-5 rounded-full shadow-lg shadow-green-500/20 transition-all hover:scale-110 active:scale-90">
                                <PhoneIcon className="h-8 w-8" />
                            </button>
                            <button onClick={rejectCall} className="bg-red-500 hover:bg-red-600 text-white p-5 rounded-full shadow-lg shadow-red-500/20 transition-all hover:scale-110 active:scale-90">
                                <PhoneXMarkIcon className="h-8 w-8" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Local Video Thumbnail - High quality, small corner */}
            <div className="absolute top-4 right-4 w-28 h-40 md:w-44 md:h-60 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-10 bg-slate-800 ring-4 ring-black/20">
                <div className="relative w-full h-full">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover -scale-x-100 ${isVideoOff ? 'hidden' : ''}`}
                    />
                    {isVideoOff && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <UserCircleIcon className="h-16 w-16 text-slate-600" />
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Controls - Sleek floating bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="flex justify-center items-center gap-4 bg-slate-900/60 backdrop-blur-xl px-6 py-4 rounded-full border border-white/10 shadow-2xl">
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-full transition-all hover:scale-110 active:scale-95 ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                    >
                        {isMuted ? <MicrophoneIcon className="h-6 w-6" /> : <MicrophoneIcon className="h-6 w-6" />}
                    </button>

                    <button
                        onClick={onEndCall}
                        className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all hover:scale-110 active:scale-95 shadow-xl shadow-red-600/20"
                    >
                        <PhoneXMarkIcon className="h-7 w-7" />
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-all hover:scale-110 active:scale-95 ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                    >
                        {isVideoOff ? <VideoCameraSlashIcon className="h-6 w-6" /> : <VideoCameraIcon className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Connection Indicator & Reconnect */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
                <div className="px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/10 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{connectionStatus}</span>
                </div>
                {(connectionStatus === 'failed' || connectionStatus === 'checking') && (
                    <button
                        onClick={() => peerConnection.current?.restartIce()}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-full shadow-lg transition-all"
                    >
                        RECONNECT
                    </button>
                )}
            </div>
        </div>
    );
};

export default VideoCall;

