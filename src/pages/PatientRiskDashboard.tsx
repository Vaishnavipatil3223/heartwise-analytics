import { PageHeader } from "@/components/PageHeader";
import { PlotlyChart } from "@/components/PlotlyChart";
import { StatCard } from "@/components/StatCard";
import mlResults from "@/data/mlResults.json";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Shield, AlertTriangle, HeartPulse, Activity, TrendingDown, TrendingUp } from "lucide-react";

const { rawData, scalerParams, lrParams, labelMappings, featureImportance } = mlResults;

function sigmoid(x: number) { return 1 / (1 + Math.exp(-x)); }

function computeRisk(patient: any) {
  const featureValues = scalerParams.features.map((feat: string) => {
    const val = patient[feat];
    if (typeof val === "string") {
      const mapping = labelMappings[feat as keyof typeof labelMappings];
      return mapping ? (mapping as any)[val] ?? 0 : 0;
    }
    return Number(val) || 0;
  });
  const scaled = featureValues.map((v: number, i: number) => (v - scalerParams.mean[i]) / scalerParams.scale[i]);
  const logit = scaled.reduce((sum: number, v: number, i: number) => sum + v * lrParams.coefficients[i], lrParams.intercept);
  return sigmoid(logit);
}

export default function PatientRiskDashboard() {
  const [ageRange, setAgeRange] = useState<[number, number]>([25, 80]);
  const [genderFilter, setGenderFilter] = useState("All");

  const patients = useMemo(() => {
    return (rawData as any[])
      .filter((p) => p.Age >= ageRange[0] && p.Age <= ageRange[1])
      .filter((p) => genderFilter === "All" || p.Gender === genderFilter)
      .map((p, i) => ({ ...p, id: i, risk: computeRisk(p) }));
  }, [ageRange, genderFilter]);

  const highRisk = patients.filter((p) => p.risk >= 0.6);
  const modRisk = patients.filter((p) => p.risk >= 0.3 && p.risk < 0.6);
  const lowRisk = patients.filter((p) => p.risk < 0.3);
  const avgRisk = patients.length ? patients.reduce((s, p) => s + p.risk, 0) / patients.length : 0;

  const riskBuckets = Array.from({ length: 10 }, (_, i) => {
    const lo = i * 10, hi = lo + 10;
    return patients.filter((p) => p.risk * 100 >= lo && p.risk * 100 < hi).length;
  });

  const topFactors = featureImportance.slice(0, 8);

  return (
    <div>
      <PageHeader title="Patient Risk Score Dashboard" description="Interactive population-level risk assessment with real-time filtering and analytics" />

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card mb-6">
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Age Range</label>
            <div className="flex gap-2 mt-1">
              <input type="number" min={25} max={80} value={ageRange[0]} onChange={(e) => setAgeRange([Number(e.target.value), ageRange[1]])} className="w-20 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <span className="self-center text-muted-foreground">—</span>
              <input type="number" min={25} max={80} value={ageRange[1]} onChange={(e) => setAgeRange([ageRange[0], Number(e.target.value)])} className="w-20 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Gender</label>
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="block mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm">
              <option>All</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
          <p className="text-sm text-muted-foreground">Showing <strong>{patients.length}</strong> patients</p>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="High Risk" value={highRisk.length} subtitle="≥ 60% probability" icon={AlertTriangle} color="destructive" />
        <StatCard title="Moderate Risk" value={modRisk.length} subtitle="30-60%" icon={TrendingUp} color="warning" />
        <StatCard title="Low Risk" value={lowRisk.length} subtitle="< 30%" icon={Shield} color="success" />
        <StatCard title="Avg Risk Score" value={`${(avgRisk * 100).toFixed(1)}%`} subtitle="Population mean" icon={HeartPulse} color="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Risk Distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <PlotlyChart
            title="Risk Score Distribution"
            data={[{
              x: riskBuckets,
              y: ["0-10%", "10-20%", "20-30%", "30-40%", "40-50%", "50-60%", "60-70%", "70-80%", "80-90%", "90-100%"],
              type: "bar",
              orientation: "h",
              marker: {
                color: riskBuckets.map((_, i) => i < 3 ? "#22c55e" : i < 6 ? "#f59e0b" : "#ef4444"),
              },
            }]}
            layout={{ xaxis: { title: "Number of Patients" }, margin: { l: 80 } }}
            height={380}
          />
        </motion.div>

        {/* Risk by Category Donut */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <PlotlyChart
            title="Risk Category Breakdown"
            data={[{
              values: [lowRisk.length, modRisk.length, highRisk.length],
              labels: ["Low Risk", "Moderate Risk", "High Risk"],
              type: "pie",
              hole: 0.55,
              marker: { colors: ["#22c55e", "#f59e0b", "#ef4444"] },
              textinfo: "label+percent+value",
            }]}
            height={380}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Risk vs Age Scatter */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <PlotlyChart
            title="Risk Score vs Age"
            data={[{
              x: patients.map((p) => p.Age),
              y: patients.map((p) => (p.risk * 100).toFixed(1)),
              mode: "markers",
              type: "scatter",
              marker: {
                color: patients.map((p) => p.risk * 100),
                colorscale: [[0, "#22c55e"], [0.5, "#f59e0b"], [1, "#ef4444"]],
                size: 6,
                opacity: 0.7,
                colorbar: { title: "Risk %" },
              },
            }]}
            layout={{ xaxis: { title: "Age" }, yaxis: { title: "Risk Score (%)" } }}
            height={380}
          />
        </motion.div>

        {/* Top Risk Factor Contribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <PlotlyChart
            title="Feature Importance (Top 8)"
            data={[{
              type: "scatterpolar",
              r: topFactors.map((f) => f.importance * 100),
              theta: topFactors.map((f) => f.feature),
              fill: "toself",
              fillcolor: "rgba(14,165,233,0.15)",
              line: { color: "#0ea5e9" },
              name: "Importance",
            }]}
            layout={{ polar: { radialaxis: { visible: true, range: [0, Math.max(...topFactors.map(f => f.importance * 100)) + 2] } } }}
            height={380}
          />
        </motion.div>
      </div>

      {/* High Risk Patient Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
        <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          High-Risk Patients ({highRisk.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Age</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Gender</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Cholesterol</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">BP</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Heart Rate</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Smoking</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Risk Score</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Actual</th>
              </tr>
            </thead>
            <tbody>
              {highRisk.slice(0, 15).map((p, i) => (
                <tr key={i} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="py-2 px-3">{p.Age}</td>
                  <td className="py-2 px-3">{p.Gender}</td>
                  <td className="py-2 px-3">{p.Cholesterol}</td>
                  <td className="py-2 px-3">{p["Blood Pressure"]}</td>
                  <td className="py-2 px-3">{p["Heart Rate"]}</td>
                  <td className="py-2 px-3">{p.Smoking}</td>
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-destructive/10 text-destructive">
                      {(p.risk * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 px-3">{p["Heart Disease"] === 1 ? "❤️ Disease" : "💚 Healthy"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
