import Link from "next/link";
import { ShieldAlert, HeartHandshake } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200/80 bg-stone-50/80 py-10 text-stone-600">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" showTagline={true} />

          <div className="flex items-center gap-4 text-xs font-medium text-stone-500">
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

        <div className="flex items-center gap-2.5 rounded-2xl bg-amber-500/5 border border-amber-500/10 p-3.5 text-xs text-stone-500">
          <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Lưu ý:</strong> TLTP là diễn đàn phản hồi ẩn danh độc lập của cộng đồng trường học, không phải website chính thức và không đại diện cho nhà trường.
          </span>
        </div>
      </div>
    </footer>
  );
}
