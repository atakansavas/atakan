"use client";

import { motion } from "framer-motion";
import { useLang } from "./LangProvider";

export function Invite() {
  const { t } = useLang();

  return (
    <section className="relative py-28 sm:py-40">
      <div className="max-w-3xl mx-auto px-5 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="sanai-label text-clay mb-6"
        >
          {t.invite.eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="sanai-serif text-[clamp(2.2rem,6vw,4rem)] font-light leading-[1.02]"
        >
          {t.invite.title}
        </motion.h2>
        <p className="mt-6 text-lg text-dim leading-relaxed max-w-xl mx-auto">
          {t.invite.sub}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a href={`mailto:${t.invite.email}`} className="sanai-btn sanai-btn-primary">
            {t.invite.emailLabel} · {t.invite.email}
          </a>
        </div>
      </div>
    </section>
  );
}
