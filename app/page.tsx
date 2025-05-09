/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const playerRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Create YouTube player
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    let player: any;
    // Initialize player when YouTube API is ready
    // Define the YouTube API ready callback on the window object
    (window as any).onYouTubeIframeAPIReady = () => {
      player = new (window as any).YT.Player("youtube-player", {
        videoId: "vITHAlvP9Oo",
        playerVars: {
          autoplay: 1,
          controls: 0,
          mute: 1, // Changed from 1 to 0 to enable sound
          start: 1,
          loop: 1,
          playlist: "vITHAlvP9Oo",
          showinfo: 0,
          rel: 0,
          enablejsapi: 1,
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
          },
        },
      });
    };

    return () => {
      // Clean up
      if (player) {
        player.destroy();
      }
      (window as any).onYouTubeIframeAPIReady = null;
    };
  }, []);

  const openImageModal = () => {
    setShowModal(true);
  };

  const closeImageModal = () => {
    setShowModal(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-gray-900 to-black text-white font-[family-name:var(--font-geist-sans)] relative overflow-hidden">
      {/* YouTube Background Player */}
      <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden">
        <div
          id="youtube-player"
          ref={playerRef}
          className="w-full h-full"
        ></div>
      </div>

      <main className="flex flex-col items-center gap-8 max-w-3xl text-center z-10">
        <div className="relative animate-[bounce_0.6s_ease-in-out_infinite] hover:animate-[spin_0.5s_linear_infinite]">
          <div
            className="w-[180px] h-[180px] rounded-full border-4 border-blue-500 shadow-lg shadow-blue-500/50 overflow-hidden relative group cursor-pointer"
            onClick={openImageModal}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 animate-[shimmer_1s_ease-in-out_infinite] -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
            <Image
              src="/cv.JPG"
              alt="Atakan"
              width={180}
              height={180}
              className="transition-all duration-200 hover:scale-110 hover:rotate-12 animate-[pulse_1.5s_ease-in-out_infinite_alternate]"
            />
          </div>
          <div className="absolute -top-2 -right-2 text-2xl animate-[wiggle_0.3s_ease-in-out_infinite] opacity-0 hover:opacity-100">
            🧙‍♂️
          </div>
          <div className="absolute -bottom-2 -left-2 text-2xl animate-[wiggle_0.3s_ease-in-out_infinite_0.15s] opacity-0 hover:opacity-100">
            💻
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 animate-[gradient_3s_ease-in-out_infinite] relative">
          Developer Atakan
          <span className="absolute top-0 left-0 right-0 bottom-0 flex overflow-hidden opacity-70">
            <span className="animate-[sparkle_2s_ease-in-out_infinite_0.4s] text-white absolute h-1 w-1 rounded-full bg-white top-[15%] left-[10%]"></span>
            <span className="animate-[sparkle_2s_ease-in-out_infinite_0.1s] text-white absolute h-1 w-1 rounded-full bg-white top-[45%] left-[45%]"></span>
            <span className="animate-[sparkle_2s_ease-in-out_infinite_0.7s] text-white absolute h-1 w-1 rounded-full bg-white top-[30%] left-[75%]"></span>
            <span className="animate-[sparkle_2s_ease-in-out_infinite_1.1s] text-white absolute h-1 w-1 rounded-full bg-white top-[70%] left-[20%]"></span>
            <span className="animate-[sparkle_2s_ease-in-out_infinite_0.9s] text-white absolute h-1 w-1 rounded-full bg-white top-[60%] left-[60%]"></span>
          </span>
        </h1>

        <h2 className="text-xl md:text-2xl font-[family-name:var(--font-geist-mono)] bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 animate-[gradient_4s_ease-in-out_infinite_alternate] relative">
          Code Wizard & Bug Slayer
          <span className="absolute top-0 left-0 right-0 bottom-0 flex overflow-hidden opacity-70">
            <span className="animate-[sparkle_3s_ease-in-out_infinite_0.3s] text-white absolute h-1 w-1 rounded-full bg-white top-[20%] left-[15%]"></span>
            <span className="animate-[sparkle_3s_ease-in-out_infinite_0.8s] text-white absolute h-1 w-1 rounded-full bg-white top-[50%] left-[70%]"></span>
            <span className="animate-[sparkle_3s_ease-in-out_infinite_1.2s] text-white absolute h-1 w-1 rounded-full bg-white top-[80%] left-[30%]"></span>
          </span>
        </h2>

        <div className="backdrop-blur-md p-6 rounded-lg shadow-xl max-w-md hover:scale-105 transition-transform duration-300 border border-gray-700/50">
          <p className="text-lg mb-4">
            Welcome to my digital playground, where:
          </p>
          <ul className="list-disc list-inside text-left space-y-2 font-[family-name:var(--font-geist-mono)] text-gray-300">
            <li className="hover:text-blue-400 hover:translate-x-1 transition-all duration-200">
              Bugs fear to tread
            </li>
            <li className="hover:text-blue-400 hover:translate-x-1 transition-all duration-200">
              Coffee is my primary fuel source
            </li>
            <li className="hover:text-blue-400 hover:translate-x-1 transition-all duration-200">
              Semicolons are never optional
            </li>
            <li className="hover:text-blue-400 hover:translate-x-1 transition-all duration-200">
              My code is so clean it squeaks
            </li>
          </ul>
        </div>

        <div className="flex gap-4 mt-6 flex-wrap justify-center">
          <a
            className="rounded-full backdrop-blur-md text-white px-6 py-3 font-bold flex items-center gap-2 hover:scale-110 active:scale-95 transition-all border border-gray-700/50"
            href="https://github.com/atakansavas"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>GitHub</span>
            <svg
              className="w-5 h-5 animate-bounce"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a
            className="rounded-full backdrop-blur-md text-white px-6 py-3 font-bold flex items-center gap-2 hover:scale-110 active:scale-95 transition-all border border-gray-700/50"
            href="https://www.linkedin.com/in/hiata/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>LinkedIn</span>
            <svg
              className="w-5 h-5 animate-pulse"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                fill="currentColor"
              />
            </svg>
          </a>
        </div>
      </main>

      <footer className="mt-16 text-gray-400 text-sm font-[family-name:var(--font-geist-mono)] z-10">
        <p
          className="mt-2 animate-[colorChange_3s_infinite]"
          style={{
            animationName: "colorChange",
            animationDuration: "3s",
            animationIterationCount: "infinite",
          }}
        >
          © {new Date().getFullYear()} Developer Atakan | Powered by coffee and
          bad jokes
        </p>
        <style jsx>{`
          @keyframes colorChange {
            0% {
              color: #9ca3af;
            }
            50% {
              color: #60a5fa;
            }
            100% {
              color: #9ca3af;
            }
          }
        `}</style>
      </footer>

      {/* Image Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 transition-colors"
              onClick={closeImageModal}
            >
              ✕
            </button>
            <Image
              src="/old.JPG"
              alt="Atakan"
              width={600}
              height={600}
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
