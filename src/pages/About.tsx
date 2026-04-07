import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { HeartPulse, Database, Brain, BarChart3, Shield, Lightbulb } from "lucide-react";
import mlResults from "@/data/mlResults.json";

const { datasetInfo } = mlResults;

export default function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="About the Project" description="AI-Powered Healthcare Risk Prediction and Decision Support System" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card mb-6">
        <h2 className="text-xl font-bold font-display mb-3 gradient-text">Project Overview</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This Honors Project presents an AI-powered healthcare analytics platform designed to analyze patient health data,
          identify cardiovascular risk factors, predict heart disease probability, and provide actionable treatment and lifestyle
          recommendations. The system employs multiple machine learning models with explainable AI (SHAP) to ensure transparency
          and trustworthiness in clinical decision support.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {[
          { icon: Database, title: "Dataset", desc: `Kaggle Heart Disease Prediction dataset — ${datasetInfo.rows} patient records, ${datasetInfo.columns} features including demographics, vitals, lifestyle factors, and medical history. Target: Heart Disease (binary classification).` },
          { icon: Brain, title: "Machine Learning", desc: "4 models trained and compared: Logistic Regression, Random Forest, XGBoost, and SVM. SHAP explainability for model transparency." },
          { icon: BarChart3, title: "Analytics Pipeline", desc: "Complete analytics covering descriptive, diagnostic, predictive, and prescriptive stages — from raw data exploration to actionable health recommendations." },
          { icon: Shield, title: "Decision Support", desc: "Expected Value framework for treatment success probability analysis, personalized lifestyle recommendations with estimated risk reduction scores." },
        ].map((item, i) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10"><item.icon className="h-5 w-5 text-primary" /></div>
              <h3 className="font-bold font-display">{item.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card mb-6">
        <h2 className="text-xl font-bold font-display mb-3">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { cat: "Frontend", tools: "React, TypeScript, TailwindCSS, ShadCN UI, Framer Motion" },
            { cat: "Visualization", tools: "Plotly.js, React-Plotly, Interactive Charts" },
            { cat: "Machine Learning", tools: "Scikit-learn, XGBoost, SHAP, Pandas, NumPy" },
            { cat: "Data Analysis", tools: "Descriptive Stats, Correlation, Feature Importance" },
          ].map((t) => (
            <div key={t.cat} className="p-3 rounded-lg bg-muted/50">
              <p className="font-semibold text-xs">{t.cat}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.tools}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card mb-6">
        <h2 className="text-xl font-bold font-display mb-3">Dataset Columns ({datasetInfo.columns})</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {datasetInfo.columnNames.map((col: string) => (
            <div key={col} className="px-3 py-2 rounded-lg bg-muted/50 text-xs font-mono">{col}</div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card mb-6">
        <h2 className="text-xl font-bold font-display mb-3">Features Implemented</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
          {[
            "Dashboard with key metrics overview",
            "Interactive data exploration with descriptive statistics",
            "Distribution analysis (histograms, box plots, violin plots, density)",
            "Correlation heatmap and feature relationship analysis",
            "Risk factor identification with Random Forest & SHAP",
            "Multi-model ML comparison (LR, RF, XGBoost, SVM)",
            "Interactive heart disease risk prediction tool",
            "Treatment success probability calculator (Expected Value)",
            "Personalized lifestyle recommendation engine",
            "Selection bias and data limitations discussion",
            "Model explainability with SHAP values",
            "ROC curves and confusion matrices",
            "Dark/light mode toggle",
            "Responsive design for all screen sizes",
            "Interactive tooltips on all charts",
            "Export charts as images",
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <Lightbulb className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
        <h2 className="text-xl font-bold font-display mb-3">Future Improvements</h2>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Integration with real-time patient monitoring systems</li>
          <li>• Deep learning models (Neural Networks, Transformers) for improved accuracy</li>
          <li>• Multi-disease prediction expanding beyond heart disease</li>
          <li>• Natural language clinical report generation</li>
          <li>• Patient history tracking and longitudinal analysis</li>
          <li>• Integration with Electronic Health Records (EHR) systems</li>
          <li>• Mobile-responsive progressive web app (PWA)</li>
          <li>• Federated learning for privacy-preserving model training</li>
        </ul>
      </motion.div>
    </div>
  );
}
