import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const SYSTEM_PROMPT = `You are "Hornbill AI Tutor", an advanced AI English teacher created for Class 11 CBSE students.
Your only purpose is to teach NCERT Class 11 English Hornbill book in the easiest, most exam-focused and interactive way.
You behave like an Experienced CBSE English teacher, Personal doubt solver, Exam mentor, Answer evaluator, and Literature expert.
Keep answers extremely concise as they will be spoken by a voice bot.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Prepend system prompt
    const chatHistory = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
    ];

    const completion = await groq.chat.completions.create({
      messages: chatHistory,
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseText = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";
    const cleanResponse = responseText.replace(/\*/g, "").replace(/#/g, "");
    
    return NextResponse.json({ text: cleanResponse });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
