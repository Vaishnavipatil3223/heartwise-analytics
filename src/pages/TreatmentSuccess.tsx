import { PageHeader } from "@/components/PageHeader";
import { PlotlyChart } from "@/components/PlotlyChart";
import { motion } from "framer-motion";
import { useState } from "react";

export default function TreatmentSuccess() {
  const [successProb, setSuccessProb] = useState(0.75);
  const [benefit, setBenefit] = useState(80);
  const [failureProb, setFailureProb] = useState(0.25);
  const [cost, setCost] = useState(30);

  const expectedValue = (successProb * benefit) - (failureProb * cost);
  const recommendation = expectedValue > 40 ? "Strongly Recommended" : expectedValue > 20 ? "Recommended with Monitoring" : expectedValue > 0 ? "Proceed with Caution" : "Not Recommended";
  const recColor = expectedValue > 40 ? "#22c55e" : expectedValue > 20 ? "#0ea5e9" : expectedValue > 0 ? "#f59e0b" : "#ef4444";

  const scenarios = [
    { name: "Medication Therapy", sp: 0.70, b: 60, fp: 0.30, c: 15 },
    { name: "Lifestyle Changes Only", sp: 0.55, b: 50, fp: 0.45, c: 5 },
    { name: "Surgical Intervention", sp: 0.85, b: 95, fp: 0.15, c: 60 },
    { name: "Combined Therapy", sp: 0.80, b: 85, fp: 0.20, c: 35 },
  ];

  return (
    <div>
      <PageHeader title="Treatment Success Probability" description="Expected Value analysis for healthcare decision-making using probability-based treatment evaluation" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <h3 className="text-lg font-bold font-display mb-4">Treatment Parameters</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Probability of Success: {(successProb * 100).toFixed(0)}%</label>
              <input type="range" min="0" max="1" step="0.01" value={successProb} onChange={(e) => { setSuccessProb(Number(e.target.value)); setFailureProb(1 - Number(e.target.value)); }} className="w-full mt-1 accent-primary" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Benefit Score (0-100): {benefit}</label>
              <input type="range" min="0" max="100" step="1" value={benefit} onChange={(e) => setBenefit(Number(e.target.value))} className="w-full mt-1 accent-primary" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Probability of Failure: {(failureProb * 100).toFixed(0)}%</label>
              <input type="range" min="0" max="1" step="0.01" value={failureProb} onChange={(e) => { setFailureProb(Number(e.target.value)); setSuccessProb(1 - Number(e.target.value)); }} className="w-full mt-1 accent-destructive" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Cost Score (0-100): {cost}</label>
              <input type="range" min="0" max="100" step="1" value={cost} onChange={(e) => setCost(Number(e.target.value))} className="w-full mt-1 accent-destructive" />
            </div>
            <div className="p-4 rounded-lg bg-muted/50 mt-4">
              <p className="text-sm font-mono">EV = ({(successProb).toFixed(2)} × {benefit}) − ({failureProb.toFixed(2)} × {cost})</p>
              <p className="text-2xl font-bold font-display mt-2" style={{ color: recColor }}>Expected Value: {expectedValue.toFixed(1)}</p>
              <p className="text-sm mt-1" style={{ color: recColor }}>{recommendation}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <PlotlyChart
            title="Treatment Decision Analysis"
            data={[
              { x: ["Success Component", "Failure Component", "Expected Value"], y: [successProb * benefit, -(failureProb * cost), expectedValue], type: "bar", marker: { color: ["#22c55e", "#ef4444", recColor] }, text: [(successProb * benefit).toFixed(1), (-(failureProb * cost)).toFixed(1), expectedValue.toFixed(1)], textposition: "outside" },
            ]}
            layout={{ yaxis: { title: "Score" } }}
            height={400}
          />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
        <h3 className="text-lg font-bold font-display mb-4">Treatment Scenario Comparison</h3>
        <PlotlyChart
          title="Expected Value by Treatment Type"
          data={[{
            x: scenarios.map((s) => s.name),
            y: scenarios.map((s) => (s.sp * s.b) - (s.fp * s.c)),
            type: "bar",
            marker: { color: ["#0ea5e9", "#22c55e", "#8b5cf6", "#f59e0b"] },
            text: scenarios.map((s) => ((s.sp * s.b) - (s.fp * s.c)).toFixed(1)),
            textposition: "outside",
          }]}
          layout={{ yaxis: { title: "Expected Value" } }}
          height={400}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {scenarios.map((s) => (
            <div key={s.name} className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-semibold">{s.name}</p>
              <p className="text-muted-foreground">Success: {(s.sp * 100)}% | Benefit: {s.b}</p>
              <p className="text-muted-foreground">Failure: {(s.fp * 100)}% | Cost: {s.c}</p>
              <p className="font-bold text-primary mt-1">EV = {((s.sp * s.b) - (s.fp * s.c)).toFixed(1)}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
