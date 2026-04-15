# ============================================================
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
print("=" * 60)
print("STEP 1: Loading Dataset")
print("=" * 60)

df = pd.read_csv("heart_disease_prediction.csv")
print(f"Dataset Shape: {df.shape}")
print(f"Total Patients: {df.shape[0]}")
print(f"Total Features: {df.shape[1]}")
print(f"\nColumn Names:\n{list(df.columns)}")
print(f"\nData Types:\n{df.dtypes}")
print(f"\nMissing Values:\n{df.isnull().sum()}")
print(f"\nBasic Statistics:\n{df.describe()}")

# ============================================================
# 2. DESCRIPTIVE STATISTICS & DISTRIBUTIONS
# ============================================================
print("\n" + "=" * 60)
print("STEP 2: Descriptive Statistics & Distributions")
print("=" * 60)

# Save raw data (before encoding) for frontend visualizations
raw_df = df.copy()

# Compute descriptive stats for numeric columns
numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
descriptive_stats = {}
for col in numeric_cols:
    s = df[col].describe()
    descriptive_stats[col] = {
        "count": int(s["count"]),
        "mean": round(float(s["mean"]), 2),
        "std": round(float(s["std"]), 2),
        "min": round(float(s["min"]), 2),
        "25%": round(float(s["25%"]), 2),
        "50%": round(float(s["50%"]), 2),
        "75%": round(float(s["75%"]), 2),
        "max": round(float(s["max"]), 2),
    }
    print(f"\n{col}:")
    for k, v in descriptive_stats[col].items():
        print(f"  {k}: {v}")

# Compute histogram distributions for numeric columns
distributions = {}
for col in numeric_cols:
    counts, edges = np.histogram(df[col].dropna(), bins=20)
    distributions[col] = {
        "counts": counts.tolist(),
        "edges": edges.tolist(),
    }

# Compute categorical distributions
categorical_cols = df.select_dtypes(include=["object"]).columns.tolist()
cat_distributions = {}
for col in categorical_cols:
    cat_distributions[col] = df[col].value_counts().to_dict()
    print(f"\n{col} distribution: {cat_distributions[col]}")

# ============================================================
# 3. CORRELATION ANALYSIS
# ============================================================
print("\n" + "=" * 60)
print("STEP 3: Correlation Analysis")
print("=" * 60)

# Need to encode for correlation
encode_df = df.copy()
label_encoders_corr = {}
for col in categorical_cols:
    le = LabelEncoder()
    encode_df[col] = le.fit_transform(encode_df[col])
    label_encoders_corr[col] = le

correlation_matrix = encode_df.corr().round(4)
print(f"Correlation matrix shape: {correlation_matrix.shape}")
print(f"\nTop correlations with Heart Disease:")
hd_corr = correlation_matrix["Heart Disease"].drop("Heart Disease").sort_values(ascending=False)
for feat, corr_val in hd_corr.items():
    print(f"  {feat:30s} {corr_val:+.4f}")

# Cross-tabs for categorical vs Heart Disease
cross_tabs = {}
for col in categorical_cols:
    ct = raw_df.groupby(col).agg(
        Count=("Heart Disease", "count"),
        Disease=("Heart Disease", "mean")
    ).round(4)
    cross_tabs[col] = ct.to_dict(orient="index")

# ============================================================
# 4. DATA PREPROCESSING
# ============================================================
print("\n" + "=" * 60)
print("STEP 4: Data Preprocessing")
print("=" * 60)

# Encode categorical variables
label_encoders = {}
label_mappings = {}
for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le
    label_mappings[col] = dict(zip(le.classes_.tolist(), le.transform(le.classes_).tolist()))
    print(f"  Encoded '{col}': {label_mappings[col]}")

# Define features and target
feature_cols = [c for c in df.columns if c != "Heart Disease"]
X = df[feature_cols]
y = df["Heart Disease"]

print(f"\nFeature columns ({len(feature_cols)}): {feature_cols}")
print(f"Target distribution:\n{y.value_counts()}")
print(f"Target balance: {y.value_counts(normalize=True).round(3).to_dict()}")

# ============================================================
# 5. TRAIN-TEST SPLIT & FEATURE SCALING
# ============================================================
print("\n" + "=" * 60)
print("STEP 5: Train-Test Split & Scaling")
print("=" * 60)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Training set: {X_train.shape[0]} samples")
print(f"Testing set:  {X_test.shape[0]} samples")

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"Scaler mean: {scaler.mean_.round(3)}")
print(f"Scaler std:  {scaler.scale_.round(3)}")

# ============================================================
# 6. MODEL TRAINING & EVALUATION
# ============================================================
print("\n" + "=" * 60)
print("STEP 6: Training ML Models")
print("=" * 60)

models = {
    "Logistic Regression": LogisticRegression(
        max_iter=1000, random_state=42, C=1.0
    ),
    "Random Forest": RandomForestClassifier(
        n_estimators=100, max_depth=10, random_state=42
    ),
    "XGBoost": XGBClassifier(
        n_estimators=100, max_depth=6, learning_rate=0.1,
        random_state=42, eval_metric="logloss"
    ),
    "SVM": SVC(
        kernel="rbf", C=1.0, gamma="scale",
        probability=True, random_state=42
    ),
}

results = {}

for name, model in models.items():
    print(f"\nTraining {name}...")
    model.fit(X_train_scaled, y_train)
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    cm = confusion_matrix(y_test, y_pred)

    results[name] = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1": round(f1, 4),
        "auc": round(auc, 4),
        "confusion_matrix": cm.tolist(),
    }

    print(f"  Accuracy:  {acc:.4f}")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall:    {rec:.4f}")
    print(f"  F1 Score:  {f1:.4f}")
    print(f"  AUC-ROC:   {auc:.4f}")
    print(f"  Confusion Matrix:\n{cm}")
    print(f"\n  Classification Report:\n{classification_report(y_test, y_pred)}")

# ============================================================
# 7. FEATURE IMPORTANCE (Random Forest)
# ============================================================
print("\n" + "=" * 60)
print("STEP 7: Feature Importance Analysis")
print("=" * 60)

rf_model = models["Random Forest"]
importances = rf_model.feature_importances_
feature_importance = sorted(
    zip(feature_cols, importances), key=lambda x: x[1], reverse=True
)

print("\nRandom Forest Feature Importance:")
for feat, imp in feature_importance:
    bar = "█" * int(imp * 50)
    print(f"  {feat:30s} {imp:.4f} {bar}")

# ============================================================
# 8. LOGISTIC REGRESSION COEFFICIENTS
# ============================================================
print("\n" + "=" * 60)
print("STEP 8: Logistic Regression Coefficients")
print("=" * 60)

lr_model = models["Logistic Regression"]
coefficients = lr_model.coef_[0]
intercept = lr_model.intercept_[0]

print(f"Intercept: {intercept:.4f}")
print("\nCoefficients:")
for feat, coef in zip(feature_cols, coefficients):
    direction = "+" if coef > 0 else "-"
    print(f"  {feat:30s} {coef:+.4f} ({direction} risk)")

# ============================================================
# 9. DETERMINE BEST MODEL
# ============================================================
print("\n" + "=" * 60)
print("STEP 9: Best Model Selection")
print("=" * 60)

best_model = max(results, key=lambda k: results[k]["auc"])
print(f"Best Model (by AUC): {best_model}")
print(f"Best AUC: {results[best_model]['auc']}")
print(f"Best Accuracy: {results[best_model]['accuracy']}")

# ============================================================
# 10. EXPORT ALL RESULTS TO JSON
# ============================================================
print("\n" + "=" * 60)
print("STEP 10: Exporting Results to JSON")
print("=" * 60)

# Prepare raw data for frontend (using original unencoded data)
raw_data_list = raw_df.to_dict(orient="records")

output = {
    "datasetInfo": {
        "rows": int(raw_df.shape[0]),
        "columns": int(raw_df.shape[1]),
        "columnNames": list(raw_df.columns),
        "targetDistribution": int(y.value_counts().to_dict().get(0, 0)),
    },
    "mlPipeline": {
        "models": list(models.keys()),
        "libraries": ["scikit-learn", "XGBoost", "pandas", "numpy"],
        "preprocessing": ["LabelEncoding", "StandardScaler"],
        "testSize": 0.2,
        "randomState": 42,
    },
    "descriptiveStats": descriptive_stats,
    "distributions": distributions,
    "catDistributions": cat_distributions,
    "correlationMatrix": {
        "columns": correlation_matrix.columns.tolist(),
        "values": correlation_matrix.values.tolist(),
    },
    "crossTabs": cross_tabs,
    "modelResults": results,
    "bestModel": best_model,
    "featureImportance": {
        feat: round(float(imp), 4) for feat, imp in feature_importance
    },
    "lrParams": {
        "intercept": round(float(intercept), 6),
        "coefficients": [round(float(c), 6) for c in coefficients],
    },
    "scalerParams": {
        "features": feature_cols,
        "mean": scaler.mean_.round(6).tolist(),
        "scale": scaler.scale_.round(6).tolist(),
    },
    "labelMappings": label_mappings,
    "rawData": raw_data_list,
}

with open("src/data/mlResults.json", "w") as f:
    json.dump(output, f, indent=2)

print("Results exported to src/data/mlResults.json")
print(f"Total models trained: {len(models)}")
print(f"Best model: {best_model}")
print(f"Best AUC: {results[best_model]['auc']}")
print(f"Raw data records: {len(raw_data_list)}")
print("\n✅ ML Pipeline Complete!")
