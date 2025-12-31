"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Lyric = {
  id: string
  lyric: string
  point?: number
}

export default function Home() {
  const [tab, setTab] = useState<"vote" | "post" | "ranking">("vote")
  const [text, setText] = useState("")
  const [randomLyrics, setRandomLyrics] = useState<Lyric[]>([])
  const [ranking, setRanking] = useState<Lyric[]>([])

  // ランダム5件取得
  const loadRandom = async () => {
    const { data } = await supabase.rpc("random_canonical")
    setRandomLyrics(data || [])
  }

  // 投稿
  const send = async () => {
    if (!text.trim()) return
  
    await fetch("/api/post", {
      method: "POST",
      body: JSON.stringify({ lyric: text })
    })
  
    setText("")
    setTab("vote")
    loadRandom()
  }
  

  // 投票
  const vote = async (id: string) => {
    const voted = JSON.parse(localStorage.getItem("voted") || "[]")
    if(voted.includes(id)){
      alert("この歌詞にはもう投票済みです")
      return
    }
  
    await fetch("/api/vote", {
      method: "POST",
      body: JSON.stringify({ id })
    })
  
    localStorage.setItem("voted", JSON.stringify([...voted, id]))
    loadRandom()
  }
  

  // ランキング取得
  const loadRanking = async () => {
    const { data } = await supabase
      .from("lyrics_canonical")
      .select("*")
      .order("point", { ascending: false })
      .limit(10)
    setRanking(data || [])
  }

  useEffect(() => { loadRandom() }, [])

  useEffect(() => {
    if(tab === "ranking") loadRanking()
  }, [tab])

  return (
    <main className="min-h-screen bg-[#FFFEF8] text-zinc-900 flex flex-col items-center px-6">
      
      {/* タブバー */}
      <div className="w-full max-w-md flex justify-around mt-8 mb-4 border-b border-[#F3EEDC]">
        <button
          onClick={() => setTab("vote")}
          className={`px-4 py-2 font-semibold ${tab==="vote" ? "border-b-2 border-[#F5D77A]" : ""}`}
        >
          投票
        </button>
        <button
          onClick={() => setTab("post")}
          className={`px-4 py-2 font-semibold ${tab==="post" ? "border-b-2 border-[#F5D77A]" : ""}`}
        >
          投稿
        </button>
        <button
          onClick={() => setTab("ranking")}
          className={`px-4 py-2 font-semibold ${tab==="ranking" ? "border-b-2 border-[#F5D77A]" : ""}`}
        >
          ランキング
        </button>
      </div>

      {/* 投票画面 */}
      {tab === "vote" && (
        <div className="w-full max-w-md space-y-3">
          <h2 className="text-xl font-semibold mb-2">今日いちばん刺さる歌詞は？</h2>
          {randomLyrics.map(l => (
            <button
              key={l.id}
              onClick={() => vote(l.id)}
              className="w-full text-left p-4 rounded-2xl border border-[#F3EEDC] hover:bg-[#FFF8D6] transition"
            >
              {l.lyric}
            </button>
          ))}
        </div>
      )}

      {/* 投稿画面 */}
      {tab === "post" && (
        <div className="w-full max-w-md mt-6">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="あなたの刺さったワンフレーズ"
            className="w-full p-3 rounded-xl border border-[#E7DFC8] focus:outline-none focus:ring-2 focus:ring-[#F5D77A]"
          />
          <button
            onClick={send}
            className="w-full mt-3 p-3 rounded-xl bg-[#F5D77A] text-zinc-900 font-semibold hover:brightness-95 transition"
          >
            投稿する
          </button>
        </div>
      )}

      {/* ランキング画面 */}
      {tab === "ranking" && (
        <div className="w-full max-w-md mt-4 space-y-2">
          <h2 className="text-xl font-semibold mb-2">ランキングTOP10</h2>
          {ranking.map((l,i) => (
            <div
              key={l.id}
              className="w-full p-3 rounded-xl border border-[#F3EEDC] bg-[#FFF8D6]"
            >
              <span className="font-bold mr-2">{i+1}位</span>
              {l.lyric} <span className="float-right font-semibold">{l.point}pt</span>
            </div>
          ))}
        </div>
      )}

    </main>
  )
}
