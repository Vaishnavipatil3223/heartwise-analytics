import { PageHeader } from "@/components/PageHeader";
import { PlotlyChart } from "@/components/PlotlyChart";
import mlResults from "@/data/mlResults.json";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

const { scalerParams, lrParams, labelMappings } = mlResults;

const fields = [
  { name: "Age", type: "number", min: 25, max: 79, default: 50 },
  { name: "Gender", type: "select", options: Object.keys(labelMappings.Gender) },
  { name: "Cholesterol", type: "number", min: 150, max: 349, default: 200 },
  { name: "Blood Pressure", type: "number", min: 80, max: 200, default: 120 },
  { name: "Heart Rate", type: "number", min: 50, max: 150, default: 72 },
  { name: "Smoking", type: "select", options: Object.keys(labelMappings.Smoking) },
  { name: "Alcohol Intake", type: "select", options: Object.keys(labelMappings["Alcohol Intake"]) },
  { name: "Exercise Hours", type: "number", min: 0, max: 20, default: 5 },
  { name: "Family History", type: "select", options: Object.keys(labelMappings["Family History"]) },
  { name: "Diabetes", type: "select", options: Object.keys(labelMappings.Diabetes) },
  { name: "Obesity", type: "select", options: Object.keys(labelMappings.Obesity) },
  { name: "Stress Level", type: "number", min: 1, max: 10, default: 5 },
  { name: "Blood Sugar", type: "number", min: 70, max: 199, default: 100 },
  { name: "Exercise Induced Angina", type: "select", options: Object.keys(labelMappings["Exercise Induced Angina"]) },
  { name: "Chest Pain Type", type: "select", options: Object.keys(labelMappings["Chest Pain Type"]) },
];

function sigmoid(x: number) { return 1 / (1 + Math.exp(-x)); }

export default function Prediction() {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === "number") init[f.name] = f.default;
      else init[f.name] = f.options![0];
    });
    return init;
  });

  const prediction = useMemo(() => {
    const featureValues = scalerParams.features.map((feat: string) => {
      const val = formData[feat];
      if (typeof val === "string") {
        const mapping = labelMappings[feat as keyof typeof labelMappings];
        return mapping ? (mapping as any)[val] : 0;
      }
      return Number(val);
    });

    const scaled = featureValues.map((v: number, i: number) => (v - scalerParams.mean[i]) / scalerParams.scale[i]);
    const logit = scaled.reduce((sum: number, v: number, i: number) => sum + v * lrParams.coefficients[i], lrParams.intercept);
    const prob = sigmoid(logit);
    return prob;
  }, [formData]);

  const riskPercent = (prediction * 100).toFixed(1);
  const riskCategory = prediction < 0.3 ? "Low Risk" : prediction < 0.6 ? "Moderate Risk" : "High Risk";
  const riskColor = prediction < 0.3 ? "#22c55e" : prediction < 0.6 ? "#f59e0b" : "#ef4444";

  return (
    <div>
      <PageHeader title="Heart Disease Risk Prediction" description="Enter patient data to predict heart disease probability using our trained Logistic Regression model" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 stat-card">
          <h3 className="text-lg font-bold font-display mb-4">Patient Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="text-xs font-medium text-muted-foreground">{f.name}</label>
                {f.type === "number" ? (
                  <input
                    type="number"
                    min={f.min}
                    max={f.max}
                    value={formData[f.name]}
                    onChange={(e) => setFormData({ ...formData, [f.name]: Number(e.target.value) })}
                    className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                ) : (
                  <select
                    value={formData[f.name]}
                    onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="stat-card flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold font-display mb-4">Prediction Result</h3>
          <PlotlyChart
            data={[{
              type: "indicator",
              mode: "gauge+number",
              value: Number(riskPercent),
              title: { text: "Risk Score (%)" },
              gauge: {
                axis: { range: [0, 100] },
                bar: { color: riskColor },
                steps: [
                  { range: [0, 30], color: "rgba(34,197,94,0.15)" },
                  { range: [30, 60], color: "rgba(245,158,11,0.15)" },
                  { range: [60, 100], color: "rgba(239,68,68,0.15)" },
                ],
                threshold: { line: { color: riskColor, width: 4 }, thickness: 0.75, value: Number(riskPercent) },
              },
              domain: { x: [0, 1], y: [0, 1] },
            }]}
            height={250}
            layout={{ margin: { t: 30, b: 0, l: 30, r: 30 }, autosize: true }}
          />
          <div className="text-center mt-2">
            <span className="text-2xl font-bold font-display" style={{ color: riskColor }}>{riskCategory}</span>
            <p className="text-sm text-muted-foreground mt-2">Predicted probability: {riskPercent}%</p>
          </div>

          <div className="w-full mt-6 p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-semibold mb-2">AI Explanation</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {prediction < 0.3
                ? "Based on the provided health indicators, this patient shows a low risk profile for heart disease. The combination of their vital signs and lifestyle factors suggests good cardiovascular health."
                : prediction < 0.6
                ? "This patient shows moderate risk indicators. Some health parameters suggest potential cardiovascular concerns. Regular monitoring and lifestyle modifications are recommended."
                : "This patient presents significant risk factors for heart disease. Multiple indicators point to elevated cardiovascular risk. Immediate medical consultation and comprehensive cardiac evaluation is strongly recommended."}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
