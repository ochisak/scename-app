import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [answers, setAnswers] = useState(Array(10).fill([]));
  const [freeWords, setFreeWords] = useState(Array(10).fill(""));
  const [result, setResult] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return;
    setLoading(true);

    const mergedAnswers = answers.map((a, i) => [...a, freeWords[i]].filter(Boolean));

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, age, gender, answers: mergedAnswers }),
    });

    const data = await res.json();
    setResult(data.result || "エラーが発生しました");
    setLoading(false);

    const history = JSON.parse(localStorage.getItem("history") || "[]");
    history.unshift({ nickname, age, gender, timestamp: Date.now() });
    localStorage.setItem("history", JSON.stringify(history));
  };

  const handleShare = async () => {
    if (!result || !nickname) return;

    const id = uuidv4();

    // タイトル抽出（全角コロン対応・失敗時は処理中断）
    const match = result.match(/タイトル[:：](.+?)(\n|$)/);
    const title = match ? match[1].trim() : "";

    if (!title || title === "タイトル未取得") {
      alert("タイトルが見つかりませんでした。もう一度シナリオを生成してください。");
      return;
    }

    const storyData = {
      id,
      title,
      story: result,
      readerName: nickname,
      age,
      gender,
    };

    try {
      const res = await fetch("/api/save-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storyData),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const url = `${window.location.origin}/play/${id}`;
      setShareUrl(url);
      setCopied(false);
    } catch (err) {
      alert("URLの発行に失敗しました。もう一度お試しください。");
      console.error("保存エラー:", err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  };

  const handleCheckboxChange = (qIndex, option) => {
    const updated = [...answers];
    updated[qIndex] = updated[qIndex].includes(option)
      ? updated[qIndex].filter((v) => v !== option)
      : [...updated[qIndex], option];
    setAnswers(updated);
  };

  const questions = [
    {
      text: "Q1. 「この人ちょっと気になるかも」と思う瞬間は？",
      options: [
        "自分の話にちゃんと笑ってくれたとき",
        "さりげなく気づかいをしてくれたとき",
        "人への接し方に優しさがにじんでいたとき",
        "ふとした表情がタイプだったとき",
      ],
    },
    {
      text: "Q2. 相手にされてキュンとするのはどんな瞬間？",
      options: [
        "些細な変化にすぐ気づいてくれる",
        "軽く冗談を交えつつ距離を縮めてくる",
        "リードしてくれて安心感を与えてくれる",
        "言葉より行動で優しさを見せてくれる",
      ],
    },
    {
      text: "Q3. 初デートで「アリかも」と感じるのは？",
      options: [
        "居酒屋やバルでゆるく飲みトーク",
        "カフェでじっくり会話を楽しむ",
        "共通の趣味に付き合ってくれる",
        "ちゃんとプランを考えてくれてた",
      ],
    },
    {
      text: "Q4. LINEや通話でグッときたやり取りは？",
      options: [
        "気づかいのあるメッセージをくれた",
        "テンポよく会話が続いた",
        "くだらない話で笑わせてくれた",
        "不意に素直な気持ちを伝えてくれた",
      ],
    },
    {
      text: "Q5. 恋愛で「これは無理かも」と感じるのは？",
      options: [
        "上から目線で話してくる",
        "自分語りばかりで共感がない",
        "モテ自慢や過去の恋愛を話してくる",
        "すぐ他人と比較してくる",
      ],
    },
    {
      text: "Q6. 理想的な恋人との関係性は？",
      options: [
        "自然体でいられる空気感",
        "対等に尊重し合える関係",
        "ふざけ合えるけど支え合える",
        "安心感と刺激が両立してる",
      ],
    },
    {
      text: "Q7. 恋人関係の“始まり方”として理想なのは？",
      options: [
        "じっくり距離を縮めて自然に始まる",
        "ある日ふと、気持ちを言葉にされる",
        "はっきり告白してくれる",
        "曖昧な関係から進展していく",
      ],
    },
    {
      text: "Q8. 恋人にしてほしいこと／されたいことは？",
      options: [
        "感情の起伏に気づいて寄り添ってくれる",
        "趣味や好きなことに興味を持ってくれる",
        "疲れてるときにそっと気づかってくれる",
        "お互いの時間や距離感を大切にしてくれる",
      ],
    },
    {
      text: "Q9. あなたの恋愛スタイルに一番近いのは？",
      options: [
        "相手のペースに合わせるのが楽",
        "自分から積極的に動くタイプ",
        "距離を詰められると慎重になる",
        "つい感情が重くなりがち",
      ],
    },
    {
      text: "Q10. ストーリーの中で“どんな自分”を見せたい？",
      options: [
        "明るく見えて実は繊細なところ",
        "芯が強くて真っ直ぐな想い",
        "臆病だけど一歩踏み出したい姿勢",
        "ふざけつつも誠実な内面",
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">ScenaMe（シナミー）</h1>
      <p className="mb-4 text-gray-700">
        恋愛観にまつわる10の質問に答えると、あなたの“落とし方”ストーリーをAIが自動生成します。
        <br />生成されたシナリオはURLでシェアして、相手に回答してもらえます。
        <br />あなたの恋愛ストーリー、試してみませんか？
        <br />選択肢はいくつ選んでもOK、フリーワードでの回答も大歓迎です！
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="ニックネーム"
          className="border p-2 w-full mb-4"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <select
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="border p-2 w-full mb-4"
        >
          <option>年代を選択</option>
          <option>10代</option>
          <option>20代</option>
          <option>30代</option>
          <option>40代</option>
          <option>50代</option>
          <option>60代以上</option>
        </select>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="border p-2 w-full mb-4"
        >
          <option>性別を選択</option>
          <option>男性</option>
          <option>女性</option>
          <option>どちらでも</option>
        </select>

        {questions.map((q, i) => (
          <div key={i} className="mb-6">
            <p className="font-semibold mb-1">{q.text}</p>
            <p className="text-sm text-gray-600 mb-1">選択肢で回答する or フリーワードで回答する</p>
            <div className="mb-2">
              {q.options.map((opt) => (
                <label key={opt} className="block">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={answers[i].includes(opt)}
                    onChange={() => handleCheckboxChange(i, opt)}
                    disabled={freeWords[i] !== ""}
                  />
                  {opt}
                </label>
              ))}
            </div>
            <input
              type="text"
              className="border mt-2 p-1 w-full"
              placeholder="フリーワード（独自のストーリーが作られやすい）"
              value={freeWords[i]}
              onChange={(e) => {
                const updated = [...freeWords];
                updated[i] = e.target.value;
                setFreeWords(updated);
                if (e.target.value !== "") {
                  const cleared = [...answers];
                  cleared[i] = [];
                  setAnswers(cleared);
                }
              }}
              disabled={answers[i].length > 0}
            />
          </div>
        ))}

        <label className="block text-sm text-gray-700 mb-4">
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="mr-2"
          />
          利用規約に同意する（
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="underline text-blue-600 hover:text-blue-800"
          >
            内容を読む
          </button>
          ）
        </label>

        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading || !agreed}
        >
          {loading ? "シナリオ生成中..." : "シナリオ生成"}
        </button>
      </form>

      {loading && (
        <div className="flex flex-col items-center mt-6 text-blue-600">
          <svg className="animate-spin h-6 w-6 mb-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm font-medium">シナリオ生成中... 少々お待ちください</p>
        </div>
      )}

      {result && (
        <div className="mt-8 p-4 border rounded bg-gray-50 whitespace-pre-line">
          <h2 className="font-bold mb-2">生成されたシナリオ：</h2>
          <div className="mb-4">{result}</div>
          <div className="pt-4 border-t mt-6">
            <button onClick={handleShare} className="mt-4 px-4 py-2 bg-green-600 text-white rounded">
              URLを発行する
            </button>
          </div>
        </div>
      )}

      {shareUrl && (
        <div className="mt-4 p-4 bg-blue-50 border rounded">
          <p className="mb-2 font-semibold">このURLを、回答してほしい相手に送ってね：</p>
          <div className="flex items-center">
            <input type="text" value={shareUrl} readOnly className="border p-2 flex-1 mr-2" />
            <button onClick={handleCopy} className="bg-blue-600 text-white px-3 py-1 rounded">
              コピー
            </button>
          </div>
          {copied && <p className="text-green-600 mt-2">コピーしました！</p>}
        </div>
      )}

      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 rounded shadow-lg relative">
            <h1 className="text-2xl font-bold text-pink-600 mb-6">利用規約・免責事項</h1>
            <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">第1条（適用）</h2>
        <p>
          本利用規約は、ScenaMe（以下「本サービス」）が提供するAI恋愛診断サービスに関する一切の利用に適用されます。
          本サービスを利用した時点で、本規約に同意いただいたものとみなします。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">第2条（サービス内容）</h2>
        <p>
          本サービスは、生成AIを活用し、恋愛に関するシナリオや診断コンテンツを提供します。
          内容はあくまでフィクションであり、実在の人物・団体とは一切関係ありません。
          また、診断結果の正確性・有効性については一切保証しません。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">第3条（免責事項）</h2>
        <ul className="list-disc ml-6">
          <li>本サービスの利用により発生したいかなる損害に対しても、運営者は一切責任を負いません。</li>
          <li>生成された内容には、ユーザーにとって不適切または不快に感じる表現が含まれる可能性があります。</li>
          <li>予告なくサービス内容の変更・停止・終了を行うことがあります。</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">第4条（禁止事項）</h2>
        <p>以下の行為は禁止されています：</p>
        <ul className="list-disc ml-6">
          <li>他人の名前やプロフィールを無断で使用する行為</li>
          <li>生成された診断・コンテンツを無断転載・複製する行為</li>
          <li>商用利用・営利目的での不正利用</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">第5条（著作権）</h2>
        <p>
          本サービスで生成されたストーリーや診断結果の著作権は運営者に帰属します。
          個人のSNS等でのシェアは自由ですが、商用利用には事前の許可が必要です。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">第6条（利用料金と支払い）</h2>
        <p>
          本サービスの基本利用は無料です。ただし、サイト運営継続支援（100円〜）をお願いする場合があります。任意のものになりますので、強制ではありません。
          支払いには、Stripeを通じたクレジットカード決済が利用されます。決済処理はStripe社のセキュアなシステムを通じて行われ、当方ではカード情報を保持しません。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">第7条（プライバシーとデータ）</h2>
        <p>
          診断に使用されるニックネーム・性別・年代等の情報は、診断体験向上のために一時的にローカル保存されますが、サーバー上には保持しません。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">第8条（改定）</h2>
        <p>
          本規約は必要に応じて随時改定されます。重要な変更がある場合は、サイト上でお知らせいたします。
        </p>
      </section>

      <footer className="text-sm text-gray-500 mt-10">
        最終更新日：2025年5月25日
      </footer>
            <div className="text-right mt-8">
              <button onClick={() => setShowTermsModal(false)} className="text-blue-600 underline text-sm">
                ← 入力画面に戻る
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
