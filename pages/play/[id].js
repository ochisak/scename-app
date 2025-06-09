import { useEffect, useState } from "react";
import { useRouter } from "next/router";

function parseStoryToScenes(story) {
  const blocks = story.split(/Scene \d+｜/).slice(1);
  const sceneTitles = [...story.matchAll(/Scene (\d+)｜([^\n]+)/g)].map(
    (match) => match[2].trim()
  );

  return blocks.map((block, index) => {
    const lines = block.trim().split("\n").filter(Boolean);

    const questionLine = lines.find((line) => line.trim().startsWith("Q"));
    const question = questionLine
      ? questionLine.replace(/^Q\d+\.\s*/, "").trim()
      : `質問${index + 1}`;

    const options = lines
      .filter((line) => /^[1-4]\.\s*/.test(line.trim()))
      .map((line) => line.replace(/^[1-4]\.\s*/, "").trim());

    const descriptionLines = lines.filter(
      (line) => !line.trim().startsWith("Q") && !/^[1-4]\.\s*/.test(line.trim())
    );
    const description = descriptionLines.join("\n");

    return {
      title: sceneTitles[index] || `シーン${index + 1}`,
      description,
      question,
      options,
    };
  });
}

export default function PlayPage({ id }) {
  const router = useRouter();

  const [scenario, setScenario] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [responderName, setResponderName] = useState("");
  const [responderAge, setResponderAge] = useState("");
  const [responderGender, setResponderGender] = useState("");
  const [submitting, setSubmitting] = useState(false);

  //（冒頭・import以降は以前と同じ）

  useEffect(() => {
  if (!id) return;

  fetch(`/api/load?id=${id}`)
    .then(async (res) => {
      const text = await res.text();

      // HTMLエラーや無効データを弾く
      if (!res.ok || text.startsWith("<!DOCTYPE")) {
        throw new Error(`無効な応答です（status: ${res.status}）`);
      }

      return JSON.parse(text);
    })
    .then((data) => {
      if (!data.story) {
        console.error("❌ data.story is missing:", data);
        setScenario(null);
        return;
      }

      const scenes = parseStoryToScenes(data.story);

      setScenario({
        title: data.title || "タイトルがありません（未入力）",
        story: data.story,
        readerName: data.nickname || "匿名さん",
        scenes,
      });
      setAnswers(Array(scenes.length).fill({ selected: null, free: "" }));
    })
    .catch((err) => {
      console.error("読み込みエラー:", err);
      setScenario(null);
    });
}, [id]);

  const handleOptionChange = (sceneIndex, optionIndex) => {
    const updated = [...answers];
    updated[sceneIndex] = {
      selected: updated[sceneIndex]?.selected === optionIndex ? null : optionIndex,
      free: "",
    };
    setAnswers(updated);
  };

  const handleFreeInput = (sceneIndex, value) => {
    const updated = [...answers];
    updated[sceneIndex] = { selected: null, free: value };
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    if (!scenario || !id) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: id,
          story: scenario.story,
          readerName: scenario.readerName,
          responses: answers,
          responderName,
          responderAge,
          responderGender,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.id) {
        console.error("診断保存レスポンス異常:", json);
        throw new Error("診断の生成・保存に失敗しました");
      }

      router.push(`/result/${json.id}`);
    } catch (err) {
      console.error("診断エラー:", err);
      alert("診断に失敗しました。もう一度お試しください。");
    }

    setSubmitting(false);
  };

  if (!scenario) return <p className="p-4">ストーリーを読み込み中...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 text-pink-700">
  {scenario.title !== "タイトルがありません（未入力）" ? scenario.title : "Untitled Story"}
</h1>
<p className="text-gray-600 mb-4">
  登場人物：{scenario.readerName} さん
</p>
<p className="mb-6 text-gray-800">
  これは「{scenario.readerName}」さんの恋愛シナリオです。
  <br />
  あなたはそのストーリーに登場し、各シーンで「どう返すか」を選びます。
  <br />
  フリーワードで答えると、独特な診断結果が得られます。
  <br />
  AIが最後に「この人を落とせるか」診断してくれます。
</p>


      <div className="mb-6">
        <p className="font-semibold mb-2">あなたの情報を教えてください</p>
        <input
          type="text"
          placeholder="ニックネーム"
          className="border p-2 w-full mb-2"
          value={responderName}
          onChange={(e) => setResponderName(e.target.value)}
        />
        <select
          value={responderAge}
          onChange={(e) => setResponderAge(e.target.value)}
          className="border p-2 w-full mb-2"
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
          value={responderGender}
          onChange={(e) => setResponderGender(e.target.value)}
          className="border p-2 w-full"
        >
          <option>性別を選択</option>
          <option>男性</option>
          <option>女性</option>
          <option>その他</option>
        </select>
      </div>

      {scenario.scenes.map((scene, index) => (
        <div key={index} className="mb-8 p-5 bg-white shadow rounded border">
          <p className="text-lg font-bold text-pink-700 mb-2">
            シーン {index + 1}｜{scene.title}
          </p>

          <p className="mb-3 whitespace-pre-line">{scene.description}</p>
          <p className="font-semibold mb-2">Q{index + 1}. {scene.question}</p>

          <p className="text-sm text-gray-500 mb-1">選択肢で答える</p>
          <div className="mb-2">
            {scene.options.map((opt, i) => (
              <label key={i} className="block cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={answers[index]?.selected === i}
                  onChange={() => handleOptionChange(index, i)}
                  disabled={answers[index]?.free}
                />
                {opt}
              </label>
            ))}
          </div>

          <p className="text-sm text-gray-500 mb-1">自由に答える（任意）</p>
          <input
            type="text"
            className="border mt-2 p-2 w-full rounded"
            placeholder="自由に答えてみる（フリーワード）"
            value={answers[index]?.free || ""}
            onChange={(e) => handleFreeInput(index, e.target.value)}
            disabled={answers[index]?.selected !== null && answers[index]?.selected !== undefined}
          />
        </div>
      ))}

      <button
        className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 rounded w-full mt-4 disabled:opacity-50"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? "診断中..." : "診断結果を見る"}
      </button>
      {submitting && (
  <div className="mt-4 flex items-center justify-center space-x-3 text-pink-600">
    <svg
      className="animate-spin h-5 w-5 text-pink-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      ></path>
    </svg>
    <span className="text-sm font-medium">診断を集計中です…AIが頑張っているのでしばらくお待ちください。</span>
  </div>
)}

    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  return {
    props: { id },
  };
}
