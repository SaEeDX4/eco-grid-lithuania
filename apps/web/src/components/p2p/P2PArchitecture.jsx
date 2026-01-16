import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";

const P2PArchitecture = () => {
  const features = [
    {
      icon: "Layers",
      title: "Modular Backend Architecture",
      description:
        "Clean separation of concerns: offer management, matching engine, settlement layer, and impact tracking. Each component can scale independently.",
    },
    {
      icon: "FileCheck",
      title: "Auditable Transaction Records",
      description:
        "Every trade generates a cryptographic receipt with blockchain-style verification. Full audit trail for regulatory compliance and dispute resolution.",
    },
    {
      icon: "Blocks",
      title: "Future-Ready Settlement Layer",
      description:
        "Simulated blockchain for pilot; ready to integrate with real distributed ledgers (Ethereum, Polygon, or custom chains) without architectural changes.",
    },
    {
      icon: "Globe",
      title: "Multi-Region Deployment",
      description:
        "Built for BC/Vancouver first, designed for national and cross-border expansion. Regional pricing, local regulations, and multi-currency support planned.",
    },
  ];

  return (
    <div>
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Built for Scale & Regulation
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Enterprise-grade architecture from day one
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = Icons[feature.icon];
          return (
            <motion.div
              key={feature.title}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="text-white" size={24} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default P2PArchitecture;
