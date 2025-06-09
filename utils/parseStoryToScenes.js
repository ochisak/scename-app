export function parseStoryToScenes(story) {
  const sceneRegex = /Scene \d+｜[\s\S]*?(?=(?:Scene \d+｜|$))/g;
  const scenes = story.match(sceneRegex) || [];

  return scenes.map((block, index) => {
    const lines = block.trim().split("\n").filter(Boolean);

    const sceneTitle = lines[0] || `シーン${index + 1}`;

    // 柔軟にQ形式を拾う（例：Q1.／Qn.／Q:など）
    const questionLine = lines.find((line) =>
      /^Q(?:\d+|n|:)\.?/.test(line)
    );
    const question = questionLine
      ? questionLine.replace(/^Q(?:\d+|n|:)\.?\s*/, "").trim()
      : `質問${index + 1}`;

    const options = lines
      .filter((line) => /^[1-4]\.\s*/.test(line))
      .map((line) => line.replace(/^[1-4]\.\s*/, "").trim());

    const description = lines
      .filter(
        (line, i) =>
          i !== 0 &&
          !/^Q(?:\d+|n|:)\.?/.test(line) &&
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
