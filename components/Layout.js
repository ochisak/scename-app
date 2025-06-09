// src/components/Layout.js
import Footer from "./Footer"; // ← これが正しい

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
