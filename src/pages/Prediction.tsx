import { PageHeader } from "@/components/PageHeader";
import { PlotlyChart } from "@/components/PlotlyChart";
import mlResults from "@/data/mlResults.json";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Heart, Shield, AlertTriangle, Dumbbell, Apple, Brain, Stethoscope, Cigarette } from "lucide-react";

const { scalerParams, lrParams, labelMappings } = mlResults;

const fields = [
  { name: "Age", type: "number", min: 20, max: 90, default: 50 },
  { name: "Gender", type: "select", options: Object.keys(labelMappings.Gender) },
  { name: "Cholesterol", type: "number", min: 150, max: 349, default: 200 },
  { name: "Blood Pressure", type: "number", min: 80, max: 200, default: 120 },
  { name: "Heart Rate", type: "number", min: 50, max: 150, default: 72 },
  { name: "Smoking", type: "select", options: Object.keys(labelMappings.Smoking) },
  { name: "Alcohol Intake", type: "select", options: Object.keys(labelMappings["Alcohol Intake"]) },
  { name: "Exercise Hours", type: "number", min: 0, max: 20, default: 5 },
  { name: "Family History", type: "select", options: Object.keys(labelMappings["Family History"]) },
  { name: "Diabetes", type: "select", options: Object.keys(labelMappings.Diabetes) },
  { name: "Obesity", type: "select", options: Object.keys(labelMappings.Obesity) },
  { name: "Stress Level", type: "number", min: 1, max: 10, default: 5 },
  { name: "Blood Sugar", type: "number", min: 70, max: 199, default: 100 },
  { name: "Exercise Induced Angina", type: "select", options: Object.keys(labelMappings["Exercise Induced Angina"]) },
  { name: "Chest Pain Type", type: "select", options: Object.keys(labelMappings["Chest Pain Type"]) },
];

function sigmoid(x: number) { return 1 / (1 + Math.exp(-x)); }

function getPreventionsAndSuggestions(formData: Record<string, any>, riskCategory: string) {
  const age = Number(formData.Age);
  const cholesterol = Number(formData.Cholesterol);
  const bp = Number(formData["Blood Pressure"]);
  const exerciseHrs = Number(formData["Exercise Hours"]);
  const stress = Number(formData["Stress Level"]);
  const bloodSugar = Number(formData["Blood Sugar"]);
  const smoking = formData.Smoking;
  const alcohol = formData["Alcohol Intake"];
  const obesity = formData.Obesity;
  const diabetes = formData.Diabetes;
  const heartRate = Number(formData["Heart Rate"]);

  const preventions: { icon: any; title: string; detail: string; priority: "high" | "medium" | "low" }[] = [];

  // Age-specific exercise recommendations
  if (age < 30) {
    if (exerciseHrs < 5) preventions.push({ icon: Dumbbell, title: "Increase Exercise", detail: `At age ${age}, you can safely do 5-7 hours/week of vigorous exercise (running, HIIT, sports). Currently at ${exerciseHrs} hrs — aim higher to build lifelong heart health.`, priority: "medium" });
  } else if (age < 50) {
    if (exerciseHrs < 4) preventions.push({ icon: Dumbbell, title: "Moderate Exercise Plan", detail: `At age ${age}, aim for 3-5 hours/week of moderate activity (brisk walking, cycling, swimming). Currently at ${exerciseHrs} hrs. Avoid overexertion and include warm-ups.`, priority: "medium" });
  } else if (age < 65) {
    if (exerciseHrs < 3) preventions.push({ icon: Dumbbell, title: "Gentle Regular Activity", detail: `At age ${age}, aim for 2.5-4 hours/week of low-impact exercise (walking, yoga, light swimming). Currently at ${exerciseHrs} hrs. Avoid heavy lifting and high-intensity workouts.`, priority: "medium" });
  } else {
    preventions.push({ icon: Dumbbell, title: "Age-Appropriate Movement", detail: `At age ${age}, focus on 1.5-3 hours/week of gentle activities (walking, tai chi, stretching, chair exercises). Avoid strenuous exercise. Listen to your body and rest when needed.`, priority: age >= 75 ? "high" : "medium" });
  }

  // Cholesterol
  if (cholesterol > 240) {
    preventions.push({ icon: Apple, title: "Critical: Reduce High Cholesterol", detail: `Cholesterol at ${cholesterol} mg/dL is dangerously high. ${age >= 60 ? "At your age, diet alone may not suffice — consult your doctor about statins." : "Cut saturated fats, eat oats/beans/fish, add omega-3 supplements."} Target: below 200 mg/dL.`, priority: "high" });
  } else if (cholesterol > 200) {
    preventions.push({ icon: Apple, title: "Manage Cholesterol", detail: `Cholesterol at ${cholesterol} mg/dL is borderline high. Include fiber-rich foods, reduce red meat, and eat more fruits/vegetables. ${age >= 50 ? "Regular lipid panel tests every 6 months recommended." : "Recheck in 1 year."}`, priority: "medium" });
  }

  // Blood Pressure
  if (bp > 140) {
    preventions.push({ icon: Heart, title: "Critical: High Blood Pressure", detail: `BP at ${bp} mmHg is hypertensive. ${age >= 65 ? "For seniors, medication management is critical — don't skip doses. Reduce salt to <1500mg/day." : "Reduce sodium intake, follow DASH diet, exercise regularly, manage stress."} Target: below 130 mmHg.`, priority: "high" });
  } else if (bp > 120) {
    preventions.push({ icon: Heart, title: "Elevated Blood Pressure", detail: `BP at ${bp} mmHg is elevated. ${age >= 60 ? "Monitor daily at home. Limit caffeine and alcohol." : "Reduce salt, increase potassium-rich foods (bananas, spinach), stay active."}`, priority: "medium" });
  }

  // Smoking
  if (smoking === "Current") {
    preventions.push({ icon: Cigarette, title: "Quit Smoking Immediately", detail: `Smoking is the #1 modifiable risk factor. ${age >= 50 ? "Even quitting now reduces heart attack risk by 50% within 1 year. Ask your doctor about cessation aids." : "Your young body can recover fully — quitting now prevents decades of damage."} Use nicotine patches or counseling.`, priority: "high" });
  } else if (smoking === "Former") {
    preventions.push({ icon: Cigarette, title: "Stay Smoke-Free", detail: `Great that you quit! ${age >= 60 ? "After 15+ years smoke-free, your risk equals a never-smoker." : "Your lungs are still recovering — avoid secondhand smoke and continue healthy habits."}`, priority: "low" });
  }

  // Blood Sugar
  if (bloodSugar > 140) {
    preventions.push({ icon: Stethoscope, title: "Critical: High Blood Sugar", detail: `Blood sugar at ${bloodSugar} mg/dL is very high. ${age >= 60 ? "Strict glucose monitoring is essential at your age. Medication adherence is critical." : "Reduce refined carbs and sugar, exercise after meals, monitor fasting glucose weekly."} Target: below 100 mg/dL fasting.`, priority: "high" });
  } else if (bloodSugar > 100) {
    preventions.push({ icon: Stethoscope, title: "Monitor Blood Sugar", detail: `Blood sugar at ${bloodSugar} mg/dL is pre-diabetic range. ${age >= 50 ? "Get HbA1c tested every 3 months." : "Lifestyle changes now can prevent diabetes — focus on whole grains and regular meals."}`, priority: "medium" });
  }

  // Stress
  if (stress > 7) {
    preventions.push({ icon: Brain, title: "Reduce Stress Urgently", detail: `Stress level ${stress}/10 is very high. ${age >= 60 ? "Chronic stress is especially dangerous at your age — practice deep breathing, gentle yoga, and ensure 7-8 hours of sleep." : "Try meditation apps, regular exercise, limit work hours, and consider therapy."} Stress raises cortisol which damages blood vessels.`, priority: "high" });
  } else if (stress > 5) {
    preventions.push({ icon: Brain, title: "Manage Stress", detail: `Stress at ${stress}/10 is moderate. ${age >= 50 ? "Prioritize relaxation — gardening, reading, social activities." : "Balance work-life, practice mindfulness 10 min/day, stay socially connected."}`, priority: "medium" });
  }

  // Obesity
  if (obesity === "Yes") {
    preventions.push({ icon: Apple, title: "Weight Management", detail: `${age >= 65 ? "At your age, aim for gradual weight loss of 0.5-1 lb/week. Focus on nutrient-dense foods rather than calorie restriction. Maintain muscle mass." : "Target 1-2 lbs/week weight loss through balanced diet and exercise. Even 5-10% weight reduction significantly lowers heart risk."}`, priority: "high" });
  }

  // Diabetes
  if (diabetes === "Yes") {
    preventions.push({ icon: Stethoscope, title: "Diabetes Care Plan", detail: `${age >= 60 ? "Strict HbA1c control (below 7%) is critical. Regular foot exams, eye checks, and kidney function tests. Never skip medication." : "Maintain HbA1c below 7%, exercise regularly, follow a diabetic-friendly diet. Regular screenings every 3-6 months."}`, priority: "high" });
  }

  // Alcohol
  if (alcohol === "Heavy") {
    preventions.push({ icon: Heart, title: "Reduce Alcohol Intake", detail: `Heavy drinking weakens heart muscle and raises BP. ${age >= 60 ? "At your age, limit to 1 drink/day maximum. Consider stopping completely." : "Reduce to moderate levels: ≤1 drink/day for women, ≤2 for men."}`, priority: "high" });
  }

  // Heart Rate
  if (heartRate > 100) {
    preventions.push({ icon: Heart, title: "High Resting Heart Rate", detail: `Heart rate at ${heartRate} bpm is elevated. ${age >= 60 ? "This may indicate cardiac stress — consult your cardiologist immediately." : "Regular cardio exercise can lower resting heart rate. Reduce caffeine and manage stress."}`, priority: "high" });
  }

  // General age-based suggestions
  if (riskCategory === "Low Risk") {
    preventions.push({ icon: Shield, title: "Maintain Your Health", detail: `${age < 40 ? "Excellent! Keep up your healthy lifestyle. Get a baseline heart checkup and annual health screenings." : age < 60 ? "Good health profile! Continue regular exercise, balanced diet, and annual cardiac screenings." : "Your low risk at age " + age + " is great! Continue gentle exercise, healthy eating, and see your cardiologist annually."}`, priority: "low" });
  }

  return preventions.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
}

export default function Prediction() {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === "number") init[f.name] = f.default;
      else init[f.name] = f.options![0];
    });
    return init;
  });

  const prediction = useMemo(() => {
    const featureValues = scalerParams.features.map((feat: string) => {
      const val = formData[feat];
      if (typeof val === "string") {
        const mapping = labelMappings[feat as keyof typeof labelMappings];
        return mapping ? (mapping as any)[val] : 0;
      }
      return Number(val);
    });

    const scaled = featureValues.map((v: number, i: number) => (v - scalerParams.mean[i]) / scalerParams.scale[i]);
    const logit = scaled.reduce((sum: number, v: number, i: number) => sum + v * lrParams.coefficients[i], lrParams.intercept);
    const prob = sigmoid(logit);
    return prob;
  }, [formData]);

  const riskPercent = (prediction * 100).toFixed(1);
  const riskCategory = prediction < 0.3 ? "Low Risk" : prediction < 0.6 ? "Moderate Risk" : "High Risk";
  const riskColor = prediction < 0.3 ? "#22c55e" : prediction < 0.6 ? "#f59e0b" : "#ef4444";

  const preventions = useMemo(() => getPreventionsAndSuggestions(formData, riskCategory), [formData, riskCategory]);

  return (
    <div>
      <PageHeader title="Heart Disease Risk Prediction" description="Enter patient data to predict heart disease probability using our trained Logistic Regression model (Python/scikit-learn)" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 stat-card">
          <h3 className="text-lg font-bold font-display mb-4">Patient Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="text-xs font-medium text-muted-foreground">{f.name}</label>
                {f.type === "number" ? (
                  <input
                    type="number"
                    min={f.min}
                    max={f.max}
                    value={formData[f.name]}
                    onChange={(e) => setFormData({ ...formData, [f.name]: Number(e.target.value) })}
                    className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                ) : (
                  <select
                    value={formData[f.name]}
                    onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="stat-card flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold font-display mb-4">Prediction Result</h3>
          <PlotlyChart
            data={[{
              type: "indicator",
              mode: "gauge+number",
              value: Number(riskPercent),
              title: { text: "Risk Score (%)" },
              gauge: {
                axis: { range: [0, 100] },
                bar: { color: riskColor },
                steps: [
                  { range: [0, 30], color: "rgba(34,197,94,0.15)" },
                  { range: [30, 60], color: "rgba(245,158,11,0.15)" },
                  { range: [60, 100], color: "rgba(239,68,68,0.15)" },
                ],
                threshold: { line: { color: riskColor, width: 4 }, thickness: 0.75, value: Number(riskPercent) },
              },
              domain: { x: [0, 1], y: [0, 1] },
            }]}
            height={250}
            layout={{ margin: { t: 30, b: 0, l: 30, r: 30 }, autosize: true }}
          />
          <div className="text-center mt-2">
            <span className="text-2xl font-bold font-display" style={{ color: riskColor }}>{riskCategory}</span>
            <p className="text-sm text-muted-foreground mt-2">Predicted probability: {riskPercent}%</p>
          </div>
        </motion.div>
      </div>

      {/* Personalized Preventions & Suggestions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
        <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Personalized Preventions & Suggestions
          <span className="text-xs font-normal text-muted-foreground ml-2">Based on age {formData.Age} & your health profile</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {preventions.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-lg border flex gap-3 ${
                p.priority === "high" ? "border-destructive/30 bg-destructive/5" :
                p.priority === "medium" ? "border-warning/30 bg-warning/5" :
                "border-success/30 bg-success/5"
              }`}
            >
              <div className={`p-2 rounded-lg h-fit ${
                p.priority === "high" ? "bg-destructive/10" :
                p.priority === "medium" ? "bg-warning/10" :
                "bg-success/10"
              }`}>
                <p.icon className={`h-4 w-4 ${
                  p.priority === "high" ? "text-destructive" :
                  p.priority === "medium" ? "text-warning" :
                  "text-success"
                }`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{p.title}</h4>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    p.priority === "high" ? "bg-destructive/20 text-destructive" :
                    p.priority === "medium" ? "bg-warning/20 text-warning" :
                    "bg-success/20 text-success"
                  }`}>{p.priority}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
