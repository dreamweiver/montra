import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  // Simple redirect to the client-side dashboard page
  return NextResponse.redirect(new URL('/dashboard/client', requestUrl));
}