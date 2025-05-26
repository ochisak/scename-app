// src/pages/play/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PlayPage() {
  const router = useRouter();
  const { id } = router.query;

  const [scenario, setScenario] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [responderName, setResponderName] = useState("");
  const [responderAge, setResponderAge] = useState("");
  const [responderGender, setResponderGender] = useState("");

  useEffect(() => {
    if (!id) return;
    const stored = localStorage.getItem(`scenario-${id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      const scenes = parsed.story.split(/Scene \d+｜/).slice(1).map((s, i) => {
        const [body, qBlock] = s.split(`Q${i + 1}.`);
        const [questionLine, ...rest] = qBlock?.trim().split("\n") || [];
        const options = rest
  .filter(line => /^\d+\./.test(line))
  .map(line => line.replace(/^\d+\.\s*/, "").replace(/^「|」$/g, ""))
  .filter(option => option !== "フリーワードで答える"); // ← この行を追加！
 
        return {
          full: s.trim(),
          description: body?.trim(),
          question: questionLine?.trim(),
          options,
        };
      });
      setScenario({ ...parsed, scenes });
      setAnswers(Array(scenes.length).fill({ selected: null, free: "" }));
    }
  }, [id]);

  const handleOptionChange = (sceneIndex, optionIndex) => {
    const updated = [...answers];
    updated[sceneIndex] = {
      selected: updated[sceneIndex]?.selected === optionIndex ? null : optionIndex,
      free: ""
    };
    setAnswers(updated);
  };

  const handleFreeInput = (sceneIndex, value) => {
    const updated = [...answers];
    updated[sceneIndex] = { selected: null, free: value };
    setAnswers(updated);
  };

  const handleSubmit = () => {
    if (!scenario || !id) return;

    const formattedResponses = answers.map((a, i) => {
      return a.free
        ? `フリーワード: ${a.free}`
        : a.selected !== null
        ? `選択肢: ${scenario.scenes[i].options[a.selected]}`
        : "未回答";
    });

    localStorage.setItem(`responses-${id}`, JSON.stringify(formattedResponses));
    localStorage.setItem(`responderInfo-${id}`, JSON.stringify({
      responderName,
      responderAge,
      responderGender,
    }));

    router.push(`/result/${id}`);
  };

  if (!scenario) return <p className="p-4">読み込み中...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-pink-700">
        これは {scenario.readerName} さんの恋愛ストーリー。
      </h1>
      <p className="mb-6 text-gray-800">
        あなたはこのストーリーの登場人物です。
        <br />
        各シーンで「選択肢」もしくは「フリーワード」でどう答えるか選びましょう。
        <br />
        最後にAIが「あなたはこの人を落とせるか」診断してくれます。
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
          <p className="mb-3 whitespace-pre-line">{scene.description}</p>
          <p className="font-semibold mb-2">Q{index + 1}. {scene.question}</p>

          <p className="text-sm font-medium text-gray-500 mb-1">
            選択肢で答える or フリーワードで答える
          </p>

          <div className="mb-2">
            {scene.options.map((opt, i) => (
              <label key={i} className="block cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={answers[index]?.selected === i}
                  onChange={() => handleOptionChange(index, i)}
                  disabled={answers[index]?.free !== ""}
                />
                {opt}
              </label>
            ))}
          </div>

          <div>
            <input
              type="text"
              className="border border-gray-300 mt-2 p-2 w-full rounded"
              placeholder="自由に答えてみる（フリーワード）"
              value={answers[index]?.free}
              onChange={(e) => handleFreeInput(index, e.target.value)}
              disabled={answers[index]?.selected !== null}
            />
          </div>
        </div>
      ))}

      <button
        className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 rounded w-full mt-4"
        onClick={handleSubmit}
      >
        診断結果を見る
      </button>
    </div>
  );
}
