# Python ML Backend — Heart Disease Prediction

## Setup & Run

```bash
# Install dependencies
pip install -r requirements.txt

# Run the ML pipeline
python ml_pipeline.py
```

## Pipeline Steps
1. **Data Loading** — Reads `heart_disease_prediction.csv` (1001 rows, 16 features)
2. **Preprocessing** — Label encoding for categorical columns, StandardScaler normalization
3. **Train-Test Split** — 80/20 stratified split (random_state=42)
4. **Model Training** — Logistic Regression, Random Forest, XGBoost, SVM
5. **Evaluation** — Accuracy, Precision, Recall, F1-Score, AUC-ROC, Confusion Matrix
6. **Feature Importance** — Random Forest feature importance ranking
7. **Export** — Trained model parameters exported to `src/data/mlResults.json`

## Output
The pipeline exports all model weights, metrics, and scaler parameters to JSON,
which the React frontend uses for real-time predictions without needing a running Python server.

## Models
| Model | Description |
|-------|-------------|
| Logistic Regression | Linear classifier with L2 regularization |
| Random Forest | Ensemble of 100 decision trees (max_depth=10) |
| XGBoost | Gradient boosting with 100 estimators |
| SVM | RBF kernel with probability calibration |
