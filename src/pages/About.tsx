import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { HeartPulse, Database, Brain, BarChart3, Lightbulb } from "lucide-react";
import mlResults from "@/data/mlResults.json";

const { datasetInfo, mlPipeline } = mlResults;

export default function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="About the Project" description="AI-Powered Healthcare Risk Prediction System — Honors Project" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card mb-6">
        <h2 className="text-xl font-bold font-display mb-3 gradient-text">Project Overview</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This Honors Project presents a machine learning-powered healthcare analytics platform for cardiovascular risk prediction.
          The system uses Python (scikit-learn, XGBoost) for model training and evaluation, with a modern React frontend for
          interactive data visualization and real-time predictions. Four ML models were trained and compared: Logistic Regression,
          Random Forest, XGBoost, and SVM. The platform provides comprehensive analytics from data exploration to personalized
          health recommendations, all driven by the trained ML models.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {[
          { icon: Database, title: "Dataset", desc: `Kaggle Heart Disease Prediction dataset — ${datasetInfo.rows} patient records, ${datasetInfo.columns} features including demographics, vitals, lifestyle factors, and medical history. Target: Heart Disease (binary classification).` },
          { icon: Brain, title: "Machine Learning Pipeline", desc: `Python backend: ${mlPipeline.libraries.join(", ")}. Models: ${mlPipeline.models.join(", ")}. Preprocessing: ${mlPipeline.preprocessing.join(", ")}. 80/20 stratified train-test split.` },
          { icon: BarChart3, title: "Analytics Pipeline", desc: "Complete analytics covering descriptive statistics, correlation analysis, feature importance, model evaluation with confusion matrices, interactive risk prediction, and personalized health recommendations." },
          { icon: HeartPulse, title: "Prediction & Recommendations", desc: "Real-time heart disease risk prediction with age-aware personalized preventions and lifestyle suggestions. Population-level risk dashboard and health trend monitoring." },
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
            { cat: "ML Backend", tools: "Python, scikit-learn, XGBoost, pandas, numpy" },
            { cat: "Frontend", tools: "React, TypeScript, TailwindCSS, ShadCN UI, Framer Motion" },
            { cat: "Visualization", tools: "Plotly.js, React-Plotly, Interactive Charts" },
            { cat: "Evaluation", tools: "Accuracy, Precision, Recall, F1, AUC-ROC, Confusion Matrix" },
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
            "Distribution analysis (histograms, box plots, violin plots)",
            "Correlation heatmap and feature relationship analysis",
            "Risk factor identification with Random Forest importance",
            "Multi-model ML comparison (LR, RF, XGBoost, SVM)",
            "Interactive heart disease risk prediction tool",
            "Age-aware personalized preventions & suggestions",
            "Treatment success probability calculator",
            "Personalized lifestyle recommendation engine",
            "Patient risk score dashboard with filters",
            "Health trend monitoring across age groups",
            "AI health assistant chatbot",
            "Confusion matrices for all models",
            "Dark/light mode toggle",
            "Responsive design for all screen sizes",
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
          <li>• Deep learning models (Neural Networks) for improved accuracy</li>
          <li>• Multi-disease prediction expanding beyond heart disease</li>
          <li>• Patient history tracking and longitudinal analysis</li>
          <li>• Integration with Electronic Health Records (EHR) systems</li>
          <li>• Mobile-responsive progressive web app (PWA)</li>
        </ul>
      </motion.div>
    </div>
  );
}
