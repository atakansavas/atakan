"use client";
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-gray-900 to-black text-white font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center gap-8 max-w-3xl text-center">
        <div className="relative animate-[spin_15s_ease-in-out_infinite]">
          <div className="w-[180px] h-[180px] rounded-full border-4 border-blue-500 shadow-lg shadow-blue-500/50 overflow-hidden relative">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <clipPath id="circleView">
                  <circle cx="50" cy="50" r="50" />
                </clipPath>
              </defs>
              <image
                href="/atakan-profile.jpg"
                width="100"
                height="100"
                clipPath="url(#circleView)"
                className="object-cover"
              />
            </svg>
          </div>
          <div className="absolute -top-4 -right-4 bg-yellow-400 text-black p-2 rounded-full font-bold animate-[pulse_2s_infinite]">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              className="fill-current"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 animate-[pulse_3s_ease-in-out_infinite]">
          Developer Atakan
        </h1>

        <h2 className="text-xl md:text-2xl text-blue-300 font-[family-name:var(--font-geist-mono)]">
          Code Wizard & Bug Slayer
        </h2>

        <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md hover:scale-105 transition-transform duration-300">
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
            className="rounded-full bg-blue-600 text-white px-6 py-3 font-bold flex items-center gap-2 hover:scale-110 hover:bg-blue-700 active:scale-95 transition-all"
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
            className="rounded-full bg-purple-600 text-white px-6 py-3 font-bold flex items-center gap-2 hover:scale-110 hover:bg-purple-700 active:scale-95 transition-all"
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

      <footer className="mt-16 text-gray-400 text-sm font-[family-name:var(--font-geist-mono)]">
        <p>
          © {new Date().getFullYear()} Developer Atakan | Powered by coffee and
          bad jokes
        </p>
        <p
          className="mt-2 animate-[colorChange_3s_infinite]"
          style={{
            animationName: "colorChange",
            animationDuration: "3s",
            animationIterationCount: "infinite",
          }}
        >
          If you can read this, you should probably hire me
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
    </div>
  );
}
