import { useMemo } from "react";
import Plot from "react-plotly.js";
import { useTheme } from "@/lib/themeContext";

interface PlotlyChartProps {
  data: any[];
  layout?: any;
  title?: string;
  height?: number;
  className?: string;
}

export function PlotlyChart({ data, layout = {}, title, height = 400, className }: PlotlyChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const mergedLayout = useMemo(
    () => ({
      title: title ? { text: title, font: { family: "Space Grotesk", size: 16, color: isDark ? "#cbd5e1" : "#1e293b" } } : undefined,
      paper_bgcolor: "transparent",
      plot_bgcolor: "transparent",
      font: { family: "Inter", color: isDark ? "#94a3b8" : "#64748b", size: 12 },
      margin: { t: title ? 50 : 20, r: 20, b: 50, l: 60 },
      xaxis: { gridcolor: isDark ? "rgba(148,163,184,0.1)" : "rgba(0,0,0,0.06)", zerolinecolor: isDark ? "rgba(148,163,184,0.2)" : "rgba(0,0,0,0.1)", ...(layout.xaxis || {}) },
      yaxis: { gridcolor: isDark ? "rgba(148,163,184,0.1)" : "rgba(0,0,0,0.06)", zerolinecolor: isDark ? "rgba(148,163,184,0.2)" : "rgba(0,0,0,0.1)", ...(layout.yaxis || {}) },
      legend: { font: { size: 11 }, bgcolor: "transparent", ...(layout.legend || {}) },
      height,
      ...layout,
    }),
    [layout, title, height, isDark]
  );

  return (
    <div className={className}>
      <Plot
        data={data}
        layout={mergedLayout}
        config={{ responsive: true, displayModeBar: false, staticPlot: false }}
        useResizeHandler
        style={{ width: "100%" }}
      />
    </div>
  );
}
