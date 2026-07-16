import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-coffee.jpg";
import interiorImg from "@/assets/cafe-interior.jpg";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { formatINR } from "@/lib/format";
import { MapPin, Phone, Clock, Mail, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brew Haven Café — The Morning Ritual, Refined." },
      { name: "description", content: "Premium café in Mumbai offering artisan coffee, breakfast, pizza, pasta and desserts. Digital menu and secure table QR ordering." },
      { property: "og:title", content: "Brew Haven Café — The Morning Ritual, Refined." },
      { property: "og:description", content: "Elevated specialty coffee where architectural precision meets the warmth of a heritage hearth." },
    ],
  }),
  component: HomePage,
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.19, 1, 0.22, 1] as const },
};

function HomePage() {
  const { data: featured = [] } = useQuery({
    queryKey: ["featured-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("id, name, description, price, veg_type, category_id, is_popular, image_url")
        .eq("is_popular", true)
        .eq("availability", true)
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-stone-50 text-walnut-950">
      <SiteNav />

      {/* Hero */}
      <section className="relative py-20 md:py-28 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="md:w-3/5"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-6">Est. Mumbai · 2018</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif leading-none text-balance mb-8">
              The Morning Ritual, <span className="italic">Refined.</span>
            </h1>
            <p className="text-lg md:text-xl text-walnut-950/70 max-w-[42ch] leading-relaxed mb-10">
              An elevated specialty coffee experience where architectural precision meets the warmth of a heritage hearth.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/order" className="bg-walnut-950 text-stone-50 px-8 py-4 rounded-full text-sm font-medium hover:bg-walnut-900 transition-colors">
                Order Now
              </Link>
              <Link to="/reservations" className="px-8 py-4 rounded-full text-sm font-medium ring-1 ring-walnut-950/15 hover:ring-walnut-950/30 transition-all">
                Reserve a Table
              </Link>
              <Link to="/menu" className="px-8 py-4 rounded-full text-sm font-medium text-walnut-950/70 hover:text-walnut-950 transition-colors">
                View Menu →
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="md:w-2/5 w-full"
          >
            <img
              src={heroImg}
              alt="Latte art in a ceramic cup on a walnut table"
              width={1024}
              height={1280}
              className="w-full aspect-[4/5] object-cover rounded-lg ring-1 ring-walnut-950/5 shadow-2xl shadow-walnut-950/10"
            />
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-24 px-6 border-t border-walnut-950/5">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="flex items-end justify-between mb-14 flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-3">Featured</p>
              <h2 className="font-serif text-4xl md:text-5xl">Signatures of the House</h2>
            </div>
            <Link to="/menu" className="text-sm font-medium uppercase tracking-widest border-b border-walnut-950 pb-1 hover:text-brass-600 hover:border-brass-600 transition-colors">
              View full menu →
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {featured.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.19, 1, 0.22, 1] }}
                className="group"
              >
                <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-stone-200 via-stone-100 to-brass-300/30 mb-5 ring-1 ring-walnut-950/5 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full grid place-items-center">
                      <span className="font-serif text-6xl text-walnut-950/15 italic">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start mb-2 gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.veg_type === "veg" ? "bg-emerald-600" : "bg-red-600"}`} />
                    <h3 className="font-medium text-lg truncate">{item.name}</h3>
                  </div>
                  <span className="font-medium text-lg text-brass-600 shrink-0">{formatINR(item.price)}</span>
                </div>
                <p className="text-sm text-walnut-950/60 leading-normal">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="story" className="py-32 px-6 bg-walnut-950 text-stone-50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp}>
            <p className="text-xs uppercase tracking-[0.3em] text-brass-500 mb-6">Our Story</p>
            <h2 className="font-serif text-4xl md:text-6xl leading-tight mb-8">
              A café built on <span className="italic">quiet devotion</span>.
            </h2>
            <p className="text-stone-300 leading-relaxed mb-6 text-lg">
              Brew Haven began in 2018 in a tucked-away corner of Heritage Lane — a single La Marzocco, one antique walnut counter, and a devotion to the slow pour. Seven years later, we still roast in small batches, still bake our sourdough by hand, and still greet regulars by name.
            </p>
            <p className="text-stone-400 leading-relaxed">
              Head Barista Aditi Rao trained in Melbourne. Chef Ravi Menon studied under a Piedmont pastaia. Together they've built a menu where every dish begins with an ingredient we couldn't stop thinking about.
            </p>
          </motion.div>
          <motion.div {...fadeUp}>
            <img
              src={interiorImg}
              alt="Brew Haven café interior with warm brass lights and walnut counter"
              width={1440}
              height={900}
              loading="lazy"
              className="w-full aspect-[4/3] object-cover rounded-lg ring-1 ring-stone-50/10"
            />
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-3">Kind Words</p>
            <h2 className="font-serif text-4xl md:text-5xl">What our guests say</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { name: "Priya Sharma", role: "Regular since 2019", quote: "The only café in Mumbai where I've stopped asking for the wifi password. I just want to be present.", rating: 5 },
              { name: "Arjun Mehta", role: "Architect", quote: "Every detail — from the ceramic to the sourdough crumb — feels considered. It's my Sunday ritual.", rating: 5 },
              { name: "Kavya Iyer", role: "Food writer, Vogue India", quote: "Aditi's cortado is the finest in the city. I have travelled far to say that with certainty.", rating: 5 },
            ].map((t, i) => (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.19, 1, 0.22, 1] }}
                className="p-8 rounded-lg bg-stone-100/50 ring-1 ring-walnut-950/5"
              >
                <div className="flex gap-0.5 mb-5 text-brass-600">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="size-4 fill-current" />
                  ))}
                </div>
                <blockquote className="font-serif text-xl italic text-walnut-950 leading-snug mb-6">"{t.quote}"</blockquote>
                <figcaption>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-walnut-950/50 uppercase tracking-widest mt-1">{t.role}</div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-32 px-6 border-t border-walnut-950/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
          <motion.div {...fadeUp}>
            <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-6">Visit Us</p>
            <h2 className="font-serif text-4xl md:text-5xl mb-8">Come find us.</h2>
            <div className="space-y-5 text-walnut-950/80">
              <div className="flex gap-4 items-start">
                <MapPin className="size-5 text-brass-600 mt-1 shrink-0" />
                <p>12/4 Heritage Lane, Oak District<br />Mumbai, Maharashtra 400001</p>
              </div>
              <div className="flex gap-4 items-start">
                <Phone className="size-5 text-brass-600 mt-1 shrink-0" />
                <p>+91 98765 43210</p>
              </div>
              <div className="flex gap-4 items-start">
                <Mail className="size-5 text-brass-600 mt-1 shrink-0" />
                <p>hello@brewhaven.cafe</p>
              </div>
              <div className="flex gap-4 items-start">
                <Clock className="size-5 text-brass-600 mt-1 shrink-0" />
                <p>Mon — Fri · 08:00 — 22:00<br />Sat — Sun · 09:00 — 23:00</p>
              </div>
            </div>
          </motion.div>
          <motion.div {...fadeUp}>
            <iframe
              title="Brew Haven location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.4173706077555!2d72.8258!3d19.0759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0!2s0x0!5e0!3m2!1sen!2sin!4v1234567890"
              className="w-full aspect-[4/3] rounded-lg ring-1 ring-walnut-950/5"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>

      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
