import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow text-amber-700">404 · Không tìm thấy</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-950">Trang này đi lạc rồi</h1>
      <p className="mt-3 text-sm leading-6 text-stone-500">Liên kết có thể đã cũ hoặc bài viết đã được gỡ khỏi bảng tin.</p>
      <Link href="/" className="mt-6 rounded-2xl bg-stone-950 px-5 py-3 text-sm font-bold text-white hover:bg-stone-800">Về bảng tin</Link>
    </main>
  );
}
