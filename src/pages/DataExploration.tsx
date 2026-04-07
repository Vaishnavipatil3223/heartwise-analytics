import { PageHeader } from "@/components/PageHeader";
import { PlotlyChart } from "@/components/PlotlyChart";
import mlResults from "@/data/mlResults.json";
import { motion } from "framer-motion";
import { useState } from "react";

const { descriptiveStats, distributions, catDistributions, rawData } = mlResults;

const numericCols = Object.keys(descriptiveStats);

export default function DataExploration() {
  const [selectedCol, setSelectedCol] = useState("Age");

  const stats = descriptiveStats[selectedCol as keyof typeof descriptiveStats];
  const dist = distributions[selectedCol as keyof typeof distributions];

  return (
    <div>
      <PageHeader title="Data Exploration" description="Descriptive statistics and distribution analysis of the heart disease dataset (1000 patients, 16 features)" />

      <div className="mb-6">
        <label className="text-sm font-medium text-muted-foreground mr-2">Select Feature:</label>
        <select value={selectedCol} onChange={(e) => setSelectedCol(e.target.value)} className="rounded-lg border border-input bg-card px-3 py-2 text-sm">
          {numericCols.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {Object.entries(stats).map(([key, val]) => (
          <motion.div key={key} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="stat-card !p-3 text-center">
            <p className="text-xs text-muted-foreground capitalize">{key}</p>
            <p className="text-lg font-bold font-display">{val}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <PlotlyChart
            title={`${selectedCol} — Histogram`}
            data={[{
              x: dist.edges.slice(0, -1).map((e, i) => (e + dist.edges[i + 1]) / 2),
              y: dist.counts,
              type: "bar",
              marker: { color: "#0ea5e9", opacity: 0.8 },
            }]}
            layout={{ xaxis: { title: selectedCol }, yaxis: { title: "Count" } }}
            height={380}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <PlotlyChart
            title={`${selectedCol} — Box Plot by Heart Disease`}
            data={[0, 1].map((hd) => ({
              y: rawData.filter((d: any) => d["Heart Disease"] === hd).map((d: any) => d[selectedCol]),
              type: "box" as const,
              name: hd === 0 ? "No Disease" : "Heart Disease",
              marker: { color: hd === 0 ? "#22c55e" : "#ef4444" },
            }))}
            height={380}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <PlotlyChart
            title={`${selectedCol} — Violin Plot`}
            data={[0, 1].map((hd) => ({
              y: rawData.filter((d: any) => d["Heart Disease"] === hd).map((d: any) => d[selectedCol]),
              type: "violin" as const,
              name: hd === 0 ? "No Disease" : "Heart Disease",
              box: { visible: true },
              meanline: { visible: true },
            }))}
            height={380}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <PlotlyChart
            title={`${selectedCol} — Density (KDE)`}
            data={[0, 1].map((hd) => {
              const vals = rawData.filter((d: any) => d["Heart Disease"] === hd).map((d: any) => d[selectedCol]);
              return {
                x: vals,
                type: "histogram" as const,
                histnorm: "probability density",
                opacity: 0.6,
                name: hd === 0 ? "No Disease" : "Heart Disease",
                marker: { color: hd === 0 ? "#22c55e" : "#ef4444" },
              };
            })}
            layout={{ barmode: "overlay", xaxis: { title: selectedCol } }}
            height={380}
          />
        </motion.div>
      </div>

      <h2 className="text-xl font-bold font-display mb-4">Categorical Feature Distributions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(catDistributions).map(([col, vals]) => (
          <motion.div key={col} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
            <PlotlyChart
              title={col}
              data={[{
                labels: Object.keys(vals),
                values: Object.values(vals),
                type: "pie",
                hole: 0.4,
              }]}
              height={300}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
