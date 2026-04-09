import { NextResponse } from 'next/server';
import type { ChatRequest } from '../../types/chat';
import { handleChat } from '../../lib/chat/orchestrator';

export async function POST(request: Request) {
  const body = (await request.json()) as ChatRequest;
  const response = await handleChat(body);
  return NextResponse.json(response);
}
