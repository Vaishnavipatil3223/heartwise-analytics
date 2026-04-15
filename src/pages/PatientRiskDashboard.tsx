import { PageHeader } from "@/components/PageHeader";
import { PlotlyChart } from "@/components/PlotlyChart";
import { StatCard } from "@/components/StatCard";
import mlResults from "@/data/mlResults.json";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Shield, AlertTriangle, HeartPulse, TrendingUp } from "lucide-react";

const { rawData, scalerParams, lrParams, labelMappings } = mlResults;

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

  return (
    <div>
      <PageHeader title="Patient Risk Score Dashboard" description="Interactive population-level risk assessment with real-time filtering and analytics" />

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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="High Risk" value={highRisk.length} subtitle="≥ 60% probability" icon={AlertTriangle} color="destructive" />
        <StatCard title="Moderate Risk" value={modRisk.length} subtitle="30-60%" icon={TrendingUp} color="warning" />
        <StatCard title="Low Risk" value={lowRisk.length} subtitle="< 30%" icon={Shield} color="success" />
        <StatCard title="Avg Risk Score" value={`${(avgRisk * 100).toFixed(1)}%`} subtitle="Population mean" icon={HeartPulse} color="primary" />
      </div>


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
