import {
  LayoutDashboard, Database, GitBranch, AlertTriangle, HeartPulse,
  Pill, Salad, BarChart3, Info, Moon, Sun, MessageCircle,
  Shield, TrendingUp
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useTheme } from "@/lib/themeContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const analyticsItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Data Exploration", url: "/exploration", icon: Database },
  { title: "Correlation Analysis", url: "/correlation", icon: GitBranch },
  { title: "Risk Factors", url: "/risk-factors", icon: AlertTriangle },
  { title: "Model Performance", url: "/model-performance", icon: BarChart3 },
];

const predictionItems = [
  { title: "Heart Disease Prediction", url: "/prediction", icon: HeartPulse },
  { title: "Risk Score Dashboard", url: "/risk-dashboard", icon: Shield },
  { title: "Treatment Success", url: "/treatment", icon: Pill },
];

const insightItems = [
  { title: "Health Trends", url: "/health-trends", icon: TrendingUp },
  { title: "Lifestyle Recommendations", url: "/lifestyle", icon: Salad },
  { title: "AI Health Assistant", url: "/chatbot", icon: MessageCircle },
  { title: "About", url: "/about", icon: Info },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { theme, toggle } = useTheme();

  const renderGroup = (label: string, items: typeof analyticsItems) => (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                  <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className={`p-4 ${collapsed ? "px-2" : ""}`}>
          <div className="flex items-center gap-2">
            <HeartPulse className="h-7 w-7 text-primary flex-shrink-0" />
            {!collapsed && (
              <div>
                <h1 className="text-sm font-bold font-display text-sidebar-foreground">CardioAI</h1>
                <p className="text-[10px] text-sidebar-foreground/60">Risk Prediction System</p>
              </div>
            )}
          </div>
        </div>
        {renderGroup("Analytics", analyticsItems)}
        {renderGroup("Prediction & Support", predictionItems)}
        {renderGroup("Insights", insightItems)}
        <div className="mt-auto p-3">
          <button onClick={toggle} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors w-full">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
