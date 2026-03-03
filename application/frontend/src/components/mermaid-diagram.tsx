"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useTheme } from "next-themes";
import mermaid from "mermaid";

const DARK_VARS = {
  darkMode: true,
  background: "transparent",
  primaryColor: "#3b82f6",
  primaryTextColor: "#e2e8f0",
  primaryBorderColor: "#3b82f680",
  lineColor: "#64748b",
  secondaryColor: "#6366f1",
  tertiaryColor: "#1e293b",
  nodeBorder: "#3b82f680",
  mainBkg: "#1e293b",
  clusterBkg: "#0f172a",
  clusterBorder: "#334155",
  titleColor: "#e2e8f0",
  edgeLabelBackground: "#0f172a",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  fontSize: "13px",
};

const LIGHT_VARS = {
  darkMode: false,
  background: "transparent",
  primaryColor: "#3b82f6",
  primaryTextColor: "#1e293b",
  primaryBorderColor: "#3b82f680",
  lineColor: "#94a3b8",
  secondaryColor: "#818cf8",
  tertiaryColor: "#f1f5f9",
  nodeBorder: "#3b82f680",
  mainBkg: "#f1f5f9",
  clusterBkg: "#f8fafc",
  clusterBorder: "#cbd5e1",
  titleColor: "#0f172a",
  edgeLabelBackground: "#f8fafc",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  fontSize: "13px",
};

const FLOW_OPTS = {
  htmlLabels: true,
  curve: "basis" as const,
  padding: 16,
  nodeSpacing: 40,
  rankSpacing: 50,
};

const FLOW_COLOR = "#3b82f6";
const ESCALATION_COLOR = "#f59e0b";

function enhanceSvgEdges(svgEl: SVGSVGElement, isDark: boolean) {
  // Process all edge paths
  const paths = svgEl.querySelectorAll<SVGPathElement>(".edge-pattern-dotted path, .flowchart-link, path.path, .edge path, [class*='flowchart-link']");
  const allPaths = paths.length > 0 ? paths : svgEl.querySelectorAll<SVGPathElement>("path[style], path[class]");

  allPaths.forEach((path, i) => {
    const style = path.getAttribute("style") || "";
    const strokeDash = path.getAttribute("stroke-dasharray") || "";
    const isDashed = strokeDash.length > 0 || style.includes("dash") || style.includes("dotted");

    const color = isDashed ? ESCALATION_COLOR : FLOW_COLOR;
    const opacity = isDark ? "0.7" : "0.6";

    // Color the edge
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-opacity", opacity);
    path.setAttribute("stroke-width", "2");

    // Add animated dot traveling along the path
    const pathLength = path.getTotalLength?.();
    if (pathLength && pathLength > 20) {
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("r", "2.5");
      dot.setAttribute("fill", color);
      dot.setAttribute("opacity", isDark ? "0.9" : "0.7");

      const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
      anim.setAttribute("dur", `${Math.max(2, pathLength / 80)}s`);
      anim.setAttribute("repeatCount", "indefinite");
      anim.setAttribute("begin", `${(i * 0.3) % 2}s`);

      const mpath = document.createElementNS("http://www.w3.org/2000/svg", "mpath");
      if (!path.id) path.id = `edge-path-${renderCounter}-${i}`;
      mpath.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${path.id}`);
      anim.appendChild(mpath);
      dot.appendChild(anim);

      path.parentNode?.appendChild(dot);
    }
  });

  // Color arrowhead markers
  svgEl.querySelectorAll("marker path, marker polygon").forEach((el) => {
    const marker = el.closest("marker");
    if (!marker) return;
    const refEdge = svgEl.querySelector(`[marker-end*="${marker.id}"]`) as SVGPathElement | null;
    const edgeStyle = refEdge?.getAttribute("stroke-dasharray") || refEdge?.getAttribute("style") || "";
    const isEsc = edgeStyle.includes("dash") || edgeStyle.length > 0 && refEdge?.getAttribute("stroke-dasharray");
    el.setAttribute("fill", isEsc ? ESCALATION_COLOR : FLOW_COLOR);
    el.setAttribute("stroke", isEsc ? ESCALATION_COLOR : FLOW_COLOR);
  });
}

let renderCounter = 0;

export function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const isDark = resolvedTheme === "dark";
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? "dark" : "default",
      themeVariables: isDark ? DARK_VARS : LIGHT_VARS,
      flowchart: FLOW_OPTS,
      sequence: { mirrorActors: false },
    });

    const id = `mermaid-${++renderCounter}`;
    let cancelled = false;

    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);

          const svgEl = containerRef.current.querySelector("svg");
          if (svgEl) {
            svgEl.style.maxWidth = "none";
            svgEl.style.height = "auto";
            enhanceSvgEdges(svgEl, isDark);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Failed to render diagram");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chart, resolvedTheme]);

  const zoomIn = useCallback(() => setScale((s) => Math.min(s + 0.25, 3)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(s - 0.25, 0.25)), []);
  const fitToView = useCallback(() => {
    const svgEl = containerRef.current?.querySelector("svg");
    const viewport = svgWrapRef.current;
    if (!svgEl || !viewport) {
      setScale(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    const svgRect = svgEl.getBoundingClientRect();
    const vpRect = viewport.getBoundingClientRect();
    const scaleX = (vpRect.width - 48) / (svgRect.width / scale);
    const scaleY = (vpRect.height - 48) / (svgRect.height / scale);
    const fitScale = Math.min(scaleX, scaleY, 1.5);
    setScale(Math.max(fitScale, 0.25));
    setPan({ x: 0, y: 0 });
  }, [scale]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((s) => Math.min(Math.max(s + delta, 0.25), 3));
    }
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    },
    [pan]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      setPan({
        x: dragStart.current.panX + (e.clientX - dragStart.current.x),
        y: dragStart.current.panY + (e.clientY - dragStart.current.y),
      });
    },
    [dragging]
  );

  const onMouseUp = useCallback(() => setDragging(false), []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-4 my-4">
        <p className="text-red-400 text-xs mb-2">Mermaid render error: {error}</p>
        <pre className="text-sm overflow-x-auto">
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-xl border border-border/50 bg-background/50 relative group">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={zoomIn}
          className="p-1.5 rounded-md bg-card/80 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={zoomOut}
          className="p-1.5 rounded-md bg-card/80 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={fitToView}
          className="p-1.5 rounded-md bg-card/80 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
          title="Fit to view"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Diagram viewport */}
      <div
        ref={svgWrapRef}
        className="overflow-hidden h-[500px] rounded-xl"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div
          ref={containerRef}
          className="flex justify-center items-start pt-6 min-h-full [&_svg]:h-auto"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "center top",
            transition: dragging ? "none" : "transform 0.15s ease-out",
          }}
        />
      </div>

      {/* Scale indicator */}
      <div className="absolute bottom-3 left-3 text-[10px] text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}
