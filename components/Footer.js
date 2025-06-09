// src/components/Footer.js
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="text-sm text-gray-500 text-center py-6 border-t mt-12">
      <p>© 2025 ScenaMe. All rights reserved.</p>
      <p className="mt-2">
        <Link href="/terms" className="underline hover:text-pink-600">
          利用規約・免責事項
        </Link>
      </p>
    </footer>
  );
}
