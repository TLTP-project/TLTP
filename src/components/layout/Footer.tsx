import Link from "next/link";
import { ShieldAlert, HeartHandshake } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200/80 bg-white/60 py-10 text-stone-600">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <Logo size="sm" showTagline={true} />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-stone-500">
            <Link href="/policies" className="hover:text-amber-700 transition-colors">
              Chính sách bảo mật
            </Link>
            <span>•</span>
            <Link href="/policies" className="hover:text-amber-700 transition-colors">
              Quy chuẩn nội dung
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-stone-400">
              <HeartHandshake className="h-3.5 w-3.5 text-amber-500" />
              Lắng nghe & Cải thiện
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/15 bg-amber-500/5 p-3.5 text-xs leading-relaxed text-stone-500">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span>
            <strong>Lưu ý:</strong> TLTP là diễn đàn phản hồi ẩn danh độc lập của cộng đồng trường học, không phải website chính thức và không đại diện cho nhà trường.
          </span>
        </div>
      </div>
    </footer>
  );
}
