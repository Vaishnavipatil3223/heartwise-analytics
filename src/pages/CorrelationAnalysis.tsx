import { PageHeader } from "@/components/PageHeader";
import { PlotlyChart } from "@/components/PlotlyChart";
import mlResults from "@/data/mlResults.json";
import { motion } from "framer-motion";

const { correlationMatrix, crossTabs } = mlResults;

export default function CorrelationAnalysis() {
  return (
    <div>
      <PageHeader title="Correlation Analysis" description="Exploring relationships between health indicators and heart disease" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card mb-6">
        <PlotlyChart
          title="Correlation Heatmap — All Features"
          data={[{
            z: correlationMatrix.values,
            x: correlationMatrix.columns,
            y: correlationMatrix.columns,
            type: "heatmap",
            colorscale: "RdBu",
            reversescale: true,
            zmin: -1,
            zmax: 1,
            text: correlationMatrix.values.map((row: number[]) => row.map((v) => v.toFixed(2))),
            texttemplate: "%{text}",
            textfont: { size: 9 },
          }]}
          layout={{ margin: { l: 120, b: 120 }, xaxis: { tickangle: -45 } }}
          height={600}
        />
        <p className="text-sm text-muted-foreground mt-3 px-2">
          The heatmap shows pairwise Pearson correlations between all encoded features. 
          Values close to +1 indicate strong positive correlation, while values close to -1 indicate strong negative correlation.
          Features with higher absolute correlation to <strong>Heart Disease</strong> are stronger predictors.
        </p>
      </motion.div>

      <h2 className="text-xl font-bold font-display mb-4">Heart Disease Rates by Category</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(crossTabs).map(([feature, data]) => (
          <motion.div key={feature} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
            <PlotlyChart
              title={`Heart Disease Rate by ${feature}`}
              data={[
                {
                  x: Object.keys(data),
                  y: Object.values(data).map((v: any) => (v["Disease"] * 100).toFixed(1)),
                  type: "bar",
                  name: "Disease Rate (%)",
                  marker: { color: "#ef4444", opacity: 0.8 },
                  text: Object.values(data).map((v: any) => `${(v["Disease"] * 100).toFixed(1)}%`),
                  textposition: "outside",
                },
              ]}
              layout={{ yaxis: { title: "Disease Rate (%)", range: [0, 60] }, xaxis: { title: feature } }}
              height={320}
            />
            <p className="text-xs text-muted-foreground mt-2 px-2">
              Shows the proportion of patients with heart disease across different <strong>{feature}</strong> categories.
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
