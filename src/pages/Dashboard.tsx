import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { PlotlyChart } from "@/components/PlotlyChart";
import { Users, HeartPulse, Activity, AlertTriangle, TrendingUp, Stethoscope } from "lucide-react";
import mlResults from "@/data/mlResults.json";
import { motion } from "framer-motion";

const { datasetInfo, descriptiveStats, modelResults, bestModel, catDistributions, crossTabs } = mlResults;

export default function Dashboard() {
  const diseaseRate = ((datasetInfo.diseaseCount / datasetInfo.rows) * 100).toFixed(1);
  const bestAcc = (modelResults[bestModel as keyof typeof modelResults]?.accuracy * 100).toFixed(1);

  return (
    <div>
      <PageHeader title="Dashboard Overview" description="AI-Powered Heart Disease Risk Prediction & Decision Support System" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard title="Total Patients" value={datasetInfo.rows.toLocaleString()} subtitle="In dataset" icon={Users} color="primary" />
        <StatCard title="Heart Disease Cases" value={datasetInfo.diseaseCount} subtitle={`${diseaseRate}% prevalence`} icon={HeartPulse} color="destructive" />
        <StatCard title="Healthy Patients" value={datasetInfo.healthyCount} subtitle="No heart disease" icon={Activity} color="success" />
        <StatCard title="Features Analyzed" value={datasetInfo.columns - 1} subtitle="Health indicators" icon={Stethoscope} color="accent" />
        <StatCard title="Best Model AUC" value={`${bestAcc}%`} subtitle={bestModel} icon={TrendingUp} color="primary" />
        <StatCard title="Avg Age" value={descriptiveStats.Age.mean} subtitle={`Range: ${descriptiveStats.Age.min}-${descriptiveStats.Age.max}`} icon={AlertTriangle} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="stat-card">
          <PlotlyChart
            title="Heart Disease Distribution"
            data={[{
              values: [datasetInfo.healthyCount, datasetInfo.diseaseCount],
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
            data={Object.entries(crossTabs.Gender).map(([gender, vals]) => ({
              x: ["No Disease", "Heart Disease"],
              y: [vals["No Disease"], vals["Disease"]],
              type: "bar" as const,
              name: gender,
            }))}
            layout={{ barmode: "group" }}
            height={350}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="stat-card">
          <PlotlyChart
            title="Model Performance Comparison"
            data={[{
              x: Object.keys(modelResults),
              y: Object.values(modelResults).map((m) => m.accuracy * 100),
              type: "bar",
              marker: { color: ["#0ea5e9", "#22c55e", "#8b5cf6", "#f59e0b"] },
              text: Object.values(modelResults).map((m) => `${(m.accuracy * 100).toFixed(1)}%`),
              textposition: "outside",
            }]}
            layout={{ yaxis: { title: "Accuracy (%)", range: [0, 105] } }}
            height={350}
          />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="stat-card">
        <PlotlyChart
          title="Heart Disease by Chest Pain Type"
          data={Object.entries(crossTabs["Chest Pain Type"]).map(([type, vals]) => ({
            x: ["No Disease", "Heart Disease"],
            y: [vals["No Disease"], vals["Disease"]],
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
