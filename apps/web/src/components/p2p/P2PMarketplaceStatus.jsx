import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";

const P2PMarketplaceStatus = () => {
  return (
    <motion.div
      className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-200 dark:border-blue-800"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex items-start gap-6 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Icons.Clock className="text-white" size={32} />
        </div>

        <div className="flex-1">
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Marketplace Status: Pilot Preparation
          </h3>

          <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
            The P2P Energy Marketplace is currently in pilot preparation.
            Trading features will be enabled progressively for stability and
            regulatory alignment. Our backend architecture is complete and
            tested—we're now working with regulatory advisors and pilot
            participants to ensure a smooth launch.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Icons.UserPlus size={20} />
              Join Pilot Program
            </a>

            <a
              href="/roadmap"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-2 border-slate-200 dark:border-slate-700"
            >
              <Icons.Map size={20} />
              View Roadmap
            </a>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mt-6">
            <Icons.Info className="inline mr-2" size={16} />
            Pilot participants will be notified before trading is enabled. Early
            adopters receive priority access and preferential fees.
          </p>
        </div>
      </div>

      {/* Timeline Preview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-8 border-t-2 border-blue-200 dark:border-blue-800">
        {[
          { phase: "Q1 2026", status: "Architecture Complete", done: true },
          { phase: "Q2 2026", status: "Pilot Launch (50 Users)", done: false },
          { phase: "Q3 2026", status: "Public Beta (500 Users)", done: false },
          { phase: "Q4 2026", status: "Full Launch", done: false },
        ].map((milestone, index) => (
          <div key={milestone.phase} className="text-center">
            <div
              className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${
                milestone.done
                  ? "bg-green-500"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              {milestone.done ? (
                <Icons.Check className="text-white" size={24} />
              ) : (
                <span className="text-white font-bold">{index + 1}</span>
              )}
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              {milestone.phase}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {milestone.status}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default P2PMarketplaceStatus;
