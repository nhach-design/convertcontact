import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function convertTextToTemplate(text: string): Promise<string> {
  const prompt = `You are an expert text analyzer and template generator.
Convert the following text into a reusable template using specific tags.

Rules for tags:
1. City / Country Names: Replace with [text:City1|City2|City3] (suggest realistic alternatives).
2. Random Words: 
   - Lowercase words -> [rndl_N] (where N is length)
   - Uppercase words -> [rndu_N]
   - Mixed words -> [rndlu_N]
3. Numbers: Replace based on length using [rndn_N]
4. Phone Numbers: Detect structure and convert into matching tag groups (e.g., [rndn_2]-[rndn_4]-[rndn_4]).
5. Building / Address Patterns: Keep keywords like "Street", "Building", "Office", "Avenue", "Road", etc. Only replace the variable parts (names, numbers).
6. Boundary tags: If a value repeats exactly in the text, you can use [bnd_ID:TAG] to reuse it. (e.g. [bnd_1:rndn_4]).

Input Text:
${text}

Output ONLY the converted template text. Do not include markdown formatting or explanations.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });

  return response.text || "";
}

export async function enhanceTemplate(template: string): Promise<string> {
  const prompt = `You are an expert template enhancer.
Enhance the following template to make it more globally reusable and improve randomness.
- Expand [text:...] options automatically (add more realistic cities, names, etc.).
- Ensure the template is robust.
- You can add boundary tags [bnd_ID:TAG] if it makes sense for consistency.

Template:
${template}

Output ONLY the enhanced template text. Do not include markdown formatting or explanations.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });

  return response.text || "";
}
