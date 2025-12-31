import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(req: Request){
  const { id } = await req.json()

  await supabase.rpc("vote_up", { lyric_id: id })

  return NextResponse.json({ ok:true })
}
