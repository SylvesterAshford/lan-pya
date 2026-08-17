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
  deploymentLabel: string;
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
      deploymentLabel: "Live deployment URL",
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
      deploymentLabel: "Live deployment URL",
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
      deploymentLabel: "Public preview or campaign URL",
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
      deploymentLabel: "Public preview သို့မဟုတ် campaign URL",
      reflectionPlaceholder: "သင့် audience၊ message နှင့် publishing ရွေးချယ်မှုများအကြောင်း ဘာသင်ယူခဲ့သလဲ?",
      localNote: "ပြည်တွင်းအလုပ်ရှင်များသည် portfolio site ထက် Facebook page link ကို ပိုမေးလေ့ရှိသည်။ နှစ်ခုစလုံး ထည့်ပါ — page က ရောက်ရှိမှုကို၊ site က အရည်အသွေးကို သက်သေပြသည်။",
    },
  },
};

export function getMissionBrief(missionKey: string, locale: string): MissionBrief | null {
  const entry = BRIEFS[missionKey];
  if (!entry) return null;
  return locale === "my" ? entry.my : entry.en;
}
