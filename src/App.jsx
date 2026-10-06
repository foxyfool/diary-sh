import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/* ─────────────────────────────────────────────
   ✏️  EDIT THESE
   ───────────────────────────────────────────── */
const CONFIG = {
  herName: "Shrutika",
  myName: "Rahul", // 👈 put your name here
  // Your WhatsApp number with country code, no "+" or spaces.
  // Leave empty "" if you don't want the WhatsApp button.
  whatsappNumber: "916267293806",

  // Put these files inside the `public` folder (same names, or change them here)
  waitingPhoto: "/waiting.gif",
  herPhoto: "/her.jpg",

  // The friend who's joining (photo is optional, put it in `public`)
  friend: {
    name: "Jenifer",
    photo: "/jenifer.jpg",
  },

  // Background music that plays softly the whole time (put it in `public`)
  // Leave file empty "" to turn it off.
  bgMusic: {
    file: "/bg.mp3",
    volume: 0.35, // 0 = silent, 1 = full
  },

  song: {
    file: "/song.mp3",
    startAt: 0, // second where your part starts (e.g. 42)
    endAt: 0, // second where it stops (0 = till the end)
    caption: "", // 👈 type the line you want her to read
  },
};

// Each line first shows the teaser, pauses, then writes the line.
const LINES = [
  {
    teaser: "Wo… main aapse kuch kehna chah raha tha",
    line: "Lagta hai mereko aapse loan lena padega…",
    punch: "tabhi aapka interest mujhpe aayega 😌",
    cta: "Hahaha okay 😂",
  },
  {
    teaser: "Wo… main aapse ek aur baat kehna chah raha tha",
    line: "This is how I wait for you to text “have a great day, handsome” with a selfie attached…",
    media: "waiting",
    punch: "…so I can actually start having a great day.",
    cta: "Hmm Sochungi kabhi aram se 😌",
  },
  {
    teaser: "Wo… main aapse aakhri baat kehna chah raha tha",
    line: "Pehle ye sunna 🎧",
    media: "song",
    punch: "With no makeup, who's a 10? 🤔",
    answer: "Definitely, it's you! 💖",
    cta: "I guess thankssss !! 😂",
  },
];

const NO_LINES = [
  "No",
  "Are you sure? 🥺",
  "Really really sure?",
  "Please don't do this to me 😭",
  "I practiced this in the mirror",
  "Okay, last chance 🥹",
];
const FACES = ["😊", "🥺", "😟", "😭", "😩", "🫠"];

const FOODS = [
  { id: "biryani", emoji: "🍛", label: "Biryani" },
  { id: "pizza", emoji: "🍕", label: "Pizza" },
  { id: "momos", emoji: "🥟", label: "Momos" },
  { id: "chaat", emoji: "🥙", label: "Street food" },
  { id: "cafe", emoji: "🧁", label: "Café & desserts" },
  { id: "surprise", emoji: "🎲", label: "Surprise me" },
];

const TIMES = [
  { id: "lunch", time: "1:00 PM", note: "Lunch" },
  { id: "snacks", time: "5:00 PM", note: "Evening snacks" },
  { id: "dinner", time: "7:30 PM", note: "Dinner" },
  { id: "late", time: "9:00 PM", note: "Late dinner" },
];

/* ───────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1];
const SPEED = 0.035; // seconds per letter when "writing"

function nextDays(n) {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d;
  });
}

const fmtDate = (d) =>
  d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

const writeTime = (text, speed = SPEED) =>
  Array.from(text).length * speed + 0.3;

/* ─────────────── Background music ─────────────── */

// One shared controller so the song clip can pause the bg music and resume it
const bgMusic = {
  el: null,
  muted: false,
  started: false,
  start() {
    this.started = true;
    this.resume();
  },
  resume() {
    if (!this.el || this.muted || !this.started) return;
    this.el.volume = CONFIG.bgMusic.volume;
    this.el.play().catch(() => {});
  },
  pause() {
    this.el?.pause();
  },
  stop() {
    this.started = false; // won't come back on its own anymore
    this.pause();
  },
};

function MuteButton({ muted, onToggle }) {
  return (
    <motion.button
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      whileTap={{ scale: 0.85 }}
      onClick={onToggle}
      aria-label={muted ? "Turn music on" : "Turn music off"}
      className="fixed top-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-paper/90 text-xl shadow-lg"
    >
      {muted ? "🔇" : "🔊"}
    </motion.button>
  );
}

/* ─────────────── Background ─────────────── */

function Backdrop() {
  const reduce = useReducedMotion();
  const [flies] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 3 + Math.random() * 4,
      dx: (Math.random() - 0.5) * 140,
      dy: (Math.random() - 0.5) * 140,
      dur: 6 + Math.random() * 8,
      delay: Math.random() * 4,
    })),
  );
  const [petals] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 10 + Math.random() * 10,
      dur: 12 + Math.random() * 10,
      delay: Math.random() * 14,
      drift: (Math.random() - 0.5) * 180,
      spin: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360),
    })),
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#2a3466_0%,#141a33_60%,#0b0f22_100%)]" />
      <motion.div
        className="absolute -top-28 -right-16 h-72 w-72 rounded-full bg-gold/25 blur-3xl"
        animate={
          reduce ? {} : { scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }
        }
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {!reduce &&
        flies.map((f) => (
          <motion.span
            key={f.id}
            className="absolute rounded-full bg-gold"
            style={{
              left: `${f.left}%`,
              top: `${f.top}%`,
              width: f.size,
              height: f.size,
              boxShadow: `0 0 ${f.size * 3}px ${f.size}px rgba(240,201,107,.5)`,
            }}
            animate={{
              x: [0, f.dx, f.dx * 0.3, 0],
              y: [0, f.dy * 0.5, f.dy, 0],
              opacity: [0.1, 1, 0.3, 0.9, 0.1],
            }}
            transition={{
              duration: f.dur,
              repeat: Infinity,
              delay: f.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      {!reduce &&
        petals.map((p) => (
          <motion.svg
            key={p.id}
            viewBox="0 0 20 30"
            className="absolute"
            style={{
              left: `${p.left}%`,
              top: -40,
              width: p.size,
              height: p.size * 1.5,
            }}
            animate={{
              y: ["0vh", "115vh"],
              x: [0, p.drift],
              rotate: [0, p.spin],
            }}
            transition={{
              duration: p.dur,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
          >
            <path
              d="M10 0 C20 10 18 25 10 30 C2 25 0 10 10 0Z"
              fill="#e8798b"
              opacity=".85"
            />
          </motion.svg>
        ))}
    </div>
  );
}

/* ─────────────── Book pieces ─────────────── */

const pageVariants = {
  enter: (dir) =>
    dir >= 0
      ? { rotateY: 30, x: 30, opacity: 0 }
      : { rotateY: -110, opacity: 0 },
  center: {
    rotateY: 0,
    x: 0,
    opacity: 1,
    transition: { duration: 0.75, ease: EASE },
  },
  exit: (dir) =>
    dir >= 0
      ? {
          rotateY: -110,
          opacity: 0,
          transition: { duration: 0.6, ease: [0.5, 0, 0.75, 0] },
        }
      : {
          rotateY: 30,
          x: 30,
          opacity: 0,
          transition: { duration: 0.45, ease: EASE },
        },
};
const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

function Page({ dir, cover = false, children }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      custom={dir}
      variants={reduce ? fadeVariants : pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      style={{ transformOrigin: "left center", backfaceVisibility: "hidden" }}
      className={`relative z-10 flex min-h-[560px] w-full flex-col rounded-l-md rounded-r-2xl shadow-[0_30px_60px_-20px_rgba(0,0,0,.75)] ${
        cover
          ? "leather px-7 py-10 text-center text-gold"
          : "paper py-9 pr-6 pl-12 sm:pr-8"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-5 rounded-l-md bg-linear-to-r from-black/25 to-transparent"
        aria-hidden
      />
      {children}
    </motion.section>
  );
}

function PageStack() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pointer-events-none absolute inset-0"
      aria-hidden
    >
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-l-md rounded-r-2xl bg-[#e6d6b8]" />
      <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-l-md rounded-r-2xl bg-[#f1e5cc]" />
      <motion.div
        className="absolute right-12 -bottom-14 h-20 w-6 origin-top bg-rose shadow-md"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)" }}
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

// Text that "writes itself" letter by letter
function HandText({
  text,
  delay = 0,
  speed = SPEED,
  className = "",
  as: Tag = "p",
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  let i = 0;
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, wi) => (
        <span key={wi}>
          <span className="inline-block whitespace-nowrap" aria-hidden>
            {Array.from(w).map((ch) => {
              const idx = i++;
              return (
                <motion.span
                  key={idx}
                  className="inline-block"
                  initial={
                    reduce ? false : { opacity: 0, y: 8, filter: "blur(4px)" }
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: delay + idx * speed, duration: 0.3 }}
                >
                  {ch}
                </motion.span>
              );
            })}
          </span>
          {wi < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}

function Scribble({ delay = 0.5, className = "" }) {
  return (
    <svg
      viewBox="0 0 200 14"
      className={`h-3.5 w-40 text-rose ${className}`}
      aria-hidden
    >
      <motion.path
        d="M3 9 C 30 2, 52 13, 82 7 S 142 2, 197 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay, duration: 0.8, ease: "easeInOut" }}
      />
    </svg>
  );
}

function Title({ children, className = "" }) {
  return (
    <div className="mb-2">
      <h1
        className={`text-[2rem] leading-[1.15] font-bold text-ink sm:text-[2.3rem] ${className}`}
      >
        {children}
      </h1>
      <Scribble />
    </div>
  );
}

function PrimaryButton({ children, disabled, onClick, className = "" }) {
  return (
    <motion.button
      whileHover={disabled ? {} : { rotate: -1.5, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full bg-rose px-7 py-3 text-xl font-bold text-paper shadow-[0_6px_0_#a8304a] transition-shadow active:translate-y-1 active:shadow-[0_2px_0_#a8304a] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${className}`}
    >
      {children}
    </motion.button>
  );
}

function SecondaryButton({ children, onClick, className = "" }) {
  return (
    <motion.button
      whileHover={{ rotate: 1.5, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`rounded-full border-2 border-dashed border-ink/60 px-6 py-3 text-lg font-bold text-ink ${className}`}
    >
      {children}
    </motion.button>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl px-2 py-2 text-lg whitespace-nowrap text-ink/60 underline-offset-4 hover:underline"
    >
      ← Back
    </button>
  );
}

function Footer({ onBack, children }) {
  return (
    <div className="mt-auto flex items-center justify-between gap-3 pt-8">
      {onBack ? <BackButton onClick={onBack} /> : <span />}
      {children}
    </div>
  );
}

// An option that gets circled in red pen when picked
function Choice({ selected, onClick, children, className = "" }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-pressed={selected}
      className={`relative rounded-xl bg-ink/[0.05] px-3 py-3 text-ink ${className}`}
    >
      <span className="relative z-10 block">{children}</span>
      <AnimatePresence>
        {selected && (
          <motion.svg
            viewBox="0 0 120 60"
            preserveAspectRatio="none"
            className="pointer-events-none absolute -top-1.5 -left-1.5 h-[calc(100%+12px)] w-[calc(100%+12px)] text-rose"
            exit={{ opacity: 0 }}
            aria-hidden
          >
            <motion.path
              d="M62 4 C 100 2, 118 18, 116 32 C 114 50, 80 58, 54 56 C 24 54, 4 46, 5 28 C 6 12, 30 3, 70 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Shows a photo from /public, or a reminder if you haven't added it yet
function Photo({ src, alt }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center border-2 border-dashed border-ink/30 bg-paper p-4 text-center text-base text-ink/60">
        Add <b className="mx-1">{src.replace("/", "")}</b> to the public folder
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setBroken(true)}
      className="aspect-[4/5] w-full object-cover"
    />
  );
}

function Polaroid({ src, alt, tilt = -3, caption }) {
  return (
    <motion.figure
      initial={{ y: -60, rotate: tilt * 4, opacity: 0, scale: 1.1 }}
      animate={{ y: 0, rotate: tilt, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 13 }}
      className="relative mx-auto mt-5 w-[82%] bg-white p-3 pb-5 shadow-[0_12px_25px_-8px_rgba(0,0,0,.45)]"
    >
      <span className="absolute -top-3 left-1/2 h-7 w-24 -translate-x-1/2 -rotate-3 bg-[#f3e2b3]/80 shadow-sm" />
      <Photo src={src} alt={alt} />
      {caption && (
        <figcaption className="mt-3 text-center text-xl">{caption}</figcaption>
      )}
    </motion.figure>
  );
}

function SongPlayer({ onEnd }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [missing, setMissing] = useState(false);
  const { file, startAt, endAt, caption } = CONFIG.song;

  useEffect(() => () => audioRef.current?.pause(), []);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      return;
    }
    try {
      bgMusic.pause();
      a.currentTime = startAt;
      await a.play();
      if (Math.abs(a.currentTime - startAt) > 1) a.currentTime = startAt;
      setPlaying(true);
    } catch {
      setMissing(true);
      bgMusic.resume();
    }
  };

  const onTime = () => {
    const a = audioRef.current;
    if (endAt && a.currentTime >= endAt) {
      a.pause();
      setPlaying(false);
      bgMusic.resume();
      onEnd?.();
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center">
      <audio
        ref={audioRef}
        src={file}
        preload="auto"
        onTimeUpdate={onTime}
        onEnded={() => {
          setPlaying(false);
          bgMusic.resume();
          onEnd?.();
        }}
        onError={() => {
          setMissing(true);
          onEnd?.();
        }}
      />

      <motion.button
        onClick={toggle}
        disabled={missing}
        aria-label={playing ? "Pause the song" : "Play the song"}
        whileTap={{ scale: 0.93 }}
        animate={{ scale: playing ? 1.04 : 1 }}
        className="relative h-48 w-48 rounded-full shadow-[0_15px_30px_-10px_rgba(0,0,0,.6)] disabled:opacity-50"
      >
        <span
          className={`vinyl absolute inset-0 rounded-full ${playing ? "playing" : ""}`}
        >
          <span className="absolute inset-[34%] flex items-center justify-center rounded-full bg-rose">
            <span className="h-3 w-3 rounded-full bg-night" />
          </span>
          <span className="absolute top-[18%] left-[22%] h-6 w-10 rotate-[-30deg] rounded-full bg-white/10 blur-sm" />
        </span>
        <AnimatePresence>
          {!playing && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-paper pl-1 text-2xl text-rose shadow-lg"
            >
              ▶
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* little music notes floating up while playing */}
      <div className="relative h-0 w-full" aria-hidden>
        <AnimatePresence>
          {playing &&
            ["♪", "♫", "♪", "♬"].map((n, i) => (
              <motion.span
                key={i}
                className="absolute bottom-6 text-2xl text-rose"
                style={{ left: `${25 + i * 16}%` }}
                initial={{ y: 0, opacity: 0 }}
                animate={{
                  y: [-10, -190],
                  opacity: [0, 1, 0],
                  x: [0, i % 2 ? 18 : -18],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  delay: i * 0.55,
                  ease: "easeOut",
                }}
              >
                {n}
              </motion.span>
            ))}
        </AnimatePresence>
      </div>

      <p className="mt-4 text-lg text-ink/70">
        {missing ? (
          <>
            Add <b>{file.replace("/", "")}</b> to the public folder
          </>
        ) : playing ? (
          "Tap the record to pause"
        ) : (
          "Tap the record"
        )}
      </p>

      {caption && (
        <p className="mt-3 text-center text-2xl leading-snug font-bold">
          {caption}
        </p>
      )}
    </div>
  );
}

function HeartBurst() {
  const reduce = useReducedMotion();
  const [hearts] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 360,
      y: -100 - Math.random() * 240,
      rotate: (Math.random() - 0.5) * 120,
      delay: 0.6 + Math.random() * 0.3,
      emoji: ["💖", "💗", "✨", "🌸"][i % 4],
    })),
  );
  if (reduce) return null;
  return (
    <div
      className="pointer-events-none absolute top-1/2 left-1/2 z-30"
      aria-hidden
    >
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          className="absolute text-3xl"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: h.x, y: h.y, scale: 1.3, opacity: 0, rotate: h.rotate }}
          transition={{ duration: 1.8, delay: h.delay, ease: "easeOut" }}
        >
          {h.emoji}
        </motion.span>
      ))}
    </div>
  );
}

/* ─────────────── Guess who's joining ─────────────── */

function FriendPhoto() {
  const [broken, setBroken] = useState(!CONFIG.friend.photo);
  if (broken) {
    return (
      <div className="flex h-36 w-36 items-center justify-center rounded-full bg-rose/10 text-7xl">
        🙋‍♀️
      </div>
    );
  }
  return (
    <img
      src={CONFIG.friend.photo}
      alt={CONFIG.friend.name}
      onError={() => setBroken(true)}
      className="h-36 w-36 rounded-full border-4 border-rose object-cover"
    />
  );
}

function MysteryCard({ revealed, onReveal }) {
  const reduce = useReducedMotion();
  return (
    <div className="mx-auto mt-6 h-72 w-60" style={{ perspective: 1000 }}>
      <motion.button
        onClick={onReveal}
        disabled={revealed}
        aria-label={revealed ? CONFIG.friend.name : "Tap to find out"}
        animate={{ rotateY: revealed ? 180 : 0 }}
        whileHover={revealed ? {} : { scale: 1.03, rotate: -1 }}
        whileTap={revealed ? {} : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative h-full w-full"
      >
        {/* front */}
        <span
          className="leather absolute inset-0 flex flex-col items-center justify-center rounded-2xl text-gold shadow-[0_15px_30px_-10px_rgba(0,0,0,.6)]"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="pointer-events-none absolute inset-2 rounded-xl border-2 border-gold/40" />
          <motion.span
            className="text-8xl font-bold"
            animate={
              reduce ? {} : { scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] }
            }
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            ?
          </motion.span>
          <span className="mt-2 text-xl">Tap to find out</span>
        </span>

        {/* back */}
        <span
          className="paper absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-rose/40 shadow-[0_15px_30px_-10px_rgba(0,0,0,.45)]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <FriendPhoto />
          <span className="mt-4 text-4xl font-bold text-rose">
            {CONFIG.friend.name}! 🎉
          </span>
          <span className="mt-1 text-lg text-ink/70">our common friend</span>
        </span>
      </motion.button>

      {/* confetti when revealed */}
      {revealed && !reduce && (
        <div className="pointer-events-none relative" aria-hidden>
          {["🎉", "✨", "🎊", "💫", "🎉", "✨", "🎊", "💫"].map((e, i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 text-2xl"
              style={{ bottom: 140 }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: Math.cos((i / 8) * Math.PI * 2) * 150,
                y: Math.sin((i / 8) * Math.PI * 2) * 150,
                opacity: 0,
                scale: 1.3,
              }}
              transition={{ duration: 1.3, delay: 0.35, ease: "easeOut" }}
            >
              {e}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────── The cheesy-line page ─────────────── */

function LinePage({ dir, data, onNext, onBack }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);
  // phases: 0 teaser, 1 line, 2 photo/song, 3 punchline, 4 answer, 5 button

  const [songDone, setSongDone] = useState(false);
  const waitForSong = data.media === "song";

  // song page: stop the background music for good
  useEffect(() => {
    if (waitForSong) bgMusic.stop();
  }, [waitForSong]);

  const schedule = (steps) => {
    const timers = steps.map(([ph, t]) =>
      setTimeout(
        () => setPhase((p) => Math.max(p, ph)),
        (reduce ? 0 : t) * 1000,
      ),
    );
    return () => timers.forEach(clearTimeout);
  };

  // what comes after the photo/song: punchline, answer, button
  const tail = (from) => {
    const t4 =
      from +
      (data.punch ? writeTime(data.punch) + (data.answer ? 1.4 : 0.3) : 0);
    const t5 = t4 + (data.answer ? 0.9 : 0);
    return [
      [3, from],
      [4, t4],
      [5, t5],
    ];
  };

  useEffect(() => {
    const start = 0.8; // wait for the page flip
    const t1 = start + writeTime(data.teaser) + 1.2; // the dramatic pause
    const t2 = t1 + writeTime(data.line) + 0.3;
    const t3 = t2 + (data.media ? 1.1 : 0);
    // on the song page, stop here and wait for the song to finish
    return schedule([[1, t1], [2, t2], ...(waitForSong ? [] : tail(t3))]);
  }, [data, reduce]);

  useEffect(() => {
    if (songDone) return schedule(tail(0.6));
  }, [songDone]);

  return (
    <Page dir={dir}>
      <motion.div
        animate={
          phase >= 1 ? { opacity: 0.45, scale: 0.92 } : { opacity: 1, scale: 1 }
        }
        transition={{ duration: 0.5 }}
        className="origin-left"
      >
        <HandText
          text={data.teaser}
          delay={0.8}
          className="text-2xl leading-snug text-ink/90"
        />
        {phase === 0 && (
          <motion.div className="mt-3 flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-2.5 w-2.5 rounded-full bg-rose"
                animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {phase >= 1 && (
        <HandText
          as="h1"
          text={data.line}
          className="mt-5 text-[1.85rem] leading-[1.2] font-bold text-ink sm:text-[2.1rem]"
        />
      )}

      {phase >= 2 && data.media === "waiting" && (
        <Polaroid
          src={CONFIG.waitingPhoto}
          alt={`${CONFIG.myName}, waiting`}
          tilt={3}
        />
      )}
      {phase >= 2 && data.media === "song" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -40 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 14 }}
        >
          <SongPlayer onEnd={() => setSongDone(true)} />
        </motion.div>
      )}

      {phase >= 3 && data.punch && (
        <HandText
          text={data.punch}
          className={`mt-5 text-2xl leading-snug font-bold ${data.answer ? "text-ink" : "text-rose"}`}
        />
      )}

      {phase >= 4 && data.answer && (
        <div className="relative mt-3">
          <motion.p
            initial={{ scale: 0, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: -2, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 12 }}
            className="origin-left text-[2.1rem] leading-tight font-bold text-rose"
          >
            {data.answer}
          </motion.p>
          {!reduce &&
            ["💖", "✨", "💗", "✨", "💖"].map((e, i) => (
              <motion.span
                key={i}
                className="pointer-events-none absolute top-1/2 left-1/3 text-2xl"
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: (i - 2) * 50,
                  y: -60 - (i % 2) * 30,
                  opacity: 0,
                  scale: 1.2,
                }}
                transition={{
                  duration: 1.3,
                  delay: 0.1 + i * 0.05,
                  ease: "easeOut",
                }}
                aria-hidden
              >
                {e}
              </motion.span>
            ))}
        </div>
      )}

      <Footer onBack={onBack}>
        <AnimatePresence>
          {phase >= 5 && (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 14 }}
            >
              <PrimaryButton onClick={onNext}>{data.cta}</PrimaryButton>
            </motion.div>
          )}
        </AnimatePresence>
      </Footer>
    </Page>
  );
}

/* ─────────────── The app ─────────────── */

export default function App() {
  const [step, setStep] = useState("intro");
  const [dir, setDir] = useState(1);
  const [noCount, setNoCount] = useState(0);
  const [food, setFood] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [friendRevealed, setFriendRevealed] = useState(false);
  const [muted, setMuted] = useState(false);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    bgMusic.muted = next;
    if (next) bgMusic.pause();
    else bgMusic.resume();
  };
  const days = useMemo(() => nextDays(9), []);

  const go = (next, d = 1) => {
    setDir(d);
    setStep(next);
  };

  const noGone = noCount >= NO_LINES.length;
  const foodObj = FOODS.find((f) => f.id === food);
  const timeObj = TIMES.find((t) => t.id === time);

  const summary =
    foodObj && date && timeObj
      ? `${foodObj.id === "surprise" ? "A surprise meal" : foodObj.label} on ${fmtDate(date)} at ${timeObj.time}, with ${CONFIG.friend.name} too 😄`
      : "";

  const waLink = CONFIG.whatsappNumber
    ? `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(
        `Dammnn that was great 😄\n\nWhat I picked: ${summary}`,
      )}`
    : null;

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-x-hidden px-4 py-10">
      <Backdrop />

      {CONFIG.bgMusic.file && (
        <audio
          ref={(el) => (bgMusic.el = el)}
          src={CONFIG.bgMusic.file}
          loop
          preload="auto"
        />
      )}
      {CONFIG.bgMusic.file && !["intro", "line3", "done"].includes(step) && (
        <MuteButton muted={muted} onToggle={toggleMute} />
      )}

      <div
        className="relative min-h-[560px] w-full max-w-md"
        style={{ perspective: 1800 }}
      >
        {step !== "intro" && <PageStack />}

        <AnimatePresence mode="wait" custom={dir}>
          {/* Cover */}
          {step === "intro" && (
            <Page key="intro" dir={dir} cover>
              <div className="pointer-events-none absolute inset-3 rounded-l-sm rounded-r-xl border-2 border-gold/50" />
              <div className="flex flex-1 flex-col items-center justify-center">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-gold/80"
                >
                  a tiny book for
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    textShadow: [
                      "0 0 0px rgba(240,201,107,0)",
                      "0 0 18px rgba(240,201,107,.7)",
                      "0 0 4px rgba(240,201,107,.2)",
                    ],
                  }}
                  transition={{ delay: 0.7, duration: 1.6, ease: EASE }}
                  className="mt-1 text-6xl font-bold"
                >
                  {CONFIG.herName}
                </motion.h1>

                <motion.div
                  initial={{ scale: 2.4, opacity: 0, rotate: -40 }}
                  animate={{ scale: 1, opacity: 1, rotate: -8 }}
                  transition={{
                    delay: 1.4,
                    type: "spring",
                    stiffness: 380,
                    damping: 16,
                  }}
                  className="mt-10 flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#a8304a] bg-rose text-4xl font-bold text-paper shadow-[inset_0_-6px_12px_rgba(0,0,0,.3),0_8px_16px_rgba(0,0,0,.4)]"
                  aria-hidden
                >
                  {CONFIG.herName[0]}
                </motion.div>
              </div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  bgMusic.start(); // music can only start after a tap
                  go("line1");
                }}
                className="relative mx-auto mt-8 rounded-full border-2 border-gold px-10 py-3 text-xl font-bold text-gold"
              >
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-gold"
                  animate={{ scale: [1, 1.25], opacity: [0.7, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: 2.4 }}
                  aria-hidden
                />
                Open it
              </motion.button>
            </Page>
          )}

          {step === "line1" && (
            <LinePage
              key="line1"
              dir={dir}
              data={LINES[0]}
              onNext={() => go("line2")}
            />
          )}
          {step === "line2" && (
            <LinePage
              key="line2"
              dir={dir}
              data={LINES[1]}
              onNext={() => go("ask")}
              onBack={() => go("line1", -1)}
            />
          )}
          {step === "line3" && (
            <LinePage
              key="line3"
              dir={dir}
              data={LINES[2]}
              onNext={() => go("done")}
              onBack={() => go("see", -1)}
            />
          )}

          {/* The big question */}
          {step === "ask" && (
            <Page key="ask" dir={dir}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={noGone ? "done" : noCount}
                  initial={{ scale: 0.3, rotate: -30, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.3, rotate: 30, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 14 }}
                  className="mb-3 text-6xl"
                  aria-hidden
                >
                  {noGone ? "😌" : FACES[noCount]}
                </motion.div>
              </AnimatePresence>

              <Title>Wanna hang out and grab a bite sometime?</Title>

              <div className="mt-8 flex min-h-[150px] flex-wrap items-center justify-center gap-5">
                <motion.button
                  layout
                  animate={{ scale: 1 + noCount * 0.13 }}
                  whileTap={{ scale: 1 + noCount * 0.13 - 0.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 14 }}
                  onClick={() => go("food")}
                  className="rounded-full bg-rose px-9 py-3 text-2xl font-bold text-paper shadow-[0_6px_0_#a8304a]"
                >
                  Yes 💖
                </motion.button>

                <AnimatePresence>
                  {!noGone && (
                    <motion.button
                      layout
                      key="no"
                      animate={{
                        scale: Math.max(1 - noCount * 0.08, 0.6),
                        rotate: noCount ? [0, -6, 6, -3, 0] : 0,
                      }}
                      exit={{ scale: 0, rotate: 200, opacity: 0, y: 40 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 16,
                      }}
                      onClick={() => setNoCount((c) => c + 1)}
                      className="rounded-full border-2 border-dashed border-ink/60 px-5 py-3 text-lg font-bold text-ink"
                    >
                      {NO_LINES[noCount]}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {noGone && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-center text-lg text-ink/60"
                  >
                    The No button has left the chat 💨
                  </motion.p>
                )}
              </AnimatePresence>
            </Page>
          )}

          {/* Food */}
          {step === "food" && (
            <Page key="food" dir={dir}>
              <Title>Yay! What are we eating?</Title>
              <p className="text-xl text-ink/70">
                Pick whatever you're craving.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {FOODS.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.07 }}
                  >
                    <Choice
                      selected={food === f.id}
                      onClick={() => setFood(f.id)}
                      className="w-full"
                    >
                      <span className="block text-3xl" aria-hidden>
                        {f.emoji}
                      </span>
                      <span className="mt-1 block text-lg font-bold">
                        {f.label}
                      </span>
                    </Choice>
                  </motion.div>
                ))}
              </div>
              <Footer onBack={() => go("ask", -1)}>
                <PrimaryButton disabled={!food} onClick={() => go("date")}>
                  Next
                </PrimaryButton>
              </Footer>
            </Page>
          )}

          {/* Date */}
          {step === "date" && (
            <Page key="date" dir={dir}>
              <Title>Which day works for you?</Title>
              <p className="text-xl text-ink/70">
                No pressure, pick any day that's free.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {days.map((d, i) => {
                  const selected = date?.toDateString() === d.toDateString();
                  return (
                    <motion.div
                      key={d.toISOString()}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.5 + i * 0.05,
                        type: "spring",
                        stiffness: 300,
                      }}
                    >
                      <Choice
                        selected={selected}
                        onClick={() => setDate(d)}
                        className="w-full py-2"
                      >
                        <span className="block text-base">
                          {d.toLocaleDateString("en-IN", { weekday: "short" })}
                        </span>
                        <span className="block text-3xl leading-tight font-bold">
                          {d.getDate()}
                        </span>
                        <span className="block text-base">
                          {d.toLocaleDateString("en-IN", { month: "short" })}
                        </span>
                      </Choice>
                    </motion.div>
                  );
                })}
              </div>
              <Footer onBack={() => go("food", -1)}>
                <PrimaryButton disabled={!date} onClick={() => go("time")}>
                  Next
                </PrimaryButton>
              </Footer>
            </Page>
          )}

          {/* Time */}
          {step === "time" && (
            <Page key="time" dir={dir}>
              <Title>And what time?</Title>
              <p className="text-xl text-ink/70">
                I'll be there a little early anyway.
              </p>
              <div className="mt-6 flex flex-col gap-4">
                {TIMES.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                  >
                    <Choice
                      selected={time === t.id}
                      onClick={() => setTime(t.id)}
                      className="w-full px-5"
                    >
                      <span className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{t.time}</span>
                        <span className="text-lg">{t.note}</span>
                      </span>
                    </Choice>
                  </motion.div>
                ))}
              </div>
              <Footer onBack={() => go("date", -1)}>
                <PrimaryButton disabled={!time} onClick={() => go("friend")}>
                  Next
                </PrimaryButton>
              </Footer>
            </Page>
          )}

          {/* Guess who's joining */}
          {step === "friend" && (
            <Page key="friend" dir={dir}>
              <Title>Guess who's joining us…</Title>
              <p className="text-xl text-ink/70">
                …so it doesn't get awkward 😅
              </p>

              <MysteryCard
                revealed={friendRevealed}
                onReveal={() => setFriendRevealed(true)}
              />

              <Footer onBack={() => go("time", -1)}>
                <AnimatePresence>
                  {friendRevealed && (
                    <motion.div
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: 0.9,
                        type: "spring",
                        stiffness: 400,
                        damping: 14,
                      }}
                    >
                      <PrimaryButton onClick={() => go("see")}>
                        Ohh nice! 😄
                      </PrimaryButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Footer>
            </Page>
          )}

          {/* Btw this is how I see you */}
          {step === "see" && (
            <Page key="see" dir={dir}>
              <Title>Btw, this is how I see you</Title>
              <div className="relative">
                <Polaroid src={CONFIG.herPhoto} alt="How I see you" tilt={-3} />
                {["💗", "✨", "💖", "🌸", "✨"].map((e, i) => (
                  <motion.span
                    key={i}
                    className="pointer-events-none absolute text-2xl"
                    style={{
                      left: i % 2 ? "88%" : "2%",
                      bottom: `${10 + i * 12}%`,
                    }}
                    animate={{
                      y: [0, -40, 0],
                      opacity: [0, 1, 0],
                      rotate: [0, i % 2 ? 20 : -20, 0],
                    }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      delay: 1 + i * 0.5,
                    }}
                    aria-hidden
                  >
                    {e}
                  </motion.span>
                ))}
              </div>
              <Footer>
                <PrimaryButton onClick={() => go("line3")}>
                  looks sundar 🫡
                </PrimaryButton>
              </Footer>
            </Page>
          )}

          {/* Done */}
          {step === "done" && (
            <Page key="done" dir={dir}>
              <HeartBurst />
              <div className="flex items-start justify-between gap-3">
                <Title>It's a plan!</Title>
                <motion.div
                  initial={{ scale: 3, opacity: 0, rotate: -50 }}
                  animate={{ scale: 1, opacity: 1, rotate: -12 }}
                  transition={{
                    delay: 0.6,
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                  }}
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-[#a8304a] bg-rose text-3xl text-paper shadow-[inset_0_-6px_12px_rgba(0,0,0,.3),0_6px_12px_rgba(0,0,0,.3)]"
                  aria-hidden
                >
                  ☺
                </motion.div>
              </div>

              <HandText
                text="Dear diary,"
                delay={1}
                className="mt-6 text-xl text-ink/60"
              />
              <HandText
                text={`${CONFIG.herName}'s up for hanging out 🥹 ${summary}`}
                delay={1.5}
                className="mt-2 text-2xl leading-snug font-bold"
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.5 }}
                className="mt-auto pt-8"
              >
                {waLink ? (
                  <>
                    <p className="text-center text-xl text-ink/80">
                      If this was good, let {CONFIG.myName} know 👇
                    </p>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 block rounded-full bg-rose px-6 py-3 text-center text-xl font-bold text-paper shadow-[0_6px_0_#a8304a] active:translate-y-1 active:shadow-[0_2px_0_#a8304a]"
                    >
                      confirm 😌
                    </a>
                  </>
                ) : (
                  <p className="text-xl">
                    Take a screenshot and send it to {CONFIG.myName} 😌
                  </p>
                )}
              </motion.div>
            </Page>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
