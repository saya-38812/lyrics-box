import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { lyric } = await req.json()

  // 1. 類似歌詞検索
  const { data } = await supabase.rpc("find_similar_lyric", { new_lyric: lyric })

  let canonical_id = null

  if(data && data.length > 0){
    canonical_id = data[0].canonical_id
  } else {
    // 2. 新規 canonical 作成
    const { data: newCanonical } = await supabase
      .from("lyrics_canonical")
      .insert({ lyric, point: 0 })
      .select("*")
    canonical_id = newCanonical[0].id
  }

  // 3. raw テーブルに登録
  await supabase.from("lyrics_raw").insert({ lyric, canonical_id })

  return NextResponse.json({ ok:true })
}
