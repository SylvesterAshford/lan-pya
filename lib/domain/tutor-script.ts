import { getCareerTrack } from "@/lib/domain/career-tracks";

/**
 * Prepared tutor answers.
 *
 * Generated from the roadmap the learner is actually looking at, so the answers
 * stay true when the curriculum changes. Nothing here is invented about
 * employers, salaries, or outcomes: PRODUCT.md forbids inventing placement
 * claims, and a tutor is exactly where that temptation shows up.
 *
 * There is no model behind this. See DESIGN.md "The AI Tutor".
 */
export type TutorQA = { question: string; answer: string };

export function getTutorScript(trackKey: string, locale: string): TutorQA[] {
  const track = getCareerTrack(trackKey);
  const stages = track.milestones;
  const first = stages[0];
  const active = stages.find((stage) => stage.status === "active") ?? stages.find((stage) => stage.status === "next") ?? first;
  const my = locale === "my";

  if (!first) return [];

  const proofStage = stages.find((stage) => stage.proof) ?? first;

  if (my) {
    return [
      {
        question: "ဘယ်အဆင့်ကနေ စရမလဲ?",
        answer: `“${first.title}” မှ စပါ။ ${first.description} ခန့်မှန်းအချိန် ${first.estimate ?? "မိမိအချိန်ဖြင့်"}။ နောက်အဆင့်တိုင်းက ဤအခြေခံကို အသုံးပြုသည်။`,
      },
      {
        question: "ပထမဆုံး သက်သေကို ဘယ်လိုရမလဲ?",
        answer: `သင့်ပထမသက်သေမှာ “${proofStage.proof}” ဖြစ်သည်။ link တင်ပြပြီးနောက် အလိုအလျောက်စစ်ဆေးမှု လုပ်ဆောင်ကာ လူသားစိစစ်သူတစ်ဦးက စံနှုန်းနှင့် နှိုင်းယှဉ်ဖတ်ရှုသည်။ စိစစ်သူသာလျှင် အတည်ပြုနိုင်သည်။`,
      },
      {
        question: "ဖုန်းနဲ့ လုပ်လို့ရလား?",
        answer: "အစောပိုင်းအဆင့်များကို online editor ဖြင့် ဖုန်းတွင် လုပ်နိုင်သည်။ နောက်ပိုင်းအဆင့်များတွင် laptop ရှိလျှင် အလုပ်လွယ်ကူပြီး နောက်ဆုံးလက်ရာအတွက် laptop လိုအပ်ပါသည်။",
      },
      {
        question: "ယခု ဘာလုပ်သင့်သလဲ?",
        answer: `သင်သည် ယခု “${active.title}” တွင် ရှိသည်။ ${active.description} ဤအဆင့်၏ ရည်မှန်းသက်သေမှာ “${active.proof}” ဖြစ်သည်။`,
      },
    ];
  }

  return [
    {
      question: "Which milestone should I start with?",
      answer: `Start with “${first.title}”. ${first.description} Estimated pace is ${first.estimate ?? "self-paced"}, and everything after it assumes you have this.`,
    },
    {
      question: "How do I get my first proof?",
      answer: `Your first proof is “${proofStage.proof}”. You submit links to your work, an automated check runs against them, then a human reviewer reads it against the rubric. Only the reviewer can mark it verified — automated feedback never creates proof.`,
    },
    {
      question: "Can I do this on a phone?",
      answer: "The early stages work on a phone with an online editor. Later stages are much easier with a laptop, and the final capstone effectively needs one. Each path shows its device expectation in the catalog.",
    },
    {
      question: "What should I work on right now?",
      answer: `You are on “${active.title}”. ${active.description} The proof target for this stage is “${active.proof}”.`,
    },
  ];
}
