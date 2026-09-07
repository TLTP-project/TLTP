import Link from "next/link";
import { ShieldAlert, HeartHandshake } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-50 py-8 text-stone-600">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500">
            <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Lưu ý:</strong> TLTP là diễn đàn phản hồi ẩn danh độc lập của cộng đồng, không phải website chính thức và không đại diện cho nhà trường.
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/policies" className="hover:text-stone-900 transition-colors">
              Chính sách bảo mật
            </Link>
            <span>•</span>
            <Link href="/policies" className="hover:text-stone-900 transition-colors">
              Quy chuẩn nội dung
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1 text-stone-400">
              <HeartHandshake className="h-3.5 w-3.5" /> Lắng nghe & Cải thiện
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
