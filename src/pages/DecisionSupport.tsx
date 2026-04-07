import { PageHeader } from "@/components/PageHeader";
import { PlotlyChart } from "@/components/PlotlyChart";
import mlResults from "@/data/mlResults.json";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Brain, CheckCircle, XCircle, AlertTriangle, Lightbulb } from "lucide-react";

const { scalerParams, lrParams, labelMappings, shapImportance, featureImportance } = mlResults;

function sigmoid(x: number) { return 1 / (1 + Math.exp(-x)); }

const fields = [
  { name: "Age", type: "number", min: 25, max: 79, default: 55 },
  { name: "Gender", type: "select", options: Object.keys(labelMappings.Gender) },
  { name: "Cholesterol", type: "number", min: 150, max: 349, default: 240 },
  { name: "Blood Pressure", type: "number", min: 80, max: 200, default: 140 },
  { name: "Heart Rate", type: "number", min: 50, max: 150, default: 80 },
  { name: "Smoking", type: "select", options: Object.keys(labelMappings.Smoking) },
  { name: "Exercise Hours", type: "number", min: 0, max: 20, default: 3 },
  { name: "Stress Level", type: "number", min: 1, max: 10, default: 6 },
  { name: "Blood Sugar", type: "number", min: 70, max: 199, default: 120 },
  { name: "Obesity", type: "select", options: Object.keys(labelMappings.Obesity) },
  { name: "Diabetes", type: "select", options: Object.keys(labelMappings.Diabetes) },
  { name: "Family History", type: "select", options: Object.keys(labelMappings["Family History"]) },
  { name: "Alcohol Intake", type: "select", options: Object.keys(labelMappings["Alcohol Intake"]) },
  { name: "Exercise Induced Angina", type: "select", options: Object.keys(labelMappings["Exercise Induced Angina"]) },
  { name: "Chest Pain Type", type: "select", options: Object.keys(labelMappings["Chest Pain Type"]) },
];

function computeContributions(formData: Record<string, any>) {
  return scalerParams.features.map((feat: string, i: number) => {
    const val = formData[feat];
    const numVal = typeof val === "string" ? ((labelMappings[feat as keyof typeof labelMappings] as any)?.[val] ?? 0) : Number(val);
    const scaled = (numVal - scalerParams.mean[i]) / scalerParams.scale[i];
    const contribution = scaled * lrParams.coefficients[i];
    return { feature: feat, contribution, value: val };
  });
}

export default function DecisionSupport() {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === "number") init[f.name] = f.default;
      else init[f.name] = f.options![0];
    });
    return init;
  });

  const contributions = useMemo(() => computeContributions(formData), [formData]);
  const riskProb = useMemo(() => {
    const logit = contributions.reduce((sum, c) => sum + c.contribution, lrParams.intercept);
    return sigmoid(logit);
  }, [contributions]);

  const sorted = [...contributions].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const topPositive = sorted.filter((c) => c.contribution > 0).slice(0, 5);
  const topNegative = sorted.filter((c) => c.contribution < 0).slice(0, 5);

  const interventions = useMemo(() => {
    const actions: { action: string; impact: string; priority: "high" | "medium" | "low" }[] = [];
    if (Number(formData.Cholesterol) > 200) actions.push({ action: "Reduce cholesterol through diet and medication", impact: "Could lower risk by 5-15%", priority: "high" });
    if (Number(formData["Blood Pressure"]) > 130) actions.push({ action: "Manage blood pressure with lifestyle and medication", impact: "Could lower risk by 5-10%", priority: "high" });
    if (formData.Smoking === "Current") actions.push({ action: "Quit smoking immediately", impact: "Could lower risk by 10-20%", priority: "high" });
    if (Number(formData["Exercise Hours"]) < 5) actions.push({ action: "Increase physical activity to 5+ hours/week", impact: "Could lower risk by 5-10%", priority: "medium" });
    if (Number(formData["Stress Level"]) > 6) actions.push({ action: "Implement stress management techniques", impact: "Could lower risk by 3-8%", priority: "medium" });
    if (Number(formData["Blood Sugar"]) > 140) actions.push({ action: "Monitor and control blood sugar levels", impact: "Could lower risk by 5-12%", priority: "high" });
    if (formData.Obesity === "Yes") actions.push({ action: "Weight management program", impact: "Could lower risk by 5-15%", priority: "high" });
    if (formData["Alcohol Intake"] === "Heavy") actions.push({ action: "Reduce alcohol consumption", impact: "Could lower risk by 3-8%", priority: "medium" });
    if (actions.length === 0) actions.push({ action: "Maintain current healthy lifestyle", impact: "Continue preventive care", priority: "low" });
    return actions;
  }, [formData]);

  return (
    <div>
      <PageHeader title="Healthcare Decision Support" description="AI-powered clinical decision support with explainable predictions and intervention recommendations" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Patient Input */}
        <div className="lg:col-span-1 stat-card">
          <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" /> Patient Profile
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="text-xs font-medium text-muted-foreground">{f.name}</label>
                {f.type === "number" ? (
                  <input type="number" min={f.min} max={f.max} value={formData[f.name]} onChange={(e) => setFormData({ ...formData, [f.name]: Number(e.target.value) })} className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm" />
                ) : (
                  <select value={formData[f.name]} onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })} className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm">
                    {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Explainable AI Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Score */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-display">Risk Assessment</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${riskProb < 0.3 ? "bg-green-500/10 text-green-500" : riskProb < 0.6 ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"}`}>
                {riskProb < 0.3 ? "Low Risk" : riskProb < 0.6 ? "Moderate Risk" : "High Risk"}
              </span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-6 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${riskProb * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full flex items-center justify-end pr-2"
                style={{ background: riskProb < 0.3 ? "#22c55e" : riskProb < 0.6 ? "#f59e0b" : "#ef4444" }}
              >
                <span className="text-xs font-bold text-white">{(riskProb * 100).toFixed(1)}%</span>
              </motion.div>
            </div>
          </motion.div>

          {/* SHAP-like Waterfall */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
            <PlotlyChart
              title="Feature Contributions (Why This Prediction)"
              data={[{
                type: "waterfall",
                orientation: "h",
                y: ["Base Rate", ...sorted.slice(0, 10).map((c) => c.feature), "Final Prediction"],
                x: [50, ...sorted.slice(0, 10).map((c) => c.contribution * 15), 0],
                measure: ["absolute", ...sorted.slice(0, 10).map(() => "relative"), "total"],
                connector: { line: { color: "rgba(100,100,100,0.2)" } },
                increasing: { marker: { color: "#ef4444" } },
                decreasing: { marker: { color: "#22c55e" } },
                totals: { marker: { color: riskProb < 0.3 ? "#22c55e" : riskProb < 0.6 ? "#f59e0b" : "#ef4444" } },
              }]}
              layout={{ margin: { l: 140 }, yaxis: { autorange: "reversed" }, xaxis: { title: "Impact on Risk (%)" } }}
              height={420}
            />
          </motion.div>

          {/* Risk Factors Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="stat-card">
              <h4 className="text-sm font-bold font-display mb-3 flex items-center gap-2 text-destructive">
                <XCircle className="w-4 h-4" /> Risk-Increasing Factors
              </h4>
              {topPositive.map((c) => (
                <div key={c.feature} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <span className="text-sm">{c.feature}: <strong>{c.value}</strong></span>
                  <span className="text-xs text-destructive font-mono">+{(c.contribution * 15).toFixed(1)}%</span>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="stat-card">
              <h4 className="text-sm font-bold font-display mb-3 flex items-center gap-2 text-green-500">
                <CheckCircle className="w-4 h-4" /> Risk-Reducing Factors
              </h4>
              {topNegative.map((c) => (
                <div key={c.feature} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <span className="text-sm">{c.feature}: <strong>{c.value}</strong></span>
                  <span className="text-xs text-green-500 font-mono">{(c.contribution * 15).toFixed(1)}%</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Interventions */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
            <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" /> Recommended Interventions
            </h3>
            <div className="space-y-3">
              {interventions.map((int, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${int.priority === "high" ? "bg-destructive" : int.priority === "medium" ? "bg-yellow-500" : "bg-green-500"}`} />
                  <div>
                    <p className="text-sm font-medium">{int.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{int.impact}</p>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${int.priority === "high" ? "bg-destructive/10 text-destructive" : int.priority === "medium" ? "bg-yellow-500/10 text-yellow-500" : "bg-green-500/10 text-green-500"}`}>
                    {int.priority}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
