import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";

const P2PImpactTeaser = () => {
  const metrics = [
    {
      icon: "Activity",
      label: "Community Trades",
      value: "Pilot Phase",
      subtext: "Trading launches Q2 2026",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: "Zap",
      label: "Energy Shared",
      value: "Calculated at Launch",
      subtext: "Real-time kWh tracking",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: "Leaf",
      label: "CO₂ Reduction",
      value: "Tracked Per Transaction",
      subtext: "~0.5 kg CO₂ per kWh saved",
      gradient: "from-emerald-500 to-green-600",
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
          Impact at a Glance
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Real environmental and economic impact, measured and verified
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = Icons[metric.icon];
          return (
            <motion.div
              key={metric.label}
              className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center mb-4 shadow-lg`}
              >
                <Icon className="text-white" size={32} />
              </div>

              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                {metric.label}
              </div>

              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {metric.value}
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400">
                {metric.subtext}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-start gap-4">
          <Icons.Info
            className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1"
            size={24}
          />
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Impact Metrics Activate with Live Trading
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Once the P2P marketplace launches, this dashboard will display
              real-time community impact: total energy traded, CO₂ savings, cost
              reductions, and participant growth. All data is calculated from
              verified transactions.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default P2PImpactTeaser;
