import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SILHO Medicina Estética";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ background: "#0B1A33", color: "white", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px" }}><div style={{ color: "#C9A45C", fontSize: 28, letterSpacing: 8 }}>SILHO</div><div style={{ fontSize: 68, marginTop: 24 }}>Medicina estética diseñada alrededor de ti.</div><div style={{ color: "#E5CF95", fontSize: 24, marginTop: 30 }}>Tratamientos faciales, capilares y de rejuvenecimiento.</div></div>, size);
}
