import { PageHeader } from "@/components/PageHeader";
import { PlotlyChart } from "@/components/PlotlyChart";
import mlResults from "@/data/mlResults.json";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

const { rawData } = mlResults;
const data = rawData as any[];

const ageGroups = ["25-34", "35-44", "45-54", "55-64", "65-74", "75+"];
function getAgeGroup(age: number) {
  if (age < 35) return "25-34";
  if (age < 45) return "35-44";
  if (age < 55) return "45-54";
  if (age < 65) return "55-64";
  if (age < 75) return "65-74";
  return "75+";
}

export default function HealthTrends() {
  const [metric, setMetric] = useState<"Blood Pressure" | "Heart Rate" | "Blood Sugar">("Blood Pressure");

  const trendData = useMemo(() => {
    const groups: Record<string, { values: number[]; diseaseCount: number; total: number }> = {};
    ageGroups.forEach((g) => (groups[g] = { values: [], diseaseCount: 0, total: 0 }));
    data.forEach((p) => {
      const g = getAgeGroup(p.Age);
      if (groups[g]) {
        groups[g].values.push(p[metric]);
        groups[g].total++;
        if (p["Heart Disease"] === 1) groups[g].diseaseCount++;
      }
    });
    return ageGroups.map((g) => ({
      group: g,
      mean: groups[g].values.length ? groups[g].values.reduce((a, b) => a + b, 0) / groups[g].values.length : 0,
      min: groups[g].values.length ? Math.min(...groups[g].values) : 0,
      max: groups[g].values.length ? Math.max(...groups[g].values) : 0,
      diseaseRate: groups[g].total ? (groups[g].diseaseCount / groups[g].total) * 100 : 0,
      count: groups[g].total,
    }));
  }, [metric]);

  const lifestyleByAge = useMemo(() => {
    const groups: Record<string, { exercise: number[]; stress: number[] }> = {};
    ageGroups.forEach((g) => (groups[g] = { exercise: [], stress: [] }));
    data.forEach((p) => {
      const g = getAgeGroup(p.Age);
      if (groups[g]) {
        groups[g].exercise.push(p["Exercise Hours"]);
        groups[g].stress.push(p["Stress Level"]);
      }
    });
    return ageGroups.map((g) => ({
      group: g,
      avgExercise: groups[g].exercise.length ? groups[g].exercise.reduce((a, b) => a + b, 0) / groups[g].exercise.length : 0,
      avgStress: groups[g].stress.length ? groups[g].stress.reduce((a, b) => a + b, 0) / groups[g].stress.length : 0,
    }));
  }, []);

  const smokingByAge = useMemo(() => {
    const groups: Record<string, Record<string, number>> = {};
    ageGroups.forEach((g) => (groups[g] = { Current: 0, Former: 0, Never: 0 }));
    data.forEach((p) => {
      const g = getAgeGroup(p.Age);
      if (groups[g] && p.Smoking && groups[g][p.Smoking] !== undefined) groups[g][p.Smoking]++;
    });
    return groups;
  }, []);

  return (
    <div>
      <PageHeader title="Health Trend Monitoring" description="Track cardiovascular health indicators across age groups and demographics" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card mb-6">
        <div className="flex flex-wrap gap-2">
          {(["Blood Pressure", "Heart Rate", "Blood Sugar"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                metric === m ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <PlotlyChart
            title="Heart Disease Rate by Age Group"
            data={[{
              x: trendData.map((d) => d.group),
              y: trendData.map((d) => d.diseaseRate.toFixed(1)),
              type: "bar",
              marker: {
                color: trendData.map((d) => d.diseaseRate > 50 ? "#ef4444" : d.diseaseRate > 30 ? "#f59e0b" : "#22c55e"),
              },
              text: trendData.map((d) => `${d.diseaseRate.toFixed(1)}%`),
              textposition: "outside",
            }]}
            layout={{ yaxis: { title: "Disease Rate (%)", range: [0, 100] }, xaxis: { title: "Age Group" } }}
            height={380}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <PlotlyChart
            title="Exercise & Stress by Age Group"
            data={[
              {
                x: lifestyleByAge.map((d) => d.group),
                y: lifestyleByAge.map((d) => d.avgExercise.toFixed(1)),
                type: "bar",
                name: "Avg Exercise (hrs)",
                marker: { color: "#22c55e" },
              },
              {
                x: lifestyleByAge.map((d) => d.group),
                y: lifestyleByAge.map((d) => d.avgStress.toFixed(1)),
                type: "bar",
                name: "Avg Stress Level",
                marker: { color: "#ef4444" },
              },
            ]}
            layout={{ barmode: "group", yaxis: { title: "Value" }, xaxis: { title: "Age Group" } }}
            height={380}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <PlotlyChart
            title="Smoking Status by Age Group"
            data={["Current", "Former", "Never"].map((status, i) => ({
              x: ageGroups,
              y: ageGroups.map((g) => smokingByAge[g][status]),
              type: "bar" as const,
              name: status,
              marker: { color: ["#ef4444", "#f59e0b", "#22c55e"][i] },
            }))}
            layout={{ barmode: "stack", yaxis: { title: "Count" }, xaxis: { title: "Age Group" } }}
            height={380}
          />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
        <h3 className="text-lg font-bold font-display mb-3">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="font-semibold text-foreground mb-1">📈 Age & Disease Correlation</p>
            <p className="text-muted-foreground">Heart disease prevalence increases significantly with age, with the highest rates observed in the 65+ age groups.</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="font-semibold text-foreground mb-1">🏃 Exercise Patterns</p>
            <p className="text-muted-foreground">Exercise hours tend to vary across age groups, with younger populations generally maintaining more active lifestyles.</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="font-semibold text-foreground mb-1">🚬 Smoking Trends</p>
            <p className="text-muted-foreground">The distribution of smoking status across age groups reveals important patterns in lifestyle choices and health outcomes.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
