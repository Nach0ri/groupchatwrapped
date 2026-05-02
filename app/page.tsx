import { Uploader } from "@/components/Uploader";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(236,72,153,0.35), transparent 60%), radial-gradient(ellipse 70% 50% at 50% 100%, rgba(99,102,241,0.35), transparent 60%)",
        }}
      />

      <div className="flex flex-col items-center gap-10 max-w-xl w-full text-center">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Group Chat
          </p>
          <h1 className="text-7xl sm:text-8xl font-black leading-[0.85] tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-pink-400 via-fuchsia-400 to-indigo-400 animate-shimmer">
            Wrapped.
          </h1>
          <p className="text-lg text-white/70 mt-2">
            drop your WhatsApp chat. see your group's wrapped.
          </p>
        </div>

        <Uploader />

        <p className="text-xs text-white/40 max-w-sm">
          your chat never leaves your browser. no servers, no storage, no logs.
          we only send anonymised stats to the AI for the verdict.
        </p>
      </div>
    </main>
  );
}
