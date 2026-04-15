import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { HeartPulse, Database, Brain, BarChart3, Lightbulb, Code, Copy, Check } from "lucide-react";
import mlResults from "@/data/mlResults.json";
import { useState } from "react";

const { datasetInfo, mlPipeline } = mlResults;

const pythonCode = `# ============================================================
# Heart Disease Prediction - Machine Learning Pipeline
# Python Backend Code (scikit-learn, XGBoost)
# Honors Project - Healthcare Risk Prediction System
# ============================================================

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix,
    classification_report
)
import json
import warnings
warnings.filterwarnings('ignore')

# ============================================================
# 1. DATA LOADING & EXPLORATION
# ============================================================
df = pd.read_csv("heart_disease_prediction.csv")
print(f"Dataset Shape: {df.shape}")
print(f"Total Patients: {df.shape[0]}")
print(f"Total Features: {df.shape[1]}")

# ============================================================
# 2. DESCRIPTIVE STATISTICS & DISTRIBUTIONS
# ============================================================
raw_df = df.copy()
numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
descriptive_stats = {}
for col in numeric_cols:
    s = df[col].describe()
    descriptive_stats[col] = {
        "count": int(s["count"]), "mean": round(float(s["mean"]), 2),
        "std": round(float(s["std"]), 2), "min": round(float(s["min"]), 2),
        "25%": round(float(s["25%"]), 2), "50%": round(float(s["50%"]), 2),
        "75%": round(float(s["75%"]), 2), "max": round(float(s["max"]), 2),
    }

distributions = {}
for col in numeric_cols:
    counts, edges = np.histogram(df[col].dropna(), bins=20)
    distributions[col] = {"counts": counts.tolist(), "edges": edges.tolist()}

categorical_cols = df.select_dtypes(include=["object"]).columns.tolist()
cat_distributions = {}
for col in categorical_cols:
    cat_distributions[col] = df[col].value_counts().to_dict()

# ============================================================
# 3. CORRELATION ANALYSIS
# ============================================================
encode_df = df.copy()
for col in categorical_cols:
    le = LabelEncoder()
    encode_df[col] = le.fit_transform(encode_df[col])
correlation_matrix = encode_df.corr().round(4)

cross_tabs = {}
for col in categorical_cols:
    ct = raw_df.groupby(col).agg(
        Count=("Heart Disease", "count"), Disease=("Heart Disease", "mean")
    ).round(4)
    cross_tabs[col] = ct.to_dict(orient="index")

# ============================================================
# 4. DATA PREPROCESSING
# ============================================================
label_encoders = {}
label_mappings = {}
for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le
    label_mappings[col] = dict(zip(le.classes_.tolist(), le.transform(le.classes_).tolist()))

feature_cols = [c for c in df.columns if c != "Heart Disease"]
X = df[feature_cols]
y = df["Heart Disease"]

# ============================================================
# 5. TRAIN-TEST SPLIT & FEATURE SCALING
# ============================================================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ============================================================
# 6. MODEL TRAINING & EVALUATION
# ============================================================
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42, C=1.0),
    "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42),
    "XGBoost": XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1,
                              random_state=42, eval_metric="logloss"),
    "SVM": SVC(kernel="rbf", C=1.0, gamma="scale", probability=True, random_state=42),
}

results = {}
for name, model in models.items():
    model.fit(X_train_scaled, y_train)
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]
    results[name] = {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred), 4),
        "recall": round(recall_score(y_test, y_pred), 4),
        "f1": round(f1_score(y_test, y_pred), 4),
        "auc": round(roc_auc_score(y_test, y_proba), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
    }
    print(f"{name}: Acc={results[name]['accuracy']}, AUC={results[name]['auc']}")

# ============================================================
# 7. FEATURE IMPORTANCE (Random Forest)
# ============================================================
rf_model = models["Random Forest"]
importances = rf_model.feature_importances_
feature_importance = sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)

# ============================================================
# 8. LOGISTIC REGRESSION COEFFICIENTS
# ============================================================
lr_model = models["Logistic Regression"]
coefficients = lr_model.coef_[0]
intercept = lr_model.intercept_[0]

# ============================================================
# 9. BEST MODEL SELECTION & JSON EXPORT
# ============================================================
best_model = max(results, key=lambda k: results[k]["auc"])

output = {
    "datasetInfo": {"rows": int(raw_df.shape[0]), "columns": int(raw_df.shape[1]),
                    "columnNames": list(raw_df.columns)},
    "mlPipeline": {"models": list(models.keys()),
                   "libraries": ["scikit-learn", "XGBoost", "pandas", "numpy"],
                   "preprocessing": ["LabelEncoding", "StandardScaler"],
                   "testSize": 0.2, "randomState": 42},
    "descriptiveStats": descriptive_stats,
    "distributions": distributions,
    "catDistributions": cat_distributions,
    "correlationMatrix": {"columns": correlation_matrix.columns.tolist(),
                          "values": correlation_matrix.values.tolist()},
    "crossTabs": cross_tabs,
    "modelResults": results,
    "bestModel": best_model,
    "featureImportance": {f: round(float(i), 4) for f, i in feature_importance},
    "lrParams": {"intercept": round(float(intercept), 6),
                 "coefficients": [round(float(c), 6) for c in coefficients]},
    "scalerParams": {"features": feature_cols,
                     "mean": scaler.mean_.round(6).tolist(),
                     "scale": scaler.scale_.round(6).tolist()},
    "labelMappings": label_mappings,
    "rawData": raw_df.to_dict(orient="records"),
}

with open("src/data/mlResults.json", "w") as f:
    json.dump(output, f, indent=2)

print(f"Best model: {best_model} (AUC: {results[best_model]['auc']})")
print("✅ ML Pipeline Complete!")
`;

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-background/80 hover:bg-background border border-border/50 transition-colors z-10"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
      </button>
      <pre className="bg-[#1a1b26] text-[#a9b1d6] rounded-xl p-4 overflow-x-auto text-xs leading-relaxed max-h-[600px] overflow-y-auto font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function About() {
  const [showCode, setShowCode] = useState(false);

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

      {/* Python ML Code Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Code className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display">Python ML Backend Code</h2>
              <p className="text-xs text-muted-foreground">Complete machine learning pipeline — scikit-learn, XGBoost, pandas</p>
            </div>
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
          >
            {showCode ? "Hide Code" : "View Full Code"}
          </button>
        </div>

        {!showCode && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {[
              "Data Loading & Exploration",
              "Label Encoding & Preprocessing",
              "Train-Test Split (80/20)",
              "StandardScaler Normalization",
              "4 ML Model Training",
              "Metrics & Confusion Matrix",
              "Feature Importance (RF)",
              "LR Coefficients Export",
              "JSON Results Export",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-xs">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
        )}

        {showCode && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <CodeBlock code={pythonCode} />
          </motion.div>
        )}
      </motion.div>

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