import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";

const P2PHero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
      {/* ✅ TOP OVERLAY — improves navbar contrast */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/40 to-transparent z-10" />

      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 attachments py-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Pilot Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-semibold">
                Pilot Phase · Architecture Ready
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Community Energy Trading
            </h1>

            <p className="text-2xl text-blue-100 mb-8 font-semibold">
              Peer-to-Peer. Local. Fair.
            </p>

            <p className="text-lg text-blue-100 leading-relaxed mb-8">
              Eco-Grid enables households and small businesses to exchange
              surplus energy directly within their community. The P2P
              marketplace is designed for transparency, fairness, and
              future-ready energy systems.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="/contact"
                className="px-8 py-4 rounded-xl bg-white text-blue-600 font-bold text-lg hover:bg-blue-50 transition-colors shadow-2xl inline-flex items-center gap-2"
              >
                Join Pilot Program
                <Icons.ArrowRight size={20} />
              </a>

              <button
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-colors inline-flex items-center gap-2"
              >
                Learn More
                <Icons.ChevronDown size={20} />
              </button>
            </div>
          </motion.div>

          {/* Right Column - Illustration */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              {/* Central Hub */}
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-2xl relative z-10">
                <Icons.Zap className="text-white" size={64} />
              </div>

              {/* Orbiting Nodes */}
              {[0, 72, 144, 216, 288].map((rotation, index) => (
                <motion.div
                  key={rotation}
                  className="absolute top-1/2 left-1/2 w-16 h-16"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-120px)`,
                  }}
                  animate={{
                    rotate: [rotation, rotation + 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                    delay: index * 0.5,
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                    <Icons.Home className="text-white" size={24} />
                  </div>
                </motion.div>
              ))}

              {/* Connection Lines */}
              <svg
                className="absolute inset-0 w-full h-full"
                style={{ zIndex: 5 }}
              >
                {[0, 72, 144, 216, 288].map((rotation) => {
                  const angle = (rotation * Math.PI) / 180;
                  const x = 50 + Math.sin(angle) * 35;
                  const y = 50 - Math.cos(angle) * 35;
                  return (
                    <motion.line
                      key={rotation}
                      x1="50%"
                      y1="50%"
                      x2={`${x}%`}
                      y2={`${y}%`}
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 1 }}
                    />
                  );
                })}
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default P2PHero;
