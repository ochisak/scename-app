// src/pages/thank-you.js
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ThankYouPage() {
  const router = useRouter();

  useEffect(() => {
    // ローカルストレージに支払い完了フラグをセット（制限解除用）
    localStorage.setItem("paymentComplete", "true");
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold text-pink-600 mb-6">
        ご支援ありがとうございます！
      </h1>

      <p className="text-lg text-gray-800 mb-4">
        これで診断結果の制限が解除されました。
        <br />
        あなたの支援が、このプロジェクトの継続を支えています。
      </p>

      <p className="text-sm text-gray-600 mb-10">
        ※ページを離れても支払い済みのフラグは維持されます
      </p>

      <div className="flex flex-col gap-4 items-center">
        <button
          onClick={() => router.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          診断結果に戻る
        </button>

        <button
          onClick={() => router.push("/")}
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded"
        >
          新しいシナリオを作成する
        </button>
      </div>
    </div>
  );
}
