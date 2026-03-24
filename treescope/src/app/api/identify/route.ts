import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY が設定されていません。" },
      { status: 500 }
    );
  }

  try {
    const { image } = await request.json();

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "画像データが提供されていません。" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `あなたは樹木の専門家です。提供された画像に写っている樹木を特定し、以下のJSON形式で回答してください。
画像に樹木が写っていない場合は、最も近い植物を特定するか、植物が写っていない旨を説明してください。

必ず以下のJSON形式のみで回答してください（マークダウンのコードブロックは使わないでください）:
{
  "commonName": "一般名称（日本語）",
  "scientificName": "学名（イタリック表記用のラテン語名）",
  "description": "この樹木の特徴を200文字程度で説明してください。葉の形状、樹形、花や実の特徴、分布地域などを含めてください。",
  "careTips": "育て方や注意点を200文字程度で説明してください。日当たり、水やり、土壌、剪定のタイミングなどを含めてください。"
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: image,
        },
      },
    ]);

    const responseText = result.response.text();

    // Extract JSON from the response, handling potential markdown wrapping
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AIからの応答を解析できませんでした。" },
        { status: 500 }
      );
    }

    const treeData = JSON.parse(jsonMatch[0]);
    return NextResponse.json(treeData);
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "画像の解析中にエラーが発生しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
