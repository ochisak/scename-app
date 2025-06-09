import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ResultPage({ id }) {
  const router = useRouter();
  const [diagnosisData, setDiagnosisData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchDiagnosis = async () => {
      try {
        const res = await fetch(`/api/get-diagnosis?id=${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data || typeof data.diagnosis !== "string") throw new Error("不正な診断データ");
        setDiagnosisData(data);
        setPaid(data.paid || false);
      } catch (err) {
        console.error("診断取得エラー:", err);
        setDiagnosisData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnosis();
  }, [id]);

  const handleCopy = () => {
    if (diagnosisData?.diagnosis) {
      navigator.clipboard.writeText(diagnosisData.diagnosis);
      setCopied(true);
    }
  };

  const handleStripeCheckout = async () => {
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnosisId: id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("決済ページの表示に失敗しました。");
    }
  };

  if (loading) return <p className="p-6 text-lg">診断を読み込み中...お待ちください。</p>;
  if (!diagnosisData || !diagnosisData.diagnosis)
    return <p className="p-6 text-red-600">診断が見つかりませんでした。URLを確認してください。</p>;

  const { responderName, readerName, diagnosis } = diagnosisData;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scename.vercel.app";
  const resultUrl = `${siteUrl}/result/${id}`;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-pink-600">
        🧠 攻略診断：{responderName || "あなた"} × {readerName}
      </h1>

      <p className="mb-6 text-gray-700 leading-relaxed">
        この診断は「{readerName}」さんの恋愛シナリオに沿って、あなたがどう振る舞ったかによって
        <strong>「どれだけ落とせたか？」</strong>をAIが判定した結果です。
        <br />
        回答から恋愛のクセや強み・弱みが見えるかも…？
        <br />
        気に入ったらSNSでシェアしてみよう！
      </p>

      <div className="bg-white whitespace-pre-wrap font-sans text-gray-800 border p-6 rounded-lg shadow mb-8 leading-relaxed">
        {diagnosis}
      </div>

      <div className="bg-blue-50 border rounded p-4 mb-8">
        <p className="font-semibold mb-2 text-gray-700">
          この診断結果を {readerName} さんにシェアしよう！
          <br />
          コピーしてSNSで送るのもOK 📣
        </p>
        <textarea
          readOnly
          value={diagnosis}
          className="border p-2 w-full h-60 mb-2 bg-white"
        />
        <button
          onClick={handleCopy}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          診断結果をコピーする
        </button>
        {copied && <p className="text-green-600 mt-2">コピーしました！</p>}

        <div className="mt-4 space-y-2">
          <p className="font-semibold text-gray-700">SNSで診断をシェアする 📢</p>
          <div className="flex space-x-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `【恋愛攻略診断】${readerName}さんを落とせる確率は？\n結果はこちら👇\n${resultUrl}\n#シナミー #ScenaMe`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Xでシェア
            </a>
            <a
              href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
                `${resultUrl}?text=${encodeURIComponent(
                  `【恋愛攻略診断】${readerName}さんに挑戦した診断結果はこちら👇`
                )}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              LINEで送る
            </a>
          </div>
        </div>
      </div>

      {!paid && (
        <div className="bg-yellow-50 border border-yellow-300 p-4 rounded mt-8 text-center">
          <p className="mb-2 font-semibold text-gray-700">
            AI診断シナミーを応援していただける方へ（任意）
          </p>
          <p className="mb-4 text-sm text-gray-600">
            100円（税込）で応援いただけます。
            <br />
            ※これは診断の対価ではなく、体験への満足に基づく任意の応援金です。
          </p>
          <button
            onClick={handleStripeCheckout}
            className="bg-yellow-500 text-white px-5 py-2 rounded hover:bg-yellow-600 transition"
          >
            シナミーを100円で応援する
          </button>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="mb-3 text-gray-700 font-semibold">
          あなたのストーリーも作成してみませんか？
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 transition"
        >
          シナリオを作成する
        </button>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  return { props: { id } };
}
