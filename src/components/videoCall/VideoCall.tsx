import {
  useState,
  useRef,
  useEffect,
  FC,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import Peer from "peerjs";
import socketService from "../../service/socketService";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchPeerId } from "../../service/api";
import toast from "react-hot-toast";
import {
  handleVideoCallModal,
  clearOutgoingCall,
} from "../../store/slices/messages/messagesSlice";
import Modal from "react-modal";

const socket = socketService.socket;

/* ─── Inline SVG Icons ─── */
const IconMicOn = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 1a4 4 0 00-4 4v7a4 4 0 008 0V5a4 4 0 00-4-4zm-1 16.93V21h2v-3.07A8.003 8.003 0 0020 10h-2a6 6 0 01-12 0H4a8.003 8.003 0 007 7.93z" />
  </svg>
);
const IconMicOff = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
  </svg>
);
const IconCamOn = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>
);
const IconCamOff = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M21 6.5l-4-4-13 13 4 4 13-13zm-17.03.03L2 8.5l4 4V17c0 .55.45 1 1 1h10.5l-2-2H7v-3.5l-3.03-3.97zM20 6l-6.79 6.79L17 16.5V7c0-.55-.45-1-1-1h-7l-2-2H17c1.1 0 2 .9 2 2h1V6z" />
  </svg>
);
const IconPhoneSlash = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99zM21 6.41L19.59 5 17 7.59 14.41 5 13 6.41 15.59 9 13 11.59 14.41 13 17 10.41 19.59 13 21 11.59 18.41 9z" />
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);

/* ─── Call Duration Timer ─── */
const CallTimer: FC<{ running: boolean }> = ({ running }) => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) {
      setSeconds(0);
      return;
    }
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return <span className="font-mono tabular-nums">{m}:{s}</span>;
};

/* ─── Pulsing ring for incoming/outgoing avatar ─── */
const PulseRing: FC<{ color?: string }> = ({ color = "green" }) => {
  const bg = color === "orange" ? "bg-orange-400" : "bg-green-400";
  const border = color === "orange" ? "border-orange-400/40" : "border-green-400/40";
  return (
    <>
      <span className={`absolute inset-0 rounded-full ${bg} opacity-30 animate-ping`} />
      <span className={`absolute inset-[-8px] rounded-full border-2 ${border} animate-pulse`} />
    </>
  );
};

/* ═══════════════════════════════════════════════════════ */
const VideoCall: FC<any> = forwardRef((_props: any, ref) => {
  const userId: any = useSelector((state: RootState) => state?.user?.user?.userId);
  const userData: any = useSelector((state: RootState) => state?.user?.user?.data);
  const modalIsOpen = useSelector((state: RootState) => state.messages.videoCall);
  const outgoingCall = useSelector((state: RootState) => (state.messages as any)?.outgoingCall);
  const dispatch = useDispatch<AppDispatch>();

  const [peerId, setPeerId] = useState<string>("");
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [calling, setCalling] = useState(false);
  const [remotePeer, setRemotePeer] = useState<string | null>(null);

  const [callerInfo, setCallerInfo] = useState<{
    callerId?: string;
    callerName?: string;
    callerPhoto?: string;
  } | null>(null);

  const [calleeInfo, setCalleeInfo] = useState<{
    receiverId?: string;
    receiverName?: string;
    receiverPhoto?: string;
  } | null>(null);

  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const currentUserVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const peerInstance = useRef<any>(null);
  const currentCallRef = useRef<any>(null);
  const ringTimeoutRef = useRef<any>(null);

  const openModal = useCallback(() => {
    dispatch(handleVideoCallModal({ status: true }));
  }, [dispatch]);

  const closeModal = useCallback(() => {
    dispatch(handleVideoCallModal({ status: false }));
    dispatch(clearOutgoingCall());
  }, [dispatch]);

  /* ── Full Call Cleanup ── */
  const cleanupCall = useCallback(() => {
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);

    remoteStreamRef.current = null;
    setRemoteStream(null);

    if (currentCallRef.current) {
      try {
        currentCallRef.current.close();
      } catch (e) { }
      currentCallRef.current = null;
    }

    if (currentUserVideoRef.current) {
      currentUserVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setCalling(false);
    setCallAccepted(false);
    setIncomingCall(null);
    setRemotePeer(null);
    setCallerInfo(null);
    setCalleeInfo(null);
    setMuted(false);
    setCamOff(false);

    closeModal();
  }, [closeModal]);

  /* ── Decline Incoming Call ── */
  const declineCall = useCallback(() => {
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }

    const callerPeerId = incomingCall?.peer || remotePeer;
    const callerUserId = callerInfo?.callerId;

    try {
      incomingCall?.close();
    } catch (e) { }
    currentCallRef.current = null;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    setIncomingCall(null);
    setCallAccepted(false);
    setCalling(false);
    closeModal();

    socket.emit("reject-call", {
      peerId: callerPeerId,
      callerId: callerUserId,
    });
  }, [incomingCall, remotePeer, callerInfo, closeModal]);

  /* ── Cancel Outgoing Call (caller hangs up before answer) ── */
  const cancelOutgoingCall = useCallback(() => {
    const targetPeer = remotePeer;
    const targetUserId = calleeInfo?.receiverId;

    cleanupCall();

    socket.emit("cancel-call", {
      peerId: targetPeer,
      targetUserId,
    });
  }, [remotePeer, calleeInfo, cleanupCall]);

  /* ── End Active Call ── */
  const endCall = useCallback(() => {
    const targetPeer = remotePeer;
    const targetUserId = callerInfo?.callerId || calleeInfo?.receiverId;

    cleanupCall();

    socket.emit("end-call", {
      peerId: targetPeer,
      targetUserId,
    });
  }, [remotePeer, callerInfo, calleeInfo, cleanupCall]);

  /* ── Answer Incoming Call ── */
  const answerCall = async () => {
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
    if (!incomingCall) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);

      const call = incomingCall;
      currentCallRef.current = call;
      setRemotePeer(call.peer);

      // Transition to active in-call view
      setCallAccepted(true);
      setIncomingCall(null);

      call.answer(stream);

      call.on("stream", (remStream: MediaStream) => {
        remoteStreamRef.current = remStream;
        setRemoteStream(remStream);
      });

      call.on("close", () => {
        cleanupCall();
        toast("Call ended", { icon: "📞" });
      });

      call.on("error", (err: any) => {
        console.error("Peer call error:", err);
        cleanupCall();
      });
    } catch (err: any) {
      console.error("Camera/mic access error:", err);
      toast.error("Could not access camera/microphone");
      declineCall();
    }
  };

  /* ── Make Outgoing Call ── */
  const callPeer = async (remoteUserId: string, targetData?: any) => {
    if (!remoteUserId) {
      toast.error("User not found");
      return;
    }

    if (!peerInstance.current || !peerInstance.current.id) {
      toast.error("Video service is connecting. Please try again.");
      return;
    }

    try {
      const response = await fetchPeerId(remoteUserId);
      const remotePeerId = response?.data?.data?.peerId;

      if (!remotePeerId) {
        toast.error("The user is currently offline");
        cleanupCall();
        return;
      }

      setRemotePeer(remotePeerId);
      setCalleeInfo({
        receiverId: remoteUserId,
        receiverName: targetData?.userName || targetData?.name || "HiveHub User",
        receiverPhoto: targetData?.profilePhoto || targetData?.image || "",
      });

      setCalling(true);
      openModal();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);

      const call = peerInstance.current.call(remotePeerId, stream, {
        metadata: {
          callerId: userId,
          callerName: userData?.userName || userData?.name || "HiveHub User",
          callerPhoto: userData?.profilePhoto || "",
        },
      });

      currentCallRef.current = call;

      call.on("stream", (remStream: MediaStream) => {
        remoteStreamRef.current = remStream;
        setRemoteStream(remStream);
        setCallAccepted(true);
        setCalling(false);
      });

      call.on("close", () => {
        cleanupCall();
        toast("Call ended", { icon: "📞" });
      });

      call.on("error", (err: any) => {
        console.error("Call error:", err);
        cleanupCall();
        toast.error("Connection error");
      });
    } catch (err: any) {
      console.error("callPeer error:", err);
      cleanupCall();
      toast.error("Failed to start call");
    }
  };

  /* ── Expose imperative ref ── */
  useImperativeHandle(ref, () => ({
    callPeer(remoteUserId: string, targetData?: any) {
      callPeer(remoteUserId, targetData);
    },
  }));

  /* ── Watch Redux outgoingCall ── */
  useEffect(() => {
    if (outgoingCall?.receiverId) {
      callPeer(outgoingCall.receiverId, outgoingCall.receiverData);
    }
  }, [outgoingCall]);

  /* ── Initialize PeerJS once ── */
  useEffect(() => {
    const peer = new Peer({
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
        ],
      },
    });

    peer.on("open", (id) => {
      setPeerId(id);
      if (userId && socket.connected) {
        socket.emit("peer-connection", { id, userId });
      }
    });

    peer.on("call", (call) => {
      currentCallRef.current = call;
      setIncomingCall(call);
      setCallerInfo(
        call.metadata || {
          callerId: null,
          callerName: "Incoming Call",
          callerPhoto: "",
        }
      );
      openModal();

      // Auto decline timeout after 30 seconds
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = setTimeout(() => {
        declineCall();
      }, 30000);
    });

    peer.on("error", (err: any) => {
      console.error("PeerJS error:", err);
      if (err?.type === "peer-unavailable") {
        toast.error("User is not available for video calls");
        cleanupCall();
      }
    });

    peerInstance.current = peer;

    return () => {
      cleanupCall();
      try {
        peer.destroy();
      } catch (e) { }
    };
  }, []);

  /* ── Sync peerId to backend whenever userId or socket connects ── */
  useEffect(() => {
    if (peerId && userId && socket.connected) {
      socket.emit("peer-connection", { id: peerId, userId });
    }

    const onConnect = () => {
      if ((peerId || peerInstance.current?.id) && userId) {
        socket.emit("peer-connection", {
          id: peerId || peerInstance.current?.id,
          userId,
        });
      }
    };

    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
    };
  }, [peerId, userId]);

  /* ── Socket Call Events ── */
  useEffect(() => {
    const handleCallRejected = () => {
      cleanupCall();
      toast("Call was declined", { icon: "📵" });
    };

    const handleCallEnded = () => {
      cleanupCall();
      toast("Call ended", { icon: "📞" });
    };

    const handleCallCancelled = () => {
      cleanupCall();
      toast("Call was cancelled", { icon: "📵" });
    };

    socket.on("call-rejected", handleCallRejected);
    socket.on("call-ended", handleCallEnded);
    socket.on("call-cancelled", handleCallCancelled);

    return () => {
      socket.off("call-rejected", handleCallRejected);
      socket.off("call-ended", handleCallEnded);
      socket.off("call-cancelled", handleCallCancelled);
    };
  }, [cleanupCall]);

  /* ── Bind Local Video Stream to DOM element ── */
  useEffect(() => {
    if (currentUserVideoRef.current) {
      if (localStream) {
        currentUserVideoRef.current.srcObject = localStream;
        currentUserVideoRef.current.play().catch(() => { });
      } else {
        currentUserVideoRef.current.srcObject = null;
      }
    }
  }, [localStream, callAccepted, calling]);

  /* ── Bind Remote Video Stream to DOM element ── */
  useEffect(() => {
    if (remoteVideoRef.current) {
      if (remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch(() => { });
      } else {
        remoteVideoRef.current.srcObject = null;
      }
    }
  }, [remoteStream, callAccepted]);

  /* ── Toggle Mute ── */
  const toggleMute = () => {
    if (localStreamRef.current) {
      const nextMuted = !muted;
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
      setMuted(nextMuted);
    }
  };

  /* ── Toggle Camera ── */
  const toggleCam = () => {
    if (localStreamRef.current) {
      const nextCamOff = !camOff;
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !nextCamOff;
      });
      setCamOff(nextCamOff);
    }
  };

  /* ─────────────────────── RENDER ─────────────────────── */
  const callerDisplayName = callerInfo?.callerName || "HiveHub User";
  const callerPhotoUrl =
    callerInfo?.callerPhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      callerDisplayName
    )}&background=F97316&color=fff`;

  const calleeDisplayName = calleeInfo?.receiverName || "Connecting...";
  const calleePhotoUrl =
    calleeInfo?.receiverPhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      calleeDisplayName
    )}&background=F97316&color=fff`;

  return (
    <Modal
      appElement={document.getElementById("root") as HTMLElement}
      overlayClassName="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      className="outline-none border-none relative w-full h-full flex items-center justify-center"
      isOpen={modalIsOpen}
      onRequestClose={() => { }}
      shouldCloseOnOverlayClick={false}
    >
      {/* ══ 1. INCOMING CALL SCREEN ══ */}
      {incomingCall && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950/90 backdrop-blur-xl" />

          <div
            className="relative z-10 flex flex-col items-center gap-6 px-8 py-10 rounded-3xl"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
              maxWidth: 380,
              width: "100%",
            }}
          >
            {/* Pulsing ring + Caller Avatar */}
            <div className="relative flex items-center justify-center w-28 h-28">
              <PulseRing color="green" />
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-green-400/70 shadow-2xl relative z-10 bg-slate-800">
                <img
                  src={callerPhotoUrl}
                  alt={callerDisplayName}
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=Caller&background=F97316&color=fff`;
                  }}
                />
              </div>
            </div>

            {/* Caller Info */}
            <div className="text-center">
              <p className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping inline-block" />
                Incoming Video Call
              </p>
              <h2 className="text-white text-2xl font-bold tracking-tight">
                {callerDisplayName}
              </h2>
              <p className="text-white/50 text-sm mt-1">HiveHub Video</p>
            </div>

            {/* Animated Dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-10 mt-2 w-full">
              {/* Decline Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={declineCall}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/50 transition-all duration-200 active:scale-95"
                  title="Decline Call"
                >
                  <IconPhoneSlash />
                </button>
                <span className="text-white/60 text-xs font-medium">Decline</span>
              </div>

              {/* Accept Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={answerCall}
                  className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 text-white flex items-center justify-center shadow-lg shadow-green-500/50 transition-all duration-200 active:scale-95 animate-pulse"
                  title="Accept Call"
                >
                  <IconPhone />
                </button>
                <span className="text-white/60 text-xs font-medium">Accept</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ 2. MAIN CALL WINDOW (Outgoing Calling or Active In-Call) ══ */}
      {(calling || callAccepted) && (
        <div className="fixed inset-0 z-[10000] flex flex-col bg-slate-950 overflow-hidden">
          {/* Remote Video (Full Screen) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${callAccepted && remoteStream ? "opacity-100" : "opacity-0"
              }`}
          />

          {/* Gradient Overlays */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 25%, transparent 65%, rgba(0,0,0,0.85) 100%)",
            }}
          />

          {/* Outgoing / Connecting Screen (shown while waiting for answer) */}
          {!callAccepted && calling && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
              <div className="relative w-32 h-32 mb-6">
                <PulseRing color="orange" />
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-orange-400/60 shadow-2xl relative z-10 bg-slate-800">
                  <img
                    src={calleePhotoUrl}
                    alt={calleeDisplayName}
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=User&background=F97316&color=fff`;
                    }}
                  />
                </div>
              </div>
              <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping inline-block" />
                Ringing
              </p>
              <h2 className="text-white text-3xl font-bold tracking-tight mb-2">
                {calleeDisplayName}
              </h2>
              <p className="text-white/50 text-sm mb-6">Waiting for response...</p>
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Top Bar: Status + Live Duration Timer */}
          <div className="relative z-20 flex items-center justify-between px-6 pt-6 pb-3">
            <div className="flex items-center gap-2">
              {callAccepted && (
                <span className="flex items-center gap-2 bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-500/30 shadow-sm backdrop-blur-md">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Live Call
                </span>
              )}
            </div>

            {callAccepted && (
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md text-white/90 text-sm font-medium px-4 py-1.5 rounded-full border border-white/10 shadow-sm">
                <span className="text-orange-400">⏱</span>
                <CallTimer running={callAccepted} />
              </div>
            )}
          </div>

          {/* Local Video (PiP preview in top right) */}
          <div className="absolute top-20 right-6 z-30">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 hover:border-orange-400/70 transition-all duration-200 group bg-slate-900"
              style={{ width: 120, height: 165 }}
            >
              <video
                ref={currentUserVideoRef}
                muted
                autoPlay
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {camOff && (
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-1 text-white/60">
                  <IconCamOff />
                  <span className="text-[10px] font-medium">Camera off</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
              <span className="absolute bottom-2 left-0 right-0 text-center text-white/80 text-[11px] font-semibold tracking-wide drop-shadow">
                You
              </span>
            </div>
          </div>

          {/* Bottom Floating Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pb-8 pt-6 px-6 flex flex-col items-center gap-4">
            <div
              className="flex items-center gap-5 px-7 py-4 rounded-3xl"
              style={{
                background: "rgba(15, 23, 42, 0.75)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            >
              {/* Mute Button */}
              <button
                type="button"
                onClick={toggleMute}
                title={muted ? "Unmute" : "Mute"}
                className="flex flex-col items-center gap-1.5 focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${muted
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/40"
                      : "bg-white/10 text-white hover:bg-white/20 active:scale-95"
                    }`}
                >
                  {muted ? <IconMicOff /> : <IconMicOn />}
                </div>
                <span className="text-white/60 text-[10px] font-medium">
                  {muted ? "Unmute" : "Mute"}
                </span>
              </button>

              {/* End / Hang Up Button */}
              <button
                type="button"
                onClick={callAccepted ? endCall : cancelOutgoingCall}
                title="End Call"
                className="flex flex-col items-center gap-1.5 focus:outline-none"
              >
                <div className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/50 transition-all duration-200 active:scale-95">
                  <IconPhoneSlash />
                </div>
                <span className="text-white/60 text-[10px] font-medium">End</span>
              </button>

              {/* Camera Button */}
              <button
                type="button"
                onClick={toggleCam}
                title={camOff ? "Turn Camera On" : "Turn Camera Off"}
                className="flex flex-col items-center gap-1.5 focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${camOff
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/40"
                      : "bg-white/10 text-white hover:bg-white/20 active:scale-95"
                    }`}
                >
                  {camOff ? <IconCamOff /> : <IconCamOn />}
                </div>
                <span className="text-white/60 text-[10px] font-medium">
                  {camOff ? "Cam Off" : "Camera"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
});

export default VideoCall;
