import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-walnut-950 text-stone-50 py-24 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <span className="font-serif text-3xl tracking-tight mb-6 block">Brew Haven</span>
          <p className="text-stone-400 text-sm max-w-[36ch] leading-relaxed mb-8">
            12/4 Heritage Lane, Oak District<br />
            Mumbai, Maharashtra 400001<br />
            +91 98765 43210
          </p>
          <div className="flex gap-3">
            <a href="#" aria-label="Instagram" className="size-10 rounded-full ring-1 ring-stone-50/20 grid place-items-center hover:bg-stone-50/10 transition-colors text-xs">
              IG
            </a>
            <a href="#" aria-label="Facebook" className="size-10 rounded-full ring-1 ring-stone-50/20 grid place-items-center hover:bg-stone-50/10 transition-colors text-xs">
              FB
            </a>
            <a href="#" aria-label="Twitter" className="size-10 rounded-full ring-1 ring-stone-50/20 grid place-items-center hover:bg-stone-50/10 transition-colors text-xs">
              X
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-brass-500 mb-6">Hours</h4>
          <div className="space-y-2 text-sm text-stone-400">
            <p className="flex justify-between gap-4"><span>Mon — Fri</span><span>08:00 — 22:00</span></p>
            <p className="flex justify-between gap-4"><span>Sat — Sun</span><span>09:00 — 23:00</span></p>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-brass-500 mb-6">Legal</h4>
          <div className="flex flex-col gap-3 text-sm text-stone-400">
            <Link to="/privacy" className="hover:text-stone-50">Privacy Policy</Link>
            <Link to="/refund" className="hover:text-stone-50">Refund Policy</Link>
            <Link to="/terms" className="hover:text-stone-50">Terms of Service</Link>
            <Link to="/disclaimer" className="hover:text-stone-50">Disclaimer</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-stone-50/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-stone-500">
        <span>© {new Date().getFullYear()} Brew Haven Café. All rights reserved.</span>
        <span>Secure payments via Razorpay (ready)</span>
      </div>
    </footer>
  );
}
