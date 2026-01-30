
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  // Complex Text Tasks with Thinking Mode
  async deepReasoning(prompt: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text;
  },

  // Fast responses for simple tasks
  async quickAssistant(prompt: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-latest",
      contents: prompt
    });
    return response.text;
  },

  // Search Grounding for price checks
  async searchProductInfo(productName: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Quais os preços médios atuais e onde encontrar ${productName} no Brasil? Forneça links e informações atualizadas.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: response.text, links };
  },

  // Image Analysis
  async analyzeImage(base64Image: string, prompt: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      }
    });
    return response.text;
  },

  // Chatbot using Gemini 3 Pro
  async startChat() {
    const ai = getAI();
    return ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: 'Você é um assistente de compras inteligente e econômico. Ajude o usuário a economizar, planejar refeições e organizar sua lista.'
      }
    });
  },

  // Image Generation with Aspect Ratio
  async generateProductImage(prompt: string, aspectRatio: string = "1:1") {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: aspectRatio as any, imageSize: "1K" }
      }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  },

  // Image Editing using 2.5 Flash
  async editImage(base64Image: string, editPrompt: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: editPrompt }
        ]
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  },

  // Video Generation
  async generateVideo(prompt: string, isPortrait: boolean = false) {
    if (!await window.aistudio.hasSelectedApiKey()) {
      await window.aistudio.openSelectKey();
    }
    const ai = getAI();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: isPortrait ? '9:16' : '16:9'
      }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const finalResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    return finalResponse;
  },

  // TTS
  async textToSpeech(text: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }
};

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
