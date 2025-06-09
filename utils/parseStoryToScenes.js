export function parseStoryToScenes(story) {
  const sceneRegex = /Scene \d+｜[\s\S]*?(?=(?:Scene \d+｜|$))/g;
  const scenes = story.match(sceneRegex) || [];

  return scenes.map((block, index) => {
    const lines = block.trim().split("\n").filter(Boolean);

    // 1行目をタイトルとして取得し、以降は description に含めない
    const sceneTitleMatch = lines[0];
    const sceneTitle = sceneTitleMatch || `シーン${index + 1}`;

    const questionLine = lines.find((line) => /^Q\d+\./.test(line));
    const question = questionLine
      ? questionLine.replace(/^Q\d+\.\s*/, "").trim()
      : `質問${index + 1}`;

    const options = lines
      .filter((line) => /^[1-4]\.\s*/.test(line))
      .map((line) => line.replace(/^[1-4]\.\s*/, "").trim());

    const description = lines
      .filter(
        (line, i) =>
          i !== 0 && // ← ここで1行目（タイトル）を除外
          !/^Q\d+\./.test(line) &&
          !/^[1-4]\.\s*/.test(line)
      )
      .join("\n");

    return {
      title: sceneTitle,
      description,
      question,
      options,
    };
  });
}
