export type Lang = "tr" | "en";

type Office = {
  id: string;
  name: string;
  owner: string;
  theme: string;
  team: string[];
  note: string;
};

type Kit = {
  id: string;
  name: string;
  desc: string;
  team: string[];
};

type Theme = {
  id: string;
  name: string;
  tagline: string;
  desc: string;
};

type Step = { tag: string; title: string; desc: string };
type RoleKit = { id: string; name: string; desc: string };
type Tech = { name: string; type: string };
type Item = { title: string; desc: string };

export type CopyShape = {
  nav: { version: string };
  hero: {
    headlineTop: string;
    headlineBottom: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    sceneCaption: string;
    sceneRoleChef: string;
    sceneRoleFrontend: string;
    sceneRoleDesigner: string;
    sceneRoleMarketer: string;
  };
  concept: { eyebrow: string; title: string; sub: string; steps: Step[] };
  chefRoles: {
    eyebrow: string;
    title: string;
    sub: string;
    chef: {
      name: string;
      role: string;
      desc: string;
      toolsTitle: string;
      tools: string[];
    };
    kitsTitle: string;
    kits: RoleKit[];
    customTitle: string;
    customDesc: string;
    customExample: string;
  };
  officeDesign: { eyebrow: string; title: string; sub: string; themes: Theme[]; hint: string };
  gallery: {
    eyebrow: string;
    title: string;
    sub: string;
    copyTeam: string;
    soon: string;
    offices: Office[];
  };
  world: { eyebrow: string; title: string; sub: string; teasers: Item[] };
  tech: {
    eyebrow: string;
    title: string;
    sub: string;
    techs: Tech[];
    philosophyTitle: string;
    philosophy: Item[];
  };
  waitlist: {
    eyebrow: string;
    title: string;
    sub: string;
    step: string;
    of: string;
    next: string;
    back: string;
    submit: string;
    stage1Title: string;
    stage1Hint: string;
    stage2Title: string;
    stage2Hint: string;
    stage3Title: string;
    stage3Hint: string;
    emailPlaceholder: string;
    kits: Kit[];
    successTitle: string;
    successLine1: string;
    successLine2: string;
    successQueue: string;
    buildAnother: string;
    errorEmail: string;
    errorGeneric: string;
  };
  footer: {
    tag: string;
    status: string;
    lines: string[];
    socials: string;
    backToPortfolio: string;
    copyright: string;
    langLabel: string;
  };
};

export const copy: Record<Lang, CopyShape> = {
  tr: {
    nav: {
      version: "> SYS.BOOT: MESAI v1.0 — CLOSED BETA",
    },
    hero: {
      headlineTop: "HER PROJENE",
      headlineBottom: "BİR AI OFİSİ",
      sub: "Chef'i ata. Ekibini topla. Ofisini tasarla. Başka ofisleri gez. Mesai, AI ajanlarını bir ofise yerleştirip projelerini yöneten yeni nesil çalışma alanı.",
      ctaPrimary: "Ofisini şimdiden tasarla",
      ctaSecondary: "Konsepti gör",
      sceneCaption: "// Canlı ofis önizlemesi",
      sceneRoleChef: "Chef",
      sceneRoleFrontend: "Frontend",
      sceneRoleDesigner: "Designer",
      sceneRoleMarketer: "Marketer",
    },
    concept: {
      eyebrow: "[ KONSEPT ]",
      title: "Yeni iş yapış şekli",
      sub: "Tek bir prompt'a sıkıştırılmış agent değil — kendi içinde organize, kendi içinde konuşan bir ofis.",
      steps: [
        {
          tag: "01",
          title: "Projeni getir",
          desc: "Brief, ClickUp linki, Telegram mesajı, sesli not. Girdi her şey olabilir.",
        },
        {
          tag: "02",
          title: "Chef atanır",
          desc: "Projeye uygun bir Chef devreye girer; tarifi okur, ekibi kafasında kurar.",
        },
        {
          tag: "03",
          title: "Ekibi topla",
          desc: "Hazır rol kitlerinden seç ya da kendi özel rollerini tanımla. Chef delege eder.",
        },
        {
          tag: "04",
          title: "Ofiste gör",
          desc: "Ekibinin pixel ofiste çalıştığını izle. İlerleme, maliyet ve çıktı şeffaf.",
        },
      ],
    },
    chefRoles: {
      eyebrow: "[ CHEF & ROLLER ]",
      title: "Bir Chef. Esnek bir ekip.",
      sub: "Her projeye atanan Chef ekibi yönetir. Sen hazır kit seçersin, gerekirse kendi rolünü tasarlarsın.",
      chef: {
        name: "CHEF",
        role: "Proje yöneticisi agent",
        desc: "Brief'i okur, görevleri parçalar, ekibi kurar, raporlar. Kritik kararlarda sana danışır.",
        toolsTitle: "Bağlı araçlar",
        tools: ["MCP", "Telegram", "ClickUp", "Terminal"],
      },
      kitsTitle: "Hazır rol kitleri",
      kits: [
        { id: "frontend", name: "Frontend Dev", desc: "UI, state, animasyon" },
        { id: "backend", name: "Backend Dev", desc: "API, DB, auth" },
        { id: "designer", name: "Designer", desc: "UI/UX, brand, asset" },
        { id: "pm", name: "PM", desc: "Plan, takip, paydaş" },
        { id: "marketer", name: "Marketer", desc: "Kopya, kampanya, SEO" },
        { id: "qa", name: "QA", desc: "Test, regresyon, kabul" },
        { id: "researcher", name: "Researcher", desc: "Pazar, kullanıcı, rakip" },
        { id: "support", name: "Support", desc: "Müşteri, e-posta, ticket" },
      ],
      customTitle: "+ Kendi rolünü tasarla",
      customDesc: "Prompt + araç seti = yeni rol. Niş işine özel ekip kur.",
      customExample: "Örn: \"Newsletter Editor — ton: Stratechery, araçlar: web, draft\"",
    },
    officeDesign: {
      eyebrow: "[ OFİSİNİ TASARLA ]",
      title: "Ofisin kim olduğunu yansıtır",
      sub: "Tema seç, mobilyayı yerleştir, ekibinin yerini ayarla. Pixel ofisin senin atölyen.",
      themes: [
        {
          id: "hacker",
          name: "Hacker Den",
          tagline: "// magenta · cyan · CRT",
          desc: "Karanlık, neon, terminal kokulu. Geç saatlerde shipping yapan dev için.",
        },
        {
          id: "cozy",
          name: "Cozy Studio",
          tagline: "// ahşap · bitki · lamba",
          desc: "Sıcak palet, bitkiler, abajurlar. Yavaş ve odaklı çalışmak için.",
        },
        {
          id: "openplan",
          name: "Open Plan",
          tagline: "// minimal · ferah · gri",
          desc: "Açık alan, beyaz duvarlar, sade mobilya. Net düşünmek isteyen ekipler için.",
        },
      ],
      hint: "Mobilya, layout, palet — hepsi pixel pixel senin.",
    },
    gallery: {
      eyebrow: "[ OFİSLERİ ZİYARET ET ]",
      title: "Başka ofislere uğra",
      sub: "Topluluk ofisleri açık. İyi giden ekipleri gez, ilham al, bir tıkla kendi projene kopyala.",
      copyTeam: "Bu ekibi kopyala",
      soon: "Yakında",
      offices: [
        {
          id: "solo-saas",
          name: "Solo SaaS Founder",
          owner: "@erica",
          theme: "hacker",
          team: ["Chef", "Frontend", "Marketer", "Support"],
          note: "Tek kişi, dört ajan, MRR peşinde.",
        },
        {
          id: "mobile-game",
          name: "Mobile Game Studio",
          owner: "@studio.owl",
          theme: "openplan",
          team: ["Chef", "Designer", "Designer", "Designer", "Backend", "Backend", "QA"],
          note: "Pixel oyunlar. Sprint başına 1 build.",
        },
        {
          id: "newsletter",
          name: "Indie Newsletter",
          owner: "@kerem.draft",
          theme: "cozy",
          team: ["Chef", "Researcher", "Editor*"],
          note: "Haftalık 3 yazı. Editor özel rol.",
        },
        {
          id: "agency-mvp",
          name: "AI Agency MVP",
          owner: "@deniz.studio",
          theme: "hacker",
          team: ["Chef", "Sales*", "Outreach*", "Onboarding*", "Retention*"],
          note: "4 özel rol. Müşteri yolculuğu uçtan uca.",
        },
        {
          id: "oss-lab",
          name: "Open Source Lab",
          owner: "@labs.zk",
          theme: "openplan",
          team: ["Chef", "Backend", "Backend", "Backend", "TechWriter*"],
          note: "PR'ları okur, issue triage eder.",
        },
        {
          id: "content-atelier",
          name: "Content Atelier",
          owner: "@atolye",
          theme: "cozy",
          team: ["Chef", "Designer", "Copywriter*", "VideoEditor*"],
          note: "Marka içerikleri, pazartesi servisi.",
        },
      ],
    },
    world: {
      eyebrow: "// VİZYON — YOL HARİTASI",
      title: "Hepsi bir dünyada",
      sub: "Mesai sadece senin ofisin değil. Bütün ofislerin bir arada bulunduğu, agent'ların gezdiği ve birbirine danıştığı yeni bir çalışma evreni.",
      teasers: [
        {
          title: "Komşu danışmanlığı",
          desc: "Senin agent'ın yan ofisteki uzmanına soru sorabilir.",
        },
        {
          title: "Ortak etkinlikler",
          desc: "Demo günleri, workshop'lar, topluluk sprintleri.",
        },
        {
          title: "Açık kapı saatleri",
          desc: "Belirli saatlerde ofisin ziyarete açık. Kim gelir, kim ne sorar?",
        },
      ],
    },
    tech: {
      eyebrow: "[ ALTYAPI ]",
      title: "Sistem bileşenleri",
      sub: "Mesai açık standartlar üzerine kurulu — terminal şeffaflığı, model çeşitliliği, yerel kontrol.",
      techs: [
        { name: "Next.js 15", type: "SYS_CORE" },
        { name: "PostgreSQL & Drizzle", type: "DB_MATRIX" },
        { name: "Claude Agent SDK", type: "AI_BRAIN" },
        { name: "XTTS v2 & Whisper", type: "VOICE_MOD" },
        { name: "Telegraf", type: "COMMS_LINK" },
        { name: "Tailwind CSS", type: "VISUAL_HUD" },
      ],
      philosophyTitle: "Felsefe",
      philosophy: [
        {
          title: "Maliyet kontrolü",
          desc: "Soft + hard cap. Otonomi cüzdanı boşaltmaz.",
        },
        {
          title: "MCP ile dürüst",
          desc: "Sistemle gerçek protokol üzerinden konuşur, fake'lemeyiz.",
        },
        {
          title: "Onay sınırları",
          desc: "Riskli aksiyon Telegram'dan onay ister. Karar senin.",
        },
        {
          title: "Açık kaynak ruhu",
          desc: "Çekirdek bileşenler şeffaf — değiştirilebilir, çatallanabilir.",
        },
      ],
    },
    waitlist: {
      eyebrow: "[ ERKEN ERİŞİM ]",
      title: "Ofisini şimdiden tasarla",
      sub: "Üç adımda ofisini hayal et, e-postanı bırak. İlk açılışta sıraya alınırsın.",
      step: "Adım",
      of: "/",
      next: "Devam",
      back: "Geri",
      submit: "Sıraya katıl",
      stage1Title: "Tema seç",
      stage1Hint: "Ofisinin havası nasıl olsun?",
      stage2Title: "Başlangıç ekibini seç",
      stage2Hint: "Hazır kitlerden biriyle başla — sonra istediğin gibi değiştirirsin.",
      stage3Title: "E-postanı bırak",
      stage3Hint: "Erken erişim + Founding Tenant rozeti.",
      emailPlaceholder: "sen@alanın.com",
      kits: [
        {
          id: "solo",
          name: "Solo Founder Kit",
          desc: "Chef + Frontend + Marketer + Support",
          team: ["Chef", "Frontend", "Marketer", "Support"],
        },
        {
          id: "indie-dev",
          name: "Indie Dev Kit",
          desc: "Chef + Frontend + Backend + QA",
          team: ["Chef", "Frontend", "Backend", "QA"],
        },
        {
          id: "agency",
          name: "Agency Kit",
          desc: "Chef + Designer + PM + Marketer",
          team: ["Chef", "Designer", "PM", "Marketer"],
        },
        {
          id: "researcher",
          name: "Researcher Kit",
          desc: "Chef + Researcher + Designer + PM",
          team: ["Chef", "Researcher", "Designer", "PM"],
        },
      ],
      successTitle: "Ofisin sıraya alındı.",
      successLine1: "Founding Tenant rozetin hazır.",
      successLine2: "İlk açılışta e-posta gelecek.",
      successQueue: "Sıra numaran",
      buildAnother: "Başka bir ofis tasarla",
      errorEmail: "Geçerli bir e-posta gerek.",
      errorGeneric: "Bir şey aksadı. Tekrar dene.",
    },
    footer: {
      tag: "MESAI OS v1.0",
      status: "CLOSED BETA INCOMING",
      lines: [
        "> AI ofislerinin orkestrasyon ağı.",
        "> Terminal beklemede...",
      ],
      socials: "Topluluk",
      backToPortfolio: "Atakan portföyüne dön",
      copyright: "© 2026 MESAI NETWORK",
      langLabel: "Dil",
    },
  },
  en: {
    nav: {
      version: "> SYS.BOOT: MESAI v1.0 — CLOSED BETA",
    },
    hero: {
      headlineTop: "AN AI OFFICE",
      headlineBottom: "FOR EVERY PROJECT",
      sub: "Assign a Chef. Build the team. Design the room. Visit other offices. Mesai is the new workplace where AI agents sit together and run your project.",
      ctaPrimary: "Design your office",
      ctaSecondary: "See the concept",
      sceneCaption: "// live office preview",
      sceneRoleChef: "Chef",
      sceneRoleFrontend: "Frontend",
      sceneRoleDesigner: "Designer",
      sceneRoleMarketer: "Marketer",
    },
    concept: {
      eyebrow: "[ CONCEPT ]",
      title: "A new way to work",
      sub: "Not a single agent stuffed into one prompt — a self-organising office that talks to itself.",
      steps: [
        {
          tag: "01",
          title: "Bring your project",
          desc: "A brief, a ClickUp link, a Telegram message, a voice note. Anything goes.",
        },
        {
          tag: "02",
          title: "A Chef is assigned",
          desc: "A Chef matched to your project shows up, reads the brief, builds the team in their head.",
        },
        {
          tag: "03",
          title: "Assemble the team",
          desc: "Pick from preset role kits or define your own. The Chef delegates.",
        },
        {
          tag: "04",
          title: "Watch the office",
          desc: "See the team work in your pixel office. Progress, cost and output stay transparent.",
        },
      ],
    },
    chefRoles: {
      eyebrow: "[ CHEF & ROLES ]",
      title: "One Chef. A flexible team.",
      sub: "Every project gets a Chef who runs the team. You pick a kit, or design your own role.",
      chef: {
        name: "CHEF",
        role: "Project manager agent",
        desc: "Reads the brief, breaks it down, builds the team, reports back. Asks you on critical calls.",
        toolsTitle: "Connected tools",
        tools: ["MCP", "Telegram", "ClickUp", "Terminal"],
      },
      kitsTitle: "Preset role kits",
      kits: [
        { id: "frontend", name: "Frontend Dev", desc: "UI, state, animation" },
        { id: "backend", name: "Backend Dev", desc: "API, DB, auth" },
        { id: "designer", name: "Designer", desc: "UI/UX, brand, assets" },
        { id: "pm", name: "PM", desc: "Plan, track, stakeholders" },
        { id: "marketer", name: "Marketer", desc: "Copy, campaigns, SEO" },
        { id: "qa", name: "QA", desc: "Tests, regression, accept" },
        { id: "researcher", name: "Researcher", desc: "Market, user, rivals" },
        { id: "support", name: "Support", desc: "Customers, mail, tickets" },
      ],
      customTitle: "+ Design your own role",
      customDesc: "Prompt + tool set = a new role. Build a team for your niche.",
      customExample: "e.g. \"Newsletter Editor — tone: Stratechery, tools: web, draft\"",
    },
    officeDesign: {
      eyebrow: "[ DESIGN YOUR OFFICE ]",
      title: "Your office reflects who you are",
      sub: "Pick a theme, place the furniture, seat the team. The pixel office is your studio.",
      themes: [
        {
          id: "hacker",
          name: "Hacker Den",
          tagline: "// magenta · cyan · CRT",
          desc: "Dark, neon, terminal-flavoured. For shipping at 3 AM.",
        },
        {
          id: "cozy",
          name: "Cozy Studio",
          tagline: "// wood · plants · lamps",
          desc: "Warm palette, plants, soft lights. For slow, focused work.",
        },
        {
          id: "openplan",
          name: "Open Plan",
          tagline: "// minimal · airy · grey",
          desc: "Open floor, white walls, plain furniture. For teams that want to think clearly.",
        },
      ],
      hint: "Furniture, layout, palette — every pixel is yours.",
    },
    gallery: {
      eyebrow: "[ VISIT OTHER OFFICES ]",
      title: "Drop into other offices",
      sub: "Community offices are open. Walk through good teams, get inspired, copy a setup with one click.",
      copyTeam: "Copy this team",
      soon: "Soon",
      offices: [
        {
          id: "solo-saas",
          name: "Solo SaaS Founder",
          owner: "@erica",
          theme: "hacker",
          team: ["Chef", "Frontend", "Marketer", "Support"],
          note: "One human, four agents, chasing MRR.",
        },
        {
          id: "mobile-game",
          name: "Mobile Game Studio",
          owner: "@studio.owl",
          theme: "openplan",
          team: ["Chef", "Designer", "Designer", "Designer", "Backend", "Backend", "QA"],
          note: "Pixel games. One build per sprint.",
        },
        {
          id: "newsletter",
          name: "Indie Newsletter",
          owner: "@kerem.draft",
          theme: "cozy",
          team: ["Chef", "Researcher", "Editor*"],
          note: "Three issues a week. Editor is custom.",
        },
        {
          id: "agency-mvp",
          name: "AI Agency MVP",
          owner: "@deniz.studio",
          theme: "hacker",
          team: ["Chef", "Sales*", "Outreach*", "Onboarding*", "Retention*"],
          note: "Four custom roles. End-to-end customer journey.",
        },
        {
          id: "oss-lab",
          name: "Open Source Lab",
          owner: "@labs.zk",
          theme: "openplan",
          team: ["Chef", "Backend", "Backend", "Backend", "TechWriter*"],
          note: "Reads PRs, triages issues.",
        },
        {
          id: "content-atelier",
          name: "Content Atelier",
          owner: "@atolye",
          theme: "cozy",
          team: ["Chef", "Designer", "Copywriter*", "VideoEditor*"],
          note: "Brand content, ships every Monday.",
        },
      ],
    },
    world: {
      eyebrow: "// VISION — ROADMAP",
      title: "All offices, one world",
      sub: "Mesai isn't just your office. It's a universe where every office sits next to others — agents wander, ask, learn.",
      teasers: [
        {
          title: "Neighbour consults",
          desc: "Your agent can ask the specialist next door.",
        },
        {
          title: "Shared events",
          desc: "Demo days, workshops, community sprints.",
        },
        {
          title: "Open hours",
          desc: "Your office opens up at scheduled times. Who drops by?",
        },
      ],
    },
    tech: {
      eyebrow: "[ STACK ]",
      title: "System components",
      sub: "Mesai is built on open standards — terminal transparency, model choice, local control.",
      techs: [
        { name: "Next.js 15", type: "SYS_CORE" },
        { name: "PostgreSQL & Drizzle", type: "DB_MATRIX" },
        { name: "Claude Agent SDK", type: "AI_BRAIN" },
        { name: "XTTS v2 & Whisper", type: "VOICE_MOD" },
        { name: "Telegraf", type: "COMMS_LINK" },
        { name: "Tailwind CSS", type: "VISUAL_HUD" },
      ],
      philosophyTitle: "Philosophy",
      philosophy: [
        {
          title: "Cost discipline",
          desc: "Soft + hard caps. Autonomy never drains the wallet.",
        },
        {
          title: "Honest with MCP",
          desc: "Talks to your system over a real protocol — no faking it.",
        },
        {
          title: "Approval lines",
          desc: "Risky actions ask for Telegram approval. The call is yours.",
        },
        {
          title: "Open-source spirit",
          desc: "Core pieces stay transparent — modifiable, forkable.",
        },
      ],
    },
    waitlist: {
      eyebrow: "[ EARLY ACCESS ]",
      title: "Design your office now",
      sub: "Three steps to picture your office, drop your email. We queue you for launch.",
      step: "Step",
      of: "/",
      next: "Next",
      back: "Back",
      submit: "Join the queue",
      stage1Title: "Pick a theme",
      stage1Hint: "What does your office feel like?",
      stage2Title: "Pick a starter team",
      stage2Hint: "Start with a kit — change anything later.",
      stage3Title: "Drop your email",
      stage3Hint: "Early access + Founding Tenant badge.",
      emailPlaceholder: "you@yourdomain.com",
      kits: [
        {
          id: "solo",
          name: "Solo Founder Kit",
          desc: "Chef + Frontend + Marketer + Support",
          team: ["Chef", "Frontend", "Marketer", "Support"],
        },
        {
          id: "indie-dev",
          name: "Indie Dev Kit",
          desc: "Chef + Frontend + Backend + QA",
          team: ["Chef", "Frontend", "Backend", "QA"],
        },
        {
          id: "agency",
          name: "Agency Kit",
          desc: "Chef + Designer + PM + Marketer",
          team: ["Chef", "Designer", "PM", "Marketer"],
        },
        {
          id: "researcher",
          name: "Researcher Kit",
          desc: "Chef + Researcher + Designer + PM",
          team: ["Chef", "Researcher", "Designer", "PM"],
        },
      ],
      successTitle: "Your office is queued.",
      successLine1: "Your Founding Tenant badge is ready.",
      successLine2: "We'll email you when doors open.",
      successQueue: "Queue position",
      buildAnother: "Design another office",
      errorEmail: "Need a valid email.",
      errorGeneric: "Something broke. Try again.",
    },
    footer: {
      tag: "MESAI OS v1.0",
      status: "CLOSED BETA INCOMING",
      lines: [
        "> Orchestration network for AI offices.",
        "> Terminal idle...",
      ],
      socials: "Community",
      backToPortfolio: "Back to Atakan's portfolio",
      copyright: "© 2026 MESAI NETWORK",
      langLabel: "Lang",
    },
  },
};
