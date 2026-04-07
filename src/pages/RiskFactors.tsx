import { PageHeader } from "@/components/PageHeader";
import { PlotlyChart } from "@/components/PlotlyChart";
import mlResults from "@/data/mlResults.json";
import { motion } from "framer-motion";

const { featureImportance, shapImportance } = mlResults;

export default function RiskFactors() {
  return (
    <div>
      <PageHeader title="Risk Factor Analysis" description="Identifying major risk factors contributing to heart disease using ML feature importance and SHAP explainability" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <PlotlyChart
            title="Random Forest — Feature Importance"
            data={[{
              y: featureImportance.map((f) => f.feature).reverse(),
              x: featureImportance.map((f) => f.importance).reverse(),
              type: "bar",
              orientation: "h",
              marker: { color: featureImportance.map((_, i) => `hsl(${199 - i * 8}, 80%, ${48 + i * 2}%)`).reverse() },
            }]}
            layout={{ margin: { l: 160 }, xaxis: { title: "Importance" } }}
            height={500}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <PlotlyChart
            title="SHAP — Mean Absolute Impact"
            data={[{
              y: shapImportance.map((f) => f.feature).reverse(),
              x: shapImportance.map((f) => f.importance).reverse(),
              type: "bar",
              orientation: "h",
              marker: { color: shapImportance.map((_, i) => `hsl(${172 - i * 8}, 66%, ${50 + i * 2}%)`).reverse() },
            }]}
            layout={{ margin: { l: 160 }, xaxis: { title: "Mean |SHAP Value|" } }}
            height={500}
          />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card mb-6">
        <h3 className="text-lg font-bold font-display mb-3">Why These Risk Factors Matter</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          {featureImportance.slice(0, 6).map((f) => (
            <div key={f.feature} className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold text-foreground">{f.feature}</p>
              <p className="mt-1">Importance: <span className="text-primary font-mono">{(f.importance * 100).toFixed(1)}%</span></p>
              <p className="mt-1">{getRiskExplanation(f.feature)}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
        <h3 className="text-lg font-bold font-display mb-3">Diagnostic Summary</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Random Forest model identified the top contributing features through information gain analysis, 
          while SHAP (SHapley Additive exPlanations) provides a game-theoretic approach to understanding individual predictions.
          Both methods agree on the importance of physiological metrics and lifestyle factors in predicting heart disease risk.
          Notably, features like <strong>Exercise Hours</strong>, <strong>Blood Sugar</strong>, and <strong>Cholesterol</strong> consistently 
          rank highly across both methods, suggesting they are robust indicators of cardiovascular health.
        </p>
      </motion.div>
    </div>
  );
}

function getRiskExplanation(feature: string): string {
  const explanations: Record<string, string> = {
    Age: "Advancing age increases cardiovascular risk as arteries stiffen and plaque accumulates over time.",
    Cholesterol: "High cholesterol leads to plaque buildup in arteries, increasing heart attack and stroke risk.",
    "Blood Pressure": "Hypertension forces the heart to work harder, damaging blood vessels over time.",
    "Heart Rate": "Abnormal resting heart rates may indicate cardiovascular stress or arrhythmias.",
    "Blood Sugar": "Elevated blood sugar damages blood vessels and nerves that control the heart.",
    "Stress Level": "Chronic stress triggers inflammation and hormonal responses that harm cardiovascular health.",
    "Exercise Hours": "Regular physical activity strengthens the heart and improves blood circulation.",
    Gender: "Biological sex differences affect hormone levels and cardiovascular disease risk profiles.",
    Smoking: "Smoking damages blood vessel lining, raises blood pressure, and reduces oxygen in blood.",
    Obesity: "Excess weight strains the heart and is linked to high cholesterol and diabetes.",
    Diabetes: "Diabetes significantly increases the risk of heart disease through blood vessel damage.",
    "Family History": "Genetic predisposition can increase susceptibility to cardiovascular conditions.",
    "Alcohol Intake": "Excessive alcohol consumption can weaken the heart muscle and raise blood pressure.",
    "Exercise Induced Angina": "Chest pain during exercise signals reduced blood flow to the heart muscle.",
    "Chest Pain Type": "The type and pattern of chest pain helps diagnose underlying cardiac conditions.",
  };
  return explanations[feature] || "This feature contributes to overall cardiovascular risk assessment.";
}
