import { PageHeader } from "@/components/PageHeader";
import { PlotlyChart } from "@/components/PlotlyChart";
import mlResults from "@/data/mlResults.json";
import { motion } from "framer-motion";

const { modelResults, bestModel } = mlResults;

const colors: Record<string, string> = {
  "Logistic Regression": "#0ea5e9",
  "Random Forest": "#22c55e",
  "XGBoost": "#8b5cf6",
  "SVM": "#f59e0b",
};

export default function ModelPerformance() {
  const metrics = ["accuracy", "precision", "recall", "f1", "auc"] as const;

  return (
    <div>
      <PageHeader title="Model Performance" description="Comprehensive comparison of machine learning models with evaluation metrics, ROC curves, and confusion matrices" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card mb-6">
        <PlotlyChart
          title="Model Comparison — All Metrics"
          data={Object.entries(modelResults).map(([name, r]) => ({
            x: metrics.map((m) => m.toUpperCase()),
            y: metrics.map((m) => (r as any)[m] * 100),
            type: "bar" as const,
            name,
            marker: { color: colors[name] },
          }))}
          layout={{ barmode: "group", yaxis: { title: "Score (%)", range: [0, 105] } }}
          height={400}
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <PlotlyChart
            title="ROC Curves"
            data={[
              ...Object.entries(modelResults).map(([name, r]) => ({
                x: r.roc.fpr,
                y: r.roc.tpr,
                type: "scatter" as const,
                mode: "lines" as const,
                name: `${name} (AUC: ${r.auc})`,
                line: { color: colors[name], width: 2 },
              })),
              {
                x: [0, 1],
                y: [0, 1],
                type: "scatter" as const,
                mode: "lines" as const,
                name: "Random Baseline",
                line: { color: "#94a3b8", dash: "dash" as const, width: 1 },
              },
            ]}
            layout={{ xaxis: { title: "False Positive Rate" }, yaxis: { title: "True Positive Rate" } }}
            height={400}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <h3 className="text-lg font-bold font-display mb-4">Performance Summary</h3>
          <div className="space-y-3">
            {Object.entries(modelResults).map(([name, r]) => (
              <div key={name} className={`p-4 rounded-lg border ${name === bestModel ? "border-primary bg-primary/5" : "border-border"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{name}</span>
                  {name === bestModel && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">Best Model</span>}
                </div>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {metrics.map((m) => (
                    <div key={m} className="text-center">
                      <p className="text-xs text-muted-foreground capitalize">{m}</p>
                      <p className="text-sm font-bold">{((r as any)[m] * 100).toFixed(1)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <h2 className="text-xl font-bold font-display mb-4">Confusion Matrices</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(modelResults).map(([name, r]) => (
          <motion.div key={name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
            <PlotlyChart
              title={`${name} — Confusion Matrix`}
              data={[{
                z: r.confusion_matrix,
                x: ["Predicted Negative", "Predicted Positive"],
                y: ["Actual Negative", "Actual Positive"],
                type: "heatmap",
                colorscale: [[0, "#f0f9ff"], [1, colors[name] || "#0ea5e9"]],
                text: r.confusion_matrix.map((row: number[]) => row.map((v) => String(v))),
                texttemplate: "%{text}",
                showscale: false,
              }]}
              layout={{ margin: { l: 120, b: 80 } }}
              height={300}
            />
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card mt-6">
        <h3 className="text-lg font-bold font-display mb-3">SHAP Model Explainability</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          SHAP (SHapley Additive exPlanations) values provide a unified measure of feature importance based on game theory.
          Each feature's SHAP value represents its contribution to pushing the model's prediction from the base value (average prediction)
          to the actual predicted value. Positive SHAP values push the prediction towards heart disease, while negative values push away from it.
          This makes the model transparent and trustworthy — essential for healthcare applications where explainability is critical.
        </p>
        <PlotlyChart
          title="SHAP Feature Impact (XGBoost)"
          data={[{
            y: mlResults.shapImportance.map((f) => f.feature).reverse(),
            x: mlResults.shapImportance.map((f) => f.importance).reverse(),
            type: "bar",
            orientation: "h",
            marker: { color: mlResults.shapImportance.map((_, i) => `hsl(${262 - i * 10}, 70%, ${55 + i * 2}%)`).reverse() },
          }]}
          layout={{ margin: { l: 160 }, xaxis: { title: "Mean |SHAP Value|" } }}
          height={450}
        />
      </motion.div>
    </div>
  );
}
