import { createTheme, alpha } from "@mui/material/styles";

const P = {
  navy: "#0F172A",
  navyMid: "#1E293B",
  indigo: "#4F46E5",
  indigoLight: "#6366F1",
  emerald: "#10B981",
  emeraldLight: "#34D399",
  amber: "#F59E0B",
  rose: "#F43F5E",
  sky: "#0EA5E9",
  violet: "#8B5CF6",
  slate50: "#F8FAFC",
  slate100: "#F1F5F9",
  slate200: "#E2E8F0",
  slate300: "#CBD5E1",
  slate400: "#94A3B8",
  slate500: "#64748B",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1E293B",
  slate850: "#1A2332",
  slate900: "#0F172A",
  white: "#FFFFFF",
};

const theme = createTheme({
  palette: {
    primary: { main: P.indigo, light: P.indigoLight, dark: "#4338CA", contrastText: P.white },
    secondary: { main: P.emerald, light: P.emeraldLight, dark: "#059669", contrastText: P.white },
    success: { main: P.emerald, light: P.emeraldLight, dark: "#059669" },
    warning: { main: P.amber, light: "#FCD34D", dark: "#D97706" },
    error: { main: P.rose, light: "#FB7185", dark: "#E11D48" },
    info: { main: P.sky, light: "#38BDF8", dark: "#0284C7" },
    background: { default: P.slate100, paper: P.white },
    text: { primary: P.slate900, secondary: P.slate500, disabled: P.slate300 },
    divider: P.slate200,
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontWeight: 800, fontSize: "1.5rem", lineHeight: 1.25, letterSpacing: "-0.025em", color: P.slate900 },
    h5: { fontWeight: 700, fontSize: "1.125rem", lineHeight: 1.3, letterSpacing: "-0.02em", color: P.slate900 },
    h6: { fontWeight: 600, fontSize: "0.9375rem", lineHeight: 1.4, color: P.slate800 },
    subtitle1: { fontWeight: 500, fontSize: "0.8125rem", color: P.slate500, letterSpacing: "0.02em" },
    subtitle2: { fontWeight: 500, fontSize: "0.75rem", color: P.slate400, letterSpacing: "0.03em" },
    body1: { fontSize: "0.875rem", lineHeight: 1.65, color: P.slate700 },
    body2: { fontSize: "0.8125rem", lineHeight: 1.6, color: P.slate500 },
    caption: { fontSize: "0.75rem", lineHeight: 1.5, color: P.slate400 },
    button: { textTransform: "none", fontWeight: 600, fontSize: "0.8125rem", letterSpacing: "0.01em" },
  },
  shape: { borderRadius: 12 },
  shadows: [
    "none",
    "0 1px 2px rgba(15,23,42,0.04)",
    "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
    "0 2px 8px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)",
    "0 4px 12px rgba(15,23,42,0.10), 0 2px 4px rgba(15,23,42,0.06)",
    "0 6px 16px rgba(15,23,42,0.12), 0 2px 6px rgba(15,23,42,0.07)",
    "0 8px 24px rgba(15,23,42,0.12), 0 4px 8px rgba(15,23,42,0.08)",
    "0 12px 32px rgba(15,23,42,0.14), 0 4px 12px rgba(15,23,42,0.08)",
    "0 16px 40px rgba(79,70,229,0.12), 0 6px 16px rgba(15,23,42,0.09)",
    "0 20px 48px rgba(79,70,229,0.14), 0 8px 20px rgba(15,23,42,0.10)",
    "0 24px 56px rgba(79,70,229,0.14), 0 10px 24px rgba(15,23,42,0.10)",
    "0 28px 64px rgba(79,70,229,0.16), 0 12px 28px rgba(15,23,42,0.11)",
    "0 32px 72px rgba(79,70,229,0.16), 0 14px 32px rgba(15,23,42,0.11)",
    "0 36px 80px rgba(79,70,229,0.18), 0 16px 36px rgba(15,23,42,0.12)",
    "0 40px 88px rgba(79,70,229,0.18), 0 18px 40px rgba(15,23,42,0.12)",
    "0 44px 96px rgba(79,70,229,0.20), 0 20px 44px rgba(15,23,42,0.13)",
    "0 48px 104px rgba(79,70,229,0.20), 0 22px 48px rgba(15,23,42,0.13)",
    "0 52px 112px rgba(79,70,229,0.22), 0 24px 52px rgba(15,23,42,0.14)",
    "0 56px 120px rgba(79,70,229,0.22), 0 26px 56px rgba(15,23,42,0.14)",
    "0 60px 128px rgba(79,70,229,0.24), 0 28px 60px rgba(15,23,42,0.15)",
    "0 64px 136px rgba(79,70,229,0.24), 0 30px 64px rgba(15,23,42,0.15)",
    "0 68px 144px rgba(79,70,229,0.26), 0 32px 68px rgba(15,23,42,0.16)",
    "0 72px 152px rgba(79,70,229,0.26), 0 34px 72px rgba(15,23,42,0.16)",
    "0 76px 160px rgba(79,70,229,0.28), 0 36px 76px rgba(15,23,42,0.17)",
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: P.slate100,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": { width: 4, height: 4 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: P.slate300, borderRadius: 10 },
          "&::-webkit-scrollbar-thumb:hover": { background: P.slate400 },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "8px 20px",
          boxShadow: "none",
          transition: "all 0.15s ease",
          "&:hover": { boxShadow: "none", transform: "translateY(-1px)" },
          "&:active": { transform: "translateY(0)" },
        },
        contained: {
          "&.MuiButton-containedPrimary": {
            background: `linear-gradient(135deg, ${P.indigo} 0%, ${P.indigoLight} 100%)`,
            boxShadow: `0 2px 8px ${alpha(P.indigo, 0.25)}`,
            "&:hover": {
              background: `linear-gradient(135deg, #4338CA 0%, ${P.indigo} 100%)`,
              boxShadow: `0 4px 14px ${alpha(P.indigo, 0.35)}`,
            },
          },
          "&.MuiButton-containedSecondary": {
            background: `linear-gradient(135deg, ${P.emerald} 0%, ${P.emeraldLight} 100%)`,
            boxShadow: `0 2px 8px ${alpha(P.emerald, 0.25)}`,
            "&:hover": {
              boxShadow: `0 4px 14px ${alpha(P.emerald, 0.35)}`,
            },
          },
        },
        outlined: {
          borderColor: P.slate200,
          "&:hover": { borderColor: P.slate400, backgroundColor: alpha(P.slate900, 0.03) },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(15,23,42,0.04), 0 0 0 1px rgba(15,23,42,0.04)",
          backgroundImage: "none",
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.06)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: "none",
          borderRight: `1px solid ${P.slate200}`,
          backgroundColor: P.white,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderBottom: `1px solid ${P.slate200}`,
          backgroundColor: alpha(P.white, 0.85),
          backdropFilter: "blur(12px) saturate(1.2)",
          WebkitBackdropFilter: "blur(12px) saturate(1.2)",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            fontWeight: 600,
            fontSize: "0.6875rem",
            color: P.slate400,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            borderBottom: `1px solid ${P.slate200}`,
            backgroundColor: P.slate50,
            padding: "10px 16px",
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root": {
            "&:hover": { backgroundColor: alpha(P.indigo, 0.02) },
            "& .MuiTableCell-body": {
              borderBottom: `1px solid ${P.slate100}`,
              fontSize: "0.8125rem",
              color: P.slate700,
              padding: "12px 16px",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, fontSize: "0.6875rem", height: 26 },
        filled: {
          "&.MuiChip-colorSuccess": { backgroundColor: "#ECFDF5", color: "#065F46" },
          "&.MuiChip-colorWarning": { backgroundColor: "#FFFBEB", color: "#92400E" },
          "&.MuiChip-colorError": { backgroundColor: "#FFF1F2", color: "#9F1239" },
          "&.MuiChip-colorInfo": { backgroundColor: "#EFF6FF", color: "#1E40AF" },
          "&.MuiChip-colorPrimary": { backgroundColor: alpha(P.indigo, 0.08), color: P.indigo },
          "&.MuiChip-colorSecondary": { backgroundColor: alpha(P.emerald, 0.1), color: "#059669" },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: P.slate50,
            transition: "all 0.15s ease",
            "& fieldset": { borderColor: P.slate200 },
            "&:hover fieldset": { borderColor: P.slate400 },
            "&.Mui-focused fieldset": { borderColor: P.indigo, borderWidth: 2 },
          },
          "& .MuiInputLabel-root": { fontSize: "0.8125rem", color: P.slate500 },
          "& .MuiInputLabel-root.Mui-focused": { color: P.indigo },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: P.slate50,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: P.slate200 },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: P.slate400 },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: P.indigo, borderWidth: 2 },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: P.slate900,
          borderRadius: 8,
          fontSize: "0.75rem",
          padding: "6px 12px",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 8, height: 6, backgroundColor: P.slate100 },
        bar: { borderRadius: 8 },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 700, fontSize: "0.875rem" },
        colorDefault: { backgroundColor: alpha(P.indigo, 0.1), color: P.indigo },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: { fontSize: "0.625rem", fontWeight: 700, minWidth: 18, height: 18 },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          marginBottom: 1,
          "&.Mui-selected": {
            backgroundColor: alpha(P.indigo, 0.08),
            "&:hover": { backgroundColor: alpha(P.indigo, 0.12) },
          },
          "&:hover": { backgroundColor: alpha(P.slate900, 0.04) },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.8125rem",
          minHeight: 40,
          "&.Mui-selected": { fontWeight: 700 },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 44,
          height: 24,
          padding: 0,
          "& .MuiSwitch-switchBase": {
            padding: 0,
            margin: 2,
            "&.Mui-checked": {
              transform: "translateX(20px)",
              "& + .MuiSwitch-track": { backgroundColor: P.indigo, opacity: 1 },
            },
          },
          "& .MuiSwitch-thumb": { width: 20, height: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.15)" },
          "& .MuiSwitch-track": { borderRadius: 12, backgroundColor: P.slate300, opacity: 1 },
        },
      },
    },
  },
});

export default theme;
export { P };