"use client";

import { useMemo, useState, useEffect } from "react";

type EmojiGroups = Record<string, string[]>;

const DATA: EmojiGroups = {
  스마일: ["😀","😃","😄","😁","😆","😅","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😋","😛","😜","🤪","🤓","😎","🥳","😏","😞","😔","😕","🙁","☹️","😢","😭","😤","😠","😡","🤬","🤯","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔","🤭","🤫","😶","😐","😑","😬","🙄","😮‍💨","😮","😯","😲","😴","🤤","😪","😵","😵‍💫","🤐","🥱","🤧","🤒","🤕","🤢","🤮","🤠"],
  "사람/제스처": ["👍","👎","👊","✊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦵","🦶","👂","👃","🧠","🦷","🦴","👀","👁️","👅","👄","🫦","🫶","🫸","🫷","🫵","☝️","👆","👇","👈","👉","✌️","🤞","🤟","🤘","🤙","👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","🫰"],
  "동물/자연": ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🐜","🐞","🦋","🐌","🐢","🐍","🦎","🐙","🦑","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐊","🌸","🌼","🌻","🌹","🌷","🌺","🌴","🌳","🌲","🍀","🍁","🍂","🌈","☀️","⛅","☁️","🌧️","⛈️","❄️","🔥"],
  음식: ["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🌽","🥕","🥔","🧄","🧅","🍄","🥜","🍞","🥐","🥖","🥨","🧀","🥚","🍳","🥞","🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟","🍕","🥪","🌮","🌯","🥙","🍝","🍜","🍲","🍛","🍣","🍱","🍤","🍙","🍚","🍘","🍧","🍨","🍦","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🧋","☕"],
  활동: ["⚽","🏀","🏈","⚾","🎾","🏐","🎱","🏓","🏸","🥅","🏒","🏑","🏏","⛳","🏌️","🏇","🧘‍♀️","🧘‍♂️","🏊‍♀️","🏊‍♂️","🚴‍♀️","🚴‍♂️","🏋️‍♀️","🏋️‍♂️","🤸‍♀️","🤸‍♂️","🤼‍♂️","🤼‍♀️","🤺"],
  "여행/장소": ["🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🚚","🚛","🚜","🛴","🚲","🛵","🏍️","🚂","🚆","🚇","✈️","🛫","🛬","🚀","🛸","⛵","🚤","🛥️","🚢","⚓","🗺️","🗽","🗼","🏰","🏯","🏟️","🏠","🏡","🏢","🏬","⛩️","⛪","🕌","🕍","🌋","🗻","⛰️"],
  사물: ["⌚","📱","💻","⌨️","🖥️","🖨️","🖱️","💽","💾","📼","📷","📸","🎥","📹","🎬","📺","📻","⏱️","⏰","🔋","🔌","💡","🔦","🕯️","🧯","🛢️","🔧","🔨","⚙️","🧰","🧪","🧬","💊","💉","🩹","🩺","🚪","🪑","🛏️","🛋️","🚿","🛁","🚽","🧻","🧼","🪥"],
  기호: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","▶️","⏯️","⏸️","⏹️","⏺️","⏭️","⏮️","⏩","⏪","⬆️","⬇️","⬅️","➡️","↗️","↘️","↙️","↖️","🔁","🔂","#️⃣","*️⃣","0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","™️","®️","©️"],
  "돈/결제": ["💰","🤑","💴","💵","💶","💷","💸","💳","🏧","🧾","🏦","🧿","👛","👜","🧮","📥","📤"],
  "금융/지표": ["📈","📉","📊","💹","🧾","🧠","⚖️","🤝","🏦"],
  "비즈/오피스": ["🧾","📄","📑","📂","🗂️","🗃️","🗄️","📦","✉️","📧","📨","📩","📠","🖊️","🖋️","✒️","📝","📅","📆","📎","🖇️","📌","📍","📊","📈","📉"],
  "시간/달력": ["⏰","⏱️","⏲️","⌛","⏳","🗓️","📅","📆","🕐","🕑","🕒","🕓","🕔","🕕","🕖","🕗","🕘","🕙","🕚","🕛"],
  "쇼핑/배송": ["🛒","🛍️","🏷️","💳","🧾","📦","📫","📮","🚚","🚛","📦","🔖"],
  "보안/경고": ["🔒","🔓","🛡️","🧿","🚫","⛔","⚠️","❗","❕","❌","✅","🔐","🕵️"],
  교육: ["🎓","📚","📖","📝","🧑‍🏫","🏫","📎","📌","✏️","✒️","🧠","🔬","🧪"],
  "코딩/기술": ["🤖","🧑‍💻","💻","🖥️","⌨️","🖱️","🛠️","🧰","🧪","🧬","🧵","🧩","🛰️","📡","🔌","🔧","⚙️"],
  국기: ["🇰🇷","🇯🇵","🇺🇸","🇨🇳","🇬🇧","🇫🇷","🇩🇪","🇮🇹","🇪🇸","🇷🇺","🇧🇷","🇮🇳","🇨🇦","🇲🇽","🇦🇺","🇳🇿","🇸🇬","🇭🇰","🇵🇭","🇻🇳","🇹🇭","🇲🇾","🇹🇷","🇸🇦","🇦🇪","🇪🇺","🏳️","🏴","🏁","🚩"],
};

const KEYWORDS: Record<string, string[]> = {
  "😀": ["해피","웃음","스마일","grinning"],
  "😂": ["폭소","눈물","ㅋㅋ","joy"],
  "❤️": ["하트","사랑","러브","heart"],
  "👍": ["따봉","좋아요","승인","ok","thumbs up"],
  "✅": ["완료","체크","확인","승인","check"],
  "❗": ["느낌표","주의","경고","important","exclamation"],
  "⚠️": ["경고","주의","warning"],
  "📌": ["핀","고정","공지","pin"],
  "📣": ["공지","알림","공지사항","announcement","megaphone"],
  "🔔": ["알림","벨","notification","bell"],
  "🗓️": ["달력","일정","스케줄","calendar"],
  "⏰": ["알람","시간","시계","alarm","clock"],
  "📊": ["차트","그래프","지표","분석","chart"],
  "📈": ["상승","증가","성장","상향","uptrend"],
  "📉": ["하락","감소","하향","downtrend"],
  "💡": ["아이디어","힌트","전구","idea","light"],
  "🚀": ["런칭","출시","가속","부스트","launch","rocket"],
  "🔥": ["인기","핫","급상승","열정","hot","fire"],
  "✨": ["강조","반짝","업데이트","sparkles"],
  "📎": ["첨부","파일","attachment","paperclip"],
  "🔗": ["링크","연결","link"],
  "🏷️": ["태그","라벨","tag"],
  "📝": ["메모","노트","기록","note","memo"],
  "🧾": ["영수증","정산","증빙","receipt"],
  "💳": ["카드","결제","payment","card"],
  "💰": ["매출","수익","돈","budget","money"],
  "🛒": ["장바구니","구매","쇼핑","cart"],
  "🚚": ["배송","출고","택배","delivery","truck"],
  "🔒": ["보안","잠금","보호","secure","lock"],
  "🔓": ["해제","잠금해제","unlock"],
  "🛡️": ["보호","안전","보안","shield"],
  "🇰🇷": ["대한민국","한국","국기","태극기","korea","flag"],
  "🚗": ["자동차","차량","이동","car"],
  "🍕": ["피자","간식","야식","pizza"],
  "☕": ["커피","카페","휴식","coffee"],
  "🐶": ["강아지","개","dog"],
  "🐱": ["고양이","cat"],
  "🌸": ["벚꽃","꽃","spring","flower"],
  "✈️": ["비행기","출장","여행","항공","airplane"],
  "🏠": ["집","홈","대시보드","home","house"],
  "💻": ["노트북","개발","코딩","업무","laptop","computer"],
};

export default function EmojiCollectionPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<keyof typeof DATA>("스마일");
  const list = useMemo(() => {
    const base = DATA[cat] ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return base;
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");
    return base.filter((e) => {
    if (e.includes(term)) return true; // 이모지 직접 포함 검색
    const kws = KEYWORDS[e] ?? [];
    return kws.some((k) => norm(k).includes(norm(term)));
    });
  }, [q, cat]);

  // 복사 토스트
  const [toast, setToast] = useState<string>("");
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1200);
    return () => clearTimeout(t);
  }, [toast]);

  const copy = async (v: string) => {
    try {
      await navigator.clipboard.writeText(v);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = v; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); ta.remove();
    }
    setToast(`복사됨: ${v}`);
  };

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">이모지 모음</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          카테고리 선택 → 이모지 클릭 시 복사. 검색 지원.
        </p>
      </header>

      {/* 패널 */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 shadow-sm">
        {/* 상단: 검색 + 카운트 */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[220px] flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
            <input
              className="w-full bg-transparent outline-none text-sm"
              placeholder="검색: 스마일, 하트, 국기… 또는 이모지 붙여넣기"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="text-xs text-slate-500">{cat}: {list.length}개</div>
        </div>

        {/* 카테고리 칩 */}
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.keys(DATA).map((k) => (
            <button
              key={k}
              onClick={() => setCat(k as keyof typeof DATA)}
              className={[
                "px-3 py-2 rounded-full border text-xs",
                cat === k
                  ? "outline outline-2 outline-blue-300/60 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                  : "border-slate-200 dark:border-slate-700 text-slate-500",
                "bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800",
              ].join(" ")}
            >
              {k}
            </button>
          ))}
        </div>

        {/* 그리드 */}
        <div className="mt-3 grid gap-2 [grid-template-columns:repeat(10,minmax(52px,1fr))] max-[900px]:[grid-template-columns:repeat(8,minmax(48px,1fr))] max-[680px]:[grid-template-columns:repeat(6,minmax(44px,1fr))]">
          {list.map((e) => (
            <button
              key={e}
              onClick={() => copy(e)}
              aria-label={`이모지 ${e} 복사`}
              className="h-14 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-2xl hover:border-blue-400 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/20 transition"
            >
              {e}
            </button>
          ))}
        </div>

        {/* 툴바 */}
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>클릭하면 이모지가 클립보드에 복사됨</span>
          <span className="truncate max-w-[50%]">{q ? `필터: "${q}"` : ""}</span>
        </div>
      </div>

      {/* 토스트 */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 -translate-x-1/2 bottom-6 rounded-lg border border-slate-300/40 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 px-3 py-2 text-sm shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
