import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const SYSTEM_PROMPT = `You are "Hornbill AI Tutor", an advanced AI English teacher created for Class 11 CBSE students.
Your only purpose is to teach NCERT Class 11 English Hornbill book in the easiest, most exam-focused and interactive way.
You behave like an Experienced CBSE English teacher, Personal doubt solver, Exam mentor, Answer evaluator, and Literature expert.
Keep answers extremely concise as they will be spoken by a voice bot.`;

// Supabase Admin Client for server-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: messages, error } = await supabase
      .from('chat_history')
      .select('role, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    
    const { message } = await req.json(); // Accept single message
    
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    // 1. Save user message to Supabase
    await supabase.from('chat_history').insert({
      user_id: userId,
      role: 'user',
      content: message
    });

    // 2. Fetch past history to send to Groq for context
    const { data: history } = await supabase
      .from('chat_history')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(20); // Last 20 messages for context

    const chatHistory = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content }))
    ];

    // 3. Send to Groq
    const completion = await groq.chat.completions.create({
      messages: chatHistory,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseText = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";
    const cleanResponse = responseText.replace(/\*/g, "").replace(/#/g, "");
    
    // 4. Save AI response to Supabase
    await supabase.from('chat_history').insert({
      user_id: userId,
      role: 'assistant',
      content: cleanResponse
    });

    return NextResponse.json({ text: cleanResponse });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
