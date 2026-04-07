import { PageHeader } from "@/components/PageHeader";
import { PlotlyChart } from "@/components/PlotlyChart";
import { motion } from "framer-motion";
import mlResults from "@/data/mlResults.json";

const { datasetInfo, catDistributions } = mlResults;

export default function BiasLimitations() {
  return (
    <div>
      <PageHeader title="Bias & Data Limitations" description="Critical analysis of selection bias, demographic representation, and dataset constraints" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <h3 className="text-lg font-bold font-display mb-3">Selection Bias in Hospital Data</h3>
          <div className="prose prose-sm text-muted-foreground max-w-none">
            <p>Hospital-based datasets are inherently subject to <strong>selection bias</strong> — the systematic error in data collection that occurs when the study population does not accurately represent the target population.</p>
            <h4 className="text-foreground">Key Sources of Bias:</h4>
            <ul>
              <li><strong>Berkson's Bias:</strong> Hospital patients may not represent the entire population. Those who seek medical care tend to have more severe conditions.</li>
              <li><strong>Survivorship Bias:</strong> Fatal cases may be underrepresented as they don't make it to hospital records.</li>
              <li><strong>Healthy User Bias:</strong> Individuals who exercise and maintain healthy lifestyles are less likely to visit hospitals, underrepresenting healthy profiles.</li>
              <li><strong>Demographic Bias:</strong> Certain demographics (age, gender, socioeconomic status) may be over or underrepresented based on healthcare access.</li>
            </ul>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <h3 className="text-lg font-bold font-display mb-3">Dataset Representation Analysis</h3>
          <PlotlyChart
            title="Gender Distribution vs Population"
            data={[
              {
                x: ["Male", "Female"],
                y: [catDistributions.Gender.Male / datasetInfo.rows * 100, catDistributions.Gender.Female / datasetInfo.rows * 100],
                type: "bar",
                name: "Dataset",
                marker: { color: "#0ea5e9" },
              },
              {
                x: ["Male", "Female"],
                y: [49.6, 50.4],
                type: "bar",
                name: "World Population",
                marker: { color: "#94a3b8" },
              },
            ]}
            layout={{ barmode: "group", yaxis: { title: "Percentage (%)" } }}
            height={300}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <PlotlyChart
            title="Disease Prevalence: Dataset vs Reality"
            data={[{
              x: ["This Dataset", "Global Average"],
              y: [(datasetInfo.diseaseCount / datasetInfo.rows * 100), 5.0],
              type: "bar",
              marker: { color: ["#ef4444", "#94a3b8"] },
              text: [`${(datasetInfo.diseaseCount / datasetInfo.rows * 100).toFixed(1)}%`, "~5%"],
              textposition: "outside",
            }]}
            layout={{ yaxis: { title: "Prevalence (%)", range: [0, 50] } }}
            height={300}
          />
          <p className="text-xs text-muted-foreground mt-2 px-2">
            The dataset has a {(datasetInfo.diseaseCount / datasetInfo.rows * 100).toFixed(1)}% heart disease prevalence — significantly higher than the global average (~5%), 
            indicating hospital/clinical selection bias where symptomatic patients are overrepresented.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <PlotlyChart
            title="Smoking Distribution Comparison"
            data={[
              {
                x: ["Never", "Former", "Current"],
                y: Object.values(catDistributions.Smoking).map((v) => (v as number) / datasetInfo.rows * 100),
                type: "bar",
                name: "Dataset",
                marker: { color: "#0ea5e9" },
              },
              {
                x: ["Never", "Former", "Current"],
                y: [58, 22, 20],
                type: "bar",
                name: "General Population (approx.)",
                marker: { color: "#94a3b8" },
              },
            ]}
            layout={{ barmode: "group", yaxis: { title: "Percentage (%)" } }}
            height={300}
          />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card mb-6">
        <h3 className="text-lg font-bold font-display mb-3">Limitations & Considerations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Sample Size", desc: `Only ${datasetInfo.rows} records — may not capture rare conditions or subgroup variations adequately.` },
            { title: "Geographic Bias", desc: "Dataset origin is unknown — health patterns vary significantly across regions and ethnicities." },
            { title: "Temporal Bias", desc: "Cross-sectional data captures a snapshot; longitudinal data would better track disease progression." },
            { title: "Feature Completeness", desc: `${datasetInfo.columns} features captured. Important factors like diet detail, genetics, and medication history are missing.` },
            { title: "Label Quality", desc: "Heart disease diagnosis accuracy depends on diagnostic criteria used, which can vary between institutions." },
            { title: "Generalizability", desc: "Models trained on this data should be validated on external datasets before clinical application." },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
        <h3 className="text-lg font-bold font-display mb-3">Academic Implications</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For academic and research purposes, these biases must be acknowledged and discussed. 
          The model's performance metrics, while strong on this dataset, should be interpreted with caution when 
          considering real-world deployment. External validation, fairness audits, and calibration studies are 
          essential steps before any clinical adoption. The high prevalence rate in the dataset ({(datasetInfo.diseaseCount / datasetInfo.rows * 100).toFixed(1)}%) 
          compared to general population prevalence (~5%) means the model may overestimate risk for the general population.
          Proper recalibration or prevalence-adjusted thresholds would be needed for population-level screening.
        </p>
      </motion.div>
    </div>
  );
}
