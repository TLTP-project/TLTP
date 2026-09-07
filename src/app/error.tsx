"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow text-rose-600">Có lỗi xảy ra</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-950">Trang chưa thể mở</h1>
      <p className="mt-3 text-sm leading-6 text-stone-500">Hệ thống gặp lỗi tạm thời. Bạn thử tải lại nhé.</p>
      <button type="button" onClick={() => reset()} className="mt-6 rounded-2xl bg-stone-950 px-5 py-3 text-sm font-bold text-white hover:bg-stone-800">
        Thử lại
      </button>
    </main>
  );
}
