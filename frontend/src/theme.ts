import { createTheme } from "@mui/material/styles";

// Official Microsoft Fluent 2 / Azure / Microsoft 365 Color Palette
export const MS_PALETTE = {
  // Brand Blues
  primary: "#0078D4",       // Microsoft Communication Blue (Azure / M365)
  primaryHover: "#106EBE",  // Microsoft Blue Hover
  primaryDark: "#005A9E",   // Microsoft Blue Pressed / Dark
  primaryLight: "#2B88D8",  // Microsoft Blue Light
  primarySubtle: "#EFF6FC", // Microsoft Blue 50 / Background Tint
  primaryBorder: "#C7E0F4", // Microsoft Blue Border

  // Secondary & Accents
  excelGreen: "#107C41",    // Microsoft Excel / Fabric Green
  excelGreenLight: "#DFF6DD",
  copilotPurple: "#5C2D91", // Microsoft Copilot / Azure AI Purple
  copilotPurpleLight: "#F3EFFC",
  teamsPurple: "#6264A7",
  fabricTeal: "#008272",
  fabricTealLight: "#D6F3EE",

  // Status Colors (Fluent Status Tokens)
  warning: "#D83B01",       // Microsoft Warning Amber / Orange
  warningLight: "#FFF4CE",
  warningText: "#797673",
  error: "#D13438",         // Microsoft Error Red
  errorLight: "#FDE7E9",
  info: "#0078D4",          // Microsoft Info Blue
  infoLight: "#EFF6FC",
  success: "#107C41",       // Microsoft Success Green
  successLight: "#DFF6DD",

  // Fluent Neutral Tokens
  white: "#FFFFFF",
  neutralLighterAlt: "#FAF9F8",
  neutralLighter: "#F3F2F1", // Standard Canvas Background
  neutralLight: "#EDEBE9",   // Crisp Card & Section Dividers
  neutralQuaternaryAlt: "#E1DFDD", // Clean 1px Table & Card Borders
  neutralQuaternary: "#D2D0CE",
  neutralTertiaryAlt: "#C8C6C4", // Border & Inactive Outlines
  neutralTertiary: "#A19F9D",
  neutralSecondary: "#605E5C",   // Secondary Text / Subtitles
  neutralPrimaryAlt: "#3B3A39",
  neutralPrimary: "#323130",     // Main Typography Color
  neutralDark: "#201F1E",        // High Emphasis Text
  black: "#000000",

  // Dark Mode Tokens
  darkBg: "#1F1F1F",
  darkSurface: "#252423",
  darkCard: "#2B2A29",
  darkBorder: "#3B3A39",
  darkText: "#F3F2F1",
  darkTextSecondary: "#A19F9D",
};

export const getMicrosoftTheme = (mode: "light" | "dark" = "light") => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: MS_PALETTE.primary,
        light: MS_PALETTE.primaryLight,
        dark: MS_PALETTE.primaryDark,
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: MS_PALETTE.copilotPurple,
        light: MS_PALETTE.copilotPurpleLight,
        dark: "#4B2577",
        contrastText: "#FFFFFF",
      },
      success: {
        main: MS_PALETTE.excelGreen,
        light: MS_PALETTE.excelGreenLight,
        dark: "#0C5E31",
        contrastText: "#FFFFFF",
      },
      warning: {
        main: MS_PALETTE.warning,
        light: MS_PALETTE.warningLight,
        dark: "#A82E00",
        contrastText: "#FFFFFF",
      },
      error: {
        main: MS_PALETTE.error,
        light: MS_PALETTE.errorLight,
        dark: "#A80000",
        contrastText: "#FFFFFF",
      },
      info: {
        main: MS_PALETTE.primary,
        light: MS_PALETTE.primarySubtle,
        dark: MS_PALETTE.primaryDark,
        contrastText: "#FFFFFF",
      },
      background: {
        default: isDark ? MS_PALETTE.darkBg : MS_PALETTE.neutralLighter,
        paper: isDark ? MS_PALETTE.darkSurface : MS_PALETTE.white,
      },
      text: {
        primary: isDark ? MS_PALETTE.darkText : MS_PALETTE.neutralPrimary,
        secondary: isDark ? MS_PALETTE.darkTextSecondary : MS_PALETTE.neutralSecondary,
        disabled: isDark ? "#605E5C" : MS_PALETTE.neutralTertiaryAlt,
      },
      divider: isDark ? MS_PALETTE.darkBorder : MS_PALETTE.neutralQuaternaryAlt,
    },
    // STRICT SHARP EDGES: 0px Border Radius
    shape: {
      borderRadius: 0,
    },
    typography: {
      fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Inter", "Roboto", sans-serif',
      h4: {
        fontWeight: 600,
        fontSize: "1.375rem",
        lineHeight: 1.25,
        color: isDark ? MS_PALETTE.darkText : MS_PALETTE.neutralDark,
        letterSpacing: "-0.01em",
      },
      h5: {
        fontWeight: 600,
        fontSize: "1.125rem",
        lineHeight: 1.3,
        color: isDark ? MS_PALETTE.darkText : MS_PALETTE.neutralDark,
      },
      h6: {
        fontWeight: 600,
        fontSize: "0.9375rem",
        lineHeight: 1.4,
        color: isDark ? MS_PALETTE.darkText : MS_PALETTE.neutralDark,
      },
      subtitle1: {
        fontWeight: 600,
        fontSize: "0.8125rem",
        color: isDark ? MS_PALETTE.darkTextSecondary : MS_PALETTE.neutralSecondary,
        letterSpacing: "0.01em",
      },
      subtitle2: {
        fontWeight: 400,
        fontSize: "0.75rem",
        color: isDark ? MS_PALETTE.darkTextSecondary : MS_PALETTE.neutralSecondary,
      },
      body1: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
        color: isDark ? MS_PALETTE.darkText : MS_PALETTE.neutralPrimary,
      },
      body2: {
        fontSize: "0.8125rem",
        lineHeight: 1.45,
        color: isDark ? MS_PALETTE.darkTextSecondary : MS_PALETTE.neutralSecondary,
      },
      caption: {
        fontSize: "0.75rem",
        lineHeight: 1.4,
        color: isDark ? MS_PALETTE.darkTextSecondary : MS_PALETTE.neutralSecondary,
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
        fontSize: "0.8125rem",
        letterSpacing: "0px",
      },
    },
    // Microsoft Fluent Elevation Shadows (Clean, subtle, no glossy dispersion)
    shadows: [
      "none",
      "0 1.6px 3.6px 0 rgba(0, 0, 0, 0.132), 0 0.3px 0.9px 0 rgba(0, 0, 0, 0.108)",
      "0 3.2px 7.2px 0 rgba(0, 0, 0, 0.132), 0 0.6px 1.8px 0 rgba(0, 0, 0, 0.108)",
      "0 6.4px 14.4px 0 rgba(0, 0, 0, 0.132), 0 1.2px 3.6px 0 rgba(0, 0, 0, 0.108)",
      "0 12.8px 28.8px 0 rgba(0, 0, 0, 0.132), 0 2.4px 7.2px 0 rgba(0, 0, 0, 0.108)",
      "0 25.6px 57.6px 0 rgba(0, 0, 0, 0.132), 0 4.8px 14.4px 0 rgba(0, 0, 0, 0.108)",
      ...Array(19).fill("0 12.8px 28.8px 0 rgba(0, 0, 0, 0.132)"),
    ] as any,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "*, *::before, *::after": {
            borderRadius: "0 !important",
          },
          body: {
            backgroundColor: isDark ? MS_PALETTE.darkBg : MS_PALETTE.neutralLighter,
            color: isDark ? MS_PALETTE.darkText : MS_PALETTE.neutralPrimary,
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { width: 6, height: 6 },
            "&::-webkit-scrollbar-track": { background: isDark ? MS_PALETTE.darkSurface : MS_PALETTE.neutralLighter },
            "&::-webkit-scrollbar-thumb": {
              background: isDark ? MS_PALETTE.darkBorder : MS_PALETTE.neutralTertiaryAlt,
              borderRadius: 0,
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: isDark ? "#605E5C" : MS_PALETTE.neutralTertiary,
            },
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          disableRipple: false,
        },
        styleOverrides: {
          root: {
            borderRadius: 0,
            padding: "6px 16px",
            minHeight: 32,
            boxShadow: "none",
            transition: "all 0.1s ease-in-out",
            border: "1px solid transparent",
            "&:focus-visible": {
              outline: `2px solid ${MS_PALETTE.primary}`,
              outlineOffset: 1,
            },
          },
          containedPrimary: {
            backgroundColor: MS_PALETTE.primary,
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: MS_PALETTE.primaryHover,
              boxShadow: "none",
            },
            "&:active": {
              backgroundColor: MS_PALETTE.primaryDark,
            },
          },
          containedSecondary: {
            backgroundColor: MS_PALETTE.copilotPurple,
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: "#4B2577",
              boxShadow: "none",
            },
          },
          outlined: {
            borderColor: isDark ? MS_PALETTE.darkBorder : MS_PALETTE.neutralTertiaryAlt,
            color: isDark ? MS_PALETTE.darkText : MS_PALETTE.neutralPrimary,
            backgroundColor: isDark ? MS_PALETTE.darkSurface : MS_PALETTE.white,
            "&:hover": {
              borderColor: MS_PALETTE.primary,
              backgroundColor: isDark ? MS_PALETTE.darkCard : MS_PALETTE.neutralLighterAlt,
            },
          },
          text: {
            color: isDark ? MS_PALETTE.darkText : MS_PALETTE.neutralPrimary,
            "&:hover": {
              backgroundColor: isDark ? "rgba(255,255,255,0.06)" : MS_PALETTE.neutralLight,
            },
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 0,
            border: `1px solid ${isDark ? MS_PALETTE.darkBorder : MS_PALETTE.neutralQuaternaryAlt}`,
            backgroundColor: isDark ? MS_PALETTE.darkSurface : MS_PALETTE.white,
            boxShadow: "0 1.6px 3.6px 0 rgba(0,0,0,0.08), 0 0.3px 0.9px 0 rgba(0,0,0,0.04)",
            backgroundImage: "none",
            transition: "border-color 0.15s ease",
            "&:hover": {
              borderColor: isDark ? MS_PALETTE.primaryLight : MS_PALETTE.neutralTertiaryAlt,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            backgroundImage: "none",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            boxShadow: "none",
            borderBottom: `1px solid ${isDark ? MS_PALETTE.darkBorder : MS_PALETTE.primaryDark}`,
            backgroundColor: isDark ? "#11100F" : MS_PALETTE.primary,
            color: "#FFFFFF",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            border: "none",
            borderRight: `1px solid ${isDark ? MS_PALETTE.darkBorder : MS_PALETTE.neutralQuaternaryAlt}`,
            backgroundColor: isDark ? MS_PALETTE.darkSurface : MS_PALETTE.white,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-head": {
              fontWeight: 600,
              fontSize: "0.75rem",
              color: isDark ? MS_PALETTE.darkTextSecondary : MS_PALETTE.neutralSecondary,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              borderBottom: `1px solid ${isDark ? MS_PALETTE.darkBorder : MS_PALETTE.neutralQuaternaryAlt}`,
              backgroundColor: isDark ? MS_PALETTE.darkCard : MS_PALETTE.neutralLighter,
              padding: "10px 14px",
            },
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            "& .MuiTableRow-root": {
              "&:hover": {
                backgroundColor: isDark ? "rgba(255,255,255,0.04)" : MS_PALETTE.neutralLighterAlt,
              },
              "& .MuiTableCell-body": {
                borderBottom: `1px solid ${isDark ? MS_PALETTE.darkBorder : MS_PALETTE.neutralLight}`,
                fontSize: "0.8125rem",
                color: isDark ? MS_PALETTE.darkText : MS_PALETTE.neutralPrimary,
                padding: "10px 14px",
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            fontWeight: 600,
            fontSize: "0.6875rem",
            height: 22,
            border: "1px solid transparent",
          },
          filled: {
            "&.MuiChip-colorSuccess": {
              backgroundColor: MS_PALETTE.excelGreenLight,
              color: MS_PALETTE.excelGreen,
              border: `1px solid #B8E3B6`,
            },
            "&.MuiChip-colorWarning": {
              backgroundColor: MS_PALETTE.warningLight,
              color: MS_PALETTE.warning,
              border: `1px solid #FED9CC`,
            },
            "&.MuiChip-colorError": {
              backgroundColor: MS_PALETTE.errorLight,
              color: MS_PALETTE.error,
              border: `1px solid #F8C3C5`,
            },
            "&.MuiChip-colorInfo": {
              backgroundColor: MS_PALETTE.primarySubtle,
              color: MS_PALETTE.primary,
              border: `1px solid ${MS_PALETTE.primaryBorder}`,
            },
            "&.MuiChip-colorPrimary": {
              backgroundColor: MS_PALETTE.primarySubtle,
              color: MS_PALETTE.primaryDark,
              border: `1px solid ${MS_PALETTE.primaryBorder}`,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
              backgroundColor: isDark ? MS_PALETTE.darkCard : MS_PALETTE.white,
              "& fieldset": {
                borderColor: isDark ? MS_PALETTE.darkBorder : MS_PALETTE.neutralTertiaryAlt,
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: isDark ? MS_PALETTE.neutralTertiary : MS_PALETTE.neutralPrimary,
              },
              "&.Mui-focused fieldset": {
                borderColor: MS_PALETTE.primary,
                borderWidth: "2px",
              },
            },
            "& .MuiInputLabel-root": {
              fontSize: "0.8125rem",
              color: isDark ? MS_PALETTE.darkTextSecondary : MS_PALETTE.neutralSecondary,
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: MS_PALETTE.primary,
              fontWeight: 600,
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            backgroundColor: isDark ? MS_PALETTE.darkCard : MS_PALETTE.white,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? MS_PALETTE.darkBorder : MS_PALETTE.neutralTertiaryAlt,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? MS_PALETTE.neutralTertiary : MS_PALETTE.neutralPrimary,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: MS_PALETTE.primary,
              borderWidth: "2px",
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? "#323130" : "#201F1E",
            color: "#FFFFFF",
            borderRadius: 0,
            fontSize: "0.75rem",
            padding: "5px 10px",
            border: `1px solid ${isDark ? "#484644" : "#323130"}`,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.8125rem",
            minHeight: 42,
            color: isDark ? MS_PALETTE.darkTextSecondary : MS_PALETTE.neutralSecondary,
            "&.Mui-selected": {
              color: isDark ? "#FFFFFF" : MS_PALETTE.primaryDark,
              fontWeight: 600,
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: MS_PALETTE.primary,
            height: 3,
            borderRadius: 0,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            marginBottom: 2,
            borderLeft: "3px solid transparent",
            "&.Mui-selected": {
              backgroundColor: isDark ? "rgba(0, 120, 212, 0.18)" : MS_PALETTE.primarySubtle,
              borderLeft: `3px solid ${MS_PALETTE.primary}`,
              color: isDark ? "#FFFFFF" : MS_PALETTE.primaryDark,
              "& .MuiListItemIcon-root": {
                color: isDark ? MS_PALETTE.primaryLight : MS_PALETTE.primary,
              },
              "&:hover": {
                backgroundColor: isDark ? "rgba(0, 120, 212, 0.25)" : "#E1EFFF",
              },
            },
            "&:hover": {
              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : MS_PALETTE.neutralLighter,
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            height: 4,
            backgroundColor: isDark ? MS_PALETTE.darkBorder : MS_PALETTE.neutralLight,
          },
          bar: {
            borderRadius: 0,
            backgroundColor: MS_PALETTE.primary,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            border: `1px solid ${isDark ? MS_PALETTE.darkBorder : MS_PALETTE.neutralQuaternaryAlt}`,
            boxShadow: "0 12.8px 28.8px 0 rgba(0, 0, 0, 0.22)",
          },
        },
      },
    },
  });
};

const theme = getMicrosoftTheme("light");
export default theme;