import { useId, type SVGProps } from "react";

type SvgProps = SVGProps<SVGSVGElement>;

const screen = { x: 34.82, y: 31.02, width: 1013.4, height: 581.98 };

function FlashMark() {
  return (
    <g fill="none" stroke="#f0f2ed" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.15">
      <path d="m2.4 12.8 4.3-7.2h6.9l-3 4.85H6.8l-1.55 2.35Z" />
      <path d="m11.1 12.8 2.9-4.85h3.2" />
    </g>
  );
}

function RailIcon({ kind, y, active = false }: { kind: "home" | "chat" | "folder" | "spark"; y: number; active?: boolean }) {
  const color = active ? "#e8ebe7" : "#a9afab";
  return (
    <g transform={`translate(42.15 ${y})`}>
      {active && <rect x="-2.82" y="-2.82" width="22.56" height="22.56" rx="1.1" fill="#2c2f2e" stroke="#5b615e" strokeWidth="0.7" />}
      {kind === "home" && <path d="m3 10.6 5.6-5.2 5.6 5.2v5H3Z" fill="none" stroke={color} strokeWidth="1.05" strokeLinejoin="round" />}
      {kind === "home" && <path d="M7.1 15.6v-3.8h3v3.8" fill="none" stroke={color} strokeWidth="0.9" />}
      {kind === "chat" && <path d="M3.2 5h10.8v8.1H8.1l-2.7 2v-2H3.2Z" fill="none" stroke={color} strokeWidth="1.05" strokeLinejoin="round" />}
      {kind === "chat" && <path d="M5.6 8.2h6M5.6 10.4h4.3" stroke={color} strokeWidth="0.9" strokeLinecap="round" />}
      {kind === "folder" && <path d="M2.7 6.2h4l1.5 1.8h6.6v7.1H2.7Z" fill="none" stroke={color} strokeWidth="1.05" strokeLinejoin="round" />}
      {kind === "spark" && <path d="m8.6 2.5 1.4 4.7 4.7 1.4-4.7 1.4-1.4 4.7-1.4-4.7-4.7-1.4 4.7-1.4Z" fill="none" stroke={color} strokeWidth="1" strokeLinejoin="round" />}
    </g>
  );
}

function TerminalSidebar() {
  return (
    <g aria-label="Flash terminal navigation">
      <rect x="34.82" y="31.02" width="31.02" height="581.98" fill="url(#terminal-sidebar)" />
      <rect x="65.1" y="31.02" width="0.75" height="581.98" fill="#2b2e2d" opacity="0.86" />
      <g transform="translate(42.15 65.42)">
        <rect width="16.92" height="16.92" rx="1.7" fill="#262a28" stroke="#4f5551" strokeWidth="0.78" />
        <g transform="translate(1.2 1)"><FlashMark /></g>
      </g>
      <RailIcon kind="home" y={133.65} active />
      <RailIcon kind="chat" y={157.54} />
      <RailIcon kind="folder" y={181.44} />
      <RailIcon kind="spark" y={205.33} />
      <path d="M42.15 238.55h16.92" stroke="#4c514f" strokeWidth="0.72" />
      <g transform="translate(46.66 263.93)" fill="none" stroke="#abb1ad" strokeWidth="0.9" strokeLinecap="round">
        <path d="M.8 1.2h5.2M.8 5.1h5.2M.8 9h5.2" />
        <path d="m1.2 16.4 2.85 2.85 2.85-2.85M4.05 13.7v5.3" />
      </g>
      <g transform="translate(39.33 565.07)">
        <rect width="22.56" height="24.25" rx="1.25" fill="#2a2d2c" stroke="#565c58" strokeWidth="0.78" />
        <circle cx="11.28" cy="10.1" r="3.2" fill="none" stroke="#d2d7d3" strokeWidth="0.9" />
        <path d="M5.9 20c.8-3.2 3.1-4.8 5.38-4.8 2.3 0 4.58 1.6 5.39 4.8" fill="none" stroke="#d2d7d3" strokeWidth="0.9" strokeLinecap="round" />
      </g>
    </g>
  );
}

function ResearchHeader() {
  return (
    <g aria-label="Research report header">
      <path d="M66 52.45h981.1M587 52.45h460.1" stroke="#e1e4e1" strokeWidth="0.75" />
      <g transform="translate(592 59)" fill="#3f4743" fontFamily="'QH UI', Arial, sans-serif">
        <text fontSize="4.45">+ Thought for 2.7s</text>
        <path d="m43.8-1.4 1.7 1.8 1.7-1.8" fill="none" stroke="#4f5653" strokeWidth="0.55" />
      </g>
      <text x="592" y="87.4" fill="#222928" fontFamily="Georgia, 'Times New Roman', serif" fontSize="17.6">Meridian Logistics plc</text>
      <text x="592" y="100.1" fill="#737b77" fontFamily="'QH UI', Arial, sans-serif" fontSize="6.45">Delivery &amp; fulfilment at national scale — initiating coverage at Overweight, PT ₹6,600</text>
      <g fontFamily="'QH UI', Arial, sans-serif" fontSize="5.55">
        <text x="592" y="113.15" fill="#79817d">Rating</text><text x="609" y="113.15" fill="#29312e" fontWeight="700">Overweight</text>
        <text x="652" y="113.15" fill="#79817d">Price target</text><text x="680" y="113.15" fill="#29312e" fontWeight="700">₹6,600</text>
        <text x="718" y="113.15" fill="#79817d">Mkt cap</text><text x="739" y="113.15" fill="#29312e" fontWeight="700">₹4.28bn</text>
        <text x="776" y="113.15" fill="#79817d">Rev (FY)</text><text x="797" y="113.15" fill="#29312e" fontWeight="700">₹1.26bn</text>
      </g>
      <g fontFamily="'QH UI', Arial, sans-serif" fontSize="5.4">
        <text x="939" y="81.6" fill="#7c8580">Ticker</text><text x="972" y="81.6" fill="#2d3531" fontWeight="700">MERL.NS · MERL LN</text>
        <text x="939" y="92.7" fill="#7c8580">HQ</text><text x="972" y="92.7" fill="#2d3531" fontWeight="700">Mumbai, India</text>
        <text x="939" y="103.8" fill="#7c8580">Price</text><text x="972" y="103.8" fill="#2d3531" fontWeight="700">₹5,123</text>
        <text x="939" y="114.9" fill="#7c8580">Segment</text><text x="972" y="114.9" fill="#2d3531" fontWeight="700">Integrated Logistics</text>
      </g>
      <path d="M592 125.2h426" stroke="#e0e3e0" strokeWidth="0.75" />
    </g>
  );
}

function PriceChart() {
  return (
    <g aria-label="Price chart" transform="translate(819 151)">
      <rect width="154" height="121" fill="#fbfbfa" stroke="#dfe2df" strokeWidth="0.75" />
      <path d="M0 30.25h154M0 60.5h154M0 90.75h154M30.8 0v121M61.6 0v121M92.4 0v121M123.2 0v121" fill="none" stroke="#eceeec" strokeWidth="0.65" />
      <g fill="#8d9590" fontFamily="'QH UI', Arial, sans-serif" fontSize="4.2"><text x="-10" y="4">$8</text><text x="-10" y="63">$6</text><text x="-10" y="121">$4</text></g>
      <path d="M6 98c10-15 14-37 25-27 9 8 15-39 27-27 10 10 15 16 24-10 8-28 20-20 30-7 10 14 21-29 35-21" fill="none" stroke="#7777e9" strokeWidth="1.65" />
      <path d="M6 108c11-8 18-15 29-10 12 4 20-8 29-17 13-14 19-1 29 4 10 6 19-13 28-8 8 4 14 18 25 12" fill="none" stroke="#a6acaa" strokeWidth="1.05" opacity="0.86" />
      <path d="M6 115h142" stroke="#dfe2df" strokeWidth="0.65" />
    </g>
  );
}

function ReportSummary() {
  return (
    <g aria-label="Executive summary">
      <text x="592" y="143.5" fill="#2b322f" fontFamily="Georgia, 'Times New Roman', serif" fontSize="8.2">Executive summary</text>
      <g fill="#444c48" fontFamily="'QH UI', Arial, sans-serif" fontSize="6.1">
        <text x="592" y="154.9">Our program for delivery partners lets agents sign up for both pick-up</text>
        <text x="592" y="162.7">and delivery services across India, and it has quickly become one of</text>
        <text x="592" y="170.5">the most flexible ways to earn on your own schedule. Whether you</text>
        <text x="592" y="178.3">ride a bike through a dense metro or drive a small van across a cluster</text>
      </g>
      <PriceChart />
      <g fill="#e3e6e3"><rect x="592" y="191" width="189" height="3.5" rx="1.75" /><rect x="592" y="201" width="215" height="3.5" rx="1.75" /><rect x="592" y="211" width="171" height="3.5" rx="1.75" /></g>
    </g>
  );
}

function ResearchComposer() {
  return (
    <g aria-label="Research prompt composer" transform="translate(210.21 301.14)">
      <rect width="266.18" height="52.45" rx="6.1" fill="#f7f8f7" stroke="#dfe3e0" strokeWidth="0.75" />
      <rect x="7.9" y="9.6" width="55.26" height="4.51" rx="2.25" fill="#dfe3e0" />
      <text x="24" y="24" fill="#56605a" fontFamily="'QH UI', Arial, sans-serif" fontSize="6.5">Research deeper. Understand faster.</text>
      <text x="24" y="32" fill="#56605a" fontFamily="'QH UI', Arial, sans-serif" fontSize="6.5">Start with a question.</text>
      <circle cx="14.2" cy="36" r="6.2" fill="#fff" stroke="#d4d9d5" strokeWidth="0.75" /><path d="M11.5 36h5.4M14.2 33.3v5.4" stroke="#67706a" strokeWidth="0.85" strokeLinecap="round" />
      <rect x="32.05" y="29.8" width="63.72" height="12.41" rx="6.2" fill="#fff" stroke="#d7dcd8" strokeWidth="0.75" /><text x="37.1" y="37.8" fill="#4a534e" fontFamily="'QH UI', Arial, sans-serif" fontSize="4.7">Dual Momentum Strategy</text>
      <rect x="245.3" y="29.8" width="11.84" height="12.41" rx="6.2" fill="#2a302d" /><path d="m249.1 35 3.55 3 1.6-1.8" fill="none" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function EventCard({ x, y, title, tone = "#f7f8f7" }: { x: number; y: number; title: string; tone?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="123.5" height="41.17" rx="2.2" fill={tone} stroke="#dfe3e0" strokeWidth="0.75" /><rect x="5.08" y="5.64" width="31.02" height="30.73" rx="1.4" fill="#d8ddd9" />
      <rect x="40.6" y="6.2" width="76.5" height="4.5" rx="2.2" fill="#68706c" opacity="0.72" /><text x="40.6" y="18.4" fill="#46504a" fontFamily="'QH UI', Arial, sans-serif" fontSize="4.55">{title}</text><rect x="40.6" y="28.2" width="59" height="3.9" rx="1.9" fill="#d9ddda" />
    </g>
  );
}

function TimelineLayers() {
  return (
    <g aria-label="Research timeline and event cards">
      <g transform="translate(118.28 429.1)">
        <rect width="123.5" height="153" fill="#fbfcfb" /><text x="0.6" y="7.4" fill="#5e6761" fontFamily="'QH UI', Arial, sans-serif" fontSize="5.65">2 Jun, 2026</text><path d="M2 14h120" stroke="#dde1de" strokeWidth="0.75" />
        <EventCard x={0} y={23} title="Why Adani is onboarding L&amp;T..." /><EventCard x={0} y={68} title="Zomato introduces low-plastic..." /><EventCard x={0} y={113} title="Paras Defence, BEL, HAL gain..." />
      </g>
      <g transform="translate(269.98 429.1)">
        <rect width="309.04" height="145.5" fill="#fbfcfb" /><path d="M0 6.2h309" stroke="#dde1de" strokeWidth="0.75" /><rect y="15.8" width="309.04" height="129.7" rx="2.5" fill="#f8f9f8" stroke="#dfe3e0" strokeWidth="0.8" /><rect x="6" y="21" width="182.7" height="119.55" rx="2" fill="#e6e9e6" />
        <path d="M7 112c26-13 42-43 67-30 31 15 39-44 68-25 19 12 24 25 43-5" fill="none" stroke="#7678e9" strokeWidth="1.3" /><text x="196.2" y="26" fill="#424b46" fontFamily="'QH UI', Arial, sans-serif" fontSize="5.5">Latest Post</text>
        <g transform="translate(196.2 35)" fill="#59625d" fontFamily="'QH UI', Arial, sans-serif" fontSize="4.45"><text y="0">₹34,500 Cr by FY30: 2 Stocks</text><text y="6">Moving Beyond Factory Sheds</text><text y="27">NCLT stays Subhash Chandra's</text><text y="33">repayment plan</text><text y="54">$100 bn and counting: FCNR</text><text y="60">inflows cross the century-mark</text></g>
      </g>
    </g>
  );
}

function WorkspacePreview({ clipId }: { clipId: string }) {
  return (
    <g clipPath={`url(#${clipId})`} aria-label="Flash research workspace">
      <rect x="65.84" y="31.02" width="982.38" height="581.98" fill="#fdfdfc" />
      <ResearchHeader /><ReportSummary /><ResearchComposer /><TimelineLayers />
    </g>
  );
}

function MonitorShell() {
  return (
    <g aria-hidden="true">
      <rect x="0.37" y="0.37" width="1081.26" height="867.16" rx="17.35" fill="url(#terminal-case)" stroke="#b9bdba" strokeWidth="1.55" />
      <rect x="2.06" y="2.26" width="1078.25" height="640.63" rx="15.1" fill="none" stroke="#3d4140" strokeWidth="1.1" />
      <rect x={screen.x} y={screen.y} width={screen.width} height={screen.height} rx="1.1" fill="#fcfcfb" /><path d="M34.82 613h1013.4" stroke="#242726" strokeWidth="5" />
      <path d="M435.36 644.58h213.17v205.84H435.36z" fill="url(#terminal-pedestal)" stroke="#b7bcba" strokeWidth="1.1" /><path d="M435.36 644.58h213.17v9.94H435.36z" fill="#333836" opacity="0.9" /><path d="M435.36 849.8h213.17" stroke="#c1c5c2" strokeWidth="1.1" /><path d="M435.36 852.67h213.17" stroke="#272b29" strokeWidth="5.64" /><path d="M456.22 858.3h171.45l13.68 8.4H442.54z" fill="#1b1e1d" stroke="#aeb4b1" strokeWidth="0.95" />
      <defs>
        <linearGradient id="terminal-case" x1="540" y1="0" x2="540" y2="868" gradientUnits="userSpaceOnUse"><stop stopColor="#1f2121" /><stop offset="0.56" stopColor="#161818" /><stop offset="1" stopColor="#1e2120" /></linearGradient>
        <linearGradient id="terminal-sidebar" x1="35" y1="31" x2="66" y2="613" gradientUnits="userSpaceOnUse"><stop stopColor="#222423" /><stop offset="1" stopColor="#191b1a" /></linearGradient>
        <linearGradient id="terminal-pedestal" x1="542" y1="645" x2="542" y2="850" gradientUnits="userSpaceOnUse"><stop stopColor="#252827" /><stop offset="1" stopColor="#161817" /></linearGradient>
      </defs>
    </g>
  );
}

/** SVG component tree reconstructed from Figma node 2017:15113 and its visible workspace layers. */
export default function FlashTerminalMonitor(props: SvgProps) {
  const clipId = `flash-terminal-screen-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 1082 868" role="img" aria-label="Flash research workspace preview" {...props}>
      <title>Flash research workspace preview</title>
      <defs><clipPath id={clipId}><rect x={screen.x} y={screen.y} width={screen.width} height={screen.height} rx="1.1" /></clipPath></defs>
      <MonitorShell />
      <WorkspacePreview clipId={clipId} />
      <g clipPath={`url(#${clipId})`}><TerminalSidebar /></g>
    </svg>
  );
}
