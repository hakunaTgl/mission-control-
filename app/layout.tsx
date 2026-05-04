import "./globals.css";
import { Nav } from "@/components/Nav";
export default function RootLayout({children}:{children:React.ReactNode}){return <html><body><div className="wrap"><Nav/><main className="main">{children}</main></div></body></html>;}
