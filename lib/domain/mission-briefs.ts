/**
 * Mission briefs, as data.
 *
 * The deliverables were previously hardcoded inside each mission page's JSX,
 * which meant the Build step could not show them as a checklist without
 * duplicating the copy. Weights come from the rubric the reviewer actually uses,
 * so a learner sees what their work is scored against before they start.
 */

export type Deliverable = {
  id: string;
  /** Rubric weight, shown so the learner knows what carries the score. */
  weight: string;
  title: string;
  hint: string;
};

export type MissionBrief = {
  missionKey: string;
  eyebrow: string;
  title: string;
  intro: string;
  premise: string;
  deliverables: Deliverable[];
  guardrailTitle: string;
  guardrail: string;
  /** Field labels for the Submit step. */
  repositoryLabel: string;
  /** One line under the label saying which link belongs here. */
  repositoryHint: string;
  deploymentLabel: string;
  deploymentHint: string;
  reflectionPlaceholder: string;
  localNote?: string;
};

const BRIEFS: Record<string, { en: MissionBrief; my: MissionBrief }> = {
  "responsive-profile-card": {
    en: {
      missionKey: "responsive-profile-card",
      eyebrow: "Stage 3 · Required proof",
      title: "Responsive Profile Card",
      intro: "Make a small interface withstand real constraints: content, keyboard navigation, and screens from 320px upward.",
      premise: "Create a profile card with a name, learning goal, current skills, and one clear action. Use only HTML and CSS for the core experience.",
      deliverables: [
        { id: "semantic", weight: "30%", title: "Semantic structure", hint: "Headings, lists, and controls convey meaning." },
        { id: "responsive", weight: "30%", title: "Responsive behaviour", hint: "No clipping or horizontal scroll at 320px." },
        { id: "accessible", weight: "25%", title: "Accessible interaction", hint: "Keyboard focus, contrast, and readable labels." },
        { id: "explanation", weight: "15%", title: "Explanation", hint: "Your reflection connects choices to outcomes." },
      ],
      guardrailTitle: "Ground-truth rule",
      guardrail: "A passing automated scan is never enough. A reviewer checks the rendered result and your explanation.",
      repositoryLabel: "GitHub repository URL",
      repositoryHint: "The repository with your HTML and CSS.",
      deploymentLabel: "Live deployment URL",
      deploymentHint: "Where the card runs, for example on Vercel or GitHub Pages.",
      reflectionPlaceholder: "What trade-off did you make, what broke, and how did you fix it?",
    },
    my: {
      missionKey: "responsive-profile-card",
      eyebrow: "အဆင့် ၃ · လိုအပ်သော သက်သေ",
      title: "Responsive Profile Card",
      intro: "သေးငယ်သော interface တစ်ခုကို content၊ keyboard navigation နှင့် 320px အထက် screen များတွင် မှန်ကန်စွာ လုပ်ဆောင်နိုင်အောင် တည်ဆောက်ပါ။",
      premise: "အမည်၊ သင်ယူရည်မှန်းချက်၊ လက်ရှိ skill များနှင့် ရှင်းလင်းသော action တစ်ခုပါသော profile card တည်ဆောက်ပါ။ Core experience အတွက် HTML နှင့် CSS ကိုသာ သုံးပါ။",
      deliverables: [
        { id: "semantic", weight: "၃၀%", title: "Semantic structure", hint: "Heading၊ list နှင့် control များက အဓိပ္ပာယ်ကို ရှင်းလင်းစွာ ဖော်ပြရမည်။" },
        { id: "responsive", weight: "၃၀%", title: "Responsive behaviour", hint: "320px တွင် clipping သို့မဟုတ် horizontal scroll မရှိရ။" },
        { id: "accessible", weight: "၂၅%", title: "အသုံးပြုရလွယ်ကူသော interaction", hint: "Keyboard focus၊ contrast နှင့် ဖတ်ရှုရလွယ်ကူသော label များပါရမည်။" },
        { id: "explanation", weight: "၁၅%", title: "ရှင်းလင်းချက်", hint: "Reflection က ရွေးချယ်မှုများနှင့် ရလဒ်များကို ချိတ်ဆက်ရမည်။" },
      ],
      guardrailTitle: "Ground-truth စည်းမျဉ်း",
      guardrail: "Automated scan အောင်မြင်ရုံဖြင့် မလုံလောက်ပါ။ Reviewer က render လုပ်ထားသော ရလဒ်နှင့် သင့်ရှင်းလင်းချက်ကို စစ်ဆေးမည်။",
      repositoryLabel: "GitHub repository URL",
      repositoryHint: "သင့် HTML နှင့် CSS ပါသော repository။",
      deploymentLabel: "Live deployment URL",
      deploymentHint: "Card ကို run ထားသောနေရာ၊ ဥပမာ Vercel သို့မဟုတ် GitHub Pages။",
      reflectionPlaceholder: "ဘာကို အလျှော့အတင်းလုပ်ခဲ့သလဲ၊ ဘာပျက်ခဲ့သလဲ၊ ဘယ်လိုပြင်ခဲ့သလဲ?",
    },
  },
  "content-creator-awareness": {
    en: {
      missionKey: "content-creator-awareness",
      eyebrow: "Controlled pilot · Mission 1",
      title: "Three-piece awareness campaign",
      intro: "Choose a real local problem, explain it clearly, and make three useful pieces of content for one specific audience.",
      premise: "This pilot is designed for a phone-first workflow. A script, a carousel, a short video, or a voice note all count. What matters is the audience, the clarity, and the evidence behind your choices.",
      deliverables: [
        { id: "audience", weight: "25%", title: "Audience and problem", hint: "Name who you are helping and what they need." },
        { id: "pieces", weight: "30%", title: "Three content pieces", hint: "Use at least two formats and keep one clear call to action." },
        { id: "safety", weight: "25%", title: "Accessibility and safety", hint: "Add captions or text alternatives and avoid unsupported claims." },
        { id: "reflection", weight: "20%", title: "Reflection", hint: "Explain what you changed after feedback or testing." },
      ],
      guardrailTitle: "Controlled-pilot note",
      guardrail: "This mission uses the same trusted-link submission and reviewer workflow as the technical path. The path is still a controlled pilot, so the curriculum stays intentionally small.",
      repositoryLabel: "Primary content or source URL",
      repositoryHint: "A folder or post holding your three pieces, such as Google Drive or Canva.",
      deploymentLabel: "Public preview or campaign URL",
      deploymentHint: "Where your audience sees it, such as a Facebook page or post.",
      reflectionPlaceholder: "What did you learn about your audience, message, and publishing choices?",
      localNote: "Local employers usually ask for a Facebook page link rather than a portfolio site. Include both: the page proves reach, the site proves craft.",
    },
    my: {
      missionKey: "content-creator-awareness",
      eyebrow: "ထိန်းချုပ်စမ်းသပ်အဆင့် · လုပ်ငန်း ၁",
      title: "Content သုံးပိုင်း အသိပညာပေး campaign",
      intro: "ဒေသတွင်း တကယ့်ပြဿနာတစ်ခု ရွေးပါ၊ ရှင်းလင်းစွာ ရှင်းပြပြီး သတ်မှတ်ထားသော audience တစ်ခုအတွက် အသုံးဝင်သည့် content သုံးပိုင်း ဖန်တီးပါ။",
      premise: "ဤ pilot ကို ဖုန်းဖြင့် စတင်နိုင်သော workflow အတွက် ဒီဇိုင်းလုပ်ထားသည်။ Script၊ carousel၊ short video သို့မဟုတ် voice note ကို သုံးနိုင်သည်။ အရေးကြီးသည်မှာ audience၊ ရှင်းလင်းမှုနှင့် ရွေးချယ်မှုနောက်က သက်သေဖြစ်သည်။",
      deliverables: [
        { id: "audience", weight: "၂၅%", title: "Audience နှင့် ပြဿနာ", hint: "သင်ကူညီမည့်သူနှင့် သူတို့လိုအပ်ချက်ကို ဖော်ပြပါ။" },
        { id: "pieces", weight: "၃၀%", title: "Content သုံးပိုင်း", hint: "Format နှစ်မျိုးထက်မနည်း သုံးပြီး ရှင်းလင်းသော call to action တစ်ခုထားပါ။" },
        { id: "safety", weight: "၂၅%", title: "Accessibility နှင့် လုံခြုံမှု", hint: "Caption သို့မဟုတ် text alternative ထည့်ပြီး သက်သေမရှိသော claim များကို ရှောင်ပါ။" },
        { id: "reflection", weight: "၂၀%", title: "ပြန်လည်သုံးသပ်ချက်", hint: "Feedback သို့မဟုတ် testing ပြီးနောက် ဘာပြောင်းလဲခဲ့သလဲ ရှင်းပြပါ။" },
      ],
      guardrailTitle: "Pilot မှတ်ချက်",
      guardrail: "ဤလုပ်ငန်းသည် technical path နည်းတူ trusted-link submission နှင့် reviewer workflow ကို သုံးသည်။ Path သည် controlled pilot ဖြစ်နေဆဲဖြစ်သောကြောင့် curriculum ကို ရည်ရွယ်ချက်ရှိရှိ တိုတောင်းစွာထားထားသည်။",
      repositoryLabel: "အဓိက content သို့မဟုတ် source URL",
      repositoryHint: "Content သုံးပိုင်းပါသော folder သို့မဟုတ် post၊ ဥပမာ Google Drive သို့မဟုတ် Canva။",
      deploymentLabel: "Public preview သို့မဟုတ် campaign URL",
      deploymentHint: "Audience မြင်ရသောနေရာ၊ ဥပမာ Facebook page သို့မဟုတ် post။",
      reflectionPlaceholder: "သင့် audience၊ message နှင့် publishing ရွေးချယ်မှုများအကြောင်း ဘာသင်ယူခဲ့သလဲ?",
      localNote: "ပြည်တွင်းအလုပ်ရှင်များသည် portfolio site ထက် Facebook page link ကို ပိုမေးလေ့ရှိသည်။ နှစ်ခုစလုံး ထည့်ပါ — page က ရောက်ရှိမှုကို၊ site က အရည်အသွေးကို သက်သေပြသည်။",
    },
  },
  "video-editor-vertical-story": {
    en: {
      missionKey: "video-editor-vertical-story",
      eyebrow: "Controlled pilot · Mission 1",
      title: "Thirty-second vertical story edit",
      intro: "Turn raw footage into a thirty-second vertical story someone would watch to the end: a clear hook, clean sound, licensed music and accurate captions.",
      premise: "Film your own clips on a phone or use footage you have permission to use. Edit in CapCut, DaVinci Resolve or any editor you have. What matters is the story, the sound and how carefully the edit is organised and delivered.",
      deliverables: [
        { id: "workflow", weight: "20%", title: "Organised project", hint: "Footage, music and exports in named folders; a 9:16 export at the right settings." },
        { id: "story", weight: "35%", title: "Story and pacing", hint: "A hook in the first three seconds, a clear beginning, middle and end, cuts on purpose." },
        { id: "sound_captions", weight: "25%", title: "Sound and captions", hint: "Clear dialogue, music you are allowed to use, and accurate, readable captions." },
        { id: "reflection", weight: "20%", title: "Reflection", hint: "Explain one edit you changed after watching it back, and why." },
      ],
      guardrailTitle: "Controlled-pilot note",
      guardrail: "This mission uses the same trusted-link submission and reviewer workflow as the other paths. A reviewer watches the edit itself. Credit every clip and track you did not make.",
      repositoryLabel: "Project folder or source URL",
      repositoryHint: "A shared folder with your footage, project file and music licences, such as Google Drive.",
      deploymentLabel: "Watchable video URL",
      deploymentHint: "Where the finished edit plays, such as YouTube (unlisted is fine), TikTok or Facebook.",
      reflectionPlaceholder: "Which cut did you change after watching it back, and what did it fix?",
      localNote: "Local clients often judge an editor by a short reel on Facebook or TikTok. A tight thirty-second edit with Burmese captions is exactly what they ask to see.",
    },
    my: {
      missionKey: "video-editor-vertical-story",
      eyebrow: "ထိန်းချုပ်စမ်းသပ်အဆင့် · လုပ်ငန်း ၁",
      title: "စက္ကန့်သုံးဆယ် ဒေါင်လိုက် story edit",
      intro: "ရိုက်ထားသော footage များကို အဆုံးထိ ကြည့်ချင်စရာ စက္ကန့်သုံးဆယ် ဒေါင်လိုက် story တစ်ခုအဖြစ် ပြောင်းပါ — ရှင်းလင်းသော hook၊ ကြည်လင်သော အသံ၊ ခွင့်ပြုချက်ရှိသော music နှင့် မှန်ကန်သော caption။",
      premise: "ဖုန်းဖြင့် ကိုယ်တိုင်ရိုက်ပါ သို့မဟုတ် သုံးခွင့်ရှိသော footage ကို သုံးပါ။ CapCut၊ DaVinci Resolve သို့မဟုတ် ရှိသည့် editor တစ်ခုခုဖြင့် edit လုပ်ပါ။ အရေးကြီးသည်မှာ story၊ အသံနှင့် edit ကို စနစ်တကျ စီစဉ်ပေးပို့ပုံ ဖြစ်သည်။",
      deliverables: [
        { id: "workflow", weight: "၂၀%", title: "စနစ်တကျ project", hint: "Footage၊ music နှင့် export များကို နာမည်ပါ folder များတွင် ထားပြီး 9:16 export ကို မှန်ကန်သော setting ဖြင့် ထုတ်ပါ။" },
        { id: "story", weight: "၃၅%", title: "Story နှင့် pacing", hint: "ပထမ သုံးစက္ကန့်အတွင်း hook၊ ရှင်းလင်းသော အစ အလယ် အဆုံးနှင့် ရည်ရွယ်ချက်ရှိသော cut များ။" },
        { id: "sound_captions", weight: "၂၅%", title: "အသံနှင့် caption", hint: "ကြည်လင်သော စကားသံ၊ သုံးခွင့်ရှိသော music နှင့် မှန်ကန်ဖတ်ရလွယ်သော caption။" },
        { id: "reflection", weight: "၂၀%", title: "ပြန်လည်သုံးသပ်ချက်", hint: "ပြန်ကြည့်ပြီးနောက် ပြောင်းခဲ့သော edit တစ်ခုနှင့် အကြောင်းရင်းကို ရှင်းပြပါ။" },
      ],
      guardrailTitle: "Pilot မှတ်ချက်",
      guardrail: "ဤလုပ်ငန်းသည် အခြားလမ်းကြောင်းများနည်းတူ trusted-link submission နှင့် reviewer workflow ကို သုံးသည်။ Reviewer က edit ကို ကိုယ်တိုင် ကြည့်မည်။ ကိုယ်တိုင်မဖန်တီးသော clip နှင့် track တိုင်းကို credit ပေးပါ။",
      repositoryLabel: "Project folder သို့မဟုတ် source URL",
      repositoryHint: "Footage၊ project file နှင့် music licence များပါသော shared folder၊ ဥပမာ Google Drive။",
      deploymentLabel: "ကြည့်နိုင်သော video URL",
      deploymentHint: "ပြီးဆုံးသော edit ကြည့်နိုင်သောနေရာ၊ ဥပမာ YouTube (unlisted ဖြစ်လည်းရ)၊ TikTok သို့မဟုတ် Facebook။",
      reflectionPlaceholder: "ပြန်ကြည့်ပြီးနောက် ဘယ် cut ကို ပြောင်းခဲ့သလဲ၊ ဘာကို ပြင်ပေးခဲ့သလဲ?",
      localNote: "ပြည်တွင်း client များသည် editor တစ်ယောက်ကို Facebook သို့မဟုတ် TikTok ပေါ်ရှိ reel တိုဖြင့် အကဲဖြတ်လေ့ရှိသည်။ မြန်မာ caption ပါသော စက္ကန့်သုံးဆယ် edit သည် သူတို့ကြည့်ချင်သည့်အရာ ဖြစ်သည်။",
    },
  },
};

export function getMissionBrief(missionKey: string, locale: string): MissionBrief | null {
  const entry = BRIEFS[missionKey];
  if (!entry) return null;
  return locale === "my" ? entry.my : entry.en;
}

/**
 * The rubric a reviewer scores is the deliverables list the learner ticked in
 * step 2. One list, so the two can never drift apart again.
 */
/**
 * Where each mission sits on its path. The map draws stages, and the mission
 * lists name missions; this is what lets a list row say "Stage 3" so it can be
 * matched to the stop it completed.
 */
const MISSION_STAGES: Record<string, { pathKey: string; stageKey: string }> = {
  "responsive-profile-card": { pathKey: "frontend-developer", stageKey: "responsive-css" },
  "content-creator-awareness": { pathKey: "content-creator", stageKey: "content-awareness-campaign" },
  "video-editor-vertical-story": { pathKey: "video-editor", stageKey: "video-editing-workflow" },
};

export function getMissionStage(missionKey: string | null | undefined) {
  return missionKey ? MISSION_STAGES[missionKey] ?? null : null;
}

/** The mission authored for a stage, if there is one yet. */
export function getStageMission(pathKey: string, stageKey: string) {
  return Object.entries(MISSION_STAGES).find(([, place]) => place.pathKey === pathKey && place.stageKey === stageKey)?.[0] ?? null;
}

/** What a verified core mission awards (record_review_decision). */
export const VERIFIED_MISSION_POINTS = 100;

export function getRubricIds(missionKey: string): string[] {
  return BRIEFS[missionKey]?.en.deliverables.map((item) => item.id) ?? [];
}
