import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { lyric } = await req.json()

  // 1. 類似歌詞検索
  const { data } = await supabase.rpc("find_similar_lyric", { new_lyric: lyric })

  let canonical_id: string

  if (data && data.length > 0) {
    // 類似歌詞があればそれを使う
    canonical_id = data[0].canonical_id
  } else {
    // 新規 canonical 作成
    const { data: newCanonical, error } = await supabase
      .from("lyrics_canonical")
      .insert({ lyric, point: 0 })
      .select("*")

    if (!newCanonical || newCanonical.length === 0) {
      return NextResponse.json({ ok: false, error: "canonical作成失敗" })
    }

    canonical_id = newCanonical[0].id
  }

  // 2. raw テーブルに登録（if/else 外で安全に実行）
  await supabase.from("lyrics_raw").insert({ lyric, canonical_id })

  return NextResponse.json({ ok: true })
}
