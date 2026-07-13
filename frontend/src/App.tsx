import { Fragment, useState, useEffect, type FormEvent } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Box, Card, CardContent, Typography, Button, TextField, Select, MenuItem,
  Switch, Table, TableContainer, TableHead, TableBody, TableRow, TableCell,
  Avatar, Badge, IconButton, Drawer, AppBar, Toolbar, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Chip, Divider, Grid, Paper,
  LinearProgress, CircularProgress, Alert, Tooltip,
  FormControl, InputLabel, InputAdornment, Checkbox, FormControlLabel,
  useMediaQuery, useTheme, alpha, styled,
} from "@mui/material";
import {
  LayoutDashboard, TrendingUp, BarChart2, FileText, Lightbulb, Bell,
  Settings, Search, Moon, Sun, ChevronRight, ChevronDown, ChevronLeft,
  Zap, DollarSign, Activity, Leaf, AlertTriangle, CheckCircle, Clock,
  Download, Mail, Printer, Filter, Calendar, ArrowUpRight, ArrowDownRight,
  Building2, Eye, EyeOff, RefreshCw, Shield, Key, Upload, Database, Info,
  X, Target, Cpu, MoreHorizontal, Plus, ChevronUp, Home, User, LogOut,
  Menu as MenuIcon,
} from "lucide-react";

type Page = "login" | "register" | "dashboard" | "prediction" | "analytics" | "reports" | "recommendations" | "alerts" | "settings";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() { return localStorage.getItem("token") || ""; }
function getUser() { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } }
function authHeaders() { return { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` }; }

type Alert = { id: string; type: string; title: string; desc: string; time: string; read?: boolean };
type Recommendation = { id: number; priority: string; title: string; desc: string; savings: number; reduction: string; difficulty: string; impact: string; progress: number; category: string };
type Report = { id: string; name: string; type: string; date: string; kwh?: number; bill?: number; status: string };

const C = {
  primary: "#1B3A4B",
  primaryLight: "#2A5F7A",
  secondary: "#E07A5F",
  success: "#2A9D8F",
  warning: "#E9C46A",
  error: "#E63946",
  info: "#457B9D",
  bg: "#F4F1EA",
  border: "#EDE9E0",
  text: "#1A1A2E",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  inputBg: "#F9F8F4",
};

function BadgeChip({ type }: { type: string }) {
  const map: Record<string, { color: "success" | "warning" | "error" | "info" | "primary" | "secondary"; label: string }> = {
    high: { color: "error", label: "High" },
    medium: { color: "warning", label: "Medium" },
    low: { color: "info", label: "Low" },
    accurate: { color: "success", label: "Accurate" },
    review: { color: "warning", label: "Review" },
    ready: { color: "success", label: "Ready" },
    generating: { color: "info", label: "Generating" },
    Monthly: { color: "primary", label: "Monthly" },
    Annual: { color: "info", label: "Annual" },
    Audit: { color: "secondary", label: "Audit" },
    Prediction: { color: "info", label: "Prediction" },
    Optimization: { color: "secondary", label: "Optimization" },
  };
  const c = map[type] || { color: "default" as const, label: type };
  return <Chip size="small" label={c.label} color={c.color as any} variant="filled" />;
}

function Sparkline({ data, color = "#1B3A4B" }: { data: number[]; color?: string }) {
  const w = 80, h = 32, pad = 2;
  if (!data || data.length < 2) return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((v - min) / range) * (h - 2 * pad);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={8} sx={{ px: 2, py: 1.5, borderRadius: 2 }}>
      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary", display: "block", mb: 0.5 }}>{label}</Typography>
      {payload.map((p: any, i: number) => (
        <Typography key={i} variant="caption" sx={{ display: "block", color: p.color }}>
          {p.name}: <strong>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</strong>
        </Typography>
      ))}
    </Paper>
  );
}

const StyledCard = styled(Card)({
  borderRadius: 16,
  border: `1px solid ${C.border}`,
  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
  transition: "box-shadow 0.2s ease, transform 0.2s ease",
  "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
});

const GradientButton = styled(Button)({
  background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryLight} 100%)`,
  color: "#fff",
  borderRadius: 10,
  padding: "10px 24px",
  fontWeight: 600,
  fontSize: "0.8125rem",
  boxShadow: `0 4px 14px ${alpha(C.primary, 0.25)}`,
  "&:hover": {
    background: `linear-gradient(135deg, ${C.primaryLight} 0%, ${C.primary} 100%)`,
    boxShadow: `0 6px 20px ${alpha(C.primary, 0.35)}`,
  },
});

// ==================== LOGIN PAGE ====================
function LoginPage({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin();
    } catch {
      setError("Cannot connect to server. Make sure Flask is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: C.bg }}>
      <Box sx={{ display: { xs: "none", lg: "flex" }, flex: 1, position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryLight} 50%, ${C.info} 100%)` }}>
        <Box sx={{ position: "absolute", top: "10%", left: "10%", width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", bgcolor: "rgba(255,255,255,0.03)" }} />
        <Box sx={{ position: "absolute", bottom: "20%", right: "15%", width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", bgcolor: "rgba(255,255,255,0.02)" }} />
        <Box sx={{ position: "absolute", top: "40%", right: "10%", width: 120, height: 120, borderRadius: 4, transform: "rotate(15deg)", border: "1px solid rgba(255,255,255,0.1)", bgcolor: "rgba(255,255,255,0.04)" }} />
        <Box sx={{ position: "absolute", bottom: "30%", left: "20%", width: 80, height: 80, borderRadius: 3, transform: "rotate(-10deg)", border: "1px solid rgba(255,255,255,0.12)", bgcolor: "rgba(255,255,255,0.05)" }} />
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
            <circle cx="160" cy="160" r="148" stroke="white" strokeOpacity="0.08" strokeWidth="1.5" />
            <circle cx="160" cy="160" r="112" stroke="white" strokeOpacity="0.12" strokeWidth="1.5" />
            <circle cx="160" cy="160" r="74" stroke="white" strokeOpacity="0.18" strokeWidth="1.5" />
            <rect x="120" y="110" width="80" height="110" rx="4" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
            <rect x="130" y="122" width="16" height="16" rx="2" fill="white" fillOpacity="0.6" />
            <rect x="154" y="122" width="16" height="16" rx="2" fill="white" fillOpacity="0.3" />
            <rect x="174" y="122" width="16" height="16" rx="2" fill="white" fillOpacity="0.6" />
            <rect x="130" y="146" width="16" height="16" rx="2" fill="white" fillOpacity="0.3" />
            <rect x="154" y="146" width="16" height="16" rx="2" fill="white" fillOpacity="0.6" />
            <rect x="174" y="146" width="16" height="16" rx="2" fill="white" fillOpacity="0.3" />
            <rect x="130" y="170" width="16" height="16" rx="2" fill="white" fillOpacity="0.6" />
            <rect x="154" y="170" width="16" height="16" rx="2" fill="white" fillOpacity="0.3" />
            <rect x="174" y="170" width="16" height="16" rx="2" fill="white" fillOpacity="0.6" />
            <path d="M168 138 L152 165 H162 L152 192 L176 160 H164 L168 138Z" fill="white" fillOpacity="0.9" />
            <circle cx="160" cy="45" r="5" fill="white" fillOpacity="0.6" />
            <circle cx="275" cy="160" r="4" fill="white" fillOpacity="0.5" />
            <circle cx="160" cy="275" r="5" fill="white" fillOpacity="0.6" />
            <circle cx="45" cy="160" r="4" fill="white" fillOpacity="0.4" />
            <path d="M225 210 Q240 200 255 210 Q270 220 285 210" stroke="white" strokeOpacity="0.35" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M225 222 Q240 212 255 222 Q270 232 285 222" stroke="white" strokeOpacity="0.2" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </Box>
        <Box sx={{ position: "absolute", bottom: 40, left: 48, right: 48 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={18} color="white" />
            </Box>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 500, letterSpacing: "0.05em" }}>EnergyIQ Platform</Typography>
          </Box>
          <Typography variant="h3" sx={{ color: "white", fontWeight: 700, lineHeight: 1.2, mb: 1.5 }}>Predict Energy.<br />Reduce Waste.</Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", maxWidth: 360, lineHeight: 1.6 }}>Data-driven energy forecasting for institutional facilities. Reduce operating costs with clear usage trends and practical recommendations.</Typography>
        </Box>
      </Box>
      <Box sx={{ flex: 1, maxWidth: { lg: 480 }, display: "flex", alignItems: "center", justifyContent: "center", px: 4, py: 6 }}>
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 5 }}>
            <Avatar sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: C.primary, boxShadow: `0 4px 12px ${alpha(C.primary, 0.3)}` }}><Zap size={20} /></Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>EnergyIQ</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>Hostel Management</Typography>
            </Box>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>Welcome back</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>Sign in to your energy dashboard</Typography>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: "0.8125rem" }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ "& .MuiTextField-root": { mb: 2.5 } }}>
            <TextField fullWidth label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@hostel.edu" required size="small" />
            <TextField fullWidth label="Password" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required size="small"
              slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowPass(!showPass)} edge="end">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</IconButton></InputAdornment> }}} />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
              <FormControlLabel control={<Checkbox size="small" checked={remember} onChange={e => setRemember(e.target.checked)} sx={{ "&.Mui-checked": { color: C.primary } }} />}
                label={<Typography variant="caption" sx={{ color: "text.secondary" }}>Remember me</Typography>} />
              <Button size="small" onClick={() => alert("Please contact your administrator to reset your password.")} sx={{ textTransform: "none", fontSize: "0.8125rem", color: C.primary, fontWeight: 600 }}>Forgot password?</Button>
            </Box>
            <GradientButton fullWidth type="submit" disabled={loading} sx={{ mb: 2 }}>
              {loading ? <CircularProgress size={18} sx={{ color: "white", mr: 1 }} /> : null}
              {loading ? "Signing in..." : "Sign In"}
            </GradientButton>
            <Divider sx={{ my: 2.5 }}><Typography variant="caption" sx={{ color: "text.disabled" }}>or</Typography></Divider>
            <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
              Don't have an account?{" "}
              <Button onClick={onRegister} sx={{ textTransform: "none", fontWeight: 700, color: C.primary, minWidth: 0, p: 0, verticalAlign: "baseline", fontSize: "0.875rem" }}>Create account</Button>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ==================== REGISTER PAGE ====================
function RegisterPage({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin();
    } catch { setError("Cannot connect to server. Make sure Flask is running."); }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: C.bg, alignItems: "center", justifyContent: "center", px: 4 }}>
      <Box sx={{ width: "100%", maxWidth: 400 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 5 }}>
          <Avatar sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: C.primary, boxShadow: `0 4px 12px ${alpha(C.primary, 0.3)}` }}><Zap size={20} /></Avatar>
          <Box><Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>EnergyIQ</Typography><Typography variant="caption" sx={{ color: "text.secondary" }}>Hostel Management</Typography></Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>Create account</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>Register to access the energy dashboard</Typography>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: "0.8125rem" }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ "& .MuiTextField-root": { mb: 2.5 } }}>
          <TextField fullWidth label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required size="small" />
          <TextField fullWidth label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@hostel.edu" required size="small" />
          <TextField fullWidth label="Password" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required size="small"
            slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowPass(!showPass)} edge="end">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</IconButton></InputAdornment> }}} />
          <GradientButton fullWidth type="submit" disabled={loading} sx={{ mb: 2 }}>
            {loading ? <CircularProgress size={18} sx={{ color: "white", mr: 1 }} /> : null}
            {loading ? "Creating account..." : "Create Account"}
          </GradientButton>
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
          Already have an account?{" "}
          <Button onClick={onBack} sx={{ textTransform: "none", fontWeight: 700, color: C.primary, minWidth: 0, p: 0, verticalAlign: "baseline", fontSize: "0.875rem" }}>Sign in</Button>
        </Typography>
      </Box>
    </Box>
  );
}

// ==================== NAV ITEMS ====================
const navItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "prediction", icon: TrendingUp, label: "Prediction" },
  { id: "analytics", icon: BarChart2, label: "Analytics" },
  { id: "reports", icon: FileText, label: "Reports" },
  { id: "recommendations", icon: Lightbulb, label: "Recommendations" },
  { id: "alerts", icon: Bell, label: "Alerts" },
  { id: "settings", icon: Settings, label: "Settings" },
];

// ==================== SIDEBAR ====================
function Sidebar({ page, setPage, collapsed, setCollapsed, onLogout, user, mobileOpen, onMobileClose }: {
  page: Page; setPage: (p: Page) => void; collapsed: boolean; setCollapsed: (c: boolean) => void;
  onLogout: () => void; user: any; mobileOpen: boolean; onMobileClose: () => void;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "white" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: collapsed && !isMobile ? 1.5 : 2.5, py: 2.5, borderBottom: `1px solid ${C.border}`, justifyContent: collapsed && !isMobile ? "center" : "flex-start" }}>
        <Avatar sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: C.primary, boxShadow: `0 3px 10px ${alpha(C.primary, 0.3)}` }}><Zap size={16} /></Avatar>
        {(!collapsed || isMobile) && <Box><Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>EnergyIQ</Typography><Typography variant="caption" sx={{ color: "text.disabled" }}>Hostel Platform</Typography></Box>}
      </Box>
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {navItems.map(item => {
          const active = page === item.id;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton onClick={() => { setPage(item.id as Page); if (isMobile) onMobileClose(); }} selected={active}
                sx={{ borderRadius: 2, px: collapsed && !isMobile ? 1.5 : 2, py: 1.2, "&.Mui-selected": { bgcolor: alpha(C.primary, 0.08) }, "&:hover": { bgcolor: alpha(C.primary, 0.04) } }}>
                <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 0 : 36, color: active ? C.primary : C.textMuted }}><item.icon size={18} /></ListItemIcon>
                {(!collapsed || isMobile) && <ListItemText primary={item.label} sx={{ "& .MuiListItemText-primary": { fontSize: "0.8125rem", fontWeight: active ? 600 : 500, color: active ? C.primary : C.textSecondary } }} />}
                {item.id === "alerts" && (!collapsed || isMobile) && <Badge badgeContent={3} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.625rem", fontWeight: 700, minWidth: 18, height: 18 } }} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ px: collapsed && !isMobile ? 1 : 2, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1.5, borderRadius: 2, bgcolor: alpha(C.primary, 0.03), mb: 1, justifyContent: collapsed && !isMobile ? "center" : "flex-start" }}>
          <Avatar sx={{ width: 30, height: 30, bgcolor: C.secondary, fontSize: "0.75rem", fontWeight: 700 }}>{user?.name?.[0]?.toUpperCase() || "U"}</Avatar>
          {(!collapsed || isMobile) && <Box sx={{ minWidth: 0 }}><Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }} noWrap>{user?.name || "User"}</Typography><Typography variant="caption" sx={{ color: "text.disabled" }} noWrap>{user?.email || ""}</Typography></Box>}
        </Box>
        {(!collapsed || isMobile) && <Button fullWidth onClick={onLogout} startIcon={<LogOut size={14} />} sx={{ color: C.textMuted, fontSize: "0.75rem", justifyContent: "flex-start", px: 1.5, py: 1, "&:hover": { bgcolor: alpha(C.error, 0.06), color: C.error } }}>Logout</Button>}
        <IconButton onClick={() => setCollapsed(!collapsed)} size="small" sx={{ display: isMobile ? "none" : "flex", mx: "auto", mt: 0.5, color: C.textMuted }}>{collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</IconButton>
      </Box>
    </Box>
  );

  if (isMobile) return <Drawer open={mobileOpen} onClose={onMobileClose} variant="temporary" sx={{ "& .MuiDrawer-paper": { width: 240, border: "none" } }}>{content}</Drawer>;
  return <Drawer variant="permanent" sx={{ width: collapsed ? 68 : 220, flexShrink: 0, transition: "width 0.25s ease", "& .MuiDrawer-paper": { width: collapsed ? 68 : 220, transition: "width 0.25s ease", overflowX: "hidden", borderRight: `1px solid ${C.border}` } }}>{content}</Drawer>;
}

// ==================== TOP NAV ====================
function TopNav({ page, darkMode, setDarkMode, user, onMenuToggle, setPage }: {
  page: Page; darkMode: boolean; setDarkMode: (v: boolean) => void; user: any; onMenuToggle: () => void; setPage: (p: Page) => void;
}) {
  const labels: Record<string, string> = { dashboard: "Dashboard", prediction: "Energy Prediction", analytics: "Analytics", reports: "Reports", recommendations: "Recommendations", alerts: "Alerts", settings: "Settings" };
  return (
    <AppBar position="sticky" sx={{ bgcolor: "white", color: "text.primary", zIndex: 1200 }}>
      <Toolbar sx={{ minHeight: "56px !important", px: { xs: 2, md: 3 }, gap: 2 }}>
        <IconButton edge="start" onClick={onMenuToggle} sx={{ display: { md: "none" } }}><MenuIcon size={20} /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary" }}>{labels[page] || page}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Home size={10} color={C.textMuted} /><Typography variant="caption" sx={{ color: "text.disabled" }}>Home</Typography><ChevronRight size={10} color={C.textMuted} />
            <Typography variant="caption" sx={{ color: C.primary, fontWeight: 500 }}>{labels[page]}</Typography>
          </Box>
        </Box>
        <TextField placeholder="Search..." size="small" sx={{ display: { xs: "none", md: "block" }, "& .MuiOutlinedInput-root": { bgcolor: C.inputBg, borderRadius: 2, fontSize: "0.8125rem", height: 36, width: 200 } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={14} color={C.textMuted} /></InputAdornment> }}} />
        <IconButton size="small" onClick={() => setDarkMode(!darkMode)} sx={{ color: C.textMuted }}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</IconButton>
        <IconButton size="small" onClick={() => setPage("alerts")} sx={{ color: C.textMuted }}><Badge badgeContent={3} color="error"><Bell size={18} /></Badge></IconButton>
        <Tooltip title={user?.name || "User"}><Avatar sx={{ width: 32, height: 32, bgcolor: C.secondary, fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>{user?.name?.[0]?.toUpperCase() || "U"}</Avatar></Tooltip>
      </Toolbar>
    </AppBar>
  );
}

// ==================== KPI CARD ====================
function KpiCard({ title, value, change, positive, icon: Icon, iconBg, sparkData, sparkColor }: {
  title: string; value: string; change: string; positive: boolean;
  icon: any; iconBg: string; sparkData: number[]; sparkColor: string;
}) {
  return (
    <StyledCard>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
          <Avatar sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: iconBg }}><Icon size={18} color="white" /></Avatar>
          <Chip size="small" icon={positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} label={change} color={positive ? "success" : "error"} sx={{ height: 24, "& .MuiChip-icon": { fontSize: "0.75rem", ml: 0.5 } }} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, mb: 0.25 }}>{title}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>{value}</Typography>
          </Box>
          <Sparkline data={sparkData} color={sparkColor} />
        </Box>
      </CardContent>
    </StyledCard>
  );
}

// ==================== DASHBOARD ====================
function DashboardPage({ setPage }: { setPage: (p: Page) => void }) {
  const [data, setData] = useState<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const loadData = () => { fetch(`${API}/dashboard`, { headers: authHeaders() }).then(r => r.json()).then(setData).catch(() => {}); fetch(`${API}/alerts`, { headers: authHeaders() }).then(r => r.json()).then(d => setAlerts(d.alerts ?? [])).catch(() => {}); };
  useEffect(() => { loadData(); }, []);
  const monthlyData = data?.monthly ?? [];
  const distributionData = data?.distribution ?? [];
  const seasonData = data?.season ?? [];
  const hostelBlockData = data?.hostelBlocks ?? [];
  const kpi = data?.kpi ?? { avgKwh: 0, avgBill: 0, avgOccupancy: 0, avgSolar: 0 };
  const kpiChanges = data?.kpiChanges ?? { kwhChange: "0%", billChange: "0%", occupancyChange: "0%", solarChange: "0%", kwhPositive: true, billPositive: true, occupancyPositive: true, solarPositive: true };
  const occupancySeries = data?.occupancySeries ?? [];
  const solarSeries = data?.solarSeries ?? [];
  const unreadAlerts = alerts.filter(a => !a.read).length;

  return (
    <Box className="page-enter" sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary" }}>Hostel Energy Dashboard</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Monitor electricity usage, forecast future demand, and reduce operating costs.</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="outlined" startIcon={<Calendar size={14} />} size="small" sx={{ fontSize: "0.75rem" }}>{new Date().toLocaleString("default", { month: "short", year: "numeric" })}</Button>
          <GradientButton size="small" startIcon={<RefreshCw size={14} />} onClick={loadData}>Refresh</GradientButton>
        </Box>
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, lg: 3 }}><KpiCard title="Energy Consumption" value={`${kpi.avgKwh.toLocaleString()} kWh`} change={kpiChanges.kwhChange} positive={kpiChanges.kwhPositive} icon={Zap} iconBg={C.primary} sparkColor={C.primary} sparkData={monthlyData.slice(-8).map((d: any) => d.consumption)} /></Grid>
        <Grid size={{ xs: 6, lg: 3 }}><KpiCard title="Electricity Bill" value={`₹${kpi.avgBill.toLocaleString()}`} change={kpiChanges.billChange} positive={kpiChanges.billPositive} icon={DollarSign} iconBg={C.secondary} sparkColor={C.secondary} sparkData={monthlyData.slice(-8).map((d: any) => d.bill)} /></Grid>
        <Grid size={{ xs: 6, lg: 3 }}><KpiCard title="Avg Occupancy" value={`${kpi.avgOccupancy}%`} change={kpiChanges.occupancyChange} positive={kpiChanges.occupancyPositive} icon={Activity} iconBg={C.success} sparkColor={C.success} sparkData={occupancySeries.length ? occupancySeries : [kpi.avgOccupancy]} /></Grid>
        <Grid size={{ xs: 6, lg: 3 }}><KpiCard title="Avg Solar (kWh)" value={kpi.avgSolar.toLocaleString()} change={kpiChanges.solarChange} positive={kpiChanges.solarPositive} icon={Leaf} iconBg={C.warning} sparkColor={C.warning} sparkData={solarSeries.length ? solarSeries : [kpi.avgSolar]} /></Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <StyledCard>
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
                <Box><Typography variant="h6" sx={{ fontWeight: 600 }}>Monthly Consumption</Typography><Typography variant="caption" sx={{ color: "text.secondary" }}>Actual vs Predicted (kWh)</Typography></Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><Box sx={{ width: 16, height: 3, borderRadius: 2, bgcolor: C.primary }} /><Typography variant="caption" sx={{ color: "text.secondary" }}>Actual</Typography></Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><Box sx={{ width: 16, height: 3, borderRadius: 2, bgcolor: "#93C5FD", border: "1px dashed #93C5FD" }} /><Typography variant="caption" sx={{ color: "text.secondary" }}>Predicted</Typography></Box>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs><linearGradient id="consGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.primary} stopOpacity={0.12} /><stop offset="95%" stopColor={C.primary} stopOpacity={0} /></linearGradient><linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#93C5FD" stopOpacity={0.1} /><stop offset="95%" stopColor="#93C5FD" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F0E8" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="consumption" name="Actual kWh" stroke={C.primary} strokeWidth={2.5} fill="url(#consGrad)" dot={false} activeDot={{ r: 4, fill: C.primary }} />
                  <Area type="monotone" dataKey="predicted" name="Predicted kWh" stroke="#93C5FD" strokeWidth={2} strokeDasharray="5 4" fill="url(#predGrad)" dot={false} activeDot={{ r: 4, fill: "#93C5FD" }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StyledCard>
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>Energy Distribution</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>By category (%)</Typography>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={distributionData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} dataKey="value" paddingAngle={3} strokeWidth={0}>
                    {distributionData.map((d: any, i: number) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <RechartsTooltip formatter={(v: any) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                {distributionData.map((d: any) => (
                  <Box key={d.name} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: d.color, flexShrink: 0 }} /><Typography variant="caption" sx={{ color: "text.secondary" }}>{d.name}</Typography></Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>{d.value}%</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <StyledCard>
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>Season Comparison</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>kWh by hostel block</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={seasonData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F0E8" vertical={false} />
                  <XAxis dataKey="season" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Bar dataKey="block_a" name="Block A" fill={C.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="block_b" name="Block B" fill={C.secondary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="block_c" name="Block C" fill={C.warning} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <StyledCard>
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>Consumption by Hostel Block</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>August 2025</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {hostelBlockData.map((b: any) => (
                  <Box key={b.block}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Building2 size={14} color={C.textMuted} /><Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>{b.block}</Typography></Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}><Typography variant="caption" sx={{ color: "text.secondary" }}>{b.consumption.toLocaleString()} kWh</Typography><Chip size="small" label={`${b.efficiency}%`} color={b.efficiency >= 85 ? "success" : "warning"} sx={{ height: 22, fontSize: "0.625rem" }} /></Box>
                    </Box>
                    <LinearProgress variant="determinate" value={(b.consumption / 7200) * 100} sx={{ height: 6, borderRadius: 3, bgcolor: alpha(C.primary, 0.08), "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: b.efficiency >= 85 ? C.success : C.primary } }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <StyledCard>
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}><Typography variant="h6" sx={{ fontWeight: 600 }}>Monthly Summary</Typography><Button size="small" onClick={() => setPage("analytics")} sx={{ textTransform: "none", fontSize: "0.75rem", color: C.primary }}>View all</Button></Box>
              <TableContainer>
                <Table size="small">
                  <TableHead><TableRow><TableCell>Month</TableCell><TableCell>Consumption</TableCell><TableCell>Bill</TableCell><TableCell>Predicted</TableCell><TableCell>Variance</TableCell></TableRow></TableHead>
                  <TableBody>
                    {monthlyData.slice(-6).map((p: any) => {
                      const variance = p.consumption - p.predicted;
                      const pct = ((variance / p.predicted) * 100).toFixed(1);
                      return (
                        <TableRow key={p.month} hover>
                          <TableCell><Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>{p.month}</Typography></TableCell>
                          <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{p.consumption.toLocaleString()} kWh</Typography></TableCell>
                          <TableCell><Typography variant="body2">₹{p.bill.toLocaleString()}</Typography></TableCell>
                          <TableCell><Typography variant="body2">{p.predicted.toLocaleString()} kWh</Typography></TableCell>
                          <TableCell><Chip size="small" label={`${variance > 0 ? "+" : ""}${pct}%`} color={variance > 0 ? "error" : "success"} sx={{ height: 22, fontSize: "0.625rem", fontWeight: 600 }} /></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StyledCard>
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}><Typography variant="h6" sx={{ fontWeight: 600 }}>Latest Alerts</Typography>{unreadAlerts > 0 && <Badge badgeContent={unreadAlerts} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.625rem", fontWeight: 700 } }} />}</Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {alerts.length === 0 && <Typography variant="body2" sx={{ color: "text.disabled", textAlign: "center", py: 3 }}>No alerts yet</Typography>}
                {alerts.slice(0, 4).map(a => {
                  const colors: Record<string, string> = { warning: C.warning, error: C.error, info: C.info, success: C.success };
                  const icons: Record<string, any> = { warning: AlertTriangle, error: X, info: Info, success: CheckCircle };
                  const Icon = icons[a.type];
                  return (
                    <Box key={a.id} sx={{ display: "flex", gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: alpha(colors[a.type] || C.info, 0.08), border: `1px solid ${alpha(colors[a.type] || C.info, 0.15)}` }}>
                      <Box sx={{ color: colors[a.type] || C.info, mt: 0.25, flexShrink: 0 }}><Icon size={14} /></Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary", display: "block" }}>{a.title}</Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.8, lineHeight: 1.4 }}>{a.desc}</Typography>
                        <Typography variant="caption" sx={{ color: "text.disabled", opacity: 0.6, mt: 0.25, display: "block" }}>{a.time}</Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
}

// ==================== PREDICTION PAGE ====================
function PredictionPage() {
  const [form, setForm] = useState({ hostel: "Block A", month: "August", season: "Summer", rooms: "120", students: "480", occupancy: "85", fans: "240", lights: "360", ac_units: "60", temperature: "34", humidity: "72", water: "1200", kitchen: "8", laundry: "6", solar: "420", tariff: "4.50", peak_load: "180" });
  const [predicted, setPredicted] = useState<null | { kwh: number; bill: number; confidence: number; efficiency: string; carbon: number; trend: string }>(null);
  const [loading, setLoading] = useState(false);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  useEffect(() => { fetch(`${API}/dashboard`, { headers: authHeaders() }).then(r => r.json()).then(d => setMonthlyData(d.monthly ?? [])).catch(() => {}); }, []);
  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const predict = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/predict`, { method: "POST", headers: authHeaders(), body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Server error");
      setPredicted(await res.json());
    } catch { alert("Could not connect to the prediction server. Make sure Flask is running on port 5000."); }
    finally { setLoading(false); }
  };
  const fields: [string, string, string, string[]][] = [
    ["hostel", "Hostel Block", "select", ["Block A", "Block B", "Block C", "Block D"]],
    ["month", "Month", "select", ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]],
    ["season", "Season", "select", ["Summer", "Winter", "Monsoon", "Spring"]],
    ["rooms", "Total Rooms", "number", []], ["students", "No. of Students", "number", []], ["occupancy", "Occupancy Rate (%)", "number", []],
    ["fans", "No. of Fans", "number", []], ["lights", "No. of Lights", "number", []], ["ac_units", "AC Units", "number", []],
    ["temperature", "Avg Temperature (°C)", "number", []], ["humidity", "Humidity (%)", "number", []], ["water", "Water Consumption (L)", "number", []],
    ["kitchen", "Kitchen Usage (hrs/day)", "number", []], ["laundry", "Laundry Usage (hrs/day)", "number", []], ["solar", "Solar Generation (kWh)", "number", []],
    ["tariff", "Electricity Tariff (₹/kWh)", "number", []], ["peak_load", "Peak Load (kW)", "number", []],
  ];

  return (
    <Box className="page-enter" sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 3 }}>
      <Box><Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary" }}>Energy Prediction</Typography><Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Configure parameters to generate a forecast</Typography></Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, xl: 8 }}>
          <StyledCard>
            <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}><Cpu size={18} color={C.primary} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Prediction Parameters</Typography></Box>
              <Grid container spacing={2}>
                {fields.map(([key, label, type, opts]) => (
                  <Grid size={6} key={key}>
                    {type === "select" ? (
                      <FormControl fullWidth size="small"><InputLabel>{label}</InputLabel><Select value={(form as any)[key]} label={label} onChange={e => f(key, e.target.value)}>{opts.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</Select></FormControl>
                    ) : (
                      <TextField fullWidth size="small" label={label} type="number" value={(form as any)[key]} onChange={e => f(key, e.target.value)} />
                    )}
                  </Grid>
                ))}
              </Grid>
              <GradientButton fullWidth onClick={predict} disabled={loading} startIcon={loading ? <CircularProgress size={16} sx={{ color: "white" }} /> : <TrendingUp size={16} />} sx={{ mt: 3 }}>{loading ? "Generating Prediction..." : "Generate Prediction"}</GradientButton>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid size={{ xs: 12, xl: 4 }}>
          {predicted ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <StyledCard>
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}><Typography variant="h6" sx={{ fontWeight: 600 }}>Prediction Result</Typography><Chip size="small" icon={<CheckCircle size={12} />} label={`${predicted.confidence}% confidence`} color="success" sx={{ height: 24 }} /></Box>
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <Box sx={{ position: "relative", width: 160, height: 90 }}>
                      <svg viewBox="0 0 160 90" width="160" height="90">
                        <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke="#F3F0E8" strokeWidth="12" strokeLinecap="round" />
                        <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke={C.primary} strokeWidth="12" strokeLinecap="round" strokeDasharray="188" strokeDashoffset={188 - (predicted.confidence / 100) * 188} style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
                        <text x="80" y="78" textAnchor="middle" fontSize="20" fontWeight="700" fill={C.text}>{predicted.confidence}%</text>
                        <text x="80" y="90" textAnchor="middle" fontSize="8" fill={C.textMuted}>CONFIDENCE</text>
                      </svg>
                    </Box>
                  </Box>
                  <Grid container spacing={1.5}>
                    {[
                      { label: "Predicted kWh", value: predicted.kwh.toLocaleString(), icon: Zap, color: C.primary },
                      { label: "Estimated Bill", value: `₹${predicted.bill.toLocaleString()}`, icon: DollarSign, color: C.secondary },
                      { label: "Efficiency Rating", value: predicted.efficiency, icon: Activity, color: C.success },
                      { label: "Carbon (kg)", value: predicted.carbon.toLocaleString(), icon: Leaf, color: C.warning },
                    ].map(item => (
                      <Grid size={6} key={item.label}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(item.color, 0.08) }}>
                          <Box sx={{ color: item.color, mb: 0.5 }}><item.icon size={16} /></Box>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>{item.label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: item.color }}>{item.value}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: alpha(C.warning, 0.1), border: `1px solid ${alpha(C.warning, 0.2)}`, display: "flex", gap: 1 }}>
                    <ArrowUpRight size={14} color={C.warning} style={{ flexShrink: 0, marginTop: 2 }} />
                    <Box><Typography variant="caption" sx={{ fontWeight: 600, color: "warning.dark" }}>Trend vs Last Month</Typography><Typography variant="caption" sx={{ color: "warning.dark", opacity: 0.8 }}>{predicted.trend} increase in consumption expected</Typography></Box>
                  </Box>
                </CardContent>
              </StyledCard>
              <StyledCard>
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 1.5, display: "block" }}>Monthly Trend Context</Typography>
                  <ResponsiveContainer width="100%" height={100}>
                    <AreaChart data={monthlyData.slice(-6)} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                      <defs><linearGradient id="miniGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.primary} stopOpacity={0.15} /><stop offset="95%" stopColor={C.primary} stopOpacity={0} /></linearGradient></defs>
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: C.textMuted }} axisLine={false} tickLine={false} />
                      <Area type="monotone" dataKey="consumption" stroke={C.primary} strokeWidth={2} fill="url(#miniGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </StyledCard>
            </Box>
          ) : (
            <StyledCard>
              <CardContent sx={{ p: 4, "&:last-child": { pb: 4 }, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 280 }}>
                <Avatar sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: alpha(C.primary, 0.08), mb: 2 }}><TrendingUp size={24} color={C.primary} /></Avatar>
                <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}>No Prediction Yet</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>Fill in the parameters on the left and click "Generate Prediction" to see results here.</Typography>
              </CardContent>
            </StyledCard>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

// ==================== ANALYTICS PAGE ====================
function AnalyticsPage() {
  const [filterHostel, setFilterHostel] = useState("All Blocks");
  const [filterYear, setFilterYear] = useState("2025");
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch(`${API}/analytics`, { headers: authHeaders() }).then(r => r.json()).then(setData).catch(() => {}); }, []);
  const monthlyData = data?.monthly ?? [];
  const weeklyData = data?.weekly ?? [];
  const seasonData = data?.season ?? [];
  const topConsumers = data?.topConsumers ?? [];
  const heatmapData = data?.heatmap ?? [];

  return (
    <Box className="page-enter" sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 3 }}>
      <Box><Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary" }}>Analytics</Typography><Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Deep-dive into energy consumption patterns and trends</Typography></Box>
      <StyledCard>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Filter size={15} color={C.textMuted} />
          <FormControl size="small" sx={{ minWidth: 140 }}><Select value={filterHostel} onChange={e => setFilterHostel(e.target.value)}>{["All Blocks", "Block A", "Block B", "Block C", "Block D"].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</Select></FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}><Select value={filterYear} onChange={e => setFilterYear(e.target.value)}>{["2025", "2024", "2023"].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</Select></FormControl>
          <Button variant="outlined" size="small" startIcon={<Download size={14} />} onClick={() => { const rows = [["Month","Consumption kWh","Bill"],[...data?.monthly?.map((m:any)=>[m.month,m.consumption,m.bill])??[]]]; const csv = rows.map(r=>r.join(",")).join("\n"); const a=document.createElement("a"); a.href="data:text/csv,"+encodeURIComponent(csv); a.download="analytics.csv"; a.click(); }} sx={{ ml: "auto", fontSize: "0.75rem" }}>Export</Button>
        </CardContent>
      </StyledCard>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <StyledCard>
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>Monthly Trend</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>Consumption over 12 months (kWh)</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F0E8" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="consumption" name="kWh" stroke={C.primary} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <StyledCard>
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>Weekly Trend</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>This week's daily consumption (kWh)</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F0E8" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Bar dataKey="kwh" name="kWh" fill={C.primary} radius={[6, 6, 0, 0]}>{weeklyData.map((_: any, i: number) => <Cell key={i} fill={i === 4 ? C.primary : alpha(C.primary, 0.35)} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <StyledCard>
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>Season Comparison</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>Average kWh by season and block</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={seasonData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F0E8" vertical={false} />
                  <XAxis dataKey="season" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="block_a" name="Block A" fill={C.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="block_b" name="Block B" fill={C.secondary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="block_c" name="Block C" fill={C.warning} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <StyledCard>
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>Peak Hour Analysis</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>Energy intensity by hour and day</Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Box sx={{ display: "grid", gap: 0.5, gridTemplateColumns: "32px repeat(24, minmax(0,1fr))", minWidth: 500 }}>
                  <Box />
                  {Array.from({ length: 24 }, (_, i) => <Box key={i} sx={{ textAlign: "center", fontSize: "0.625rem", color: C.textMuted, pb: 0.5 }}>{i % 4 === 0 ? `${i}h` : ""}</Box>)}
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                    <Fragment key={day}>
                      <Box sx={{ fontSize: "0.6875rem", color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "flex-end", pr: 0.5 }}>{day}</Box>
                      {Array.from({ length: 24 }, (_, ci) => {
                        const val = heatmapData.find((d: any) => d.day === day && d.hour === ci)?.value || 0;
                        return (
                          <Tooltip key={ci} title={`${day} ${ci}:00 — ${val}% load`}>
                            <Box sx={{ height: 20, borderRadius: 0.5, bgcolor: alpha(C.primary, 0.05 + (val / 100) * 0.9), cursor: "pointer", "&:hover": { outline: `1px solid ${C.primary}` } }} />
                          </Tooltip>
                        );
                      })}
                    </Fragment>
                  ))}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5, justifyContent: "flex-end" }}>
                  <Typography variant="caption" sx={{ color: "text.disabled" }}>Low</Typography>
                  {[0.05, 0.25, 0.5, 0.75, 0.95].map((o, i) => <Box key={i} sx={{ width: 16, height: 12, borderRadius: 0.5, bgcolor: alpha(C.primary, o) }} />)}
                  <Typography variant="caption" sx={{ color: "text.disabled" }}>High</Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
      <StyledCard>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Top Energy Consumers — Average Hostel</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow><TableCell>#</TableCell><TableCell>Category</TableCell><TableCell>Monthly kWh</TableCell><TableCell>Cost (₹)</TableCell><TableCell>Share</TableCell></TableRow></TableHead>
              <TableBody>
                {topConsumers.map((c: any, i: number) => (
                  <TableRow key={i} hover>
                    <TableCell><Typography variant="caption" sx={{ color: "text.disabled" }}>{i + 1}</Typography></TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{c.category}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{c.kwh.toLocaleString()}</Typography></TableCell>
                    <TableCell><Typography variant="body2">₹{c.cost.toLocaleString()}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <LinearProgress variant="determinate" value={c.share} sx={{ width: 80, height: 6, borderRadius: 3, bgcolor: alpha(C.primary, 0.08), "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: C.primary } }} />
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>{c.share}%</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </StyledCard>
    </Box>
  );
}

// ==================== REPORTS PAGE ====================
function ReportsPage() {
  const [dashData, setDashData] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  useEffect(() => { fetch(`${API}/dashboard`, { headers: authHeaders() }).then(r => r.json()).then(setDashData).catch(() => {}); fetch(`${API}/reports`, { headers: authHeaders() }).then(r => r.json()).then(d => setReports(d.reports ?? [])).catch(() => {}); }, []);
  const monthlyData = dashData?.monthly ?? [];
  const kpi = dashData?.kpi ?? { avgKwh: 0, avgBill: 0 };
  const totalKwh = monthlyData.reduce((s: number, m: any) => s + m.consumption, 0);
  const totalBill = monthlyData.reduce((s: number, m: any) => s + m.bill, 0);
  const carbon = Math.round(totalKwh * 0.82);
  const latestReport = reports[0];

  return (
    <Box className="page-enter" sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
        <Box><Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary" }}>Reports</Typography><Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Generate, download and share energy reports</Typography></Box>
        <Box sx={{ display: "flex", gap: 1 }}><Button variant="outlined" size="small" startIcon={<Printer size={14} />} onClick={() => window.print()} sx={{ fontSize: "0.75rem" }}>Print</Button><Button variant="outlined" size="small" startIcon={<Mail size={14} />} onClick={() => alert("Email report feature requires email configuration.")} sx={{ fontSize: "0.75rem" }}>Email Report</Button><GradientButton size="small" startIcon={<Download size={14} />} onClick={() => alert("PDF export feature coming soon.")}>Download PDF</GradientButton></Box>
      </Box>
      <Grid container spacing={2}>
        {[
          { label: "Monthly Report", icon: Calendar, color: C.info },
          { label: "Annual Report", icon: BarChart2, color: C.primary },
          { label: "Prediction Summary", icon: TrendingUp, color: C.secondary },
          { label: "Energy Audit", icon: Target, color: C.warning },
          { label: "Optimization Plan", icon: Lightbulb, color: C.success },
        ].map(item => (
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={item.label}>
            <StyledCard onClick={() => alert(`${item.label} generation coming soon.`)} sx={{ cursor: "pointer", "&:hover": { borderColor: item.color } }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Avatar sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(item.color, 0.1), mb: 1.5 }}><item.icon size={16} color={item.color} /></Avatar>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>{item.label}</Typography>
                <Typography variant="caption" sx={{ color: "text.disabled" }}>Generate</Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
      <StyledCard>
        <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, pb: 2.5, borderBottom: `1px solid ${C.border}` }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}><BadgeChip type="Monthly" /><Typography variant="caption" sx={{ color: "text.disabled" }}>{latestReport ? `Generated ${latestReport.date}` : "No reports yet"}</Typography></Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>{latestReport ? latestReport.name : "Energy Management Report"}</Typography>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>EnergyIQ Hostel Platform · Data from MongoDB</Typography>
            </Box>
            <Button variant="outlined" size="small" startIcon={<Download size={14} />} onClick={() => alert("PDF export feature coming soon.")} sx={{ fontSize: "0.75rem" }}>Download PDF</Button>
          </Box>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: "Total Consumption", value: `${totalKwh.toLocaleString()} kWh` },
              { label: "Total Bill", value: `₹${totalBill.toLocaleString()}` },
              { label: "Avg Monthly kWh", value: `${kpi.avgKwh.toLocaleString()} kWh` },
              { label: "Carbon Footprint", value: `${carbon.toLocaleString()} kg CO₂` },
            ].map(s => (
              <Grid size={{ xs: 6, md: 3 }} key={s.label}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(C.primary, 0.03) }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5 }}>{s.label}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>{s.value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={monthlyData.slice(-4)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs><linearGradient id="rpGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.primary} stopOpacity={0.12} /><stop offset="95%" stopColor={C.primary} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F0E8" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
              <RechartsTooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="consumption" name="kWh" stroke={C.primary} strokeWidth={2} fill="url(#rpGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </StyledCard>
      <StyledCard>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Recent Reports</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow><TableCell>Report Name</TableCell><TableCell>Type</TableCell><TableCell>Generated</TableCell><TableCell>kWh</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
              <TableBody>
                {reports.length === 0 && <TableRow><TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}><Typography variant="body2" sx={{ color: "text.disabled" }}>No prediction reports yet. Run a prediction to generate reports.</Typography></TableCell></TableRow>}
                {reports.map(r => (
                  <TableRow key={r.id} hover>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{r.name}</Typography></TableCell>
                    <TableCell><BadgeChip type={r.type} /></TableCell>
                    <TableCell><Typography variant="caption" sx={{ color: "text.secondary" }}>{r.date}</Typography></TableCell>
                    <TableCell><Typography variant="caption" sx={{ color: "text.secondary" }}>{r.kwh?.toLocaleString() ?? "—"}</Typography></TableCell>
                    <TableCell><BadgeChip type={r.status} /></TableCell>
                    <TableCell><Box sx={{ display: "flex", gap: 0.5 }}><IconButton size="small" onClick={() => alert("PDF export coming soon.")} sx={{ color: C.textMuted }}><Download size={14} /></IconButton><IconButton size="small" onClick={() => alert("Email report feature requires email configuration.")} sx={{ color: C.textMuted }}><Mail size={14} /></IconButton><IconButton size="small" onClick={() => window.print()} sx={{ color: C.textMuted }}><Printer size={14} /></IconButton></Box></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </StyledCard>
    </Box>
  );
}

// ==================== RECOMMENDATIONS PAGE ====================
function RecommendationsPage() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState("All");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [co2Reduction, setCo2Reduction] = useState(0);
  useEffect(() => { fetch(`${API}/recommendations`, { headers: authHeaders() }).then(r => r.json()).then(d => { setRecommendations(d.recommendations ?? []); setTotalSavings(d.totalSavings ?? 0); setCo2Reduction(d.co2Reduction ?? 0); }).catch(() => {}); }, []);
  const filtered = filter === "All" ? recommendations : recommendations.filter(r => r.priority === filter.toLowerCase());
  const priorityConfig: Record<string, { color: "error" | "warning" | "info"; label: string }> = { high: { color: "error", label: "High Priority" }, medium: { color: "warning", label: "Medium" }, low: { color: "info", label: "Low" } };

  return (
    <Box className="page-enter" sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
        <Box><Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary" }}>Recommendations</Typography><Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Actionable suggestions to reduce energy use and costs</Typography></Box>
        <Chip icon={<DollarSign size={14} />} label={`Potential Savings: ₹${totalSavings.toLocaleString()}/mo`} color="success" sx={{ height: 32, fontSize: "0.75rem", fontWeight: 600 }} />
      </Box>
      <Grid container spacing={2}>
        {[
          { label: "Total Recommendations", value: String(recommendations.length), icon: Lightbulb, color: C.primary },
          { label: "Estimated Monthly Savings", value: `₹${totalSavings.toLocaleString()}`, icon: DollarSign, color: C.success },
          { label: "CO₂ Reduction Potential", value: `${co2Reduction.toLocaleString()} kg`, icon: Leaf, color: C.info },
        ].map(s => (
          <Grid size={{ xs: 12, sm: 4 }} key={s.label}>
            <StyledCard>
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 }, display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: alpha(s.color, 0.1) }}><s.icon size={20} color={s.color} /></Avatar>
                <Box><Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>{s.label}</Typography><Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>{s.value}</Typography></Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: "flex", gap: 1 }}>{["All", "High", "Medium", "Low"].map(f => <Chip key={f} label={f} onClick={() => setFilter(f)} color={filter === f ? "primary" : "default"} variant={filter === f ? "filled" : "outlined"} sx={{ fontWeight: 500, cursor: "pointer" }} />)}</Box>
      <Grid container spacing={2}>
        {filtered.length === 0 && <Grid size={12}><Typography variant="body2" sx={{ color: "text.disabled", textAlign: "center", py: 4 }}>No recommendations available. Seed MongoDB with energy data first.</Typography></Grid>}
        {filtered.map(rec => {
          const cfg = priorityConfig[rec.priority];
          const isOpen = expanded === rec.id;
          return (
            <Grid size={{ xs: 12, lg: 6 }} key={rec.id}>
              <StyledCard sx={{ overflow: "visible" }}>
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: cfg.color === "error" ? C.error : cfg.color === "warning" ? C.warning : C.info, flexShrink: 0 }} />
                      <Chip size="small" label={cfg.label} color={cfg.color} sx={{ height: 22, fontSize: "0.625rem" }} />
                      <Chip size="small" label={rec.category} variant="outlined" sx={{ height: 22, fontSize: "0.625rem", borderColor: C.border }} />
                    </Box>
                    <IconButton size="small" onClick={() => setExpanded(isOpen ? null : rec.id)} sx={{ color: C.textMuted }}>{isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</IconButton>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}>{rec.title}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>{rec.desc}</Typography>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {[
                      { label: "Est. Savings", value: `₹${rec.savings.toLocaleString()}/mo`, color: C.success },
                      { label: "Cost Reduction", value: rec.reduction, color: C.primary },
                      { label: "Difficulty", value: rec.difficulty, color: C.warning },
                      { label: "Impact", value: rec.impact, color: C.info },
                    ].map(m => (
                      <Grid size={6} key={m.label}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(m.color, 0.06) }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>{m.label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: m.color }}>{m.value}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}><Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>Implementation Progress</Typography><Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>{rec.progress}%</Typography></Box>
                    <LinearProgress variant="determinate" value={rec.progress} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(C.primary, 0.08), "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: rec.progress === 0 ? C.textMuted : rec.progress >= 70 ? C.success : C.primary } }} />
                  </Box>
                  {isOpen && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${C.border}` }}>
                      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}><Leaf size={16} color={C.success} style={{ flexShrink: 0, marginTop: 2 }} /><Typography variant="caption" sx={{ color: "text.secondary" }}>Implementing this recommendation reduces carbon emissions by an estimated <strong>12–18%</strong> of current block output, helping meet sustainability targets.</Typography></Box>
                      <Button variant="outlined" fullWidth size="small" onClick={() => alert(`Implementation plan for "${rec.title}" will be available soon.`)} sx={{ borderColor: C.primary, color: C.primary, fontSize: "0.75rem" }}>Start Implementation Plan</Button>
                    </Box>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

// ==================== ALERTS PAGE ====================
function AlertsPage() {
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, warnings: 0, resolved: 0 });
  const loadAlerts = () => { fetch(`${API}/alerts`, { headers: authHeaders() }).then(r => r.json()).then(d => setAllAlerts(d.alerts ?? [])).catch(() => {}); fetch(`${API}/alerts/stats`, { headers: authHeaders() }).then(r => r.json()).then(setStats).catch(() => {}); };
  useEffect(() => { loadAlerts(); }, []);
  const markAllRead = async () => { await fetch(`${API}/alerts/mark-all-read`, { method: "POST", headers: authHeaders() }); loadAlerts(); };
  const deleteAlert = async (id: string) => { await fetch(`${API}/alerts/${id}`, { method: "DELETE", headers: authHeaders() }); loadAlerts(); };
  const icons: Record<string, any> = { warning: AlertTriangle, error: X, info: Info, success: CheckCircle };
  const alertColors: Record<string, string> = { warning: C.warning, error: C.error, info: C.info, success: C.success };

  return (
    <Box className="page-enter" sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
        <Box><Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary" }}>Alerts</Typography><Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>System alerts, anomalies and operational notifications</Typography></Box>
        <Button variant="outlined" size="small" startIcon={<CheckCircle size={14} />} onClick={markAllRead} sx={{ fontSize: "0.75rem" }}>Mark all read</Button>
      </Box>
      <Grid container spacing={2}>
        {[
          { label: "Total Alerts", value: String(stats.total), icon: Bell, color: C.text },
          { label: "Critical", value: String(stats.critical), icon: X, color: C.error },
          { label: "Warnings", value: String(stats.warnings), icon: AlertTriangle, color: C.warning },
          { label: "Resolved", value: String(stats.resolved), icon: CheckCircle, color: C.success },
        ].map(s => (
          <Grid size={{ xs: 6, md: 3 }} key={s.label}>
            <StyledCard>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ color: s.color }}><s.icon size={20} /></Box>
                <Box><Typography variant="caption" sx={{ color: "text.secondary" }}>{s.label}</Typography><Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>{s.value}</Typography></Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {allAlerts.length === 0 && <Typography variant="body2" sx={{ color: "text.disabled", textAlign: "center", py: 4 }}>No alerts yet</Typography>}
        {allAlerts.map(a => {
          const Icon = icons[a.type];
          const color = alertColors[a.type] || C.info;
          return (
            <StyledCard key={a.id} sx={{ bgcolor: alpha(color, 0.04), borderColor: alpha(color, 0.2) }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", gap: 2 }}>
                <Avatar sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}><Icon size={16} color={color} /></Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.25 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>{a.title}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="caption" sx={{ color: "text.disabled", display: "flex", alignItems: "center", gap: 0.5 }}><Clock size={10} /> {a.time}</Typography>
                      <IconButton size="small" onClick={() => deleteAlert(a.id)} sx={{ color: C.textMuted }}><X size={12} /></IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>{a.desc}</Typography>
                </Box>
              </CardContent>
            </StyledCard>
          );
        })}
      </Box>
    </Box>
  );
}

// ==================== SETTINGS PAGE ====================
function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState({ email: true, sms: false, push: true, weekly: true, alerts: true });
  const [profile, setProfile] = useState({ name: "", email: "", role: "" });
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [retraining, setRetraining] = useState(false);
  useEffect(() => {
    fetch(`${API}/auth/me`, { headers: authHeaders() }).then(r => r.json()).then(d => { const u = d.user ?? {}; setProfile({ name: u.name || "", email: u.email || "", role: u.role || "admin" }); }).catch(() => {});
    fetch(`${API}/model/info`, { headers: authHeaders() }).then(r => r.json()).then(setModelInfo).catch(() => {});
  }, []);
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API}/dataset/upload`, { method: "POST", headers: { Authorization: `Bearer ${getToken()}` }, body: formData });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Upload failed"); return; }
      alert(`Uploaded ${data.records} records to MongoDB. Retrain the model to use new data.`);
      fetch(`${API}/model/info`, { headers: authHeaders() }).then(r => r.json()).then(setModelInfo);
    } catch { alert("Upload failed. Check server connection."); }
    finally { setUploading(false); }
  };
  const handleRetrain = async () => {
    setRetraining(true);
    try {
      const res = await fetch(`${API}/model/retrain`, { method: "POST", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Retraining failed"); return; }
      alert("Model retrained successfully.");
      fetch(`${API}/model/info`, { headers: authHeaders() }).then(r => r.json()).then(setModelInfo);
    } catch { alert("Retraining failed. Check server logs."); }
    finally { setRetraining(false); }
  };
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "dataset", label: "Dataset Upload", icon: Upload },
    { id: "api", label: "API Keys", icon: Key },
    { id: "security", label: "Security", icon: Shield },
    { id: "roles", label: "Role Management", icon: Database },
  ];

  return (
    <Box className="page-enter" sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 3 }}>
      <Box><Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary" }}>Settings</Typography><Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Manage your account, preferences and system configuration</Typography></Box>
      <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" } }}>
        <Box sx={{ width: { xs: "100%", md: 200 }, flexShrink: 0 }}>
          <List sx={{ bgcolor: "white", borderRadius: 2, border: `1px solid ${C.border}`, p: 1 }}>
            {tabs.map(tab => (
              <ListItem key={tab.id} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} sx={{ borderRadius: 1.5, "&.Mui-selected": { bgcolor: alpha(C.primary, 0.08) } }}>
                  <ListItemIcon sx={{ minWidth: 32, color: activeTab === tab.id ? C.primary : C.textMuted }}><tab.icon size={16} /></ListItemIcon>
                  <ListItemText primary={tab.label} sx={{ "& .MuiListItemText-primary": { fontSize: "0.8125rem", fontWeight: activeTab === tab.id ? 600 : 500 } }} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={() => { if (confirm("Are you sure you want to delete all data? This cannot be undone.")) alert("Danger zone actions require backend support."); }} sx={{ borderRadius: 1.5, color: C.error }}>
                <ListItemIcon sx={{ minWidth: 32, color: C.error }}><AlertTriangle size={16} /></ListItemIcon>
                <ListItemText primary="Danger Zone" sx={{ "& .MuiListItemText-primary": { fontSize: "0.8125rem", fontWeight: 500 } }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
        <Box sx={{ flex: 1 }}>
          {activeTab === "profile" && (
            <StyledCard>
              <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Profile Information</Typography>
                <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", sm: "row" }, mb: 3 }}>
                  <Box sx={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                    <Avatar sx={{ width: 80, height: 80, borderRadius: 2, bgcolor: C.secondary, fontSize: "1.75rem", fontWeight: 700 }}>{profile.name?.[0]?.toUpperCase() || "U"}</Avatar>
                    <IconButton size="small" sx={{ position: "absolute", bottom: -4, right: -4, bgcolor: "white", border: `1px solid ${C.border}`, width: 28, height: 28, "&:hover": { bgcolor: C.inputBg } }}><Plus size={12} /></IconButton>
                  </Box>
                  <Grid container spacing={2} sx={{ flex: 1 }}>
                    {[
                      { label: "Full Name", value: profile.name },
                      { label: "Email", value: profile.email },
                      { label: "Role", value: profile.role },
                      { label: "Dataset Records", value: modelInfo?.recordCount?.toLocaleString() ?? "—" },
                    ].map(({ label, value }) => (
                      <Grid size={6} key={label}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, mb: 0.5 }}>{label}</Typography>
                        <TextField fullWidth size="small" value={value} slotProps={{ input: { readOnly: true } }} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}><GradientButton size="small" onClick={() => alert("Profile update feature coming soon.")}>Save Changes</GradientButton></Box>
              </CardContent>
            </StyledCard>
          )}
          {activeTab === "notifications" && (
            <StyledCard>
              <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Notification Preferences</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {[
                    { key: "email", label: "Email Notifications", desc: "Receive reports and alerts via email" },
                    { key: "sms", label: "SMS Alerts", desc: "Get critical alerts via SMS" },
                    { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
                    { key: "weekly", label: "Weekly Digest", desc: "Weekly energy summary every Monday" },
                    { key: "alerts", label: "Real-time Alerts", desc: "Immediate notification for anomalies" },
                  ].map(item => (
                    <Box key={item.key} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2, borderBottom: `1px solid ${C.border}`, "&:last-child": { borderBottom: "none" } }}>
                      <Box><Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>{item.label}</Typography><Typography variant="caption" sx={{ color: "text.secondary" }}>{item.desc}</Typography></Box>
                      <Switch checked={(notifications as any)[item.key]} onChange={e => setNotifications(p => ({ ...p, [item.key]: e.target.checked }))} />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </StyledCard>
          )}
          {activeTab === "dataset" && (
            <StyledCard>
              <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Dataset Upload & Model Retraining</Typography>
                <Box component="label" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 6, borderRadius: 3, border: `2px dashed ${C.border}`, cursor: "pointer", textAlign: "center", "&:hover": { borderColor: C.primary, bgcolor: alpha(C.primary, 0.02) } }}>
                  <input type="file" accept=".csv,.xlsx" hidden onChange={handleUpload} disabled={uploading} />
                  <Avatar sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: alpha(C.primary, 0.08), mb: 2 }}><Upload size={22} color={C.primary} /></Avatar>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}>{uploading ? "Uploading..." : "Upload Energy Dataset"}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>CSV or Excel — stored in MongoDB</Typography>
                  <Chip label="Choose File" color="primary" variant="outlined" sx={{ fontWeight: 500 }} />
                </Box>
                <Box sx={{ mt: 2.5, p: 2, borderRadius: 2, bgcolor: alpha(C.primary, 0.03), display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>Model Status</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {modelInfo?.updated_at ? new Date(modelInfo.updated_at).toLocaleDateString() : "—"}
                      {" · "}{modelInfo?.status ?? "unknown"}{" · "}{modelInfo?.loaded ? "Model loaded" : "Model not loaded"}{" · "}{modelInfo?.dataset_size?.toLocaleString() ?? 0} records
                    </Typography>
                  </Box>
                  <Button variant="outlined" size="small" onClick={handleRetrain} disabled={retraining} startIcon={<RefreshCw size={14} />} sx={{ fontSize: "0.75rem" }}>{retraining ? "Training..." : "Retrain Model"}</Button>
                </Box>
              </CardContent>
            </StyledCard>
          )}
          {activeTab === "api" && (
            <StyledCard>
              <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>API Configuration</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, borderRadius: 2, bgcolor: alpha(C.primary, 0.03) }}>
                  <Avatar sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: "white", border: `1px solid ${C.border}` }}><Key size={14} color={C.textMuted} /></Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>Backend API</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "monospace" }}>{API}</Typography>
                    <Typography variant="caption" sx={{ color: "text.disabled", display: "block" }}>MongoDB: {modelInfo?.recordCount?.toLocaleString() ?? 0} energy records</Typography>
                  </Box>
                  <BadgeChip type={modelInfo?.loaded ? "accurate" : "review"} />
                </Box>
              </CardContent>
            </StyledCard>
          )}
          {(activeTab === "security" || activeTab === "roles") && (
            <StyledCard>
              <CardContent sx={{ p: 6, "&:last-child": { pb: 6 }, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <Avatar sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: alpha(C.primary, 0.06), mb: 2 }}>{activeTab === "security" ? <Shield size={24} color={C.textMuted} /> : <Database size={24} color={C.textMuted} />}</Avatar>
                <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}>{activeTab === "security" ? "Security Settings" : "Role Management"}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>This section is available to Super Admins only.</Typography>
              </CardContent>
            </StyledCard>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ==================== APP ====================
export default function App() {
  const [page, setPage] = useState<Page>(() => getToken() ? "dashboard" : "login");
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(() => getUser());
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleLogin = () => { setUser(getUser()); setPage("dashboard"); };
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); setPage("login"); };
  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage setPage={setPage} />;
      case "prediction": return <PredictionPage />;
      case "analytics": return <AnalyticsPage />;
      case "reports": return <ReportsPage />;
      case "recommendations": return <RecommendationsPage />;
      case "alerts": return <AlertsPage />;
      case "settings": return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };
  if (page === "login") return <LoginPage onLogin={handleLogin} onRegister={() => setPage("register")} />;
  if (page === "register") return <RegisterPage onLogin={handleLogin} onBack={() => setPage("login")} />;
  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", bgcolor: C.bg }}>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} onLogout={handleLogout} user={user} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <TopNav page={page} darkMode={darkMode} setDarkMode={setDarkMode} user={user} onMenuToggle={() => setMobileOpen(true)} setPage={setPage} />
        <Box component="main" sx={{ flex: 1, overflow: "auto" }}>{renderPage()}</Box>
      </Box>
    </Box>
  );
}