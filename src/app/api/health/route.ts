import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'TeenBond (Liderzy Jutra)',
      version: '1.0.0',
      supabaseConfigured: isSupabaseConfigured(),
      demoModeAvailable: true,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
