import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Heart, Dumbbell, Cigarette, Brain, Stethoscope, Apple } from "lucide-react";

interface RiskProfile {
  cholesterol: number;
  bloodPressure: number;
  smoking: string;
  exerciseHours: number;
  stressLevel: number;
  bloodSugar: number;
  obesity: string;
  diabetes: string;
  alcoholIntake: string;
}

const defaultProfile: RiskProfile = {
  cholesterol: 250,
  bloodPressure: 140,
  smoking: "Current",
  exerciseHours: 2,
  stressLevel: 7,
  bloodSugar: 150,
  obesity: "Yes",
  diabetes: "Yes",
  alcoholIntake: "Heavy",
};

function getRecommendations(profile: RiskProfile) {
  const recs = [];

  if (profile.cholesterol > 200) {
    recs.push({ icon: Apple, title: "Diet: Lower Cholesterol", desc: `Your cholesterol (${profile.cholesterol} mg/dL) is above optimal. Reduce saturated fats, eat more fiber-rich foods (oats, beans, fruits). Include omega-3 fatty acids from fish, flaxseed, and walnuts.`, impact: Math.min(30, Math.round((profile.cholesterol - 200) / 5)), category: "diet" });
  }
  if (profile.bloodPressure > 120) {
    recs.push({ icon: Heart, title: "Blood Pressure Management", desc: `Your blood pressure (${profile.bloodPressure} mmHg) is elevated. Reduce sodium intake to <2300mg/day, follow DASH diet, increase potassium-rich foods, and consider meditation.`, impact: Math.min(25, Math.round((profile.bloodPressure - 120) / 3)), category: "diet" });
  }
  if (profile.smoking !== "Never") {
    recs.push({ icon: Cigarette, title: "Smoking Cessation", desc: `Status: ${profile.smoking}. Quitting smoking is the single most effective step. Risk drops 50% within 1 year. Consider nicotine replacement therapy or counseling.`, impact: 35, category: "lifestyle" });
  }
  if (profile.exerciseHours < 5) {
    recs.push({ icon: Dumbbell, title: "Increase Physical Activity", desc: `Current: ${profile.exerciseHours} hrs/week. Aim for 150+ minutes of moderate aerobic activity weekly. Start with brisk walking 30 min/day, 5 days/week.`, impact: Math.min(25, (5 - profile.exerciseHours) * 5), category: "exercise" });
  }
  if (profile.stressLevel > 5) {
    recs.push({ icon: Brain, title: "Stress Reduction", desc: `Stress level: ${profile.stressLevel}/10. Practice mindfulness meditation (10 min/day), deep breathing exercises, and ensure 7-8 hours of quality sleep.`, impact: Math.min(20, (profile.stressLevel - 5) * 4), category: "mental" });
  }
  if (profile.bloodSugar > 100) {
    recs.push({ icon: Stethoscope, title: "Blood Sugar Control", desc: `Fasting blood sugar (${profile.bloodSugar} mg/dL) is elevated. Monitor regularly, reduce refined carbohydrates, and maintain consistent meal schedules.`, impact: Math.min(25, Math.round((profile.bloodSugar - 100) / 4)), category: "medical" });
  }
  if (profile.obesity === "Yes") {
    recs.push({ icon: Dumbbell, title: "Weight Management", desc: "Aim for gradual weight loss of 1-2 lbs/week through caloric deficit and increased activity. Even 5-10% weight loss significantly reduces risk.", impact: 20, category: "exercise" });
  }
  if (profile.alcoholIntake === "Heavy") {
    recs.push({ icon: Heart, title: "Reduce Alcohol Intake", desc: "Heavy drinking raises blood pressure and weakens heart muscle. Limit to ≤1 drink/day for women, ≤2 for men.", impact: 15, category: "lifestyle" });
  }
  if (profile.diabetes === "Yes") {
    recs.push({ icon: Stethoscope, title: "Diabetes Management", desc: "Maintain HbA1c below 7%. Regular monitoring, medication adherence, and dietary management are crucial for cardiovascular protection.", impact: 20, category: "medical" });
  }

  return recs;
}

export default function Lifestyle() {
  const [profile, setProfile] = useState<RiskProfile>(defaultProfile);
  const recommendations = useMemo(() => getRecommendations(profile), [profile]);
  const totalImpact = recommendations.reduce((sum, r) => sum + r.impact, 0);

  return (
    <div>
      <PageHeader title="Lifestyle Recommendations" description="Personalized prescriptive analytics to reduce heart disease risk based on patient profile" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <h3 className="text-lg font-bold font-display mb-4">Patient Risk Profile</h3>
          <div className="space-y-3">
            {[
              { label: "Cholesterol (mg/dL)", key: "cholesterol", type: "number", min: 150, max: 349 },
              { label: "Blood Pressure (mmHg)", key: "bloodPressure", type: "number", min: 80, max: 200 },
              { label: "Exercise Hours/Week", key: "exerciseHours", type: "number", min: 0, max: 20 },
              { label: "Stress Level (1-10)", key: "stressLevel", type: "number", min: 1, max: 10 },
              { label: "Blood Sugar (mg/dL)", key: "bloodSugar", type: "number", min: 70, max: 199 },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs text-muted-foreground">{f.label}</label>
                <input type="number" min={f.min} max={f.max} value={(profile as any)[f.key]} onChange={(e) => setProfile({ ...profile, [f.key]: Number(e.target.value) })} className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm" />
              </div>
            ))}
            {[
              { label: "Smoking", key: "smoking", options: ["Never", "Former", "Current"] },
              { label: "Obesity", key: "obesity", options: ["No", "Yes"] },
              { label: "Diabetes", key: "diabetes", options: ["No", "Yes"] },
              { label: "Alcohol Intake", key: "alcoholIntake", options: ["None", "Moderate", "Heavy"] },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs text-muted-foreground">{f.label}</label>
                <select value={(profile as any)[f.key]} onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })} className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm">
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-primary/10 text-center">
            <p className="text-xs text-muted-foreground">Estimated Risk Reduction Potential</p>
            <p className="text-3xl font-bold font-display text-primary">{Math.min(totalImpact, 100)}%</p>
          </div>
        </motion.div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold font-display">Personalized Health Plan ({recommendations.length} Recommendations)</h3>
          {recommendations.map((rec, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="stat-card flex gap-4">
              <div className="p-3 rounded-xl bg-primary/10 h-fit">
                <rec.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{rec.title}</h4>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">-{rec.impact}% risk</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{rec.desc}</p>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${rec.impact * 3}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }} className="h-full rounded-full bg-success" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
