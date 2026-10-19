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
import { handleVideoCallModal } from "../../store/slices/messages/messagesSlice";
import Modal from "react-modal";

const socket = socketService.socket;

/* ─── tiny icon helpers (inline SVG, no extra dep) ─── */
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
    if (!running) { setSeconds(0); return; }
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return <span className="font-mono tabular-nums">{m}:{s}</span>;
};

/* ─── Pulsing ring for incoming call avatar ─── */
const PulseRing: FC = () => (
  <>
    <span className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping" />
    <span className="absolute inset-[-8px] rounded-full border-2 border-green-400/40 animate-pulse" />
  </>
);

/* ═══════════════════════════════════════════════════════ */
const VideoCall: FC<any> = forwardRef((__, ref) => {
  const userId: any = useSelector((state: RootState) => state?.user?.user?.userId);
  const userData: any = useSelector((state: RootState) => state?.user?.user?.data);
  const [_, setPeerId] = useState("");
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const currentUserVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerInstance = useRef<any>(null);
  const [calling, setCalling] = useState(false);
  const [remotePeer, setRemotePeer] = useState<any>(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);

  const modalIsOpen = useSelector((state: RootState) => state.messages.videoCall);
  const dispatch = useDispatch<AppDispatch>();

  const openModal = useCallback(() => dispatch(handleVideoCallModal({ status: true })), [dispatch]);
  const closeModal = useCallback(() => dispatch(handleVideoCallModal({ status: false })), [dispatch]);

  /* ── toggle mute ── */
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = muted));
      setMuted((m) => !m);
    }
  };

  /* ── toggle camera ── */
  const toggleCam = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = camOff));
      setCamOff((c) => !c);
    }
  };

  /* ── init peer ── */
  useEffect(() => {
    const peer = new Peer();
    peer.on("open", (id) => {
      setPeerId(id);
      socket.emit("peer-connection", { id, userId });
    });
    peer.on("call", (call) => {
      setIncomingCall(call);
      openModal();
      setTimeout(() => { try { declineCall(); } catch { } }, 25000);
    });
    peerInstance.current = peer;
  }, []);

  /* ── answer call ── */
  const answerCall = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localStreamRef.current = stream;
      if (currentUserVideoRef.current) {
        currentUserVideoRef.current.srcObject = stream;
        currentUserVideoRef.current.play().catch(() => { });
        if (incomingCall) incomingCall.answer(stream);
        incomingCall.on("stream", (remoteStream: any) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(() => { });
            setRemotePeer(incomingCall?.peer);
            setIncomingCall(null);
            setCallAccepted(true);
          }
        });
      }
    }).catch(() => toast.error("Camera/microphone access denied"));
  };

  /* ── imperative call peer ── */
  useImperativeHandle(ref, () => ({
    async callPeer(remoteUser: any) {
      fetchPeerId(remoteUser)
        .then((response) => {
          const remotePeerId = response.data.data.peerId;
          setRemotePeer(remotePeerId);
          if (remotePeerId === undefined) throw new Error("Unable to connect");
          setCalling(true);
          openModal();
          navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            localStreamRef.current = stream;
            if (currentUserVideoRef.current) {
              currentUserVideoRef.current.srcObject = stream;
              currentUserVideoRef.current.play().catch(() => { });
              const call = peerInstance.current.call(remotePeerId, stream);
              call.on("stream", (remoteStream: any) => {
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = remoteStream;
                  remoteVideoRef.current.play().catch(() => { });
                  setCallAccepted(true);
                }
              });
            }
          });
        })
        .catch(() => toast.error("The person is not online"));
    },
  }), []);

  /* ── socket: call rejected ── */
  useEffect(() => {
    const handler = () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      if (currentUserVideoRef.current) currentUserVideoRef.current.srcObject = null;
      setCalling(false);
      closeModal();
      toast("Call was declined", { icon: "📵" });
    };
    socket.on("call-rejected", handler);
    return () => { socket.off("call-rejected", handler); };
  }, []);

  /* ── socket: call ended ── */
  useEffect(() => {
    const handler = () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      if (currentUserVideoRef.current) currentUserVideoRef.current.srcObject = null;
      setCalling(false);
      setCallAccepted(false);
      closeModal();
      window.location.reload();
    };
    socket.on("call-ended", handler);
    return () => { socket.off("call-ended", handler); };
  }, []);

  const declineCall = () => {
    try { incomingCall?.close(); } catch { }
    setIncomingCall(null);
    setCallAccepted(false);
    setCalling(false);
    socket.emit("reject-call", incomingCall?.peer);
    closeModal();
  };

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    try { peerInstance.current?.destroy(); } catch { }
    setCalling(false);
    setCallAccepted(false);
    closeModal();
    socket.emit("end-call", remotePeer);
    window.location.reload();
  };

  const declineOutGoingCall = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    try { peerInstance.current?.destroy(); } catch { }
    setCalling(false);
    closeModal();
  };

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <Modal
      appElement={document.getElementById("root") as HTMLElement}
      overlayClassName="fixed inset-0 z-[999] flex items-center justify-center"
      className="outline-none border-none relative"
      isOpen={modalIsOpen}
      onRequestClose={() => { }}
      shouldCloseOnOverlayClick={false}
    >
      {/* ══ INCOMING CALL SCREEN ══ */}
      {incomingCall && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          {/* blurred backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-md" />

          {/* card */}
          <div className="relative z-10 flex flex-col items-center gap-6 px-8 py-10 rounded-3xl"
            style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 32px 64px rgba(0,0,0,0.5)", maxWidth: 360, width: "90vw" }}
          >
            {/* animated waveform ring + avatar */}
            <div className="relative flex items-center justify-center w-28 h-28">
              <PulseRing />
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-green-400/60 shadow-2xl relative z-10">
                <img
                  src={userData?.profilePhoto || `https://ui-avatars.com/api/?name=Caller&background=F97316&color=fff`}
                  alt="Caller"
                  className="w-full h-full object-cover"
                  onError={(e: any) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=Caller&background=F97316&color=fff`; }}
                />
              </div>
            </div>

            {/* caller info */}
            <div className="text-center">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Incoming Video Call</p>
              <h2 className="text-white text-2xl font-bold tracking-tight">Incoming Call</h2>
              <p className="text-white/40 text-sm mt-1">HiveHub Video</p>
            </div>

            {/* animated dots */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>

            {/* action buttons */}
            <div className="flex items-center gap-8 mt-2">
              {/* decline */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={declineCall}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/40 transition-all duration-200 active:scale-95"
                >
                  <IconPhoneSlash />
                </button>
                <span className="text-white/50 text-xs font-medium">Decline</span>
              </div>

              {/* accept */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={answerCall}
                  className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 text-white flex items-center justify-center shadow-lg shadow-green-500/40 transition-all duration-200 active:scale-95 animate-pulse"
                  style={{ animationDuration: "1.5s" }}
                >
                  <IconPhone />
                </button>
                <span className="text-white/50 text-xs font-medium">Accept</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MAIN CALL WINDOW (outgoing / in-call) ══ */}
      {(calling || callAccepted) && (
        <div className="fixed inset-0 z-[1000] flex flex-col bg-slate-900 overflow-hidden">
          {/* ── Remote video (full screen) ── */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${callAccepted ? "opacity-100" : "opacity-0"}`}
          />

          {/* ── Gradient overlays for readability ── */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.7) 100%)" }}
          />

          {/* ── Outgoing / waiting screen ── */}
          {!callAccepted && calling && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="relative w-28 h-28 mb-6">
                <PulseRing />
                <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-orange-400/50 shadow-2xl relative z-10">
                  <img
                    src={userData?.profilePhoto || `https://ui-avatars.com/api/?name=Me&background=F97316&color=fff`}
                    alt="Me"
                    className="w-full h-full object-cover"
                    onError={(e: any) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=Me&background=F97316&color=fff`; }}
                  />
                </div>
              </div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Calling…</p>
              <h2 className="text-white text-2xl font-bold tracking-tight mb-3">Connecting</h2>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Top bar: status + timer ── */}
          <div className="relative z-20 flex items-center justify-between px-5 pt-safe pt-5 pb-3">
            <div className="flex items-center gap-2">
              {callAccepted && (
                <span className="flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full border border-green-500/30">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Live
                </span>
              )}
            </div>
            {callAccepted && (
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm text-white/80 text-sm font-medium px-3 py-1.5 rounded-full">
                <span className="text-orange-400">⏱</span>
                <CallTimer running={callAccepted} />
              </div>
            )}
          </div>

          {/* ── Local video (PiP) ── */}
          <div className="absolute top-20 right-4 z-30">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 cursor-pointer hover:border-orange-400/60 transition-all duration-200 group"
              style={{ width: 110, height: 155 }}
            >
              <video
                ref={currentUserVideoRef}
                muted
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {camOff && (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                  <IconCamOff />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute bottom-1.5 left-0 right-0 text-center text-white/70 text-[10px] font-medium">You</span>
            </div>
          </div>

          {/* ── Bottom control bar ── */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pb-8 pt-6 px-6 flex flex-col items-center gap-4">
            {/* pill controls */}
            <div
              className="flex items-center gap-4 px-6 py-4 rounded-3xl"
              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {/* Mute */}
              <button
                onClick={toggleMute}
                title={muted ? "Unmute" : "Mute"}
                className={`flex flex-col items-center gap-1.5 group`}
              >
                <div className={`w-13 h-13 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${muted ? "bg-red-500/90 text-white shadow-lg shadow-red-500/40" : "bg-white/10 text-white hover:bg-white/20"}`}>
                  {muted ? <IconMicOff /> : <IconMicOn />}
                </div>
                <span className="text-white/50 text-[10px] font-medium">{muted ? "Unmute" : "Mute"}</span>
              </button>

              {/* End / Decline call */}
              <button
                onClick={callAccepted ? endCall : declineOutGoingCall}
                title="End Call"
                className="flex flex-col items-center gap-1.5"
              >
                <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-500/50 transition-all duration-200 active:scale-95">
                  <IconPhoneSlash />
                </div>
                <span className="text-white/50 text-[10px] font-medium">End</span>
              </button>

              {/* Camera */}
              <button
                onClick={toggleCam}
                title={camOff ? "Turn Camera On" : "Turn Camera Off"}
                className="flex flex-col items-center gap-1.5"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${camOff ? "bg-red-500/90 text-white shadow-lg shadow-red-500/40" : "bg-white/10 text-white hover:bg-white/20"}`}>
                  {camOff ? <IconCamOff /> : <IconCamOn />}
                </div>
                <span className="text-white/50 text-[10px] font-medium">{camOff ? "Cam Off" : "Camera"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
});

export default VideoCall;
