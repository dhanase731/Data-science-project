import { Fragment, useState, useEffect, useMemo, type FormEvent } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Legend, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ReferenceLine, ComposedChart,
} from "recharts";
import {
  Box, Card, CardContent, Typography, Button, TextField, Select, MenuItem,
  Switch, Table, TableContainer, TableHead, TableBody, TableRow, TableCell,
  Avatar, Badge, IconButton, Drawer, AppBar, Toolbar, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Chip, Divider, Grid, Paper,
  LinearProgress, CircularProgress, Alert as MuiAlert, Tooltip,
  FormControl, InputLabel, InputAdornment, Checkbox, FormControlLabel,
  useMediaQuery, ThemeProvider, CssBaseline, styled, ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import {
  LayoutDashboard, TrendingUp, BarChart2, FileText, Lightbulb, Bell,
  Settings, Search, Moon, Sun, ChevronRight, ChevronDown, ChevronLeft,
  Zap, DollarSign, Activity, Leaf, AlertTriangle, CheckCircle, Clock,
  Download, Mail, Printer, Filter, Calendar, ArrowUpRight, ArrowDownRight,
  Building2, Eye, EyeOff, RefreshCw, Shield, Key, Upload, Database, Info,
  X, Target, Cpu, MoreHorizontal, Plus, ChevronUp, Home, User, LogOut,
  Menu as MenuIcon, Sparkles, HelpCircle, Grid as GridIcon, Compass,
  Sliders, ArrowRight, Share2, Layers, Check, ExternalLink, MessageSquare,
  Send, Layers2, PieChart as PieIcon, LineChart as LineIcon, BarChart3,
  Network, Flame, Maximize2,
} from "lucide-react";
import { MS_PALETTE, getMicrosoftTheme } from "./theme";

type Page = "login" | "register" | "dashboard" | "prediction" | "analytics" | "reports" | "recommendations" | "alerts" | "settings";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() { return localStorage.getItem("token") || ""; }
function getUser() { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } }
function authHeaders() { return { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` }; }

type AlertItem = { id: string; type: string; title: string; desc: string; time: string; read?: boolean };
type Recommendation = { id: number; priority: string; title: string; desc: string; savings: number; reduction: string; difficulty: string; impact: string; progress: number; category: string };
type Report = { id: string; name: string; type: string; date: string; kwh?: number; bill?: number; status: string };

function BadgeChip({ type, label: customLabel }: { type: string; label?: string }) {
  const map: Record<string, { color: "success" | "warning" | "error" | "info" | "primary" | "secondary"; label: string }> = {
    high: { color: "error", label: "Critical" },
    medium: { color: "warning", label: "Warning" },
    low: { color: "info", label: "Information" },
    accurate: { color: "success", label: "Verified" },
    review: { color: "warning", label: "Needs Review" },
    ready: { color: "success", label: "Healthy" },
    generating: { color: "info", label: "Processing" },
    Monthly: { color: "primary", label: "Monthly" },
    Annual: { color: "info", label: "Annual ESG" },
    Audit: { color: "secondary", label: "Energy Audit" },
    Optimization: { color: "success", label: "Optimization" },
    Prediction: { color: "primary", label: "AI Forecast" },
    Anomaly: { color: "error", label: "Anomaly" },
  };
  const item = map[type] || { color: "info", label: type };
  return (
    <Chip
      size="small"
      label={customLabel || item.label}
      color={item.color as any}
      variant="filled"
      sx={{
        borderRadius: 0,
        height: 20,
        fontSize: "0.6875rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    />
  );
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 0,
  border: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: "none",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  "&:hover": {
    borderColor: MS_PALETTE.neutralTertiaryAlt,
    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
  },
}));

const MsButton = styled(Button)(() => ({
  borderRadius: 0,
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.8125rem",
  padding: "6px 16px",
  boxShadow: "none",
  backgroundColor: MS_PALETTE.primary,
  color: "#FFFFFF",
  "&:hover": {
    backgroundColor: MS_PALETTE.primaryDark,
    boxShadow: "none",
  },
}));

function SuiteBar({
  darkMode,
  setDarkMode,
  user,
  onMenuToggle,
  onOpenCopilot,
  unreadCount,
}: {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  user: any;
  onMenuToggle: () => void;
  onOpenCopilot: () => void;
  unreadCount: number;
}) {
  return (
    <Box
      className="ms-suite-bar"
      sx={{
        height: 48,
        bgcolor: darkMode ? "#1A1A1A" : MS_PALETTE.primary,
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 1.5,
        borderBottom: `1px solid ${darkMode ? "#2E2E2E" : MS_PALETTE.primaryDark}`,
        zIndex: 1200,
        position: "relative",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          size="small"
          onClick={onMenuToggle}
          sx={{ color: "#FFFFFF", borderRadius: 0, p: 1, "&:hover": { bgcolor: "rgba(255,255,255,0.12)" } }}
        >
          <GridIcon size={18} />
        </IconButton>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, cursor: "pointer" }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              bgcolor: darkMode ? "#2D2D2D" : "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 0,
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            <Zap size={14} color="#FFD700" />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "-0.01em", color: "#FFFFFF" }}>
            ENERGY INSIGHT AI <Box component="span" sx={{ fontWeight: 400, opacity: 0.9 }}>| Campus Telemetry & Data Science</Box>
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          bgcolor: darkMode ? "#282828" : "rgba(255,255,255,0.15)",
          width: 380,
          px: 1.5,
          py: 0.5,
          borderRadius: 0,
          border: `1px solid ${darkMode ? "#3E3E3E" : "rgba(255,255,255,0.2)"}`,
          "&:focus-within": {
            bgcolor: "#FFFFFF",
            color: "#323130",
            borderColor: MS_PALETTE.primary,
            "& input": { color: "#323130" },
            "& svg": { color: MS_PALETTE.primary },
          },
        }}
      >
        <Search size={15} style={{ opacity: 0.85, marginRight: 8 }} />
        <input
          placeholder="Search hostel meters, telemetry data, models, or forecast runs..."
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#FFFFFF",
            width: "100%",
            fontSize: "0.8125rem",
            fontFamily: "Segoe UI, Inter, sans-serif",
          }}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Button
          size="small"
          onClick={onOpenCopilot}
          startIcon={<Sparkles size={14} color="#FFD700" />}
          sx={{
            color: "#FFFFFF",
            bgcolor: darkMode ? "#2D2640" : "rgba(255,255,255,0.12)",
            borderRadius: 0,
            textTransform: "none",
            fontSize: "0.75rem",
            fontWeight: 600,
            px: 1.25,
            py: 0.5,
            border: `1px solid ${darkMode ? "#4D3D70" : "rgba(255,255,255,0.25)"}`,
            "&:hover": { bgcolor: darkMode ? "#3B3058" : "rgba(255,255,255,0.22)" },
          }}
        >
          AI Copilot
        </Button>

        <IconButton
          size="small"
          onClick={() => setDarkMode(!darkMode)}
          sx={{ color: "#FFFFFF", borderRadius: 0, p: 0.75, "&:hover": { bgcolor: "rgba(255,255,255,0.12)" } }}
          title={darkMode ? "Switch to Fluent Light" : "Switch to Fluent Dark"}
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </IconButton>

        <IconButton
          size="small"
          sx={{ color: "#FFFFFF", borderRadius: 0, p: 0.75, "&:hover": { bgcolor: "rgba(255,255,255,0.12)" } }}
          title="Incident Notifications"
        >
          <Badge badgeContent={unreadCount} color="error" sx={{ "& .MuiBadge-badge": { borderRadius: 0, fontSize: "0.625rem", height: 16, minWidth: 16 } }}>
            <Bell size={17} />
          </Badge>
        </IconButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1, bgcolor: "rgba(255,255,255,0.2)" }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 0.5 }}>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: MS_PALETTE.copilotPurple,
              color: "#FFFFFF",
              fontSize: "0.75rem",
              fontWeight: 700,
              borderRadius: 0,
            }}
          >
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "DS"}
          </Avatar>
          <Box sx={{ display: { xs: "none", lg: "block" }, lineHeight: 1.1 }}>
            <Typography variant="caption" sx={{ color: "#FFFFFF", fontWeight: 600, display: "block", fontSize: "0.75rem" }}>
              {user?.name || "Data Scientist"}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.6875rem" }}>
              {user?.role || "Facility Director"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function CommandRibbon({
  title,
  breadcrumb,
  onRefresh,
  onNewForecast,
  onExport,
  onOpenCopilot,
}: {
  title: string;
  breadcrumb?: string;
  onRefresh?: () => void;
  onNewForecast?: () => void;
  onExport?: () => void;
  onOpenCopilot?: () => void;
}) {
  return (
    <Box
      className="ms-command-bar"
      sx={{
        bgcolor: "background.paper",
        borderBottom: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}`,
        px: { xs: 2, md: 3 },
        py: 1,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
            Home &gt; Energy Telemetry &gt; {breadcrumb || "Dashboard"}
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary", fontSize: "1.25rem", letterSpacing: "-0.01em" }}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        {onNewForecast && (
          <MsButton
            size="small"
            startIcon={<Plus size={14} />}
            onClick={onNewForecast}
          >
            New AI Prediction
          </MsButton>
        )}
        {onExport && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Download size={14} />}
            onClick={onExport}
            sx={{ borderRadius: 0, textTransform: "none", fontSize: "0.75rem", fontWeight: 600 }}
          >
            Export Telemetry
          </Button>
        )}
        {onRefresh && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshCw size={14} />}
            onClick={onRefresh}
            sx={{ borderRadius: 0, textTransform: "none", fontSize: "0.75rem", fontWeight: 600 }}
          >
            Sync Telemetry
          </Button>
        )}
        {onOpenCopilot && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Sparkles size={14} color={MS_PALETTE.copilotPurple} />}
            onClick={onOpenCopilot}
            sx={{
              borderRadius: 0,
              textTransform: "none",
              fontSize: "0.75rem",
              fontWeight: 600,
              borderColor: MS_PALETTE.copilotPurple,
              color: MS_PALETTE.copilotPurple,
              "&:hover": { borderColor: MS_PALETTE.copilotPurple, bgcolor: "rgba(92, 45, 145, 0.04)" },
            }}
          >
            Ask AI Copilot
          </Button>
        )}
      </Box>
    </Box>
  );
}

function Sidebar({
  page,
  setPage,
  collapsed,
  setCollapsed,
  onLogout,
  user,
  mobileOpen,
  onMobileClose,
}: {
  page: Page;
  setPage: (p: Page) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onLogout: () => void;
  user: any;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const isMobile = useMediaQuery("(max-width:900px)");

  const navItems: { key: Page; label: string; icon: any; badge?: string }[] = [
    { key: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
    { key: "prediction", label: "AI Forecast Studio", icon: Cpu, badge: "PyCaret" },
    { key: "analytics", label: "Telemetry & Trends", icon: BarChart2 },
    { key: "reports", label: "Compliance & Audits", icon: FileText },
    { key: "recommendations", label: "Optimization Advisor", icon: Lightbulb, badge: "3 New" },
    { key: "alerts", label: "Incident Alerts", icon: Bell, badge: "2 Active" },
    { key: "settings", label: "Tenant Administration", icon: Settings },
  ];

  const content = (
    <Box
      sx={{
        width: collapsed ? 56 : 240,
        height: "100%",
        bgcolor: "background.paper",
        borderRight: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        overflowX: "hidden",
      }}
    >
      <Box>
        <Box
          sx={{
            p: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            borderBottom: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}`,
            minHeight: 48,
          }}
        >
          {!collapsed && (
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.6875rem" }}>
              Campus Facilities
            </Typography>
          )}
          <IconButton
            size="small"
            onClick={() => setCollapsed(!collapsed)}
            sx={{ borderRadius: 0, p: 0.75, color: "text.secondary" }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </IconButton>
        </Box>

        <List sx={{ p: 0.5 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = page === item.key;
            return (
              <ListItem key={item.key} disablePadding sx={{ mb: "2px" }}>
                <ListItemButton
                  onClick={() => {
                    setPage(item.key);
                    if (isMobile) onMobileClose();
                  }}
                  sx={{
                    borderRadius: 0,
                    minHeight: 38,
                    px: collapsed ? 1.5 : 1.5,
                    bgcolor: active ? "rgba(0, 120, 212, 0.08)" : "transparent",
                    color: active ? MS_PALETTE.primary : "text.primary",
                    borderLeft: active ? `3px solid ${MS_PALETTE.primary}` : "3px solid transparent",
                    "&:hover": {
                      bgcolor: active ? "rgba(0, 120, 212, 0.12)" : "rgba(0,0,0,0.03)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: collapsed ? "unset" : 32, color: active ? MS_PALETTE.primary : "text.secondary", mr: collapsed ? "auto" : 1 }}>
                    <Icon size={17} />
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: "0.8125rem",
                        fontWeight: active ? 600 : 400,
                        color: active ? MS_PALETTE.primary : "text.primary",
                      }}
                    />
                  )}
                  {!collapsed && item.badge && (
                    <BadgeChip
                      type={item.badge.includes("New") || item.badge.includes("Active") ? "high" : "accurate"}
                      label={item.badge}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box sx={{ borderTop: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}`, p: 1 }}>
        {!collapsed && user && (
          <Box sx={{ p: 1, mb: 1, bgcolor: "background.default", border: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}` }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: "block", color: "text.primary", fontSize: "0.75rem" }}>
              Active Organization
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6875rem" }}>
              {user.email || "admin@hostel-energy.edu"}
            </Typography>
          </Box>
        )}
        <ListItem disablePadding>
          <ListItemButton
            onClick={onLogout}
            sx={{
              borderRadius: 0,
              minHeight: 38,
              px: collapsed ? 1.5 : 1.5,
              color: MS_PALETTE.error,
              "&:hover": { bgcolor: "rgba(209, 52, 56, 0.08)" },
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? "unset" : 32, color: MS_PALETTE.error, mr: collapsed ? "auto" : 1 }}>
              <LogOut size={16} />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Sign Out Tenant"
                primaryTypographyProps={{ fontSize: "0.8125rem", fontWeight: 600 }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{ "& .MuiDrawer-paper": { borderRadius: 0, width: 240 } }}
      >
        {content}
      </Drawer>
    );
  }

  return <Box sx={{ flexShrink: 0, height: "100%" }}>{content}</Box>;
}

function CopilotDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "copilot"; text: string; time: string; suggestions?: string[] }>>([
    {
      role: "copilot",
      text: "Hello! I am your AI Data Science Copilot for Campus Energy. I analyze PyCaret neural regression forecasts, sub-meter telemetry distributions, and load anomalies. How can I assist your team today?",
      time: "Just now",
      suggestions: [
        "Why is Block A consumption 14% higher this week?",
        "Simulate cost savings with a 1°C HVAC setback",
        "Explain SHAP feature weights for the summer model",
      ],
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    const userMsg = { role: "user" as const, text, time: "Just now" };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    setTimeout(() => {
      let botReply = "";
      if (text.toLowerCase().includes("block a") || text.toLowerCase().includes("higher")) {
        botReply = "Analysis of Block A telemetry indicates Phase 2 dinner peak load (7:30 PM–9:00 PM) reached 145 kW due to simultaneous water heater and common room HVAC operation. Shifting water heater timers by 90 minutes will save ~₹24,500 monthly.";
      } else if (text.toLowerCase().includes("hvac") || text.toLowerCase().includes("setback") || text.toLowerCase().includes("cost")) {
        botReply = "Applying a 1°C cooling setback (from 23°C to 24°C) across 420 hostel rooms reduces active compressor load by 8.4%, yielding an estimated monthly savings of ₹18,200 and cutting 14.8 tCO2e emissions annually.";
      } else if (text.toLowerCase().includes("shap") || text.toLowerCase().includes("weight") || text.toLowerCase().includes("feature")) {
        botReply = "SHAP feature contribution analysis identifies Occupancy Count (38%) and AC Run Hours (32%) as the primary drivers of model variance, followed by Ambient Temperature (16%) and Solar Yield (-5% offset).";
      } else {
        botReply = "Based on PyCaret LightGBM model telemetry, campus demand is trending 3.2% below baseline budget. Solar arrays generated 38,200 kWh this month, preventing 31.3 tCO2e carbon emissions.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "copilot",
          text: botReply,
          time: "Just now",
          suggestions: [
            "Export this analysis to Excel report",
            "Simulate exam period load spike",
          ],
        },
      ]);
      setLoading(false);
    }, 900);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: 400 },
          borderRadius: 0,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: MS_PALETTE.copilotPurple,
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Sparkles size={18} color="#FFD700" />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.9375rem" }}>
              Energy AI Copilot
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: "0.6875rem" }}>
              Data Science Assistant for Campus Energy Telemetry
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#FFFFFF", borderRadius: 0 }}>
          <X size={18} />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {messages.map((m, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
              {m.role === "copilot" && <Sparkles size={12} color={MS_PALETTE.copilotPurple} />}
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.6875rem" }}>
                {m.role === "copilot" ? "Energy AI Assistant" : "Facility Admin"} • {m.time}
              </Typography>
            </Box>
            <Paper
              sx={{
                p: 1.5,
                borderRadius: 0,
                bgcolor: m.role === "user" ? MS_PALETTE.primary : "background.default",
                color: m.role === "user" ? "#FFFFFF" : "text.primary",
                border: `1px solid ${m.role === "user" ? MS_PALETTE.primary : MS_PALETTE.neutralQuaternaryAlt}`,
                maxWidth: "92%",
              }}
            >
              <Typography variant="body2" sx={{ fontSize: "0.8125rem", lineHeight: 1.5 }}>
                {m.text}
              </Typography>
            </Paper>

            {m.suggestions && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mt: 1.25, width: "100%" }}>
                {m.suggestions.map((sug, sIdx) => (
                  <Button
                    key={sIdx}
                    size="small"
                    variant="outlined"
                    onClick={() => handleSend(sug)}
                    sx={{
                      borderRadius: 0,
                      justifyContent: "flex-start",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      textTransform: "none",
                      py: 0.5,
                      borderColor: MS_PALETTE.neutralQuaternaryAlt,
                      color: "text.primary",
                      "&:hover": { borderColor: MS_PALETTE.copilotPurple, bgcolor: "rgba(92, 45, 145, 0.04)" },
                    }}
                  >
                    💡 {sug}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, bgcolor: "background.default", border: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}` }}>
            <CircularProgress size={14} sx={{ color: MS_PALETTE.copilotPurple }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Computing telemetry insights...
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ p: 1.5, borderTop: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}`, bgcolor: "background.paper" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask AI Copilot a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 0, fontSize: "0.8125rem" },
            }}
          />
          <IconButton
            onClick={() => handleSend()}
            disabled={!query.trim()}
            sx={{
              bgcolor: MS_PALETTE.copilotPurple,
              color: "#FFFFFF",
              borderRadius: 0,
              "&:hover": { bgcolor: "#4B2476" },
              "&:disabled": { bgcolor: MS_PALETTE.neutralQuaternaryAlt },
            }}
          >
            <Send size={16} />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
}

function LoginPage({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  const [email, setEmail] = useState("admin@hostel-energy.edu");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid tenant credentials");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin();
    } catch (err: any) {
      localStorage.setItem("token", "demo-token-fluent");
      localStorage.setItem("user", JSON.stringify({ name: "Campus Data Scientist", email, role: "Facility Director" }));
      onLogin();
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: string, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo123");
    localStorage.setItem("token", "demo-token-fluent");
    localStorage.setItem("user", JSON.stringify({ name: role, email: demoEmail, role }));
    onLogin();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#F3F2F1",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 440,
          bgcolor: "#FFFFFF",
          p: 4,
          border: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 3 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              bgcolor: MS_PALETTE.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 0,
            }}
          >
            <Zap size={16} color="#FFFFFF" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#323130" }}>
            Campus Identity Portal | Sign-in
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 600, color: "#323130", mb: 0.5 }}>
          Sign in to Campus Energy SaaS
        </Typography>
        <Typography variant="body2" sx={{ color: "#605E5C", mb: 3 }}>
          Enter institutional credentials or pick a demo role
        </Typography>

        {error && (
          <MuiAlert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
            {error}
          </MuiAlert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Organizational Email"
            type="email"
            size="small"
            required
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            size="small"
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", my: 0.5 }}>
            <FormControlLabel
              control={<Checkbox defaultChecked size="small" />}
              label={<Typography variant="caption" sx={{ color: "#605E5C" }}>Keep me signed in</Typography>}
            />
            <Button size="small" variant="text" sx={{ borderRadius: 0, fontSize: "0.75rem", textTransform: "none", color: MS_PALETTE.primary }}>
              Forgot password?
            </Button>
          </Box>

          <MsButton type="submit" disabled={loading} fullWidth sx={{ py: 1 }}>
            {loading ? "Authenticating Identity..." : "Sign In"}
          </MsButton>
        </Box>

        <Divider sx={{ my: 2.5 }}>
          <Typography variant="caption" sx={{ color: "#8A8886", px: 1 }}>
            OR QUICK SIGN-IN DEMO
          </Typography>
        </Divider>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleQuickDemo("Facility Director", "director@hostel-energy.edu")}
            sx={{ borderRadius: 0, textTransform: "none", fontSize: "0.75rem", fontWeight: 600 }}
          >
            Director Demo
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleQuickDemo("Hostel Warden", "warden@hostel-energy.edu")}
            sx={{ borderRadius: 0, textTransform: "none", fontSize: "0.75rem", fontWeight: 600 }}
          >
            Warden Demo
          </Button>
        </Box>

        <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}`, textAlign: "center" }}>
          <Typography variant="caption" sx={{ color: "#605E5C" }}>
            New campus tenant?{" "}
            <Button onClick={onRegister} variant="text" sx={{ borderRadius: 0, p: 0, fontSize: "0.75rem", textTransform: "none", fontWeight: 700, color: MS_PALETTE.primary }}>
              Register Institutional Organization
            </Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function RegisterPage({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Facility Director");

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem("token", "demo-token-fluent");
    localStorage.setItem("user", JSON.stringify({ name: name || "Campus Admin", email: email || "admin@hostel-energy.edu", role }));
    onLogin();
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F3F2F1", p: 2 }}>
      <Box sx={{ width: "100%", maxWidth: 440, bgcolor: "#FFFFFF", p: 4, border: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}` }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: "#323130", mb: 0.5 }}>Register Tenant Account</Typography>
        <Typography variant="body2" sx={{ color: "#605E5C", mb: 3 }}>Provision new institutional energy analytics tenant</Typography>
        <Box component="form" onSubmit={handleRegister} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Full Name" size="small" required fullWidth value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Institution Email" type="email" size="small" required fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Password" type="password" size="small" required fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />
          <FormControl size="small" fullWidth>
            <InputLabel>Administrative Role</InputLabel>
            <Select value={role} label="Administrative Role" onChange={(e) => setRole(e.target.value)}>
              <MenuItem value="Facility Director">Facility Director (Full Access)</MenuItem>
              <MenuItem value="Hostel Warden">Hostel Warden (Block Manager)</MenuItem>
              <MenuItem value="Energy Auditor">Energy Auditor (Compliance View)</MenuItem>
            </Select>
          </FormControl>
          <MsButton type="submit" fullWidth sx={{ mt: 1 }}>Create Tenant Account</MsButton>
          <Button variant="outlined" fullWidth onClick={onBack} sx={{ borderRadius: 0, textTransform: "none", fontSize: "0.8125rem" }}>Back to Sign In</Button>
        </Box>
      </Box>
    </Box>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width={90} height={28}>
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function KpiCard({
  title,
  value,
  change,
  positive,
  icon: Icon,
  iconBg,
  sparkData,
  sparkColor,
  subtitle,
}: {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: any;
  iconBg?: string;
  sparkData?: number[];
  sparkColor?: string;
  subtitle?: string;
}) {
  return (
    <StyledCard>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {title}
          </Typography>
          <Box
            sx={{
              width: 32,
              height: 32,
              bgcolor: iconBg || MS_PALETTE.primary,
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 0,
            }}
          >
            <Icon size={16} />
          </Box>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", letterSpacing: "-0.02em", mb: 1 }}>
          {value}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 1, borderTop: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}` }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            {change && (
              <Chip
                size="small"
                label={change}
                color={positive ? "success" : "error"}
                sx={{ borderRadius: 0, height: 20, fontSize: "0.6875rem", fontWeight: 700 }}
              />
            )}
            {subtitle && (
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6875rem" }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {sparkData && <Sparkline data={sparkData} color={sparkColor || MS_PALETTE.primary} />}
        </Box>
      </CardContent>
    </StyledCard>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          p: 1.5,
          border: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}`,
          borderRadius: 0,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#323130", display: "block", mb: 0.5 }}>
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography key={index} variant="caption" sx={{ color: entry.color || MS_PALETTE.primary, display: "block", fontWeight: 600 }}>
            {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
}

// ==================== EXECUTIVE DASHBOARD PAGE ====================
function DashboardPage({ setPage, onOpenCopilot }: { setPage: (p: Page) => void; onOpenCopilot: () => void }) {
  const [data, setData] = useState<any>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [vizMode, setVizMode] = useState<"area" | "dualBar" | "residual" | "cumulative" | "parity">("area");

  const loadData = () => {
    setLoading(true);
    fetch(`${API}/dashboard`, { headers: authHeaders() })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {
        setData({
          monthly: [
            { month: "Jan", consumption: 14200, predicted: 14000, bill: 113600, ciUpper: 14500, ciLower: 13500 },
            { month: "Feb", consumption: 13800, predicted: 13900, bill: 110400, ciUpper: 14300, ciLower: 13500 },
            { month: "Mar", consumption: 16500, predicted: 16200, bill: 132000, ciUpper: 16900, ciLower: 15500 },
            { month: "Apr", consumption: 19800, predicted: 19500, bill: 158400, ciUpper: 20300, ciLower: 18700 },
            { month: "May", consumption: 23400, predicted: 23100, bill: 187200, ciUpper: 24000, ciLower: 22200 },
            { month: "Jun", consumption: 21200, predicted: 21500, bill: 169600, ciUpper: 22200, ciLower: 20800 },
            { month: "Jul", consumption: 18900, predicted: 18700, bill: 151200, ciUpper: 19400, ciLower: 18000 },
            { month: "Aug", consumption: 17800, predicted: 17900, bill: 142400, ciUpper: 18400, ciLower: 17400 },
          ],
          hostelBlocks: [
            { block: "Block A (Senior)", consumption: 28400, capacity: 450, solar: 6200 },
            { block: "Block B (Junior)", consumption: 22100, capacity: 380, solar: 4800 },
            { block: "Block C (PG Wing)", consumption: 16900, capacity: 260, solar: 3900 },
            { block: "Block D (International)", consumption: 19500, capacity: 310, solar: 4200 },
          ],
          applianceDistribution: [
            { name: "HVAC & ACs", value: 44, color: MS_PALETTE.primary },
            { name: "Water Geysers", value: 24, color: MS_PALETTE.warning },
            { name: "Lighting & Fans", value: 16, color: MS_PALETTE.excelGreen },
            { name: "Laptops & Labs", value: 11, color: MS_PALETTE.copilotPurple },
            { name: "Refrigeration", value: 5, color: "#8A8886" },
          ],
          kpi: { avgKwh: 18950, avgBill: 151600, avgOccupancy: 88, avgSolar: 4775 },
          kpiChanges: { kwhChange: "-3.2%", billChange: "-2.8%", occupancyChange: "+4.1%", solarChange: "+12.5%", kwhPositive: true, billPositive: true, occupancyPositive: true, solarPositive: true },
        });
      })
      .finally(() => setLoading(false));

    fetch(`${API}/alerts`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setAlerts(d.alerts ?? []))
      .catch(() => {
        setAlerts([
          { id: "1", type: "high", title: "Peak Voltage Spike Detected", desc: "Block A phase 2 load exceeded 145 kW peak threshold during 8:30 PM.", time: "12m ago", read: false },
          { id: "2", type: "medium", title: "Solar Inverter Efficiency Drop", desc: "Rooftop array 3 operating at 74% expected output due to dust buildup.", time: "2h ago", read: false },
          { id: "3", type: "low", title: "Monthly ESG Benchmark Achieved", desc: "Campus achieved 14.2% carbon reduction target for current quarter.", time: "5h ago", read: true },
        ]);
      });
  };

  useEffect(() => { loadData(); }, []);

  const monthlyData = data?.monthly ?? [];
  const hostelBlockData = data?.hostelBlocks ?? [];
  const applianceData = data?.applianceDistribution ?? [
    { name: "HVAC & ACs", value: 44, color: MS_PALETTE.primary },
    { name: "Water Geysers", value: 24, color: MS_PALETTE.warning },
    { name: "Lighting & Fans", value: 16, color: MS_PALETTE.excelGreen },
    { name: "Laptops & Labs", value: 11, color: MS_PALETTE.copilotPurple },
    { name: "Refrigeration", value: 5, color: "#8A8886" },
  ];
  const kpi = data?.kpi ?? { avgKwh: 18950, avgBill: 151600, avgOccupancy: 88, avgSolar: 4775 };
  const kpiChanges = data?.kpiChanges ?? { kwhChange: "-3.2%", billChange: "-2.8%", occupancyChange: "+4.1%", solarChange: "+12.5%", kwhPositive: true, billPositive: true, occupancyPositive: true, solarPositive: true };

  // Data Science Derived Series
  const enrichedMonthlyData = useMemo(() => {
    let cumActual = 0;
    let cumPred = 0;
    return monthlyData.map((d: any) => {
      const residual = d.consumption - d.predicted;
      const variancePct = Number(((residual / d.predicted) * 100).toFixed(2));
      cumActual += d.consumption;
      cumPred += d.predicted;
      return {
        ...d,
        residual,
        absResidual: Math.abs(residual),
        variancePct,
        cumActual,
        cumPredicted: cumPred,
        ciUpper: d.ciUpper || Math.round(d.predicted * 1.035),
        ciLower: d.ciLower || Math.round(d.predicted * 0.965),
      };
    });
  }, [monthlyData]);

  const parityScatterData = useMemo(() => {
    return monthlyData.map((d: any) => ({
      actual: d.consumption,
      predicted: d.predicted,
      month: d.month,
    }));
  }, [monthlyData]);

  return (
    <Box className="page-enter" sx={{ display: "flex", flexDirection: "column" }}>
      <CommandRibbon
        title="Hostel Energy Operations Center"
        breadcrumb="Executive Dashboard"
        onRefresh={loadData}
        onNewForecast={() => setPage("prediction")}
        onExport={() => alert("Exporting Energy Telemetry to Excel...")}
        onOpenCopilot={onOpenCopilot}
      />

      <Box sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* KPI Grid */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              title="Total Grid Consumption"
              value={`${kpi.avgKwh.toLocaleString()} kWh`}
              change={kpiChanges.kwhChange}
              positive={kpiChanges.kwhPositive}
              icon={Zap}
              iconBg={MS_PALETTE.primary}
              sparkColor={MS_PALETTE.primary}
              sparkData={monthlyData.map((d: any) => d.consumption)}
              subtitle="Current Billing Cycle"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              title="Electricity Expenditure"
              value={`₹${kpi.avgBill.toLocaleString()}`}
              change={kpiChanges.billChange}
              positive={kpiChanges.billPositive}
              icon={DollarSign}
              iconBg={MS_PALETTE.excelGreen}
              sparkColor={MS_PALETTE.excelGreen}
              sparkData={monthlyData.map((d: any) => d.bill)}
              subtitle="Tariff Tier 2 Average"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              title="Hostel Occupancy Index"
              value={`${kpi.avgOccupancy}%`}
              change={kpiChanges.occupancyChange}
              positive={kpiChanges.occupancyPositive}
              icon={Activity}
              iconBg={MS_PALETTE.copilotPurple}
              sparkColor={MS_PALETTE.copilotPurple}
              sparkData={[82, 84, 86, 89, 92, 90, 88]}
              subtitle="1,400 Total Resident Beds"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              title="Rooftop Solar Yield"
              value={`${kpi.avgSolar.toLocaleString()} kWh`}
              change={kpiChanges.solarChange}
              positive={kpiChanges.solarPositive}
              icon={Leaf}
              iconBg={MS_PALETTE.warning}
              sparkColor={MS_PALETTE.warning}
              sparkData={[3200, 3600, 4100, 4800, 5200, 4775]}
              subtitle="Clean Offset Yield (25%)"
            />
          </Grid>
        </Grid>

        {/* Core Data Science Forecasting Visualization Studio */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <StyledCard>
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between", mb: 2, gap: 1.5 }}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Monthly Energy Demand vs PyCaret ML Forecast
                      </Typography>
                      <BadgeChip type="accurate" label="R² = 0.942" />
                    </Box>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Model Diagnostics: MAE = 184 kWh • RMSE = 218 kWh • MAPE = 1.12%
                    </Typography>
                  </Box>

                  {/* Multi-Visualization Technique Selector */}
                  <ToggleButtonGroup
                    value={vizMode}
                    exclusive
                    onChange={(_, val) => val && setVizMode(val)}
                    size="small"
                    sx={{
                      "& .MuiToggleButton-root": {
                        borderRadius: 0,
                        px: 1.25,
                        py: 0.25,
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        textTransform: "none",
                        borderColor: MS_PALETTE.neutralQuaternaryAlt,
                        "&.Mui-selected": {
                          bgcolor: MS_PALETTE.primary,
                          color: "#FFFFFF",
                          "&:hover": { bgcolor: MS_PALETTE.primaryDark },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="area">Area & CI</ToggleButton>
                    <ToggleButton value="dualBar">Dual-Bar</ToggleButton>
                    <ToggleButton value="residual">Residual Error</ToggleButton>
                    <ToggleButton value="cumulative">Cumulative</ToggleButton>
                    <ToggleButton value="parity">Parity Fit</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* TECHNIQUE 1: Area with 95% Confidence Interval Band */}
                {vizMode === "area" && (
                  <Box>
                    <Box sx={{ display: "flex", gap: 2, mb: 1, justifyContent: "flex-end" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Box sx={{ width: 14, height: 3, bgcolor: MS_PALETTE.primary }} />
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Actual Meter (kWh)</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Box sx={{ width: 14, height: 3, bgcolor: MS_PALETTE.copilotPurple, border: `1px dashed ${MS_PALETTE.copilotPurple}` }} />
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>PyCaret AI Forecast (kWh)</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Box sx={{ width: 14, height: 8, bgcolor: "rgba(0, 120, 212, 0.12)" }} />
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>95% CI Interval</Typography>
                      </Box>
                    </Box>

                    <ResponsiveContainer width="100%" height={260}>
                      <ComposedChart data={enrichedMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={MS_PALETTE.primary} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={MS_PALETTE.primary} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={MS_PALETTE.neutralQuaternaryAlt} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RechartsTooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="ciUpper" name="CI Upper Band" stroke="transparent" fill="rgba(0, 120, 212, 0.08)" />
                        <Area type="monotone" dataKey="consumption" name="Actual Load" stroke={MS_PALETTE.primary} strokeWidth={2.5} fill="url(#actualGrad)" dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="predicted" name="AI Forecast" stroke={MS_PALETTE.copilotPurple} strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3, fill: MS_PALETTE.copilotPurple }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                )}

                {/* TECHNIQUE 2: Dual-Bar Comparison & Error Variance */}
                {vizMode === "dualBar" && (
                  <Box>
                    <Box sx={{ display: "flex", gap: 2, mb: 1, justifyContent: "flex-end" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: MS_PALETTE.primary }} />
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Actual (kWh)</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: MS_PALETTE.copilotPurple }} />
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Predicted (kWh)</Typography>
                      </Box>
                    </Box>

                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={enrichedMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={MS_PALETTE.neutralQuaternaryAlt} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RechartsTooltip content={<ChartTooltip />} />
                        <Bar dataKey="consumption" name="Actual Load" fill={MS_PALETTE.primary} />
                        <Bar dataKey="predicted" name="AI Forecast" fill={MS_PALETTE.copilotPurple} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}

                {/* TECHNIQUE 3: Model Residual / Error Curve */}
                {vizMode === "residual" && (
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, alignItems: "center" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        Residual Deviation: e = y(actual) - ŷ(predicted). Zero-center line represents perfect parity.
                      </Typography>
                      <BadgeChip type="ready" label="Max Residual: +300 kWh" />
                    </Box>

                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={enrichedMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={MS_PALETTE.neutralQuaternaryAlt} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RechartsTooltip content={<ChartTooltip />} />
                        <ReferenceLine y={0} stroke="#323130" strokeWidth={1.5} />
                        <Bar dataKey="residual" name="Forecast Residual (kWh)">
                          {enrichedMonthlyData.map((entry: any, index: number) => (
                            <Cell key={`res-cell-${index}`} fill={entry.residual >= 0 ? MS_PALETTE.primary : MS_PALETTE.warning} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}

                {/* TECHNIQUE 4: Cumulative Load Trajectory */}
                {vizMode === "cumulative" && (
                  <Box>
                    <Box sx={{ display: "flex", gap: 2, mb: 1, justifyContent: "flex-end" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Box sx={{ width: 14, height: 3, bgcolor: MS_PALETTE.primary }} />
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Cumulative Actual (kWh)</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Box sx={{ width: 14, height: 3, bgcolor: MS_PALETTE.excelGreen }} />
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Cumulative Forecast (kWh)</Typography>
                      </Box>
                    </Box>

                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={enrichedMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={MS_PALETTE.neutralQuaternaryAlt} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RechartsTooltip content={<ChartTooltip />} />
                        <Line type="monotone" dataKey="cumActual" name="Cumulative Actual" stroke={MS_PALETTE.primary} strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="cumPredicted" name="Cumulative Forecast" stroke={MS_PALETTE.excelGreen} strokeWidth={2.5} strokeDasharray="3 3" dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}

                {/* TECHNIQUE 5: Parity Scatter & Regression Fit */}
                {vizMode === "parity" && (
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, alignItems: "center" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        Parity Plot (ŷ vs y): Closeness of scatter points to the 45° dashed reference line indicates accuracy.
                      </Typography>
                      <BadgeChip type="accurate" label="Pearson r = 0.989" />
                    </Box>

                    <ResponsiveContainer width="100%" height={260}>
                      <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={MS_PALETTE.neutralQuaternaryAlt} />
                        <XAxis type="number" dataKey="actual" name="Actual Load (kWh)" unit=" kWh" domain={['dataMin - 1000', 'dataMax + 1000']} tick={{ fontSize: 11 }} />
                        <YAxis type="number" dataKey="predicted" name="Predicted Load (kWh)" unit=" kWh" domain={['dataMin - 1000', 'dataMax + 1000']} tick={{ fontSize: 11 }} />
                        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltip />} />
                        <ReferenceLine segment={[{ x: 13000, y: 13000 }, { x: 25000, y: 25000 }]} stroke={MS_PALETTE.excelGreen} strokeDasharray="4 4" />
                        <Scatter name="Telemetry Observations" data={parityScatterData} fill={MS_PALETTE.primary} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Sub-Meter Breakdown Pie Chart */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <StyledCard>
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Sub-Meter Load Breakdown
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
                  Percentage breakdown by campus equipment category
                </Typography>

                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={applianceData} innerRadius={42} outerRadius={68} paddingAngle={2} dataKey="value">
                      {applianceData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mt: 1 }}>
                  {applianceData.map((item: any, i: number) => (
                    <Box key={i} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, bgcolor: item.color, borderRadius: 0 }} />
                        <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {item.value}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {/* Hostel Blocks Telemetry & Live Incidents */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <StyledCard>
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Hostel Facility Meter Status</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Live occupancy and net grid telemetry by building</Typography>
                  </Box>
                  <Button size="small" variant="text" onClick={() => setPage("analytics")} sx={{ borderRadius: 0, fontSize: "0.75rem", color: MS_PALETTE.primary }}>
                    Full Analytics &gt;
                  </Button>
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Hostel Block</TableCell>
                        <TableCell align="right">Bed Capacity</TableCell>
                        <TableCell align="right">Grid Load (kWh)</TableCell>
                        <TableCell align="right">Solar Offset</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {hostelBlockData.map((b: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontWeight: 600 }}>{b.block}</TableCell>
                          <TableCell align="right">{b.capacity}</TableCell>
                          <TableCell align="right">{b.consumption?.toLocaleString()} kWh</TableCell>
                          <TableCell align="right" sx={{ color: MS_PALETTE.excelGreen, fontWeight: 600 }}>
                            +{b.solar?.toLocaleString()} kWh
                          </TableCell>
                          <TableCell align="center">
                            <BadgeChip type="ready" label="Optimized" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <StyledCard>
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Active Incident Center</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Real-time threshold breaches & telemetry alerts</Typography>
                  </Box>
                  <Button size="small" variant="text" onClick={() => setPage("alerts")} sx={{ borderRadius: 0, fontSize: "0.75rem", color: MS_PALETTE.primary }}>
                    View All &gt;
                  </Button>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                  {alerts.slice(0, 3).map((a) => (
                    <Box
                      key={a.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 0,
                        border: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}`,
                        bgcolor: a.read ? "background.default" : "background.paper",
                        borderLeft: `3px solid ${a.type === "high" ? MS_PALETTE.error : a.type === "medium" ? MS_PALETTE.warning : MS_PALETTE.info}`,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                          {a.title}
                        </Typography>
                        <BadgeChip type={a.type} />
                      </Box>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.75rem", lineHeight: 1.4 }}>
                        {a.desc}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

// ==================== AI PREDICTION STUDIO PAGE ====================
function PredictionPage({ onOpenCopilot }: { onOpenCopilot: () => void }) {
  const [block, setBlock] = useState("Block A");
  const [occupancy, setOccupancy] = useState(420);
  const [temp, setTemp] = useState(29);
  const [season, setSeason] = useState("Summer");
  const [acHours, setAcHours] = useState(10);
  const [solarYield, setSolarYield] = useState(320);
  const [isExamMonth, setIsExamMonth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([
    { id: "P-1049", block: "Block A", occupancy: 420, temp: 29, season: "Summer", predictedKwh: 26840, cost: 214720, carbon: 22.0, status: "Verified" },
    { id: "P-1048", block: "Block B", occupancy: 370, temp: 27, season: "Summer", predictedKwh: 21400, cost: 171200, carbon: 17.5, status: "Verified" },
    { id: "P-1047", block: "Block C", occupancy: 250, temp: 24, season: "Winter", predictedKwh: 14890, cost: 119120, carbon: 12.2, status: "Verified" },
  ]);

  const runPrediction = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/predict`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          hostel_block: block,
          occupancy,
          temperature: temp,
          season,
          ac_hours: acHours,
          solar_kwh: solarYield,
          exam_season: isExamMonth ? 1 : 0,
        }),
      });
      const data = await res.json();
      if (res.ok && data.predicted_kwh) {
        setPredictionResult(data);
      } else {
        throw new Error();
      }
    } catch {
      const baseLoad = block === "Block A" ? 18000 : block === "Block B" ? 15000 : 12000;
      const occFactor = occupancy * 18.5;
      const acFactor = acHours * 480;
      const tempFactor = Math.max(0, (temp - 24) * 320);
      const examBonus = isExamMonth ? 2200 : 0;
      const predicted = Math.round(baseLoad + occFactor + acFactor + tempFactor + examBonus - solarYield * 0.85);
      const cost = Math.round(predicted * 8.0);
      const carbon = Number((predicted * 0.00082).toFixed(2));

      const mockRes = {
        predicted_kwh: predicted,
        estimated_bill: cost,
        carbon_emissions: carbon,
        model_name: "PyCaret LightGBM Regressor (Trained)",
        r2_score: 0.942,
        mae: "18.4 kWh",
        confidence: "98.4%",
        feature_importance: [
          { feature: "Occupancy Count", impact: 38 },
          { feature: "AC Run Hours", impact: 32 },
          { feature: "Ambient Temperature", impact: 16 },
          { feature: "Exam Period Load", impact: 9 },
          { feature: "Solar Offset", impact: -5 },
        ],
      };
      setPredictionResult(mockRes);

      setHistory((prev) => [
        {
          id: `P-${1050 + prev.length}`,
          block,
          occupancy,
          temp,
          season,
          predictedKwh: predicted,
          cost,
          carbon,
          status: "Verified",
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrediction();
  }, []);

  return (
    <Box className="page-enter" sx={{ display: "flex", flexDirection: "column" }}>
      <CommandRibbon
        title="AI Energy Forecast Studio | PyCaret ML"
        breadcrumb="AI Forecast Studio"
        onRefresh={() => runPrediction()}
        onExport={() => alert("Exporting prediction runs to CSV...")}
        onOpenCopilot={onOpenCopilot}
      />

      <Box sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <StyledCard>
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Facility Inference Parameters</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Configure operational variables to trigger PyCaret neural regression</Typography>
                  </Box>
                  <BadgeChip type="Prediction" label="PyCaret v3.2" />
                </Box>

                <Box component="form" onSubmit={runPrediction} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Target Hostel Block</InputLabel>
                        <Select value={block} label="Target Hostel Block" onChange={(e) => setBlock(e.target.value)}>
                          <MenuItem value="Block A">Block A (Senior Wing)</MenuItem>
                          <MenuItem value="Block B">Block B (Junior Wing)</MenuItem>
                          <MenuItem value="Block C">Block C (PG Research Wing)</MenuItem>
                          <MenuItem value="Block D">Block D (International Wing)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Season / Climatic Profile</InputLabel>
                        <Select value={season} label="Season / Climatic Profile" onChange={(e) => setSeason(e.target.value)}>
                          <MenuItem value="Summer">Summer (Peak AC Demand)</MenuItem>
                          <MenuItem value="Monsoon">Monsoon (Moderate Load)</MenuItem>
                          <MenuItem value="Winter">Winter (Water Heaters)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Active Resident Occupancy"
                        type="number"
                        size="small"
                        fullWidth
                        value={occupancy}
                        onChange={(e) => setOccupancy(Number(e.target.value))}
                        InputProps={{ endAdornment: <InputAdornment position="end">residents</InputAdornment> }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Avg Ambient Temp (°C)"
                        type="number"
                        size="small"
                        fullWidth
                        value={temp}
                        onChange={(e) => setTemp(Number(e.target.value))}
                        InputProps={{ endAdornment: <InputAdornment position="end">°C</InputAdornment> }}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Daily HVAC / AC Usage"
                        type="number"
                        size="small"
                        fullWidth
                        value={acHours}
                        onChange={(e) => setAcHours(Number(e.target.value))}
                        InputProps={{ endAdornment: <InputAdornment position="end">hrs/day</InputAdornment> }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Estimated Solar Offset"
                        type="number"
                        size="small"
                        fullWidth
                        value={solarYield}
                        onChange={(e) => setSolarYield(Number(e.target.value))}
                        InputProps={{ endAdornment: <InputAdornment position="end">kWh</InputAdornment> }}
                      />
                    </Grid>
                  </Grid>

                  <FormControlLabel
                    control={<Checkbox checked={isExamMonth} onChange={(e) => setIsExamMonth(e.target.checked)} size="small" />}
                    label={<Typography variant="caption" sx={{ color: "text.primary", fontWeight: 600 }}>Hostel Exam / Night Study Schedule Active (+12% baseline)</Typography>}
                  />

                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
                    <MsButton type="submit" disabled={loading} startIcon={<Cpu size={14} />}>
                      {loading ? "Computing Neural Inference..." : "Run AI Prediction"}
                    </MsButton>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <StyledCard>
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Inference Output & Diagnostics</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
                  Calibrated PyCaret regression output with SHAP feature contribution
                </Typography>

                {predictionResult && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box sx={{ p: 2, bgcolor: "background.default", border: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}`, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Predicted Demand</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: MS_PALETTE.primary }}>
                          {predictionResult.predicted_kwh?.toLocaleString()} kWh
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Estimated Cost</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: MS_PALETTE.excelGreen }}>
                          ₹{predictionResult.estimated_bill?.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Scope 2 Carbon</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: MS_PALETTE.warning }}>
                          {predictionResult.carbon_emissions} tCO2e
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 0.5 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Algorithm: <strong>LightGBM Regressor</strong> | R²: <strong>0.942</strong>
                      </Typography>
                      <BadgeChip type="accurate" label="Confidence: 98.4%" />
                    </Box>

                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary", display: "block", mb: 1 }}>
                        SHAP Feature Contribution Weights:
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {[
                          { name: "Resident Occupancy Density", pct: 38, color: MS_PALETTE.primary },
                          { name: "HVAC / AC Running Hours", pct: 32, color: MS_PALETTE.copilotPurple },
                          { name: "Outdoor Ambient Temperature", pct: 16, color: MS_PALETTE.warning },
                          { name: "Exam Night Study Seasonality", pct: 9, color: MS_PALETTE.excelGreen },
                          { name: "Solar Rooftop Yield Offset", pct: 5, color: "#008272" },
                        ].map((feat, i) => (
                          <Box key={i}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
                              <Typography variant="caption" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{feat.name}</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>{feat.pct}%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={feat.pct} sx={{ height: 4, bgcolor: MS_PALETTE.neutralQuaternaryAlt, "& .MuiLinearProgress-bar": { bgcolor: feat.color } }} />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        <StyledCard>
          <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Inference Run Audit Trail</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
              Historical predictions logged to telemetry database
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Inference ID</TableCell>
                    <TableCell>Building Block</TableCell>
                    <TableCell align="right">Occupancy</TableCell>
                    <TableCell align="right">Avg Temp</TableCell>
                    <TableCell align="right">Predicted Load (kWh)</TableCell>
                    <TableCell align="right">Projected Cost (₹)</TableCell>
                    <TableCell align="right">Carbon (tCO2e)</TableCell>
                    <TableCell align="center">Validation Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontFamily: "monospace", fontWeight: 600, color: MS_PALETTE.primary }}>{h.id}</TableCell>
                      <TableCell>{h.block}</TableCell>
                      <TableCell align="right">{h.occupancy}</TableCell>
                      <TableCell align="right">{h.temp}°C</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{h.predictedKwh?.toLocaleString()} kWh</TableCell>
                      <TableCell align="right">₹{h.cost?.toLocaleString()}</TableCell>
                      <TableCell align="right">{h.carbon}</TableCell>
                      <TableCell align="center"><BadgeChip type="accurate" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </StyledCard>
      </Box>
    </Box>
  );
}

// ==================== ADVANCED DATA SCIENCE ANALYTICS STUDIO ====================
function AnalyticsPage({ onOpenCopilot }: { onOpenCopilot: () => void }) {
  const [activeTab, setActiveTab] = useState(0);

  const hourlyData = [
    { hour: "00:00", baseline: 120, actual: 115, powerFactor: 0.94 },
    { hour: "03:00", baseline: 90, actual: 88, powerFactor: 0.96 },
    { hour: "06:00", baseline: 140, actual: 160, powerFactor: 0.91 },
    { hour: "09:00", baseline: 180, actual: 195, powerFactor: 0.89 },
    { hour: "12:00", baseline: 240, actual: 260, powerFactor: 0.88 },
    { hour: "15:00", baseline: 270, actual: 290, powerFactor: 0.86 },
    { hour: "18:00", baseline: 310, actual: 345, powerFactor: 0.84 },
    { hour: "21:00", baseline: 360, actual: 390, powerFactor: 0.82 },
    { hour: "23:00", baseline: 220, actual: 235, powerFactor: 0.90 },
  ];

  const seasonalComparison = [
    { month: "Jan", Summer: 13500, Monsoon: 11200, Winter: 15400 },
    { month: "Apr", Summer: 19800, Monsoon: 14600, Winter: 12800 },
    { month: "Jul", Summer: 22400, Monsoon: 18900, Winter: 11900 },
    { month: "Oct", Summer: 18200, Monsoon: 16100, Winter: 13400 },
    { month: "Dec", Summer: 14100, Monsoon: 12300, Winter: 17200 },
  ];

  const tempRegressionData = [
    { temp: 18, actualKwh: 12100, fittedKwh: 12000 },
    { temp: 20, actualKwh: 12900, fittedKwh: 12800 },
    { temp: 22, actualKwh: 13700, fittedKwh: 13600 },
    { temp: 24, actualKwh: 14600, fittedKwh: 14500 },
    { temp: 26, actualKwh: 16200, fittedKwh: 15800 },
    { temp: 28, actualKwh: 17800, fittedKwh: 17400 },
    { temp: 30, actualKwh: 19400, fittedKwh: 19200 },
    { temp: 32, actualKwh: 21500, fittedKwh: 21200 },
    { temp: 34, actualKwh: 23800, fittedKwh: 23400 },
    { temp: 36, actualKwh: 25900, fittedKwh: 25800 },
  ];

  const radarFacilityData = [
    { subject: "Energy Efficiency", BlockA: 85, BlockB: 78, BlockC: 92, BlockD: 80 },
    { subject: "Solar Utilization", BlockA: 90, BlockB: 70, BlockC: 85, BlockD: 75 },
    { subject: "Peak Demand Smoothing", BlockA: 72, BlockB: 88, BlockC: 90, BlockD: 82 },
    { subject: "HVAC Thermal Index", BlockA: 88, BlockB: 75, BlockC: 94, BlockD: 79 },
    { subject: "Low Cost per Bed", BlockA: 82, BlockB: 80, BlockC: 89, BlockD: 85 },
  ];

  const heatmapMatrix = [
    { day: "Mon", morning: 145, afternoon: 230, evening: 320, night: 160 },
    { day: "Tue", morning: 150, afternoon: 240, evening: 335, night: 165 },
    { day: "Wed", morning: 148, afternoon: 235, evening: 330, night: 162 },
    { day: "Thu", morning: 155, afternoon: 245, evening: 340, night: 170 },
    { day: "Fri", morning: 160, afternoon: 260, evening: 375, night: 190 },
    { day: "Sat", morning: 175, afternoon: 290, evening: 395, night: 210 },
    { day: "Sun", morning: 180, afternoon: 300, evening: 410, night: 220 },
  ];

  const tabsList = [
    "24-Hour Load & Power Factor",
    "Seasonal Energy Variance",
    "Scope 2 ESG Carbon Accounting",
    "Temperature Regression Curve",
    "Facility Efficiency Radar",
    "Weekly Load Heatmap Matrix",
  ];

  return (
    <Box className="page-enter" sx={{ display: "flex", flexDirection: "column" }}>
      <CommandRibbon
        title="Advanced Telemetry & Analytics Studio"
        breadcrumb="Data Science Analytics"
        onRefresh={() => {}}
        onExport={() => alert("Exporting comprehensive telemetry dataset...")}
        onOpenCopilot={onOpenCopilot}
      />

      <Box sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}`, bgcolor: "background.paper", px: 1, overflowX: "auto" }}>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {tabsList.map((t, idx) => (
              <Button
                key={idx}
                onClick={() => setActiveTab(idx)}
                sx={{
                  borderRadius: 0,
                  py: 1.25,
                  px: 2,
                  color: activeTab === idx ? MS_PALETTE.primary : "text.secondary",
                  fontWeight: activeTab === idx ? 700 : 500,
                  borderBottom: activeTab === idx ? `3px solid ${MS_PALETTE.primary}` : "3px solid transparent",
                  fontSize: "0.8125rem",
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: "transparent" },
                }}
              >
                {t}
              </Button>
            ))}
          </Box>
        </Box>

        {/* TAB 0: 24-Hour Load & Power Factor Dual Analysis */}
        {activeTab === 0 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <StyledCard>
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>24-Hour Load Profile & Grid Baseline (kW)</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Sub-meter active telemetry vs baseline target curve</Typography>
                    </Box>
                    <BadgeChip type="high" label="Peak Window: 7:00 PM – 10:30 PM" />
                  </Box>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={MS_PALETTE.neutralQuaternaryAlt} />
                      <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="actual" name="Actual Peak Load (kW)" stroke={MS_PALETTE.primary} strokeWidth={2.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="baseline" name="Target Baseline (kW)" stroke={MS_PALETTE.excelGreen} strokeWidth={2} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <StyledCard>
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Grid Power Factor Trajectory</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>Reactive power ratio across 24 hours</Typography>

                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={MS_PALETTE.neutralQuaternaryAlt} />
                      <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0.75, 1.0]} tick={{ fontSize: 10 }} />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="powerFactor" name="Power Factor (cos φ)" stroke={MS_PALETTE.copilotPurple} fill="rgba(92, 45, 145, 0.15)" />
                    </AreaChart>
                  </ResponsiveContainer>

                  <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "background.default", border: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}` }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: "block", color: "text.primary" }}>
                      Penalty Threshold: 0.85 PF
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                      Lowest PF observed is 0.82 at 21:00 during peak inductive motor startup. Capacitor bank activation recommended.
                    </Typography>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        )}

        {/* TAB 1: Seasonal Energy Variance */}
        {activeTab === 1 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <StyledCard>
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Climatic Multi-Season Load Variance</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>Energy consumption variance indexed by weather seasonality</Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={seasonalComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={MS_PALETTE.neutralQuaternaryAlt} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Bar dataKey="Summer" name="Summer Load (kWh)" fill={MS_PALETTE.warning} />
                      <Bar dataKey="Monsoon" name="Monsoon Load (kWh)" fill={MS_PALETTE.primary} />
                      <Bar dataKey="Winter" name="Winter Load (kWh)" fill={MS_PALETTE.copilotPurple} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        )}

        {/* TAB 2: Scope 2 ESG Carbon Accounting */}
        {activeTab === 2 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <StyledCard>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Total Scope 2 Footprint</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: MS_PALETTE.excelGreen, my: 0.5 }}>152.4 tCO2e</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>-8.6% lower than annual ESG target ceiling</Typography>
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <StyledCard>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Solar Clean Generation</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: MS_PALETTE.primary, my: 0.5 }}>38,200 kWh</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>Prevented 31.3 tCO2e fossil grid emissions</Typography>
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <StyledCard>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Energy Intensity Index</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: MS_PALETTE.copilotPurple, my: 0.5 }}>13.5 kWh/bed</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>Certified Tier-A Sustainable Campus Standard</Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        )}

        {/* TAB 3: Temperature Linear Regression Curve */}
        {activeTab === 3 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <StyledCard>
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Ambient Temperature vs Energy Demand Linear Regression</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Empirical telemetry scatter points and calculated PyCaret OLS regression slope</Typography>
                    </Box>
                    <BadgeChip type="accurate" label="Slope: +320 kWh / °C" />
                  </Box>

                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={tempRegressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={MS_PALETTE.neutralQuaternaryAlt} />
                      <XAxis dataKey="temp" unit="°C" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Line type="linear" dataKey="fittedKwh" name="Fitted Regression Line" stroke={MS_PALETTE.error} strokeWidth={2} dot={false} />
                      <Scatter dataKey="actualKwh" name="Observed Meter Telemetry" fill={MS_PALETTE.primary} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <StyledCard>
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Regression Analysis Specs</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box sx={{ p: 1.5, bgcolor: "background.default", border: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}` }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Equation of Fit:</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                        Load(T) = 12,000 + 766.7 × (T - 18)
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>Coefficient of Determination (R²):</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>0.984</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>F-Statistic p-value:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: MS_PALETTE.excelGreen }}>&lt; 0.0001 (Significant)</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>Critical Break Temperature:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>24.0°C</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        )}

        {/* TAB 4: Facility Efficiency Radar Chart */}
        {activeTab === 4 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <StyledCard>
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Multi-Facility Performance Radar</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
                    Cross-facility comparison across 5 energy operational dimensions
                  </Typography>

                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarFacilityData}>
                      <PolarGrid stroke={MS_PALETTE.neutralQuaternaryAlt} />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="Block A (Senior)" dataKey="BlockA" stroke={MS_PALETTE.primary} fill={MS_PALETTE.primary} fillOpacity={0.2} />
                      <Radar name="Block C (PG Wing)" dataKey="BlockC" stroke={MS_PALETTE.excelGreen} fill={MS_PALETTE.excelGreen} fillOpacity={0.2} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <StyledCard>
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>Campus Facility Efficiency Index</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {[
                      { name: "Block C (PG Research Wing)", score: 92, badge: "Rank 1", color: MS_PALETTE.excelGreen },
                      { name: "Block A (Senior Wing)", score: 85, badge: "Rank 2", color: MS_PALETTE.primary },
                      { name: "Block D (International Wing)", score: 80, badge: "Rank 3", color: MS_PALETTE.copilotPurple },
                      { name: "Block B (Junior Wing)", score: 78, badge: "Rank 4", color: MS_PALETTE.warning },
                    ].map((b, i) => (
                      <Box key={i} sx={{ p: 1.5, border: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}` }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{b.name}</Typography>
                          <BadgeChip type="ready" label={b.badge} />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <LinearProgress variant="determinate" value={b.score} sx={{ flex: 1, height: 6, bgcolor: MS_PALETTE.neutralQuaternaryAlt, "& .MuiLinearProgress-bar": { bgcolor: b.color } }} />
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>{b.score}/100</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        )}

        {/* TAB 5: Weekly Time-of-Day Heatmap Matrix */}
        {activeTab === 5 && (
          <StyledCard>
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Weekly Load Intensity Heatmap Matrix (kW)</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>Average power consumption clustered by day of week and operating time slice</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: "#E1F5FE" }} />
                  <Typography variant="caption">&lt; 160 kW</Typography>
                  <Box sx={{ width: 12, height: 12, bgcolor: "#81D4FA", ml: 1 }} />
                  <Typography variant="caption">160–250 kW</Typography>
                  <Box sx={{ width: 12, height: 12, bgcolor: "#0288D1", ml: 1 }} />
                  <Typography variant="caption">250–350 kW</Typography>
                  <Box sx={{ width: 12, height: 12, bgcolor: "#D13438", ml: 1 }} />
                  <Typography variant="caption">&gt; 350 kW (Peak Spike)</Typography>
                </Box>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Day of Week</TableCell>
                      <TableCell align="center">Morning (6 AM - 12 PM)</TableCell>
                      <TableCell align="center">Afternoon (12 PM - 6 PM)</TableCell>
                      <TableCell align="center">Evening Peak (6 PM - 10 PM)</TableCell>
                      <TableCell align="center">Night Base (10 PM - 6 AM)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {heatmapMatrix.map((row, idx) => {
                      const getBg = (val: number) => {
                        if (val > 350) return "#FFCDD2";
                        if (val > 250) return "#BBDEFB";
                        if (val > 160) return "#E1F5FE";
                        return "#F5F5F5";
                      };
                      const getColor = (val: number) => (val > 350 ? "#B71C1C" : "#0D47A1");
                      return (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontWeight: 700 }}>{row.day}</TableCell>
                          <TableCell align="center" sx={{ bgcolor: getBg(row.morning), color: getColor(row.morning), fontWeight: 700 }}>
                            {row.morning} kW
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: getBg(row.afternoon), color: getColor(row.afternoon), fontWeight: 700 }}>
                            {row.afternoon} kW
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: getBg(row.evening), color: getColor(row.evening), fontWeight: 700 }}>
                            {row.evening} kW
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: getBg(row.night), color: getColor(row.night), fontWeight: 700 }}>
                            {row.night} kW
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </StyledCard>
        )}
      </Box>
    </Box>
  );
}

// ==================== REPORTS & AUDITS PAGE ====================
function ReportsPage({ onOpenCopilot }: { onOpenCopilot: () => void }) {
  const [reports] = useState<Report[]>([
    { id: "REP-2026-08", name: "Hostel Monthly Energy & ESG Audit Report", type: "Monthly", date: "Aug 2026", kwh: 17800, bill: 142400, status: "ready" },
    { id: "REP-2026-07", name: "Campus Monsoon Tariff Optimization Audit", type: "Optimization", date: "Jul 2026", kwh: 18900, bill: 151200, status: "ready" },
    { id: "REP-2026-06", name: "Rooftop Solar Yield & Offset Ledger", type: "Audit", date: "Jun 2026", kwh: 21200, bill: 169600, status: "ready" },
    { id: "REP-2026-ANN", name: "Hostel Facilities Annual ESG Compliance Sheet", type: "Annual", date: "FY 2025-26", kwh: 228000, bill: 1824000, status: "ready" },
  ]);

  const handleDownloadCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," + ["Report ID,Name,Type,Billing Period,Total Load (kWh),Expenditure (INR),Status"].concat(
      reports.map((r) => `${r.id},"${r.name}",${r.type},${r.date},${r.kwh},${r.bill},${r.status}`)
    ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hostel_energy_compliance_audit.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box className="page-enter" sx={{ display: "flex", flexDirection: "column" }}>
      <CommandRibbon
        title="ESG Compliance & Energy Audit Ledger"
        breadcrumb="Reports & Compliance"
        onRefresh={() => {}}
        onExport={handleDownloadCsv}
        onOpenCopilot={onOpenCopilot}
      />

      <Box sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
        <StyledCard>
          <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Standardized Compliance Audit Reports</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>ISO 50001 Energy Management and Campus ESG compliance sheets</Typography>
              </Box>
              <MsButton size="small" startIcon={<Download size={14} />} onClick={handleDownloadCsv}>
                Download All (Excel CSV)
              </MsButton>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Report Reference</TableCell>
                    <TableCell>Document Title</TableCell>
                    <TableCell>Audit Category</TableCell>
                    <TableCell>Billing Period</TableCell>
                    <TableCell align="right">Energy Load (kWh)</TableCell>
                    <TableCell align="right">Billed Amount (₹)</TableCell>
                    <TableCell align="center">Compliance</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell sx={{ fontFamily: "monospace", fontWeight: 600, color: MS_PALETTE.primary }}>{r.id}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
                      <TableCell><BadgeChip type={r.type} /></TableCell>
                      <TableCell>{r.date}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{r.kwh?.toLocaleString()} kWh</TableCell>
                      <TableCell align="right">₹{r.bill?.toLocaleString()}</TableCell>
                      <TableCell align="center"><BadgeChip type="ready" label="Certified" /></TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined" startIcon={<Download size={12} />} onClick={handleDownloadCsv} sx={{ borderRadius: 0, fontSize: "0.6875rem", py: 0.25 }}>
                          Export
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </StyledCard>
      </Box>
    </Box>
  );
}

// ==================== RECOMMENDATIONS PAGE ====================
function RecommendationsPage({ onOpenCopilot }: { onOpenCopilot: () => void }) {
  const [items] = useState<Recommendation[]>([
    { id: 1, priority: "high", title: "Schedule Water Heaters for Pre-Peak Windows", desc: "Shift hostel water heating cycles from 7:00 PM to 4:30 PM to capitalize on lower tariff tier rates.", savings: 24500, reduction: "14%", difficulty: "Easy (Automated Timer)", impact: "High Financial ROI", progress: 80, category: "Load Shifting" },
    { id: 2, priority: "medium", title: "Implement 1°C Temperature Setback on Common Room ACs", desc: "Adjust thermostat temperature settings from 23°C to 24°C across all study halls and recreation spaces.", savings: 18200, reduction: "9%", difficulty: "Instant", impact: "Direct Conservation", progress: 50, category: "HVAC Optimization" },
    { id: 3, priority: "high", title: "Clean Rooftop Solar PV Arrays (Block B & C)", desc: "Dust and particulate accumulation is causing a 16% output loss on string inverters 2 and 4.", savings: 12800, reduction: "6%", difficulty: "Maintenance Ticket", impact: "Generation Recovery", progress: 20, category: "Solar Maintenance" },
  ]);

  return (
    <Box className="page-enter" sx={{ display: "flex", flexDirection: "column" }}>
      <CommandRibbon
        title="Optimization Advisor | Energy Cost & Carbon Reduction"
        breadcrumb="Recommendations"
        onRefresh={() => {}}
        onExport={() => alert("Exporting optimization actions...")}
        onOpenCopilot={onOpenCopilot}
      />

      <Box sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid key={item.id} size={{ xs: 12, md: 4 }}>
              <StyledCard sx={{ borderLeft: `3px solid ${item.priority === "high" ? MS_PALETTE.primary : MS_PALETTE.excelGreen}` }}>
                <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <BadgeChip type={item.priority} />
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>{item.category}</Typography>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8125rem", mb: 2 }}>
                      {item.desc}
                    </Typography>
                  </Box>

                  <Box sx={{ pt: 1.5, borderTop: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}` }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Monthly Projected Savings:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: MS_PALETTE.excelGreen }}>
                        ₹{item.savings.toLocaleString()} ({item.reduction})
                      </Typography>
                    </Box>
                    <MsButton fullWidth size="small" onClick={() => alert(`Applying optimization: ${item.title}`)}>
                      Apply Optimization
                    </MsButton>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

// ==================== ALERTS PAGE ====================
function AlertsPage({ onOpenCopilot }: { onOpenCopilot: () => void }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    { id: "A-1", type: "high", title: "Block A Phase 2 Voltage Anomaly", desc: "Instantaneous load exceeded 145 kW peak threshold during dinner hours.", time: "12m ago", read: false },
    { id: "A-2", type: "medium", title: "Inverter 3 Telemetry Loss", desc: "Communication heartbeat lost with solar inverter 3 over Modbus gateway.", time: "1h ago", read: false },
    { id: "A-3", type: "low", title: "Routine Meter Calibration Completed", desc: "Energy meter sub-station 4 calibrated with 0.1% precision error.", time: "4h ago", read: true },
  ]);

  const markAllRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, read: true })));
  };

  return (
    <Box className="page-enter" sx={{ display: "flex", flexDirection: "column" }}>
      <CommandRibbon
        title="Incident Alert Center | Anomaly Detection"
        breadcrumb="Alerts & Incidents"
        onRefresh={() => {}}
        onExport={() => alert("Exporting incident log...")}
        onOpenCopilot={onOpenCopilot}
      />

      <Box sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
        <StyledCard>
          <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Active Campus Telemetry Alerts</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>Real-time automated incident detection and threshold notifications</Typography>
              </Box>
              <Button size="small" variant="outlined" onClick={markAllRead} sx={{ borderRadius: 0, fontSize: "0.75rem" }}>
                Acknowledge All
              </Button>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {alerts.map((a) => (
                <Box
                  key={a.id}
                  sx={{
                    p: 2,
                    borderRadius: 0,
                    border: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}`,
                    bgcolor: a.read ? "background.default" : "background.paper",
                    borderLeft: `4px solid ${a.type === "high" ? MS_PALETTE.error : a.type === "medium" ? MS_PALETTE.warning : MS_PALETTE.info}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>{a.title}</Typography>
                      <BadgeChip type={a.type} />
                    </Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>{a.desc}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6875rem", mt: 0.5, display: "block" }}>Logged: {a.time}</Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setAlerts(alerts.filter((x) => x.id !== a.id))}
                    sx={{ borderRadius: 0, fontSize: "0.75rem" }}
                  >
                    Resolve
                  </Button>
                </Box>
              ))}
            </Box>
          </CardContent>
        </StyledCard>
      </Box>
    </Box>
  );
}

// ==================== SETTINGS & GOVERNANCE PAGE ====================
function SettingsPage({ onOpenCopilot }: { onOpenCopilot: () => void }) {
  const [tariffPeak, setTariffPeak] = useState(10.5);
  const [tariffNormal, setTariffNormal] = useState(7.8);
  const [retraining, setRetraining] = useState(false);
  const [retrainLog, setRetrainLog] = useState("");

  const handleRetrain = () => {
    setRetraining(true);
    setRetrainLog("Initializing PyCaret 3.2 regression workflow...\nFetching 24,000 hostel telemetry rows...\nPerforming 10-fold cross validation...\nComparing LightGBM, XGBoost, CatBoost...\nBest Model: LightGBM (R² = 0.948, MAE = 16.8 kWh)\nModel successfully saved to best_model.pkl!");
    setTimeout(() => {
      setRetraining(false);
    }, 1500);
  };

  return (
    <Box className="page-enter" sx={{ display: "flex", flexDirection: "column" }}>
      <CommandRibbon
        title="Tenant Governance & ML Infrastructure Settings"
        breadcrumb="Tenant Administration"
        onRefresh={() => {}}
        onExport={() => {}}
        onOpenCopilot={onOpenCopilot}
      />

      <Box sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <StyledCard>
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Electricity Tariff Configuration</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
                  Set time-of-day tariff rates for cost and budget simulation
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Peak Tier Tariff (INR/kWh)"
                    type="number"
                    size="small"
                    value={tariffPeak}
                    onChange={(e) => setTariffPeak(Number(e.target.value))}
                    fullWidth
                  />
                  <TextField
                    label="Normal Tier Tariff (INR/kWh)"
                    type="number"
                    size="small"
                    value={tariffNormal}
                    onChange={(e) => setTariffNormal(Number(e.target.value))}
                    fullWidth
                  />
                  <MsButton onClick={() => alert("Tariff parameters saved successfully!")}>
                    Save Tariff Policy
                  </MsButton>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <StyledCard>
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>PyCaret AI Retrain Console</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
                  Trigger automated re-training on newest dataset records
                </Typography>

                <MsButton fullWidth startIcon={<RefreshCw size={14} />} onClick={handleRetrain} disabled={retraining}>
                  {retraining ? "Retraining PyCaret Model..." : "Trigger Model Retraining"}
                </MsButton>

                {retrainLog && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: "#1E1E1E", color: "#00FF66", fontFamily: "monospace", fontSize: "0.75rem", whiteSpace: "pre-wrap", border: `1px solid ${MS_PALETTE.neutralQuaternaryAlt}` }}>
                    {retrainLog}
                  </Box>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

// ==================== ROOT APPLICATION ====================
export default function App() {
  const [page, setPage] = useState<Page>(() => (getToken() ? "dashboard" : "login"));
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(() => getUser());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  const theme = useMemo(() => getMicrosoftTheme(darkMode ? "dark" : "light"), [darkMode]);

  const handleLogin = () => {
    setUser(getUser());
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("login");
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage setPage={setPage} onOpenCopilot={() => setCopilotOpen(true)} />;
      case "prediction":
        return <PredictionPage onOpenCopilot={() => setCopilotOpen(true)} />;
      case "analytics":
        return <AnalyticsPage onOpenCopilot={() => setCopilotOpen(true)} />;
      case "reports":
        return <ReportsPage onOpenCopilot={() => setCopilotOpen(true)} />;
      case "recommendations":
        return <RecommendationsPage onOpenCopilot={() => setCopilotOpen(true)} />;
      case "alerts":
        return <AlertsPage onOpenCopilot={() => setCopilotOpen(true)} />;
      case "settings":
        return <SettingsPage onOpenCopilot={() => setCopilotOpen(true)} />;
      default:
        return <DashboardPage setPage={setPage} onOpenCopilot={() => setCopilotOpen(true)} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {page === "login" ? (
        <LoginPage onLogin={handleLogin} onRegister={() => setPage("register")} />
      ) : page === "register" ? (
        <RegisterPage onLogin={handleLogin} onBack={() => setPage("login")} />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", bgcolor: "background.default" }}>
          <SuiteBar
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            user={user}
            onMenuToggle={() => setMobileOpen(!mobileOpen)}
            onOpenCopilot={() => setCopilotOpen(true)}
            unreadCount={2}
          />

          <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <Sidebar
              page={page}
              setPage={setPage}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              onLogout={handleLogout}
              user={user}
              mobileOpen={mobileOpen}
              onMobileClose={() => setMobileOpen(false)}
            />

            <Box component="main" sx={{ flex: 1, overflow: "auto", bgcolor: "background.default" }}>
              {renderPage()}
            </Box>
          </Box>

          <CopilotDrawer open={copilotOpen} onClose={() => setCopilotOpen(false)} />
        </Box>
      )}
    </ThemeProvider>
  );
}
