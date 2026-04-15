import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { PlotlyChart } from "@/components/PlotlyChart";
import { Users, HeartPulse, Activity, AlertTriangle, TrendingUp, Stethoscope } from "lucide-react";
import mlResults from "@/data/mlResults.json";
import { motion } from "framer-motion";

const { datasetInfo, descriptiveStats, modelResults, bestModel, catDistributions, crossTabs, rawData } = mlResults;

const diseaseCount = rawData.filter((r) => r["Heart Disease"] === 1).length;
const healthyCount = rawData.filter((r) => r["Heart Disease"] === 0).length;

export default function Dashboard() {
  const diseaseRate = ((diseaseCount / datasetInfo.rows) * 100).toFixed(1);
  const bestAcc = (modelResults[bestModel as keyof typeof modelResults]?.accuracy * 100).toFixed(1);

  return (
    <div>
      <PageHeader title="Dashboard Overview" description="ML-Powered Heart Disease Risk Prediction System (Python Backend)" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard title="Total Patients" value={datasetInfo.rows.toLocaleString()} subtitle="In dataset" icon={Users} color="primary" />
        <StatCard title="Heart Disease Cases" value={diseaseCount} subtitle={`${diseaseRate}% prevalence`} icon={HeartPulse} color="destructive" />
        <StatCard title="Healthy Patients" value={healthyCount} subtitle="No heart disease" icon={Activity} color="success" />
        <StatCard title="Features Analyzed" value={datasetInfo.columns - 1} subtitle="Health indicators" icon={Stethoscope} color="accent" />
        <StatCard title="Best Model AUC" value={`${bestAcc}%`} subtitle={bestModel} icon={TrendingUp} color="primary" />
        <StatCard title="Avg Age" value={descriptiveStats.Age.mean} subtitle={`Range: ${descriptiveStats.Age.min}-${descriptiveStats.Age.max}`} icon={AlertTriangle} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="stat-card">
          <PlotlyChart
            title="Heart Disease Distribution"
            data={[{
              values: [healthyCount, diseaseCount],
              labels: ["No Disease", "Heart Disease"],
              type: "pie",
              marker: { colors: ["#22c55e", "#ef4444"] },
              hole: 0.5,
              textinfo: "label+percent",
            }]}
            height={350}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="stat-card">
          <PlotlyChart
            title="Gender Distribution"
            data={[{
              x: Object.keys(catDistributions.Gender),
              y: Object.values(catDistributions.Gender),
              type: "bar",
              marker: { color: ["#0ea5e9", "#8b5cf6"] },
            }]}
            height={350}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="stat-card">
          <PlotlyChart
            title="Heart Disease by Gender"
            data={Object.entries(crossTabs.Gender).map(([gender, vals]: [string, any]) => ({
              x: ["No Disease", "Heart Disease"],
              y: [Math.round(vals.Count * (1 - vals.Disease)), Math.round(vals.Count * vals.Disease)],
              type: "bar" as const,
              name: gender,
            }))}
            layout={{ barmode: "group" }}
            height={350}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="stat-card">
          <PlotlyChart
            title="Model Comparison — All Metrics"
            data={Object.entries(modelResults).map(([name, r]) => ({
              x: ["ACCURACY", "PRECISION", "RECALL", "F1", "AUC"],
              y: [r.accuracy * 100, r.precision * 100, r.recall * 100, r.f1 * 100, r.auc * 100],
              type: "bar" as const,
              name,
              marker: { color: { "Logistic Regression": "#0ea5e9", "Random Forest": "#22c55e", "XGBoost": "#8b5cf6", "SVM": "#f59e0b" }[name] },
            }))}
            layout={{ barmode: "group", yaxis: { title: "Score (%)", range: [0, 105] } }}
            height={350}
          />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="stat-card">
        <PlotlyChart
          title="Heart Disease by Chest Pain Type"
          data={Object.entries(crossTabs["Chest Pain Type"]).map(([type, vals]: [string, any]) => ({
            x: ["No Disease", "Heart Disease"],
            y: [Math.round(vals.Count * (1 - vals.Disease)), Math.round(vals.Count * vals.Disease)],
            type: "bar" as const,
            name: type,
          }))}
          layout={{ barmode: "group" }}
          height={350}
        />
      </motion.div>
    </div>
  );
}
