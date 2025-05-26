import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link"; // ✅ 利用規約へのリンク用

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
  const [agreed, setAgreed] = useState(false); // ✅ 同意チェック用

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return; // ✅ チェックされてなければ中止
    setLoading(true);

    const mergedAnswers = answers.map((a, i) =>
      [...a, freeWords[i]].filter(Boolean)
    );

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, age, gender, answers: mergedAnswers }),
    });

    const data = await res.json();
    setResult(data.result || "エラーが発生しました");
    setLoading(false);
  };

  const handleShare = () => {
    if (!result || !nickname) return;
    const id = uuidv4();
    const storyData = {
      story: result,
      readerName: nickname,
    };
    localStorage.setItem(`scenario-${id}`, JSON.stringify(storyData));
    const url = `${window.location.origin}/play/${id}`;
    setShareUrl(url);
    setCopied(false);
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
      text: "Q1. 「この人、ちょっと気になるかも」と思う瞬間は？",
      options: [
        "会話のテンポが合ったとき",
        "不意に優しさや気づかいを感じたとき",
        "他人への接し方に人柄がにじんでいたとき",
        "顔がタイプ",
      ],
    },
    {
      text: "Q2. 相手にされて“ちょっと惚れる”行動は？",
      options: [
        "変化や感情にすぐ気づいてくれる",
        "さりげなくリードしてくれる",
        "テンションに合わせてくれる",
        "席を譲ってくれる",
      ],
    },
    {
      text: "Q3. 初デートで『アリかも』と思うのは？",
      options: [
        "気取らず居酒屋やバルで話せる",
        "カフェでゆっくり話す",
        "趣味や好きな場所に合わせてくれたとき",
        "プランをちゃんと練ってくれてるとき",
      ],
    },
    {
      text: "Q4. LINEや通話で『ドキッとした』やり取りは？",
      options: [
        "体調や気持ちを気づかってくれた",
        "即レスが続いたとき",
        "ちょっとした冗談にツッコんでくれた",
        "不意に『会いたい』って言ってくれた",
      ],
    },
    {
      text: "Q5. 恋愛で『これは冷める…』と感じる言動は？",
      options: [
        "上から目線の話し方",
        "モテ自慢や恋愛経験アピール",
        "共感ゼロで自分の話しかしない",
        "すぐ他人と比べてくる",
      ],
    },
    {
      text: "Q6. 理想の関係性は？",
      options: [
        "気を遣わずにいられる空気感",
        "しっかり尊重し合える距離感",
        "冗談も真面目も自然に言える",
        "めちゃくちゃ信頼しあってる芸人コンビみたいな関係",
      ],
    },
    {
      text: "Q7. 理想の恋人関係の始まり方は？",
      options: [
        "告白されるのを待ちたい",
        "自然な流れで始まる関係",
        "ある日ちゃんと言葉にしてくれる",
        "ちょっと曖昧なまま始まるのもアリ",
      ],
    },
    {
      text: "Q8. 恋人にされたいこと／してほしいことは？",
      options: [
        "趣味に興味を持ってくれる",
        "忙しいときに労ってくれる",
        "感情の起伏があるとき寄り添ってくれる",
        "無理に踏み込まない距離感を守ってくれる",
      ],
    },
    {
      text: "Q9. 自分の恋愛スタイルは？",
      options: [
        "押されると弱い／相手主導が楽",
        "自分からグイグイいくタイプ",
        "距離を詰められすぎると引いてしまう",
        "実はちょっと重いタイプ",
      ],
    },
    {
      text: "Q10. このストーリーを読む人に“どんな自分”を知ってほしい？",
      options: [
        "明るく見えるけど意外と不器用なところ",
        "本気になると一直線なところ",
        "自信なさげに見えて実は芯があるところ",
        "恋には臆病だけど、ちゃんと向き合いたい気持ち",
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">ScenaMe（シナミー）</h1>
      <p className="mb-4 text-gray-700">
        恋愛観にまつわる10の質問に答えると、あなたの“落とし方”ストーリーをAIが自動生成します。
        <br />
        生成されたシナリオはURLでシェアして、相手に回答してもらえます。
        <br />
        あなたの恋愛ストーリー、試してみませんか？
        <br />
        選択肢はいくつ選んでもOK、フリーワードでの回答も大歓迎です！
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

        {/* ✅ 利用規約への同意 */}
        <label className="block text-sm text-gray-700 mb-4">
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="mr-2"
          />
          利用規約に同意する（
          <Link href="/terms" className="underline text-blue-600 hover:text-blue-800">内容を読む</Link>
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

      {result && (
        <div className="mt-8 p-4 border rounded bg-gray-50 whitespace-pre-line">
          <h2 className="font-bold mb-2">生成されたシナリオ：</h2>
          <div className="mb-4">{result}</div>
          <div className="pt-4 border-t mt-6">
            <button
              onClick={handleShare}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
            >
              URLを発行する
            </button>
          </div>
        </div>
      )}

      {shareUrl && (
        <div className="mt-4 p-4 bg-blue-50 border rounded">
          <p className="mb-2 font-semibold">このURLを、回答してほしい相手に送ってね：</p>
          <div className="flex items-center">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="border p-2 flex-1 mr-2"
            />
            <button
              onClick={handleCopy}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              コピー
            </button>
          </div>
          {copied && <p className="text-green-600 mt-2">コピーしました！</p>}
        </div>
      )}
    </div>
  );
}
