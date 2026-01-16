import React from "react";
import { motion } from "framer-motion";
import P2PHero from "../components/p2p/P2PHero";
import P2PValueProposition from "../components/p2p/P2PValueProposition";
import P2PMarketplaceStatus from "../components/p2p/P2PMarketplaceStatus";
import P2PArchitecture from "../components/p2p/P2PArchitecture";
import P2PImpactTeaser from "../components/p2p/P2PImpactTeaser";

const P2PCommunity = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <P2PHero />

      {/* Value Proposition */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <P2PValueProposition />
        </div>
      </section>

      {/* Marketplace Status */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4">
          <P2PMarketplaceStatus />
        </div>
      </section>

      {/* Architecture & Scale */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <P2PArchitecture />
        </div>
      </section>

      {/* Impact Teaser */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <P2PImpactTeaser />
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Join the Energy Community?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Be among the first to trade energy with your neighbors when P2P
              launches.
            </p>

            <a
              href="/contact"
              className="inline-block px-8 py-4 rounded-2xl bg-white text-blue-600 font-bold text-lg hover:bg-blue-50 transition-colors shadow-2xl"
            >
              Join Pilot Program
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default P2PCommunity;
