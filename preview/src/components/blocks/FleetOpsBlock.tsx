import { useEffect, useRef, useState } from "react";
import { CartesianGrid, XAxis, YAxis, Bar, BarChart } from "recharts";
import {
  IconCarSuv,
  IconBatteryCharging,
  IconMapPin,
  IconClock,
  IconAlertTriangle,
  IconActivity,
  IconNavigation,
  IconGauge,
  IconSearch,
  IconShield,
  IconRadar,
  IconArrowLeft,
  IconTemperature,
  IconCpu,
  IconEye,
  IconWifi,
  IconBolt,
  IconRoute,
  IconCircleCheck,
  IconCircleX,
  IconChartBar,
  IconWifiOff,
} from "@tabler/icons-react";

import { cssMs, cssCurve } from "@/lib/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";

// ─── Data ────────────────────────────────────────────────────────────────────

type VehicleStatus = "Active" | "Idle" | "Charging" | "Maintenance" | "Offline";

interface Vehicle {
  id: string;
  status: VehicleStatus;
  location: string;
  battery: number;
  currentTrip: string;
  lastPing: string;
  coords: { x: number; y: number };
}

const STATUS_VARIANT: Record<VehicleStatus, "default" | "secondary" | "outline" | "destructive"> = {
  Active:      "default",
  Idle:        "secondary",
  Charging:    "outline",
  Maintenance: "outline",
  Offline:     "destructive",
};

const VEHICLES: Vehicle[] = [
  { id: "AV-001", status: "Active",      location: "Market St & 4th",     battery: 87, currentTrip: "TRP-4821", lastPing: "2s ago",  coords: { x: 38, y: 52 } },
  { id: "AV-002", status: "Active",      location: "Mission Bay Loop",    battery: 64, currentTrip: "TRP-4819", lastPing: "5s ago",  coords: { x: 62, y: 72 } },
  { id: "AV-003", status: "Charging",    location: "Depot A — Bay 3",    battery: 42, currentTrip: "—",        lastPing: "1m ago",  coords: { x: 78, y: 85 } },
  { id: "AV-004", status: "Active",      location: "Embarcadero & King",  battery: 91, currentTrip: "TRP-4823", lastPing: "3s ago",  coords: { x: 72, y: 58 } },
  { id: "AV-005", status: "Idle",        location: "Soma Standby Zone",   battery: 78, currentTrip: "—",        lastPing: "30s ago", coords: { x: 48, y: 62 } },
  { id: "AV-006", status: "Maintenance", location: "Depot B — Bay 1",    battery: 55, currentTrip: "—",        lastPing: "12m ago", coords: { x: 22, y: 88 } },
  { id: "AV-007", status: "Active",      location: "Potrero & 16th",     battery: 73, currentTrip: "TRP-4825", lastPing: "1s ago",  coords: { x: 55, y: 78 } },
  { id: "AV-008", status: "Offline",     location: "Last: Depot A",       battery: 12, currentTrip: "—",        lastPing: "2h ago",  coords: { x: 80, y: 88 } },
  { id: "AV-009", status: "Active",      location: "Hayes Valley",        battery: 82, currentTrip: "TRP-4827", lastPing: "4s ago",  coords: { x: 28, y: 42 } },
  { id: "AV-010", status: "Charging",    location: "Depot A — Bay 7",    battery: 29, currentTrip: "—",        lastPing: "3m ago",  coords: { x: 82, y: 82 } },
];

type AlertSeverity = "critical" | "warning" | "info";

interface Alert {
  severity: AlertSeverity;
  message: string;
  vehicle: string;
  time: string;
}

const ALERT_STYLE: Record<AlertSeverity, { badge: "destructive" | "outline" | "secondary"; icon: string }> = {
  critical: { badge: "destructive", icon: "text-destructive" },
  warning:  { badge: "outline",     icon: "text-orange-500"  },
  info:     { badge: "secondary",   icon: "text-muted-foreground" },
};

const ALERTS: Alert[] = [
  { severity: "critical", message: "Sensor array fault — lidar primary",        vehicle: "AV-008", time: "14m ago" },
  { severity: "warning",  message: "Disengagement event — construction zone",   vehicle: "AV-001", time: "28m ago" },
  { severity: "warning",  message: "Battery below 30% threshold",               vehicle: "AV-010", time: "42m ago" },
  { severity: "info",     message: "Geofence boundary approached — Pier 39",    vehicle: "AV-004", time: "1h ago"  },
  { severity: "warning",  message: "Passenger no-show — trip auto-cancelled",   vehicle: "AV-005", time: "1h ago"  },
  { severity: "info",     message: "Route recalculated — traffic on 101",       vehicle: "AV-002", time: "2h ago"  },
  { severity: "critical", message: "Emergency stop triggered — pedestrian",      vehicle: "AV-007", time: "3h ago"  },
  { severity: "info",     message: "Scheduled maintenance reminder",             vehicle: "AV-006", time: "4h ago"  },
];

// ─── Fleet map ──────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<VehicleStatus, string> = {
  Active:      "var(--chart-1)",
  Idle:        "var(--chart-3)",
  Charging:    "var(--chart-4)",
  Maintenance: "var(--chart-5)",
  Offline:     "var(--color-destructive, hsl(0 84% 60%))",
};

function centroid(points: string): { cx: number; cy: number } {
  const pts = points.split(" ").map((p) => p.split(",").map(Number));
  return {
    cx: pts.reduce((s, p) => s + p[0], 0) / pts.length,
    cy: pts.reduce((s, p) => s + p[1], 0) / pts.length,
  };
}

// Zones — each gets a distinct chart color for topographic identity
const ZONES = [
  { id: "downtown",   points: "25,35 55,35 55,58 35,65 25,55",  label: "Downtown",    fill: "var(--chart-1)", activity: 0.10 },
  { id: "soma",       points: "35,65 55,58 65,68 55,80 35,78",  label: "SoMa",        fill: "var(--chart-2)", activity: 0.08 },
  { id: "missionbay", points: "55,58 75,50 85,65 75,78 65,68",  label: "Mission Bay", fill: "var(--chart-3)", activity: 0.08 },
  { id: "potrero",    points: "45,78 55,80 60,90 40,92",         label: "Potrero",     fill: "var(--chart-4)", activity: 0.06 },
  { id: "depot",      points: "70,78 88,78 88,92 70,92",         label: "Depot Zone",  fill: "var(--chart-5)", activity: 0.06 },
].map((z) => ({ ...z, ...centroid(z.points) }));

// Routes: primary (named, with arrows) + secondary grid
const PRIMARY_ROUTES = [
  { d: "M 18,32 L 72,62",          label: "Market St"    },
  { d: "M 75,30 Q 92,45 88,70",    label: "Embarcadero"  },
  { d: "M 15,55 L 90,55",          label: "Mission St"   },
];
const SECONDARY_ROUTES = [
  "M 30,25 L 30,92", "M 50,25 L 50,92", "M 70,25 L 70,78",
  "M 15,40 L 90,40", "M 15,70 L 90,70", "M 15,85 L 90,85",
];

// Per-vehicle heading in degrees (0 = north, clockwise)
const VEHICLE_HEADING: Record<string, number> = {
  "AV-001": 45,   // NE along Market
  "AV-002": 170,  // S through Mission Bay
  "AV-003": 0,    // at depot, pointing N
  "AV-004": 120,  // SE toward Embarcadero
  "AV-005": 260,  // W, idling
  "AV-006": 0,    // at depot
  "AV-007": 200,  // SW toward Potrero
  "AV-008": 0,    // offline
  "AV-009": 80,   // E through Hayes Valley
  "AV-010": 0,    // charging at depot
};

// Projected route paths for active vehicles — curved SVG paths toward destination
const ACTIVE_ROUTES: { id: string; path: string }[] = [
  { id: "AV-001", path: "M 38,52 Q 52,44 68,34" },
  { id: "AV-002", path: "M 62,72 Q 66,79 70,87" },
  { id: "AV-004", path: "M 72,58 Q 79,65 83,73" },
  { id: "AV-007", path: "M 55,78 Q 49,84 42,90" },
  { id: "AV-009", path: "M 28,42 Q 40,39 53,36" },
];

// ── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let rafId: number;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(target * ease);
      if (progress < 1) rafId = requestAnimationFrame(tick);
      else setValue(target);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);
  return value;
}

function FleetMap({ vehicles, selectedId, onSelect }: {
  vehicles: Vehicle[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="relative w-full h-full min-h-[300px] rounded-lg overflow-hidden border bg-[hsl(220,20%,6%)]">
      <style>{`
        @keyframes fleet-march {
          from { stroke-dashoffset: 14; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes fleet-sonar {
          from { transform: scale(1); opacity: 0.7; }
          to   { transform: scale(3.2); opacity: 0; }
        }
        .fleet-route { animation: fleet-march 1.2s linear infinite; }
        .fleet-sonar { animation: fleet-sonar 2.4s ease-out infinite; }
      `}</style>

      <svg viewBox="10 20 85 78" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="tactical-dots" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.25" fill="white" fillOpacity="0.12" />
          </pattern>
          <filter id="glow-active" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-selected" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Full canvas dot grid */}
        <rect x="0" y="0" width="100" height="100" fill="url(#tactical-dots)" />

        {/* Zone glows — behind everything */}
        {ZONES.map((zone) => (
          <polygon
            key={zone.id}
            points={zone.points}
            fill={zone.fill}
            fillOpacity={0.05}
            stroke={zone.fill}
            strokeOpacity={0.12}
            strokeWidth="0.3"
          />
        ))}

        {/* Street grid — crisp thin lines */}
        {SECONDARY_ROUTES.map((d, i) => (
          <path key={i} d={d} stroke="white" strokeOpacity={0.055} strokeWidth="0.3" fill="none" strokeLinecap="round" />
        ))}

        {/* Primary arteries — slightly brighter */}
        {PRIMARY_ROUTES.map((r) => (
          <path key={r.label} d={r.d} stroke="white" strokeOpacity={0.14} strokeWidth="0.55" fill="none" strokeLinecap="round" />
        ))}

        {/* Active route projections — marching dashes in vehicle's status color */}
        {ACTIVE_ROUTES.map((r) => {
          const vehicle = vehicles.find((v) => v.id === r.id);
          if (!vehicle) return null;
          const color = STATUS_COLOR[vehicle.status];
          const isSelected = selectedId === r.id;
          return (
            <path
              key={r.id}
              d={r.path}
              stroke={color}
              strokeOpacity={isSelected ? 0.9 : 0.45}
              strokeWidth={isSelected ? 1.0 : 0.65}
              strokeDasharray="3 2"
              strokeLinecap="round"
              fill="none"
              className="fleet-route"
              style={{ animationDelay: `${ACTIVE_ROUTES.indexOf(r) * 0.18}s` }}
            />
          );
        })}

        {/* Zone labels */}
        {ZONES.map((zone) => (
          <text
            key={zone.id}
            x={zone.cx}
            y={zone.cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fillOpacity={0.2}
            fontSize="2.2"
            fontWeight="700"
            className="select-none pointer-events-none"
            style={{ letterSpacing: "0.08em" }}
          >
            {zone.label.toUpperCase()}
          </text>
        ))}

        {/* Vehicle markers */}
        {vehicles.map((v) => {
          const color = STATUS_COLOR[v.status];
          const isActive = v.status === "Active";
          const isSelected = selectedId === v.id;
          const isOffline = v.status === "Offline" || v.status === "Maintenance";
          const heading = VEHICLE_HEADING[v.id] ?? 0;
          const { x, y } = v.coords;

          return (
            <g key={v.id} className="cursor-pointer" onClick={() => onSelect(isSelected ? null : v.id)}>
              {/* Hit area */}
              <circle cx={x} cy={y} r={6} fill="transparent" />

              {/* Sonar rings for active — scale from center via translated g */}
              {isActive && (
                <g transform={`translate(${x}, ${y})`}>
                  <circle
                    cx="0" cy="0" r="3"
                    fill="none"
                    stroke={color}
                    strokeWidth="0.5"
                    className="fleet-sonar"
                    style={{ animationDelay: `${(parseInt(v.id.replace("AV-0", "")) * 0.37) % 2.4}s`, transformOrigin: "0px 0px" }}
                  />
                </g>
              )}

              {/* Selection ring — dashed orbit */}
              {isSelected && (
                <circle
                  cx={x} cy={y} r="5.5"
                  fill="none"
                  stroke="white"
                  strokeOpacity={0.5}
                  strokeWidth="0.5"
                  strokeDasharray="1.5 1.5"
                />
              )}

              {/* Marker body */}
              {isOffline ? (
                <circle cx={x} cy={y} r="2" fill={color} fillOpacity={0.3} />
              ) : (
                <g
                  transform={`rotate(${heading}, ${x}, ${y})`}
                  filter={isActive ? "url(#glow-active)" : undefined}
                >
                  {/* Diamond/chevron: sharp forward point */}
                  <path
                    d={`M ${x},${y - 3.2} L ${x + 1.8},${y + 1.6} L ${x},${y + 0.6} L ${x - 1.8},${y + 1.6} Z`}
                    fill={color}
                    fillOpacity={isSelected ? 1 : 0.85}
                  />
                </g>
              )}

              {/* ID label */}
              <text
                x={x}
                y={y - 5.5}
                textAnchor="middle"
                fill="white"
                fillOpacity={isSelected ? 0.9 : 0.5}
                fontSize="1.9"
                fontWeight="700"
                className="select-none pointer-events-none"
                style={{ letterSpacing: "0.04em" }}
              >
                {v.id.replace("AV-0", "")}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend — bottom left overlay */}
      <div className="absolute bottom-2.5 left-3 flex items-center gap-3">
        {(["Active", "Idle", "Charging", "Offline"] as VehicleStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1 text-[9px] text-white/40 font-medium">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[s] }} />
            {s}
          </span>
        ))}
      </div>

      {/* Coordinates watermark */}
      <div className="absolute top-2 right-3 text-[8px] text-white/20 font-mono tracking-wider">
        37.7749° N · 122.4194° W
      </div>
    </div>
  );
}

// ─── Stat cards ──────────────────────────────────────────────────────────────

const STATS = [
  { label: "Active Vehicles",  value: "6",   icon: IconCarSuv,      delta: "+2 vs yesterday" },
  { label: "Trips Today",      value: "847", icon: IconNavigation,  delta: "+12% vs avg"     },
  { label: "Avg Wait Time",    value: "3.2m",icon: IconClock,       delta: "-18s vs last wk" },
  { label: "Fleet Utilization", value: "72%", icon: IconGauge,      delta: "+4pp vs target"  },
] as const;

const FLEET_SUMMARY = [
  { icon: IconActivity,       label: "active",             count: VEHICLES.filter((v) => v.status === "Active").length },
  { icon: IconBatteryCharging, label: "charging",           count: VEHICLES.filter((v) => v.status === "Charging").length },
  { icon: IconAlertTriangle,  label: "offline/maintenance", count: VEHICLES.filter((v) => v.status === "Maintenance" || v.status === "Offline").length },
];

// ─── Vehicle detail data ────────────────────────────────────────────────────

const VEHICLE_TRIPS = [
  { hour: "6 AM", distance: 2.4 }, { hour: "7 AM", distance: 5.1 }, { hour: "8 AM", distance: 8.7 },
  { hour: "9 AM", distance: 11.2 }, { hour: "10 AM", distance: 7.3 }, { hour: "11 AM", distance: 4.8 },
  { hour: "12 PM", distance: 6.2 }, { hour: "1 PM", distance: 9.1 }, { hour: "2 PM", distance: 7.5 },
  { hour: "3 PM", distance: 8.9 }, { hour: "4 PM", distance: 12.1 }, { hour: "5 PM", distance: 14.3 },
];

const vehicleTripConfig = {
  distance: { label: "Miles", color: "var(--chart-2)" },
} satisfies ChartConfig;

const SENSOR_DATA = [
  { label: "Lidar",       icon: IconEye,         value: "Nominal", status: "ok" },
  { label: "Camera Array", icon: IconEye,         value: "6/6 online", status: "ok" },
  { label: "CPU Temp",     icon: IconTemperature, value: "62°C", status: "ok" },
  { label: "GPU Load",     icon: IconCpu,         value: "41%", status: "ok" },
  { label: "Connectivity", icon: IconWifi,        value: "5G — 42ms", status: "ok" },
  { label: "IMU",          icon: IconActivity,    value: "Calibrated", status: "ok" },
] as const;

const VEHICLE_EVENTS = [
  { time: "2m ago",  event: "Passenger picked up — Market & 4th",    type: "info" as const },
  { time: "8m ago",  event: "Route recalculated — congestion on 3rd", type: "info" as const },
  { time: "14m ago", event: "Yielded to pedestrian — crosswalk",      type: "info" as const },
  { time: "22m ago", event: "Lane change executed — Highway 101 on-ramp", type: "info" as const },
  { time: "31m ago", event: "Passenger dropped off — Embarcadero",    type: "info" as const },
  { time: "45m ago", event: "Construction zone — reduced speed",       type: "warning" as const },
  { time: "1h ago",  event: "Trip TRP-4819 completed — 4.2mi",        type: "info" as const },
];

// ─── Incident data ───────────────────────────────────────────────────────────

type IncidentType = "disengagement" | "emergency_stop" | "sensor_fault" | "geofence" | "comm_loss";

interface Incident {
  id: string;
  type: IncidentType;
  severity: AlertSeverity;
  vehicle: string;
  location: string;
  description: string;
  time: string;
  responseTimeSec: number;
  resolved: boolean;
}

const INCIDENT_TYPE_META: Record<IncidentType, { label: string; icon: React.ElementType; color: string }> = {
  disengagement:  { label: "Disengagement",  icon: IconRoute,             color: "text-orange-500"  },
  emergency_stop: { label: "Emergency Stop", icon: IconBolt,              color: "text-destructive" },
  sensor_fault:   { label: "Sensor Fault",   icon: IconEye,               color: "text-yellow-500"  },
  geofence:       { label: "Geofence",       icon: IconShield,            color: "text-blue-400"    },
  comm_loss:      { label: "Comm Loss",      icon: IconWifiOff,           color: "text-muted-foreground" },
};

const INCIDENTS: Incident[] = [
  { id: "INC-0041", type: "emergency_stop",  severity: "critical", vehicle: "AV-007", location: "Market & Polk St",       description: "Pedestrian entered active ODD — full autonomy stop executed, remote ops notified", time: "3h ago",      responseTimeSec: 1.4, resolved: true  },
  { id: "INC-0042", type: "sensor_fault",    severity: "critical", vehicle: "AV-008", location: "Depot A — Bay 3",        description: "Lidar primary array lost signal — fallback to camera-only, vehicle sidelined",  time: "14m ago",     responseTimeSec: 8.2, resolved: false },
  { id: "INC-0043", type: "disengagement",   severity: "warning",  vehicle: "AV-001", location: "Market St & 8th",        description: "Construction zone cone displacement — operator assumed manual control",          time: "28m ago",     responseTimeSec: 3.1, resolved: true  },
  { id: "INC-0044", type: "geofence",        severity: "warning",  vehicle: "AV-004", location: "Embarcadero Ferry Dock", description: "Approaching restricted ferry zone — route correction automatically applied",      time: "1h ago",      responseTimeSec: 2.0, resolved: true  },
  { id: "INC-0045", type: "comm_loss",       severity: "warning",  vehicle: "AV-002", location: "SOMA Tunnel Approach",   description: "5G primary degraded below 10 Mbps — switched to V2X mesh backup",               time: "1h 14m ago",  responseTimeSec: 0.8, resolved: true  },
  { id: "INC-0046", type: "sensor_fault",    severity: "warning",  vehicle: "AV-005", location: "Hayes Valley — Oak St",  description: "Camera 3 (left rear) lens obstruction detected — auto-clean sequence initiated",  time: "2h ago",      responseTimeSec: 4.4, resolved: true  },
  { id: "INC-0047", type: "disengagement",   severity: "warning",  vehicle: "AV-009", location: "Van Ness & Fell St",     description: "Anomalous cyclist trajectory in adjacent lane — operator intervened, re-engaged",  time: "4h ago",      responseTimeSec: 2.8, resolved: true  },
  { id: "INC-0048", type: "emergency_stop",  severity: "critical", vehicle: "AV-003", location: "Potrero & 20th St",      description: "Wrong-way vehicle detected on one-way — immediate full stop, hazard lights on",   time: "6h ago",      responseTimeSec: 1.1, resolved: true  },
  { id: "INC-0049", type: "sensor_fault",    severity: "info",     vehicle: "AV-006", location: "Depot B — Bay 1",        description: "Radar calibration drift exceeds 0.3° threshold — recalibration queued",          time: "8h ago",      responseTimeSec: 0,   resolved: true  },
  { id: "INC-0050", type: "geofence",        severity: "info",     vehicle: "AV-010", location: "Pier 39 Approach",       description: "Tourist density spike (>200 pedestrians/min) — adaptive speed reduction applied", time: "10h ago",     responseTimeSec: 0,   resolved: true  },
];

// Incident distribution across 6-hour windows (last 24h)
const INCIDENT_TIMELINE = [
  { window: "00–06", disengagement: 1, emergency_stop: 1, sensor_fault: 0, geofence: 0, comm_loss: 0 },
  { window: "06–12", disengagement: 0, emergency_stop: 0, sensor_fault: 1, geofence: 1, comm_loss: 1 },
  { window: "12–18", disengagement: 1, emergency_stop: 0, sensor_fault: 1, geofence: 1, comm_loss: 0 },
  { window: "18–24", disengagement: 1, emergency_stop: 1, sensor_fault: 1, geofence: 0, comm_loss: 0 },
];

const incidentChartConfig = {
  disengagement:  { label: "Disengagement",  color: "var(--chart-3)" },
  emergency_stop: { label: "Emergency Stop", color: "var(--chart-1)" },
  sensor_fault:   { label: "Sensor Fault",   color: "var(--chart-2)" },
  geofence:       { label: "Geofence",       color: "var(--chart-4)" },
  comm_loss:      { label: "Comm Loss",      color: "var(--chart-5)" },
} satisfies ChartConfig;

// ─── Stat tile with count-up ─────────────────────────────────────────────────

function StatTile({ stat, delay }: { stat: typeof STATS[number]; delay: number }) {
  const Icon = stat.icon;
  const numMatch = stat.value.match(/^([\d.]+)(.*)$/);
  const numericPart = numMatch ? parseFloat(numMatch[1]) : 0;
  const suffix = numMatch ? numMatch[2] : "";
  const counted = useCountUp(numericPart, 800 + delay * 120);
  const display = numericPart % 1 !== 0
    ? counted.toFixed(1) + suffix
    : Math.round(counted) + suffix;

  return (
    <div
      className="rounded-lg border bg-muted/20 p-3 flex flex-col justify-between gap-2"
      style={{
        animation: "var(--anim-slide-up-in)",
        animationDelay: `calc(var(--motion-duration-ultra-fast) * ${delay + 2})`,
        animationFillMode: "both",
      }}
    >
      <div className="flex items-center justify-between">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground/60 truncate ml-1 text-right leading-tight">{stat.delta}</span>
      </div>
      <div>
        <div className="text-2xl font-bold tabular-nums tracking-tight leading-none">{display}</div>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
      </div>
    </div>
  );
}

// ─── Selected vehicle mini-panel ─────────────────────────────────────────────

function VehicleMiniPanel({ vehicle, onOpenDetail }: { vehicle: Vehicle; onOpenDetail: () => void }) {
  const batteryBg = vehicle.battery < 30 ? "bg-destructive" : vehicle.battery < 50 ? "bg-orange-500" : "bg-green-500";
  const batteryText = vehicle.battery < 30 ? "text-destructive" : vehicle.battery < 50 ? "text-orange-500" : "text-green-500";

  return (
    <div
      className="rounded-lg border bg-muted/20 p-3 space-y-2"
      style={{ animation: "var(--anim-expand-in)", animationFillMode: "both" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold">{vehicle.id}</span>
          <Badge variant={STATUS_VARIANT[vehicle.status]} className="text-[9px] h-4 px-1.5">{vehicle.status}</Badge>
        </div>
        <button
          onClick={onOpenDetail}
          className="text-[10px] text-primary hover:underline cursor-pointer shrink-0"
        >
          Details →
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
        <IconMapPin className="h-3 w-3 shrink-0" />
        {vehicle.location}
      </p>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">Battery</span>
          <span className={`text-[10px] font-mono font-semibold ${batteryText}`}>{vehicle.battery}%</span>
        </div>
        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full ${batteryBg}`} style={{ width: `${vehicle.battery}%` }} />
        </div>
      </div>
      {vehicle.currentTrip !== "—" && (
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <IconNavigation className="h-3 w-3 shrink-0" />
          <span className="font-mono">{vehicle.currentTrip}</span>
          <span className="text-muted-foreground/50">· {vehicle.lastPing}</span>
        </p>
      )}
    </div>
  );
}

// ─── Compact vehicle list ─────────────────────────────────────────────────────

function VehicleList({ vehicles, selectedId, onSelect, onOpenDetail, globalFilter, setGlobalFilter }: {
  vehicles: Vehicle[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onOpenDetail: (id: string) => void;
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
}) {
  const filtered = vehicles.filter((v) =>
    globalFilter === "" ||
    v.id.toLowerCase().includes(globalFilter.toLowerCase()) ||
    v.location.toLowerCase().includes(globalFilter.toLowerCase())
  );

  return (
    <div className="rounded-lg border overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/20 shrink-0">
        <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vehicles</h2>
        <div className="relative">
          <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-6 h-6 text-xs w-32"
          />
        </div>
      </div>
      <div className="overflow-y-auto flex-1 divide-y">
        {filtered.map((v, i) => {
          const isSelected = selectedId === v.id;
          const batteryBg = v.battery < 30 ? "bg-destructive" : v.battery < 50 ? "bg-orange-500" : "bg-green-500";
          return (
            <div
              key={v.id}
              className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors hover:bg-muted/40 ${isSelected ? "bg-muted/60" : ""}`}
              onClick={() => onSelect(isSelected ? null : v.id)}
              style={{
                animation: "var(--anim-fade-in)",
                animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i * 0.4})`,
                animationFillMode: "both",
              }}
            >
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: STATUS_COLOR[v.status] }} />
              <span className="font-mono text-xs font-bold w-12 shrink-0">{v.id}</span>
              <span className="text-xs text-muted-foreground flex-1 truncate">{v.location}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-8 h-1 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${batteryBg}`} style={{ width: `${v.battery}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground tabular-nums w-6 text-right">{v.battery}%</span>
              </div>
              {isSelected && (
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenDetail(v.id); }}
                  className="text-[10px] text-primary hover:underline shrink-0 cursor-pointer"
                >
                  →
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 px-3 py-2 border-t bg-muted/10 shrink-0">
        {FLEET_SUMMARY.map(({ icon: Icon, label, count }) => (
          <span key={label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Icon className="h-3 w-3" />{count} {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Alerts panel ─────────────────────────────────────────────────────────────

function AlertsPanel({ alerts, filter, onFilterChange }: {
  alerts: Alert[];
  filter: "all" | AlertSeverity;
  onFilterChange: (f: "all" | AlertSeverity) => void;
}) {
  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  return (
    <div className="rounded-lg border overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/20 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Alerts</h2>
          {criticalCount > 0 && (
            <span className="text-[9px] font-bold bg-destructive/15 text-destructive px-1.5 py-0.5 rounded-full">
              {criticalCount} critical
            </span>
          )}
        </div>
        <IconShield className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex border-b shrink-0">
        {(["all", "critical", "warning", "info"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onFilterChange(tab)}
            className={`flex-1 text-[10px] py-1.5 font-medium transition-colors capitalize cursor-pointer ${
              filter === tab ? "text-foreground border-b border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="overflow-y-auto flex-1 divide-y">
        {filtered.map((alert, i) => {
          const style = ALERT_STYLE[alert.severity];
          return (
            <div
              key={i}
              className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-muted/40 transition-colors"
              style={{
                animation: "var(--anim-fade-in)",
                animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i * 0.4})`,
                animationFillMode: "both",
              }}
            >
              <IconAlertTriangle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${style.icon}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-snug">{alert.message}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[10px] text-muted-foreground">{alert.vehicle}</span>
                  <span className="text-[10px] text-muted-foreground/50">{alert.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Incident Review page ────────────────────────────────────────────────────

function IncidentReviewPage({ onBack }: { onBack: () => void }) {
  const [typeFilter, setTypeFilter] = useState<"all" | IncidentType>("all");
  const [unresolvedOnly, setUnresolvedOnly] = useState(false);

  const filtered = INCIDENTS.filter(
    (i) => (typeFilter === "all" || i.type === typeFilter) && (!unresolvedOnly || !i.resolved)
  );

  const criticalCount  = INCIDENTS.filter((i) => i.severity === "critical").length;
  const unresolvedCount = INCIDENTS.filter((i) => !i.resolved).length;
  const withResponse   = INCIDENTS.filter((i) => i.responseTimeSec > 0);
  const avgResponse    = (withResponse.reduce((s, i) => s + i.responseTimeSec, 0) / withResponse.length).toFixed(1);

  const totalCounted   = useCountUp(INCIDENTS.length, 700);
  const criticalCounted = useCountUp(criticalCount, 700);

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-5">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3"
        style={{ animation: "var(--anim-fade-in)" }}
      >
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to fleet overview">
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight">Incident Review</h1>
            <span className="inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              Last 24h
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            SF Metro · {VEHICLES.length} vehicles · {INCIDENTS.length} recorded events
          </p>
        </div>
        {unresolvedCount > 0 && (
          <span
            className="shrink-0 text-[10px] font-bold bg-destructive/15 text-destructive px-2.5 py-1 rounded-full"
            style={{ animation: "var(--anim-fade-in)", animationDelay: "calc(var(--motion-duration-ultra-fast) * 2)", animationFillMode: "both" }}
          >
            {unresolvedCount} unresolved
          </span>
        )}
      </div>

      {/* ── KPI row ──────────────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        style={{
          animation: "var(--anim-slide-up-in)",
          animationDelay: "calc(var(--motion-duration-ultra-fast) * 2)",
          animationFillMode: "both",
        }}
      >
        {[
          { label: "Total Events",     value: Math.round(totalCounted),    unit: "",   icon: IconChartBar,     delta: "Last 24 hours"          },
          { label: "Critical",         value: Math.round(criticalCounted), unit: "",   icon: IconAlertTriangle, delta: `${unresolvedCount} unresolved` },
          { label: "Avg Response",     value: avgResponse,                 unit: "s",  icon: IconClock,         delta: "Autonomy to safe-stop"  },
          { label: "Safety Score",     value: "94.2",                      unit: "/100", icon: IconShield,      delta: "+1.3 vs yesterday"      },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-lg border bg-muted/20 p-3 flex flex-col justify-between gap-2"
              style={{
                animation: "var(--anim-slide-up-in)",
                animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i + 2})`,
                animationFillMode: "both",
              }}
            >
              <div className="flex items-center justify-between">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground/60 truncate ml-1 text-right leading-tight">{kpi.delta}</span>
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums tracking-tight leading-none">
                  {kpi.value}<span className="text-sm font-medium text-muted-foreground ml-0.5">{kpi.unit}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{kpi.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Timeline chart + Category breakdown ─────────────────────────── */}
      <div
        className="grid gap-4 lg:grid-cols-[1fr_260px]"
        style={{
          animation: "var(--anim-slide-up-in)",
          animationDelay: "calc(var(--motion-duration-ultra-fast) * 4)",
          animationFillMode: "both",
        }}
      >
        {/* Stacked bar timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Incident Timeline</CardTitle>
            <CardDescription className="text-xs">Distribution across 6-hour windows</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={incidentChartConfig} className="h-[180px] w-full">
              <BarChart data={INCIDENT_TIMELINE} barSize={32}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="window" tickLine={false} axisLine={false} tickMargin={8} className="text-[10px]" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-[10px]" allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="disengagement"  stackId="a" fill="var(--color-disengagement)"  radius={[0,0,0,0]} animationDuration={cssMs("--motion-duration-slow")} animationEasing={cssCurve("--motion-curve-decelerate-max")} />
                <Bar dataKey="emergency_stop" stackId="a" fill="var(--color-emergency_stop)" radius={[0,0,0,0]} animationDuration={cssMs("--motion-duration-slow")} animationEasing={cssCurve("--motion-curve-decelerate-max")} />
                <Bar dataKey="sensor_fault"   stackId="a" fill="var(--color-sensor_fault)"   radius={[0,0,0,0]} animationDuration={cssMs("--motion-duration-slow")} animationEasing={cssCurve("--motion-curve-decelerate-max")} />
                <Bar dataKey="geofence"       stackId="a" fill="var(--color-geofence)"       radius={[0,0,0,0]} animationDuration={cssMs("--motion-duration-slow")} animationEasing={cssCurve("--motion-curve-decelerate-max")} />
                <Bar dataKey="comm_loss"      stackId="a" fill="var(--color-comm_loss)"      radius={[4,4,0,0]} animationDuration={cssMs("--motion-duration-slow")} animationEasing={cssCurve("--motion-curve-decelerate-max")} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">By Category</CardTitle>
            <CardDescription className="text-xs">Event type distribution</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {(Object.entries(INCIDENT_TYPE_META) as [IncidentType, typeof INCIDENT_TYPE_META[IncidentType]][]).map(([type, meta], i) => {
              const count = INCIDENTS.filter((inc) => inc.type === type).length;
              const pct = Math.round((count / INCIDENTS.length) * 100);
              const Icon = meta.icon;
              return (
                <div
                  key={type}
                  className="space-y-1"
                  style={{
                    animation: "var(--anim-fade-in)",
                    animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i})`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-1.5 text-[11px] font-medium ${meta.color}`}>
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{ width: `${pct}%`, background: `currentColor` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ── Incident event log ───────────────────────────────────────────── */}
      <Card
        style={{
          animation: "var(--anim-slide-up-in)",
          animationDelay: "calc(var(--motion-duration-ultra-fast) * 6)",
          animationFillMode: "both",
        }}
      >
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-sm font-semibold">Event Log</CardTitle>
              <CardDescription className="text-xs">{filtered.length} events {typeFilter !== "all" ? `· ${INCIDENT_TYPE_META[typeFilter].label}` : ""}</CardDescription>
            </div>
            <button
              onClick={() => setUnresolvedOnly((v) => !v)}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                unresolvedOnly
                  ? "bg-destructive/15 text-destructive border-destructive/30"
                  : "text-muted-foreground hover:text-foreground border-transparent hover:border-border"
              }`}
            >
              {unresolvedOnly ? "Unresolved only" : "All events"}
            </button>
          </div>
          {/* Type filter tabs */}
          <div className="flex gap-1 mt-3 flex-wrap">
            {(["all", "disengagement", "emergency_stop", "sensor_fault", "geofence", "comm_loss"] as const).map((tab) => {
              const isAll = tab === "all";
              const label = isAll ? "All" : INCIDENT_TYPE_META[tab].label;
              return (
                <button
                  key={tab}
                  onClick={() => setTypeFilter(tab)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border cursor-pointer transition-colors font-medium ${
                    typeFilter === tab
                      ? "bg-foreground text-background border-foreground"
                      : "text-muted-foreground hover:text-foreground border-border"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No events match the current filter</p>
          ) : (
            filtered.map((incident, i) => {
              const meta = INCIDENT_TYPE_META[incident.type];
              const TypeIcon = meta.icon;
              const severityDot =
                incident.severity === "critical" ? "bg-destructive" :
                incident.severity === "warning"  ? "bg-orange-500"  : "bg-muted-foreground";
              return (
                <div
                  key={incident.id}
                  className="flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-muted/40 transition-colors"
                  style={{
                    animation: "var(--anim-fade-in)",
                    animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i * 0.3})`,
                    animationFillMode: "both",
                  }}
                >
                  {/* Severity indicator */}
                  <div className="mt-1 flex flex-col items-center gap-1.5 shrink-0">
                    <span className={`h-2 w-2 rounded-full ${severityDot}`} />
                    <TypeIcon className={`h-3.5 w-3.5 ${meta.color}`} />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-muted-foreground">{incident.id}</span>
                      <span className={`text-[10px] font-medium ${meta.color}`}>{meta.label}</span>
                      <span className="text-[10px] text-muted-foreground/50 ml-auto shrink-0">{incident.time}</span>
                    </div>
                    <p className="text-xs leading-snug mt-0.5 text-foreground">{incident.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                        <IconCarSuv className="h-3 w-3" />
                        {incident.vehicle}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <IconMapPin className="h-3 w-3" />
                        {incident.location}
                      </span>
                      {incident.responseTimeSec > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <IconClock className="h-3 w-3" />
                          {incident.responseTimeSec}s response
                        </span>
                      )}
                      <span className={`flex items-center gap-1 text-[10px] font-medium ${incident.resolved ? "text-green-500" : "text-destructive"}`}>
                        {incident.resolved
                          ? <IconCircleCheck className="h-3 w-3" />
                          : <IconCircleX className="h-3 w-3" />
                        }
                        {incident.resolved ? "Resolved" : "Open"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sub-pages ──────────────────────────────────────────────────────────────

function FleetOverviewPage({ onSelectVehicle, onGoToIncidents }: { onSelectVehicle: (id: string) => void; onGoToIncidents: () => void }) {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [alertFilter, setAlertFilter] = useState<"all" | AlertSeverity>("all");
  const [globalFilter, setGlobalFilter] = useState("");

  const selectedV = selectedVehicle ? VEHICLES.find((v) => v.id === selectedVehicle) ?? null : null;

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-5">

      {/* Header — compact single line */}
      <div
        className="flex items-center justify-between"
        style={{ animation: "var(--anim-fade-in)" }}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight">Fleet Operations</h1>
          <p className="text-xs text-muted-foreground">San Francisco · {VEHICLES.length} vehicles</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onGoToIncidents}
            className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground border border-transparent hover:border-border rounded-full px-2.5 py-1 transition-colors cursor-pointer"
          >
            <IconAlertTriangle className="h-3 w-3" />
            Incidents
            <span className="font-mono text-destructive">
              {INCIDENTS.filter((i) => i.severity === "critical").length}
            </span>
          </button>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-[10px] font-mono text-muted-foreground tracking-widest">LIVE</span>
        </div>
      </div>

      {/* ── Hero row: Map + Stats ─────────────────────────────────────────── */}
      <div
        className="grid gap-4 lg:grid-cols-[1fr_300px]"
        style={{
          animation: "var(--anim-slide-up-in)",
          animationDelay: "calc(var(--motion-duration-ultra-fast) * 2)",
          animationFillMode: "both",
        }}
      >
        {/* Tactical map */}
        <div style={{ minHeight: "320px" }}>
          <FleetMap vehicles={VEHICLES} selectedId={selectedVehicle} onSelect={setSelectedVehicle} />
        </div>

        {/* Right column: stat tiles + selected vehicle panel */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {STATS.map((s, i) => (
              <StatTile key={s.label} stat={s} delay={i} />
            ))}
          </div>

          {selectedV ? (
            <VehicleMiniPanel
              vehicle={selectedV}
              onOpenDetail={() => onSelectVehicle(selectedV.id)}
            />
          ) : (
            <div className="rounded-lg border bg-muted/10 px-4 py-5 text-center flex flex-col items-center gap-2 flex-1">
              <IconNavigation className="h-5 w-5 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground/60">Select a vehicle on the map</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom row: Vehicle list + Alerts ────────────────────────────── */}
      <div
        className="grid gap-4 lg:grid-cols-[1fr_360px]"
        style={{
          animation: "var(--anim-slide-up-in)",
          animationDelay: "calc(var(--motion-duration-ultra-fast) * 4)",
          animationFillMode: "both",
          minHeight: "280px",
        }}
      >
        <VehicleList
          vehicles={VEHICLES}
          selectedId={selectedVehicle}
          onSelect={setSelectedVehicle}
          onOpenDetail={onSelectVehicle}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
        <AlertsPanel
          alerts={ALERTS}
          filter={alertFilter}
          onFilterChange={setAlertFilter}
        />
      </div>
    </div>
  );
}

function VehicleDetailPage({ vehicleId, onBack }: { vehicleId: string; onBack: () => void }) {
  const vehicle = VEHICLES.find((v) => v.id === vehicleId) ?? VEHICLES[0];
  const vehicleAlerts = ALERTS.filter((a) => a.vehicle === vehicle.id);
  const batteryColor = vehicle.battery < 30 ? "text-destructive" : vehicle.battery < 50 ? "text-orange-500" : "text-green-500";
  const batteryBg = vehicle.battery < 30 ? "bg-destructive" : vehicle.battery < 50 ? "bg-orange-500" : "bg-green-500";

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-3" style={{ animation: "var(--anim-fade-in)" }}>
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to fleet overview">
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight font-mono">{vehicle.id}</h1>
            <Badge variant={STATUS_VARIANT[vehicle.status]}>{vehicle.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <IconMapPin className="h-3 w-3" />
            {vehicle.location}
          </p>
        </div>
      </div>

      {/* Vital stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {([
          { label: "Battery", value: `${vehicle.battery}%`, icon: IconBatteryCharging, sub: vehicle.battery < 30 ? "Low — charge soon" : "Healthy" },
          { label: "Current Trip", value: vehicle.currentTrip, icon: IconNavigation, sub: vehicle.currentTrip === "—" ? "No active trip" : "In progress" },
          { label: "Last Ping", value: vehicle.lastPing, icon: IconRadar, sub: "Telemetry active" },
          { label: "Today's Distance", value: "47.3 mi", icon: IconGauge, sub: "12 trips completed" },
        ] as const).map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} style={{
              animation: "var(--anim-slide-up-in)",
              animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i + 1})`,
              animationFillMode: "both",
            }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">{s.label}</CardDescription>
                  <Icon className={`h-4 w-4 ${s.label === "Battery" ? batteryColor : "text-muted-foreground"}`} />
                </div>
                <CardTitle className="text-2xl font-bold tabular-nums">{s.value}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Battery bar */}
      <Card style={{
        animation: "var(--anim-slide-up-in)",
        animationDelay: "calc(var(--motion-duration-ultra-fast) * 5)",
        animationFillMode: "both",
      }}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Battery Level</span>
            <span className={`text-sm font-bold tabular-nums ${batteryColor}`}>{vehicle.battery}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full ${batteryBg} transition-[width] duration-500`} style={{ width: `${vehicle.battery}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {vehicle.battery < 30 ? "Estimated range: ~12 mi" : vehicle.battery < 50 ? "Estimated range: ~35 mi" : `Estimated range: ~${Math.round(vehicle.battery * 1.1)} mi`}
          </p>
        </CardContent>
      </Card>

      {/* Distance chart + Sensor grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]" style={{
        animation: "var(--anim-slide-up-in)",
        animationDelay: "calc(var(--motion-duration-ultra-fast) * 6)",
        animationFillMode: "both",
      }}>
        {/* Distance per hour */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Distance by Hour</CardTitle>
            <CardDescription className="text-xs">Miles driven today</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={vehicleTripConfig} className="h-[200px] w-full">
              <BarChart data={VEHICLE_TRIPS}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => v.replace(" ", "")}
                  className="text-[10px]"
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-[10px]" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="distance"
                  fill="var(--color-distance)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={cssMs("--motion-duration-slow")}
                  animationEasing={cssCurve("--motion-curve-decelerate-max")}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Sensor status grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Sensor Status</CardTitle>
            <CardDescription className="text-xs">All systems operational</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {SENSOR_DATA.map((sensor, i) => {
                const Icon = sensor.icon;
                return (
                  <div
                    key={sensor.label}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                    style={{
                      animation: "var(--anim-fade-in)",
                      animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i})`,
                      animationFillMode: "both",
                    }}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{sensor.label}</p>
                      <p className="text-[11px] text-muted-foreground">{sensor.value}</p>
                    </div>
                    <span className="ml-auto h-2 w-2 rounded-full bg-green-500 shrink-0" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event log + Vehicle alerts */}
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]" style={{
        animation: "var(--anim-slide-up-in)",
        animationDelay: "calc(var(--motion-duration-ultra-fast) * 7)",
        animationFillMode: "both",
      }}>
        {/* Event log */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Event Log</CardTitle>
            <CardDescription className="text-xs">Recent vehicle activity</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            {VEHICLE_EVENTS.map((evt, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/60 transition-colors"
                style={{
                  animation: "var(--anim-fade-in)",
                  animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i})`,
                  animationFillMode: "both",
                }}
              >
                <IconActivity className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${evt.type === "warning" ? "text-orange-500" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug">{evt.event}</p>
                  <span className="text-[10px] text-muted-foreground">{evt.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Vehicle-specific alerts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Alerts for {vehicle.id}</CardTitle>
              <IconShield className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            {vehicleAlerts.length > 0 ? vehicleAlerts.map((alert, i) => {
              const style = ALERT_STYLE[alert.severity];
              return (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/60 transition-colors"
                  style={{
                    animation: "var(--anim-fade-in)",
                    animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i})`,
                    animationFillMode: "both",
                  }}
                >
                  <IconAlertTriangle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${style.icon}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug">{alert.message}</p>
                    <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                  </div>
                </div>
              );
            }) : (
              <p className="text-xs text-muted-foreground px-2.5 py-4 text-center">No alerts for this vehicle</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Root with page transitions ─────────────────────────────────────────────

type FleetPage = "overview" | "detail" | "incidents";
type Phase = "idle" | "exiting" | "entering";

export function FleetOpsBlock() {
  const [activePage, setActivePage] = useState<FleetPage>("overview");
  const [displayPage, setDisplayPage] = useState<FleetPage>("overview");
  const [phase, setPhase] = useState<Phase>("idle");
  const [detailVehicleId, setDetailVehicleId] = useState<string>("AV-001");
  const pending = useRef<FleetPage>("overview");

  const navigate = (next: FleetPage) => {
    if (next === activePage || phase !== "idle") return;
    pending.current = next;
    setActivePage(next);
    setPhase("exiting");
  };

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return;
    if (phase === "exiting") {
      setDisplayPage(pending.current);
      setPhase("entering");
    } else if (phase === "entering") {
      setPhase("idle");
    }
  };

  const goToDetail = (vehicleId: string) => {
    setDetailVehicleId(vehicleId);
    navigate("detail");
  };

  const goToOverview   = () => navigate("overview");
  const goToIncidents  = () => navigate("incidents");

  return (
    <div className="min-h-full overflow-hidden">
      <div
        key={displayPage}
        style={{
          animation: phase === "exiting"
            ? "var(--anim-page-exit)"
            : phase === "entering"
              ? "var(--anim-page-enter)"
              : undefined,
        }}
        onAnimationEnd={handleAnimationEnd}
      >
        {displayPage === "overview"   && <FleetOverviewPage onSelectVehicle={goToDetail} onGoToIncidents={goToIncidents} />}
        {displayPage === "detail"     && <VehicleDetailPage vehicleId={detailVehicleId} onBack={goToOverview} />}
        {displayPage === "incidents"  && <IncidentReviewPage onBack={goToOverview} />}
      </div>
    </div>
  );
}
