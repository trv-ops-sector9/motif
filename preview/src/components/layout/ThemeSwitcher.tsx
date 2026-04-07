import { useState } from "react";
import { Palette, ChevronDown, SlidersHorizontal, RotateCcw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEMES = [
  { value: "default", label: "Default" },
  { value: "dark-minimal", label: "Dark Minimal" },
  { value: "fluent-light", label: "Fluent 2 Light" },
  { value: "fluent-dark", label: "Fluent 2 Dark" },
  { value: "bebop-light", label: "Bebop Light" },
  { value: "bebop-dark", label: "Bebop Dark" },
  { value: "nova-dark", label: "Nova Dark" },
] as const;

type ThemeValue = (typeof THEMES)[number]["value"];

export function SidebarThemePicker({ collapsed }: { collapsed: boolean }) {
  const [theme, setTheme] = useState<ThemeValue>("default");

  const handleChange = (value: string) => {
    const t = value as ThemeValue;
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  };

  const currentLabel = THEMES.find((t) => t.value === theme)?.label ?? "Default";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title={collapsed ? `Theme: ${currentLabel}` : undefined}
          aria-label={collapsed ? `Switch theme — current: ${currentLabel}` : "Switch theme"}
          className={cn(
            "flex w-full cursor-pointer items-center rounded-md transition-colors",
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            collapsed ? "h-8 w-8 mx-auto justify-center px-0" : "gap-2.5 px-2 py-1.5"
          )}
        >
          <Palette className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-sm font-medium text-left">Theme</span>
              <span className="shrink-0 text-xs text-muted-foreground">{currentLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={collapsed ? "right" : "bottom"}
        align={collapsed ? "start" : "start"}
        sideOffset={collapsed ? 8 : 4}
        className="w-44"
      >
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={handleChange}>
          {THEMES.map((t) => (
            <DropdownMenuRadioItem key={t.value} value={t.value}>
              {t.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─── Motion theme picker ────────────────────────────────────────────────── */

const MOTION_THEMES = [
  { value: "fluent2", label: "Fluent 2" },
  { value: "balanced", label: "Balanced" },
  { value: "dense", label: "Dense" },
  { value: "expressive", label: "Expressive" },
  { value: "reduced", label: "Reduced" },
] as const;

type MotionThemeValue = (typeof MOTION_THEMES)[number]["value"];

export function SidebarMotionPicker({ collapsed }: { collapsed: boolean }) {
  const [motionTheme, setMotionTheme] = useState<MotionThemeValue>("fluent2");

  const handleChange = (value: string) => {
    const t = value as MotionThemeValue;
    setMotionTheme(t);
    document.documentElement.setAttribute("data-motion-theme", t);
  };

  const currentLabel = MOTION_THEMES.find((t) => t.value === motionTheme)?.label ?? "Fluent 2";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title={collapsed ? `Motion: ${currentLabel}` : undefined}
          aria-label={collapsed ? `Switch motion theme — current: ${currentLabel}` : "Switch motion theme"}
          className={cn(
            "flex w-full cursor-pointer items-center rounded-md transition-colors",
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            collapsed ? "h-8 w-8 mx-auto justify-center px-0" : "gap-2.5 px-2 py-1.5"
          )}
        >
          <Zap className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-sm font-medium text-left">Motion</span>
              <span className="shrink-0 text-xs text-muted-foreground">{currentLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={collapsed ? "right" : "bottom"}
        align="start"
        sideOffset={collapsed ? 8 : 4}
        className="w-44"
      >
        <DropdownMenuLabel>Motion Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={motionTheme} onValueChange={handleChange}>
          {MOTION_THEMES.map((t) => (
            <DropdownMenuRadioItem key={t.value} value={t.value}>
              {t.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─── Spacing slider ─────────────────────────────────────────────────────── */

const SPACING_DEFAULT = 0.25;
const SPACING_MIN = 0.2;
const SPACING_MAX = 0.35;
const SPACING_STEP = 0.005;

function densityLabel(value: number) {
  if (value < 0.225) return "Compact";
  if (value > 0.285) return "Spacious";
  return "Default";
}

export function SidebarSpacingSlider({ collapsed }: { collapsed: boolean }) {
  const [value, setValue] = useState(SPACING_DEFAULT);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setValue(v);
    document.documentElement.style.setProperty("--spacing", `${v}rem`);
  };

  const handleReset = () => {
    setValue(SPACING_DEFAULT);
    document.documentElement.style.removeProperty("--spacing");
  };

  const isDefault = Math.abs(value - SPACING_DEFAULT) < 0.001;
  const pct = ((value - SPACING_MIN) / (SPACING_MAX - SPACING_MIN)) * 100;
  const label = densityLabel(value);

  if (collapsed) {
    return (
      <div
        title={`Spacing: ${label}`}
        aria-label={`Spacing — ${label}`}
        className="flex h-8 w-8 mx-auto items-center justify-center text-sidebar-foreground/40 select-none"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="px-2 py-1">
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        <SlidersHorizontal className="h-4 w-4 shrink-0 text-sidebar-foreground" />
        <span className="flex-1 text-sm font-medium text-sidebar-foreground">Spacing</span>
        <span className="text-xs text-muted-foreground tabular-nums">{label}</span>
        {!isDefault && (
          <button
            onClick={handleReset}
            aria-label="Reset spacing to default"
            className={cn(
              "flex h-4 w-4 cursor-pointer items-center justify-center rounded",
              "text-muted-foreground hover:text-sidebar-foreground transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring"
            )}
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Range track */}
      <input
        type="range"
        min={SPACING_MIN}
        max={SPACING_MAX}
        step={SPACING_STEP}
        value={value}
        onChange={handleChange}
        aria-label={`Global spacing: ${value}rem`}
        aria-valuemin={SPACING_MIN}
        aria-valuemax={SPACING_MAX}
        aria-valuenow={value}
        className={cn(
          "w-full cursor-pointer appearance-none rounded-full h-1.5",
          /* webkit thumb */
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3",
          "[&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:bg-sidebar-primary",
          "[&::-webkit-slider-thumb]:cursor-pointer",
          "[&::-webkit-slider-thumb]:transition-transform",
          "[&::-webkit-slider-thumb]:hover:scale-125",
          /* firefox thumb */
          "[&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3",
          "[&::-moz-range-thumb]:rounded-full",
          "[&::-moz-range-thumb]:border-0",
          "[&::-moz-range-thumb]:bg-sidebar-primary",
          "[&::-moz-range-thumb]:cursor-pointer"
        )}
        style={{
          background: `linear-gradient(to right, var(--sidebar-primary) ${pct}%, var(--sidebar-accent) ${pct}%)`,
        }}
      />

      {/* Min / max labels */}
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground/60">Compact</span>
        <span className="text-[10px] text-muted-foreground/60">Spacious</span>
      </div>
    </div>
  );
}
