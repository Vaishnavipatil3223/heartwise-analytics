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
# 2. DATA PREPROCESSING
# ============================================================
print("\n" + "=" * 60)
print("STEP 2: Data Preprocessing")
print("=" * 60)

# Encode categorical variables
label_encoders = {}
categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
print(f"Categorical Columns: {categorical_cols}")

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le
    print(f"  Encoded '{col}': {dict(zip(le.classes_, le.transform(le.classes_)))}")

# Define features and target
feature_cols = [c for c in df.columns if c != 'Heart Disease']
X = df[feature_cols]
y = df['Heart Disease']

print(f"\nFeature columns ({len(feature_cols)}): {feature_cols}")
print(f"Target distribution:\n{y.value_counts()}")
print(f"Target balance: {y.value_counts(normalize=True).round(3).to_dict()}")

# ============================================================
# 3. TRAIN-TEST SPLIT & FEATURE SCALING
# ============================================================
print("\n" + "=" * 60)
print("STEP 3: Train-Test Split & Scaling")
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
# 4. MODEL TRAINING
# ============================================================
print("\n" + "=" * 60)
print("STEP 4: Training ML Models")
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
        random_state=42, eval_metric='logloss'
    ),
    "SVM": SVC(
        kernel='rbf', C=1.0, gamma='scale',
        probability=True, random_state=42
    )
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
        "f1_score": round(f1, 4),
        "auc_roc": round(auc, 4),
        "confusion_matrix": cm.tolist()
    }
    
    print(f"  Accuracy:  {acc:.4f}")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall:    {rec:.4f}")
    print(f"  F1 Score:  {f1:.4f}")
    print(f"  AUC-ROC:   {auc:.4f}")
    print(f"  Confusion Matrix:\n{cm}")

# ============================================================
# 5. FEATURE IMPORTANCE (Random Forest)
# ============================================================
print("\n" + "=" * 60)
print("STEP 5: Feature Importance Analysis")
print("=" * 60)

rf_model = models["Random Forest"]
importances = rf_model.feature_importances_
feature_importance = sorted(
    zip(feature_cols, importances),
    key=lambda x: x[1], reverse=True
)

print("\nRandom Forest Feature Importance:")
for feat, imp in feature_importance:
    bar = "█" * int(imp * 50)
    print(f"  {feat:30s} {imp:.4f} {bar}")

# ============================================================
# 6. LOGISTIC REGRESSION COEFFICIENTS
# ============================================================
print("\n" + "=" * 60)
print("STEP 6: Logistic Regression Coefficients")
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
# 7. EXPORT RESULTS TO JSON
# ============================================================
print("\n" + "=" * 60)
print("STEP 7: Exporting Results")
print("=" * 60)

output = {
    "datasetInfo": {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "columnNames": list(df.columns),
        "targetDistribution": y.value_counts().to_dict()
    },
    "mlPipeline": {
        "models": list(models.keys()),
        "libraries": ["scikit-learn", "XGBoost", "pandas", "numpy"],
        "preprocessing": ["LabelEncoding", "StandardScaler"],
        "testSize": 0.2,
        "randomState": 42
    },
    "modelResults": results,
    "featureImportance": {
        feat: round(float(imp), 4)
        for feat, imp in feature_importance
    },
    "logisticRegression": {
        "intercept": round(float(intercept), 4),
        "coefficients": {
            feat: round(float(coef), 4)
            for feat, coef in zip(feature_cols, coefficients)
        }
    },
    "scalerParams": {
        "mean": scaler.mean_.round(4).tolist(),
        "scale": scaler.scale_.round(4).tolist(),
        "featureNames": feature_cols
    }
}

with open("src/data/mlResults.json", "w") as f:
    json.dump(output, f, indent=2)

print("Results exported to src/data/mlResults.json")
print(f"Total models trained: {len(models)}")
print(f"Best model: {max(results, key=lambda k: results[k]['accuracy'])}")
print(f"Best accuracy: {max(r['accuracy'] for r in results.values())}")
print("\n✅ ML Pipeline Complete!")
