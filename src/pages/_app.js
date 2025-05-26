// src/pages/_app.js
import "@/styles/globals.css";
import Layout from "@/components/Layout"; // ✅ default import

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
