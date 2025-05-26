import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const router = useRouter();
  const { id } = router.query;

  const [scenarioData, setScenarioData] = useState(null);
  const [responses, setResponses] = useState([]);
  const [responderInfo, setResponderInfo] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!id) return;

    const stored = localStorage.getItem(`scenario-${id}`);
    const resps = localStorage.getItem(`responses-${id}`);
    const responder = localStorage.getItem(`responderInfo-${id}`);
    const paidStatus = localStorage.getItem("paymentComplete") === "true";

    if (stored && resps && responder) {
      const parsedScenario = JSON.parse(stored);
      const parsedResponses = JSON.parse(resps);
      const parsedResponder = JSON.parse(responder);

      setScenarioData(parsedScenario);
      setResponses(parsedResponses);
      setResponderInfo(parsedResponder);
      setPaid(paidStatus);

      fetchDiagnosis(parsedScenario, parsedResponses, parsedResponder);
    } else {
      setLoading(false);
      setDiagnosis("診断に必要な情報が見つかりませんでした。最初からやり直してください。");
    }
  }, [id]);

  const fetchDiagnosis = async (scenarioData, responseData, responderData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story: scenarioData.story,
          readerName: scenarioData.readerName,
          responses: responseData,
          responderName: responderData?.responderName || "",
          responderAge: responderData?.responderAge || "",
          responderGender: responderData?.responderGender || "",
        }),
      });

      const data = await res.json();
      setDiagnosis(data.result || "診断の生成に失敗しました");
    } catch (err) {
      console.error("診断APIエラー", err);
      setDiagnosis("診断の生成に失敗しました");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(diagnosis);
    setCopied(true);
  };

  const handleStripeCheckout = async () => {
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      alert("決済ページの表示に失敗しました。");
    }
  };

  if (loading) {
    return (
      <p className="p-6 text-lg">
        診断を作成中...AIが頑張っています。少々お待ちください。
      </p>
    );
  }

  if (!scenarioData || !diagnosis) {
    return (
      <p className="p-6 text-red-600">
        診断データが見つかりません。URLや操作を確認してください。
      </p>
    );
  }

  const displayDiagnosis = diagnosis.replace(
    /🗣️\s*の返答：/g,
    `🗣️ ${responderInfo?.responderName || "あなた"}の返答：`
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-pink-600">
        🧠 攻略診断：{scenarioData.readerName}
        {responderInfo?.responderName && ` × ${responderInfo.responderName}`}
      </h1>

      {!paid && (
        <div className="bg-yellow-50 border border-yellow-300 p-4 rounded mb-6 text-center">
          <p className="mb-2 font-semibold text-gray-700">
            この診断にはAI生成のコストがかかっています。
          </p>
          <p className="mb-4 text-sm text-gray-600">
            内容が気に入ったら、100円で応援してください。
            <br />
            ご支援いただくと、診断結果の全体表示が無制限になります。
          </p>
          <button
            onClick={handleStripeCheckout}
            className="bg-yellow-500 text-white px-5 py-2 rounded hover:bg-yellow-600 transition"
          >
            100円でサポートする
          </button>
        </div>
      )}

      {paid && (
        <div className="bg-green-50 border border-green-300 p-4 rounded mb-6 text-center">
          <p className="text-green-700 font-semibold">
            ご支援ありがとうございます！診断の全内容をご覧いただけます 🙏
          </p>
        </div>
      )}

      <div className="bg-white whitespace-pre-wrap text-gray-800 border p-6 rounded-lg shadow mb-8 leading-relaxed">
  {displayDiagnosis}
</div>


      <div className="bg-blue-50 border rounded p-4">
        <p className="font-semibold mb-2 text-gray-700">
          これは {scenarioData.readerName} さんとの診断結果です！
          <br />コピーしてSNSでシェアしよう 📣
        </p>
        <textarea
          readOnly
          value={displayDiagnosis}
          className="border p-2 w-full h-60 mb-2 bg-white"
        />
        <button
          onClick={handleCopy}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          診断結果をコピーする
        </button>
        {copied && <p className="text-green-600 mt-2">コピーしました！</p>}
      </div>

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
