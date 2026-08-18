import type { Milestone, OpportunityCard } from "@/lib/domain/types";

export type AppLocale = "en" | "my";

const english = {
  brandTagline: "From Map to Proof",
  home: {
    greetingMorning: "Good morning, {name}",
    greetingAfternoon: "Good afternoon, {name}",
    greetingEvening: "Good evening, {name}",
    subtitle: "One focused step moves your path forward.",
    climb: {
      eyebrow: "Today's climb",
      continueMission: "Continue mission",
      stageOf: "Stage {a} of {b}",
      points: "points on verification",
      noMission: "No stage in progress",
      subtitle: "Pick the stage back up where you left it.",
    },
    momentum: {
      title: "Your momentum",
      summary: "{a} milestones complete · {b} proof in progress",
      learn: "Learn", learnBody: "Foundations",
      build: "Build", buildBody: "Skills in action",
      prove: "Prove", proveBody: "Show your proof",
      opportunity: "Opportunity", opportunityBody: "Get discovered",
    },
    week: {
      title: "This week",
      body: "Deadlines and work waiting for you.",
      closingTitle: "Closing soon",
      pausedTitle: "Paused work",
      empty: "Nothing closes this week, and nothing is paused.",
      viewAll: "View all opportunities",
      resume: "Resume",
    },
    proof: {
      title: "Proof growing",
      viewProof: "View proof",
      points: "Points",
      body: "Keep collecting verified evidence.",
      empty: "No verified competencies yet.",
    },
    signal: {
      title: "Opportunity signal",
      viewAll: "View all opportunities",
      supportedSkills: "Supported skills",
      none: "None recorded yet",
      empty: "No opportunities published yet.",
    },
    note: "Lan Pya shows evidence, gaps, and sources — never a fake match score.",
  },
  today: {
    welcome: "Welcome", emptyTitle: "Find one direction that fits.", emptyBody: "Career Compass will suggest an available path and show your first proof-producing mission.", openCompass: "Open Career Compass",
    title: "Keep your direction visible.", body: "One path, one concrete mission, and proof you can carry forward.", activePath: "Active path", viewPath: "View path", level: "Level", xpOnPath: "XP on this path",
    nextMission: "Next mission", openBuild: "Open Build", portfolioEvidence: "Portfolio evidence", humanReview: "Human review", xpAfterVerification: "+100 XP after verification",
    contentMission: "Create one clear outcome for a real audience, then submit your evidence when ready.", frontendMission: "Build a responsive, accessible interface and explain the choices behind it.",
    happensNext: "What happens next", proofTitle: "Work becomes trusted proof.", viewPortfolio: "View Portfolio", build: "Build", buildDetail: "Finish one clear deliverable.", submit: "Submit", submitDetail: "Keep a private snapshot of your work.", review: "Review", reviewDetail: "Receive evidence-linked feedback.", prove: "Prove", proveDetail: "Share verified proof only when you choose.",
  },
  paths: {
    direction: "Your direction", emptyTitle: "Start with a few small choices.", emptyBody: "Career Compass suggests one path you can actually start, then keeps the full career catalog available when you are curious.", findPath: "Find my path",
    title: "One active path. A clear next move.", body: "Explore without getting lost. Your active path shapes Build; every other career stays a considered alternative or a preview.", activePath: "Active path", complete: "complete", xpOnPath: "XP on this path", pilot: "Controlled pilot", ready: "Ready to build", viewRoadmap: "View skill roadmap", continueBuild: "Continue Build",
    alternatives: "Alternatives for you", alternativesTitle: "Only two options, with a reason.", alternativesTitleOne: "One other option, with a reason.", yourPath: "Your path", noMissionsYet: "No missions yet", stages: "stages", showPreviews: "Show {n} preview paths", hidePreviews: "Hide preview paths", browsePaths: "Browse all paths", stepOf: "Step {a} of {b}", editCompass: "Edit my Career Compass", firstMission: "First mission", choosePath: "Choose this path", onlyAvailable: "Your current path is the only operational option right now. You can still explore upcoming careers below.",
    exploreAll: "Explore all digital careers", catalogBody: "Browse by arena. Preview paths cannot become active until their first real mission opens.", paths: "paths", preview: "Preview", available: "Available", confirmTitle: "Confirm path change", confirmBody: "Your current progress will stay saved. This path will shape your next mission.", confirm: "Confirm path", cancel: "Cancel", changing: "Changing path…", changeError: "Your path did not change. Please retry.",
  },
  build: {
    emptyTitle: "Your next mission starts with a path.", emptyBody: "Choose a path that is available now, then Lan Pya will show one brief and one next action.", choosePath: "Choose a path", title: "One mission at a time.", body: "Make one real thing, submit it when ready, and let the evidence show what you can do.",
    needsChanges: "Needs changes", needsChangesDetail: "Your first version is safe. Use the reviewer feedback to revise it.", revise: "Revise mission", inReview: "In review", inReviewDetail: "Your submitted version is being checked. You can leave safely and return here.", viewSubmission: "View submission", inProgress: "In progress", inProgressDetail: "Your mission is active. Keep building from the saved brief.", continueMission: "Continue mission", paused: "Paused", pausedDetail: "This mission belongs to this path and is ready when you are.", resume: "Resume mission", available: "Available", availableDetail: "A clear first deliverable with a real proof target.", start: "Start mission", operational: "Operational path", nextQuest: "Next quest", phoneFriendly: "Phone-friendly", laptop: "Laptop recommended", yourPath: "Your path", after: "What comes after this", changePath: "Change path", currentStage: "Current stage", pausedWork: "Paused work", pausedTitle: "Still yours when you return.", startError: "This mission could not start. Please retry.", starting: "Starting…",
  },
  profile: {
    editor: {
      edit: "Edit profile",
      name: "Display name",
      headline: "Your line",
      headlineHint: "Leave empty to show your path and start date",
      character: "Character",
      save: "Save",
      saving: "Saving…",
      cancel: "Cancel",
      failed: "That did not save. Try again.",
    },
    missionsStat: "Missions", stepsStat: "Points", proofsStat: "Proofs", since: "since",
    heading: "Career profile", title: "Your direction, on your terms.", body: "Career Compass controls your recommendations. Your proof stays in Portfolio, and your account settings stay compact.", compassProgress: "Career Compass in progress", demo: "Demo account", privateProfile: "Private learner profile", editCompass: "Edit Career Compass", activePath: "Active path", noPath: "No path chosen", noPathBody: "Complete Career Compass to choose one available path.", progress: "progress", changePath: "Change path", guides: "What guides this", personalization: "Personalization", interests: "Interests", preferredWork: "Preferred work", nearGoal: "Near-term goal", device: "Device", weekly: "Weekly rhythm", notSure: "Not sure yet", compassEmpty: "Career Compass has not been answered yet.", compassEmptyBody: "Five short questions set which paths get recommended and why. Nothing here is shared.", compassEmptyAction: "Answer the Compass", update: "Update answers", previous: "Previous paths & paused work", previousTitle: "Nothing disappears when you change direction.", pausedPath: "Paused path", lastActive: "last active", recently: "recently", account: "Account & language", settings: "Private settings", email: "Email", unavailable: "Not available", language: "Language", privacy: "Privacy settings", signOut: "Sign out", switchToEnglish: "Switch language to English", switchToMyanmar: "Switch language to Myanmar",
  },
  opportunities: {
    heading: "Explained matches", title: "Opportunities without fake certainty.", body: "Every card shows what your evidence supports, what is missing, and what Lan Pya cannot know.", all: "All", internships: "Internships", challenges: "Challenges", scholarships: "Scholarships", supported: "Supported by your proof", gaps: "Gaps to close", unknown: "Still unknown", noneVerified: "Nothing verified yet.", noGaps: "No known evidence gap.", noUnknowns: "No declared unknowns.", deadline: "Deadline", checked: "checked", open: "Open source", emptyTitle: "No live opportunities yet.", emptyBody: "Partner-verified listings will appear here as they are published.",
  },
  proof: {
    heading: "Your portable evidence", title: "Portfolio", body: "Your work, with trust labels. Verified work is private by default; share only the evidence snapshot you choose.", evidenceItems: "evidence items", shareable: "Shareable after human review", verified: "Verified", rubric: "Rubric", review: "Review", emptyTitle: "Your portfolio starts with one finished mission.", emptyBody: "Submit real work, respond to review, and choose what to share after verification.", share: "Share proof", revoke: "Revoke", creating: "Creating private link…", copied: "Private 7-day link copied", revoked: "Link revoked immediately", shareError: "Could not create link.", revokeError: "Could not revoke the link.",
  },
  privacy: {
    heading: "Privacy & control", title: "Your work stays yours.", body: "Lan Pya stores only what the journey needs and keeps proof private until you choose to share it.", store: "What we store", public: "What public proof shows", deleteTitle: "Request account deletion", deleteBody: "This creates a tracked deletion request. Shared links are revoked immediately; permanent removal follows the published retention procedure.", request: "Request deletion", back: "Back to today", stored: ["Account identifier and private email", "Alias, language, weekly time, and placement responses", "Mission URLs, reflection, review history, and appeals", "Consent and security audit events"], publicItems: ["Your chosen alias and verified project snapshot", "Rubric version, competencies, and review tier", "Never your private email by default", "Only proof you explicitly choose to share"],
  },
  pathTabs: {
    map: "Map", missions: "Missions", tutor: "Tutor",
    missionsLocked: "Start this path to unlock its missions.",
    missionsLockedAction: "Choose this path",
    noMissionYet: "No mission is authored for this path yet.",
    noMissionYetBody: "The roadmap is published so you can see the whole journey. The first mission opens when a maintainer publishes it.",
    tutorTitle: "AI Tutor",
    tutorPreview: "Preview",
    tutorGreeting: "Hello — how can I help with your {path} roadmap today? You can ask in English or Burmese.",
    tutorSuggestLead: "Some questions you might have about this roadmap:",
    tutorPlaceholder: "Ask me anything about this roadmap…",
    tutorDisclaimer: "Answers use your roadmap context · verify links before applying",
    tutorScripted: "This tutor answers from prepared notes for now, not a live model. It never marks work done or creates proof.",
    tutorNewChat: "New chat",
    tutorSend: "Send", tutorOpen: "Open the tutor", tutorClose: "Close", tutorNudge: "Stuck on a stage? Ask in English or Burmese.",
  },
  runner: {
    steps: ["Brief", "Build", "Submit", "Review", "Proof"] as [string,string,string,string,string],
    stepOf: "Step {a} of {b}",
    back: "Back", next: "Continue", toSubmit: "Go to submit",
    savedLocally: "saved on this device",
    doneCount: "{a} of {b} done",
    premise: "The work", deliverables: "Deliverables", localNote: "Myanmar note",
    weightNote: "Tick these off as you go. The percentages are the rubric your reviewer uses.",
    reviewWaiting: "With a reviewer",
    reviewWaitingBody: "Your submitted version is being checked. Automated checks run first, then a trained reviewer reads it against the rubric. You can close this safely.",
    changesRequested: "Changes requested",
    changesRequestedBody: "A reviewer asked for revisions. Update your links or reflection and submit again — your earlier attempt stays on record.",
    verified: "Verified",
    verifiedBody: "A reviewer verified this work. It is now a portfolio record, private until you choose to share it.",
    notSubmitted: "Not submitted yet",
    notSubmittedBody: "Finish the deliverables, then submit your links.",
    viewProof: "View in Portfolio →",
  },
  missions: {
    heading: "Your work", title: "One mission at a time.",
    body: "Missions come from the stage you are on. Finish one, get it reviewed, and it becomes proof you can show.",
    active: "In progress", activeEmpty: "No mission open right now.",
    activeEmptyBody: "Open your roadmap and start the stage you are on.",
    openRoadmap: "Open roadmap", completed: "Completed", completedNone: "Nothing verified yet.",
    completedNoneBody: "Your first verified mission will appear here, and in Portfolio.",
    stage: "Stage", verifiedOn: "Verified", viewProof: "View proof", openMission: "Open mission",
    noPath: "Choose a path first.", noPathBody: "Missions come from the path you are following.", choosePath: "Choose a path",
  },
  careers: {
    tab: "Careers", heading: "Explore", title: "Every path we maintain.",
    body: "Browse by arena. A path becomes startable when its first mission is published.",
    yourPathHere: "You are here", startable: "You can start these", notReady: "Not open yet",
    stages: "stages", switchTo: "Switch to this path",
  },
  carousel: {
    prev: "Previous opportunity", next: "Next opportunity",
    of: "{a} of {b}", select: "Show details",
    apply: "Open listing", supported: "Your evidence supports",
    gaps: "Still missing", unknown: "Cannot tell yet",
    none: "None recorded", scrollHint: "Drag, scroll, or use arrow keys",
  },
  board: {
    searchPlaceholder: "Search opportunities",
    forYou: "For you", all: "All",
    filters: "Filter opportunities",
    everything: "Everything",
    closingSoon: "Closing this week",
    closingSoonBody: "Deadlines within seven days, whatever your evidence says.",
    readyNow: "Your evidence supports these",
    readyNowBody: "Verified proof already covers what these ask for.",
    buildToward: "Build toward",
    buildTowardBody: "Reachable once the missing evidence is verified.",
    explore: "Worth knowing about",
    exploreBody: "No deadline pressure and no clear evidence match yet.",
    viewMore: "View more", showLess: "Show less",
    apply: "Open listing",
    supported: "Your evidence supports", gaps: "Still missing", unknown: "Cannot tell yet",
    none: "None recorded",
    noMatches: "Nothing matches those filters",
    noMatchesBody: "Try a different category, or clear the search to see everything again.",
    clear: "Clear filters",
    count: "{n} opportunities", countOne: "{n} opportunity",
    noteTitle: "How these are ordered",
    noteBody: "Lan Pya never invents a match score. Every listing shows the evidence you already have, the proof still missing, where it came from, and when it was last checked.",
    featured: {
      partner: "Verified partner",
      featured: "Featured opportunity",
      challenge: "Partner challenge",
      supported: "{n} skills supported",
      gapsToClose: "{n} to close",
      proofSupports: "Your proof supports",
      stillMissing: "What is still missing",
      none: "Nothing recorded yet",
      view: "View opportunity",
      checked: "Source checked",
    },
  },
  roadmap: {
    heading: "Technical roadmaps", title: "Choose a path. See every skill that matters.", body: "Each technical path connects foundations, practical skills, production quality, and proof-producing work. Select any milestone to inspect it.", careerTracks: "Career tracks", milestones: "milestones", selected: "Selected path", stages: "stages", completeCurriculum: "complete curriculum", verified: "Verified", inProgress: "In progress", next: "Next", upcoming: "Upcoming", learn: "Learn", prove: "Prove", selfPaced: "Self-paced", complete: "complete", startHere: "Start here ↓", jump: "Jump to my position ↓", visibleNext: "Visible next", step: "Step", proofTarget: "Proof target", estimated: "Estimated pace", placement: "Placement", whatCover: "What you will cover", completion: "Completion is grounded in submitted work, not a self-reported checkbox.", continueMission: "Continue current mission →", viewProof: "View verified proof →", visibleNote: "This step stays visible now. Your starting point can move when new evidence is verified.", stage: "Stage", milestone: "Milestone", path: "Path", comingSoon: "Coming soon",
  },
  onboarding: {
    brand: "Find your private path", step: "Step {current} of 5", compass: "Career Compass", interestsTitle: "What kinds of work pull you in?", interestsBody: "Pick up to three interests. “Not sure yet” is welcome, and you can change direction later.", alias: "Display name or alias", selected: "{count}/3 selected", workTitle: "How would you like to contribute?", workBody: "This helps us explain a direction. It never locks you into a job title.", setup: "Your setup", setupTitle: "What can you comfortably use today?", setupBody: "We adapt the first mission to the device and connection you actually have.", device: "Device", connection: "Connection", rhythm: "Your rhythm", rhythmTitle: "What can you protect right now?", rhythmBody: "We use your time and near-term goal to make the first proof feel possible, not overwhelming.", weekly: "Weekly time", nearGoal: "Near-term goal", starting: "Your starting point", startingTitle: "Here is a path you can start now.", startingBody: "We use your answers to explain the suggestion. Practical evidence will always matter more than self-report.", tried: "What have you already tried?", optional: "Optional", recommended: "Recommended for you", alsoAvailable: "Also available", privatePath: "Create my private path", privateBody: "Your interests and setup stay private. Reviewers see your work, not these answers.", back: "Back", continue: "Continue →", saving: "Saving…", creating: "Creating path…", create: "Create my path →", savedDevice: "Saved on this device", savedPrivate: "Saved privately", aliasError: "Add a display name or alias first.", consentError: "Accept the privacy notice before creating your private path.", chooseError: "Choose one available path to continue.", saveError: "Your answers are still saved on this device. Retry when you are ready.",
  },
  mission: {
    submitWork: "Submit real work", projectEvidence: "Project evidence", privateDraft: "Private draft", draftSaved: "Draft saved on this device", submitError: "Submission failed. Your draft is still safe on this device.", submitted: "Submitted. Deterministic checks are queued; a human reviewer makes the final decision.", screenshot: "Screenshot or preview URL", optional: "optional", reflection: "Reflection", before: "Before you submit", beforeBody: "Automated checks can suggest issues, but they cannot verify you. Your final result comes from a human reviewer using the mission rubric.", submitting: "Submitting…", submitReview: "Submit for review →", frontendTitle: "Responsive Profile Card", contentTitle: "Three-piece awareness campaign", backBuild: "Back to Build →",
  },
};

const myanmar: typeof english = {
  brandTagline: "လမ်းညွှန်ချက်မှ သက်သေပြချက်သို့",
  home: {
    greetingMorning: "မင်္ဂလာနံနက်ခင်းပါ၊ {name}",
    greetingAfternoon: "မင်္ဂလာနေ့လယ်ခင်းပါ၊ {name}",
    greetingEvening: "မင်္ဂလာညနေခင်းပါ၊ {name}",
    subtitle: "အာရုံစိုက်သော ခြေလှမ်းတစ်ခုက သင့်လမ်းကြောင်းကို ရှေ့သို့ တွန်းပေးသည်။",
    climb: {
      eyebrow: "ယနေ့ တက်ရမည့်လမ်း",
      continueMission: "လုပ်ငန်း ဆက်လုပ်မည်",
      stageOf: "အဆင့် {a} / {b}",
      points: "အမှတ် (အတည်ပြုပြီးလျှင်)",
      noMission: "လက်ရှိ ဆောင်ရွက်နေသော အဆင့် မရှိပါ",
      subtitle: "ရပ်ထားသည့်နေရာမှ ပြန်စပါ။",
    },
    momentum: {
      title: "သင့်ရှေ့ဆက်မှု",
      summary: "အဆင့် {a} ခု ပြီးစီး · သက်သေ {b} ခု ဆောင်ရွက်ဆဲ",
      learn: "လေ့လာ", learnBody: "အခြေခံများ",
      build: "တည်ဆောက်", buildBody: "ကျွမ်းကျင်မှု လက်တွေ့",
      prove: "သက်သေပြ", proveBody: "သင့်သက်သေကို ပြပါ",
      opportunity: "အခွင့်အလမ်း", opportunityBody: "အသိအမှတ်ပြုခံရရန်",
    },
    week: {
      title: "ဤအပတ်",
      body: "သတ်မှတ်ရက်များနှင့် ဆက်လုပ်ရန် ကျန်နေသော လက်ရာများ။",
      closingTitle: "မကြာမီ ပိတ်မည်",
      pausedTitle: "ခေတ္တရပ်ထားသော လက်ရာ",
      empty: "ဤအပတ်တွင် ပိတ်မည့်အရာ မရှိသလို ခေတ္တရပ်ထားသည်လည်း မရှိပါ။",
      viewAll: "အခွင့်အလမ်း အားလုံး ကြည့်မည်",
      resume: "ဆက်လုပ်မည်",
    },
    proof: {
      title: "သက်သေ တိုးပွားနေသည်",
      viewProof: "သက်သေ ကြည့်မည်",
      points: "အမှတ်",
      body: "အတည်ပြုထားသော သက်သေများကို ဆက်စုဆောင်းပါ။",
      empty: "အတည်ပြုထားသော ကျွမ်းကျင်မှု မရှိသေးပါ။",
    },
    signal: {
      title: "အခွင့်အလမ်း အချက်ပြ",
      viewAll: "အခွင့်အလမ်း အားလုံး ကြည့်မည်",
      supportedSkills: "ထောက်ခံထားသော ကျွမ်းကျင်မှုများ",
      none: "မှတ်တမ်း မရှိသေးပါ",
      empty: "အခွင့်အလမ်း မရှိသေးပါ။",
    },
    note: "Lan Pya သည် သက်သေ၊ လိုအပ်ချက်နှင့် မူရင်းကို ပြသည်။ ကိုက်ညီမှုရမှတ် အတုကို ဘယ်တော့မှ မပြပါ။",
  },
  today: { welcome: "ကြိုဆိုပါတယ်", emptyTitle: "သင့်အတွက် သင့်တော်သော လမ်းကြောင်းတစ်ခု ရှာဖွေပါ။", emptyBody: "Career Compass က စတင်နိုင်သော လမ်းကြောင်းနှင့် ပထမဆုံး သက်သေပြနိုင်သည့် လက်တွေ့လုပ်ငန်းကို အကြံပြုပေးမည်။", openCompass: "Career Compass ဖွင့်မည်", title: "သင့်လမ်းကြောင်းကို ရှင်းလင်းစွာ မြင်ရပါစေ။", body: "လမ်းကြောင်းတစ်ခု၊ တိကျသော လက်တွေ့လုပ်ငန်းတစ်ခုနှင့် ရှေ့ဆက်ယူသွားနိုင်သည့် သက်သေတစ်ခု။", activePath: "လက်ရှိလမ်းကြောင်း", viewPath: "လမ်းကြောင်းကြည့်မည်", level: "အဆင့်", xpOnPath: "ဤလမ်းကြောင်းရှိ XP", nextMission: "နောက်ထပ် လက်တွေ့လုပ်ငန်း", openBuild: "Build ဖွင့်မည်", portfolioEvidence: "Portfolio သက်သေ", humanReview: "လူဖြင့် သုံးသပ်မှု", xpAfterVerification: "အတည်ပြုပြီးနောက် +100 XP", contentMission: "လူထုတစ်ခုအတွက် ရှင်းလင်းသော ရလဒ်တစ်ခု ဖန်တီးပြီး အဆင်သင့်ဖြစ်လျှင် သက်သေကို တင်ပြပါ။", frontendMission: "Responsive နှင့် အသုံးပြုရလွယ်ကူသော interface တစ်ခု တည်ဆောက်ပြီး သင့်ရွေးချယ်မှုများကို ရှင်းပြပါ။", happensNext: "နောက်တစ်ဆင့်တွင် ဘာဖြစ်မလဲ", proofTitle: "လက်ရာသည် ယုံကြည်ရသော သက်သေအဖြစ် ပြောင်းလဲမည်။", viewPortfolio: "Portfolio ကြည့်မည်", build: "တည်ဆောက်မည်", buildDetail: "တိကျသော ရလဒ်တစ်ခု ပြီးအောင်လုပ်ပါ။", submit: "တင်ပြမည်", submitDetail: "သင့်လက်ရာကို ကိုယ်ပိုင် snapshot အဖြစ် သိမ်းထားပါ။", review: "သုံးသပ်မည်", reviewDetail: "သက်သေကို အခြေခံသော အကြံပြုချက် ရယူပါ။", prove: "သက်သေပြမည်", proveDetail: "အတည်ပြုထားသော သက်သေကို သင်ရွေးချယ်သည့်အခါသာ မျှဝေပါ။" },
  paths: { direction: "သင့်လမ်းကြောင်း", emptyTitle: "သေးငယ်သော ရွေးချယ်မှုအချို့ဖြင့် စတင်ပါ။", emptyBody: "Career Compass က သင်တကယ် စတင်နိုင်သော လမ်းကြောင်းတစ်ခုကို အကြံပြုပြီး သင်စိတ်ဝင်စားသည့်အခါ career catalog အပြည့်အစုံကိုလည်း ထားပေးသည်။", findPath: "ကျွန်ုပ်၏လမ်းကြောင်း ရှာမည်", title: "လက်ရှိလမ်းကြောင်းတစ်ခု။ ရှင်းလင်းသော နောက်တစ်ဆင့်တစ်ခု။", body: "မပျောက်ကွယ်ဘဲ စူးစမ်းပါ။ လက်ရှိလမ်းကြောင်းက Build ကို သတ်မှတ်ပေးပြီး အခြား career များကို ရွေးချယ်စရာ သို့မဟုတ် preview အဖြစ်သာ ထားပေးသည်။", activePath: "လက်ရှိလမ်းကြောင်း", complete: "ပြီးစီး", xpOnPath: "ဤလမ်းကြောင်းရှိ XP", pilot: "ထိန်းချုပ်စမ်းသပ်အဆင့်", ready: "စတင်တည်ဆောက်ရန် အသင့်", viewRoadmap: "ကျွမ်းကျင်မှုမြေပုံ ကြည့်မည်", continueBuild: "Build ဆက်လုပ်မည်", alternatives: "သင့်အတွက် အခြားရွေးချယ်စရာများ", alternativesTitle: "အကြောင်းပြချက်ပါသော ရွေးချယ်စရာ နှစ်ခုသာ။", alternativesTitleOne: "အကြောင်းပြချက်ပါသော အခြားရွေးချယ်စရာ တစ်ခု။", yourPath: "သင့်လမ်းကြောင်း", noMissionsYet: "လုပ်ငန်း မရှိသေး", stages: "အဆင့်", showPreviews: "အစမ်းလမ်းကြောင်း {n} ခု ကြည့်ရန်", hidePreviews: "အစမ်းလမ်းကြောင်းများ ဖျောက်ရန်", browsePaths: "လမ်းကြောင်းအားလုံး ရှာဖွေရန်", stepOf: "အဆင့် {a} / {b}", editCompass: "Career Compass ပြင်မည်", firstMission: "ပထမလုပ်ငန်း", choosePath: "ဤလမ်းကြောင်း ရွေးမည်", onlyAvailable: "ယခုအချိန်တွင် သင့်လက်ရှိလမ်းကြောင်းသာ စတင်နိုင်သည်။ အောက်တွင် လာမည့် career များကို စူးစမ်းနိုင်သေးသည်။", exploreAll: "Digital career အားလုံး စူးစမ်းမည်", catalogBody: "ကဏ္ဍအလိုက် ကြည့်ပါ။ ပထမဆုံး လက်တွေ့လုပ်ငန်း မဖွင့်မချင်း preview လမ်းကြောင်းများကို လက်ရှိလမ်းကြောင်း မပြုလုပ်နိုင်ပါ။", paths: "လမ်းကြောင်း", preview: "ကြိုတင်ကြည့်ရှု", available: "အသုံးပြုနိုင်", confirmTitle: "လမ်းကြောင်းပြောင်းမည်ကို အတည်ပြုပါ", confirmBody: "သင့်လက်ရှိတိုးတက်မှုကို သိမ်းထားမည်။ ဤလမ်းကြောင်းက နောက်တစ်ခုလုပ်မည့် လက်တွေ့လုပ်ငန်းကို သတ်မှတ်ပေးမည်။", confirm: "လမ်းကြောင်း အတည်ပြုမည်", cancel: "မလုပ်တော့ပါ", changing: "လမ်းကြောင်း ပြောင်းနေသည်…", changeError: "လမ်းကြောင်း မပြောင်းနိုင်သေးပါ။ ထပ်ကြိုးစားပါ။" },
  build: { emptyTitle: "သင့်နောက်လုပ်ငန်းသည် လမ်းကြောင်းတစ်ခုမှ စတင်သည်။", emptyBody: "လက်ရှိစတင်နိုင်သည့် လမ်းကြောင်းကို ရွေးပါ။ ထို့နောက် Lan Pya က brief တစ်ခုနှင့် နောက်တစ်ဆင့်တစ်ခုကို ပြသမည်။", choosePath: "လမ်းကြောင်း ရွေးမည်", title: "တစ်ကြိမ်လျှင် လက်တွေ့လုပ်ငန်းတစ်ခုသာ။", body: "တကယ့်လက်ရာတစ်ခု ဖန်တီးပါ၊ အဆင်သင့်လျှင် တင်ပြပါ၊ သက်သေက သင်လုပ်နိုင်သည်ကို ပြပါစေ။", needsChanges: "ပြင်ဆင်ရန်လိုသည်", needsChangesDetail: "ပထမ version ကို သိမ်းထားပြီးဖြစ်သည်။ Reviewer အကြံပြုချက်ဖြင့် ပြန်လည်ပြင်ဆင်ပါ။", revise: "လုပ်ငန်း ပြင်ဆင်မည်", inReview: "သုံးသပ်နေသည်", inReviewDetail: "သင်တင်ပြထားသော version ကို စစ်ဆေးနေသည်။ လုံခြုံစွာ ထွက်နိုင်ပြီး နောက်မှ ပြန်လာနိုင်သည်။", viewSubmission: "တင်ပြချက် ကြည့်မည်", inProgress: "လုပ်ဆောင်နေသည်", inProgressDetail: "ဤလုပ်ငန်းကို စတင်ထားပြီးဖြစ်သည်။ သိမ်းထားသော brief အတိုင်း ဆက်လက်တည်ဆောက်ပါ။", continueMission: "လုပ်ငန်း ဆက်လုပ်မည်", paused: "ခေတ္တရပ်ထားသည်", pausedDetail: "ဤလုပ်ငန်းသည် ဤလမ်းကြောင်းအတွက် ဖြစ်ပြီး အဆင်သင့်ဖြစ်သည့်အခါ ဆက်လုပ်နိုင်သည်။", resume: "ပြန်စမည်", available: "အသုံးပြုနိုင်", availableDetail: "တကယ့် သက်သေပန်းတိုင်ပါသော ပထမဆုံး ရလဒ်တစ်ခု။", start: "လုပ်ငန်း စတင်မည်", operational: "အသုံးပြုနေသော လမ်းကြောင်း", nextQuest: "နောက်လုပ်ငန်း", phoneFriendly: "ဖုန်းဖြင့်လည်း လုပ်နိုင်", laptop: "Laptop အကြံပြုသည်", yourPath: "သင့်လမ်းကြောင်း", after: "ဤနောက် ဘာလာမလဲ", changePath: "လမ်းကြောင်း ပြောင်းမည်", currentStage: "လက်ရှိအဆင့်", pausedWork: "ခေတ္တရပ်ထားသော လက်ရာ", pausedTitle: "ပြန်လာသည့်အခါလည်း သင့်လက်ရာအဖြစ် ရှိနေမည်။", startError: "ဤလုပ်ငန်းကို မစတင်နိုင်သေးပါ။ ထပ်ကြိုးစားပါ။", starting: "စတင်နေသည်…" },
  profile: {
    editor: {
      edit: "ပရိုဖိုင် ပြင်မည်",
      name: "ပြသမည့်အမည်",
      headline: "သင့်စာကြောင်း",
      headlineHint: "ဗလာထားလျှင် သင့်လမ်းကြောင်းနှင့် စတင်သည့်ရက်ကို ပြမည်",
      character: "ဇာတ်ကောင်",
      save: "သိမ်းမည်",
      saving: "သိမ်းနေသည်…",
      cancel: "မလုပ်တော့ပါ",
      failed: "မသိမ်းနိုင်ပါ။ ထပ်ကြိုးစားပါ။",
    },
    missionsStat: "မစ်ရှင်", stepsStat: "အမှတ်", proofsStat: "သက်သေ", since: "မှစ၍", heading: "အလုပ်အကိုင် ပရိုဖိုင်", title: "သင့်လမ်းကြောင်းကို သင့်ပုံစံအတိုင်း။", body: "Career Compass က အကြံပြုချက်များကို သတ်မှတ်ပေးသည်။ သင့်သက်သေများကို Portfolio တွင်ထားပြီး account setting များကို ရိုးရှင်းစွာ စုစည်းထားသည်။", compassProgress: "Career Compass လုပ်ဆောင်နေသည်", demo: "နမူနာအကောင့်", privateProfile: "ကိုယ်ပိုင်သင်ယူသူ ပရိုဖိုင်", editCompass: "Career Compass ပြင်မည်", activePath: "လက်ရှိလမ်းကြောင်း", noPath: "လမ်းကြောင်း မရွေးရသေးပါ", noPathBody: "စတင်နိုင်သည့် လမ်းကြောင်းတစ်ခု ရွေးရန် Career Compass ကို ပြီးစီးပါ။", progress: "တိုးတက်မှု", changePath: "လမ်းကြောင်း ပြောင်းမည်", guides: "အကြံပြုမှုကို ဘာက သတ်မှတ်ပေးသလဲ", personalization: "ကိုယ်ပိုင်အကြံပြုမှု", interests: "စိတ်ဝင်စားမှုများ", preferredWork: "နှစ်သက်သော လက်ရာပုံစံ", nearGoal: "လက်ငင်းရည်မှန်းချက်", device: "ကိရိယာ", weekly: "အပတ်စဉ် အချိန်", notSure: "မသေချာသေးပါ", compassEmpty: "Career Compass ကို မဖြေရသေးပါ။", compassEmptyBody: "မေးခွန်းငါးခုက ဘယ်လမ်းကြောင်းများကို အဘယ်ကြောင့် အကြံပြုမည်ကို သတ်မှတ်သည်။ ဤအချက်အလက်များကို မမျှဝေပါ။", compassEmptyAction: "Compass ဖြေမည်", update: "အဖြေများ ပြင်မည်", previous: "ယခင်လမ်းကြောင်းများနှင့် ခေတ္တရပ်ထားသော လက်ရာ", previousTitle: "လမ်းကြောင်းပြောင်းလည်း ဘာမှပျောက်မသွားပါ။", pausedPath: "ခေတ္တရပ်ထားသော လမ်းကြောင်း", lastActive: "နောက်ဆုံးအသုံးပြု", recently: "မကြာသေးမီက", account: "အကောင့်နှင့် ဘာသာစကား", settings: "ကိုယ်ပိုင် setting များ", email: "အီးမေးလ်", unavailable: "မရရှိနိုင်ပါ", language: "ဘာသာစကား", privacy: "ကိုယ်ရေးလုံခြုံမှု setting", signOut: "အကောင့်ထွက်မည်", switchToEnglish: "English သို့ ပြောင်းမည်", switchToMyanmar: "မြန်မာဘာသာသို့ ပြောင်းမည်" },
  opportunities: { heading: "ရှင်းပြထားသော ကိုက်ညီမှုများ", title: "အတုအယောင် သေချာမှုမပါသော အခွင့်အလမ်းများ။", body: "Card တိုင်းက သင့်သက်သေက အထောက်အပံ့ပြုထားသည်၊ လိုအပ်နေသည်နှင့် Lan Pya မသိနိုင်သည်ကို ပြသသည်။", all: "အားလုံး", internships: "Internship များ", challenges: "စိန်ခေါ်မှုများ", scholarships: "ပညာသင်ဆုများ", supported: "သင့်သက်သေက အထောက်အပံ့ပြုထားသည်", gaps: "ဖြည့်ဆည်းရန် လိုအပ်ချက်", unknown: "မသိရသေးသည်", noneVerified: "အတည်ပြုထားသည့် သက်သေ မရှိသေးပါ။", noGaps: "သိရှိထားသော လိုအပ်ချက် မရှိပါ။", noUnknowns: "ဖော်ပြထားသော မသိရသေးမှု မရှိပါ။", deadline: "နောက်ဆုံးရက်", checked: "စစ်ဆေးပြီး", open: "ရင်းမြစ်ဖွင့်မည်", emptyTitle: "လက်တွေ့ အခွင့်အလမ်း မရှိသေးပါ။", emptyBody: "Partner များ အတည်ပြုထားသော listing များကို ထုတ်ပြန်သည်နှင့် ဤနေရာတွင် ပြသမည်။" },
  proof: { heading: "သင်ယူသွားနိုင်သော သက်သေ", title: "Portfolio", body: "ယုံကြည်မှုအမှတ်အသားများပါသော သင့်လက်ရာ။ အတည်ပြုထားသော လက်ရာကို မူလအားဖြင့် ကိုယ်ပိုင်ထားပြီး သင်ရွေးချယ်သော snapshot ကိုသာ မျှဝေပါ။", evidenceItems: "သက်သေ items", shareable: "လူဖြင့် သုံးသပ်ပြီးနောက် မျှဝေနိုင်သည်", verified: "အတည်ပြုပြီး", rubric: "အကဲဖြတ်စံ", review: "သုံးသပ်မှု", emptyTitle: "သင့် Portfolio သည် ပြီးစီးသော လက်တွေ့လုပ်ငန်းတစ်ခုမှ စတင်သည်။", emptyBody: "တကယ့်လက်ရာ တင်ပြပါ၊ သုံးသပ်ချက်ကို တုံ့ပြန်ပါ၊ အတည်ပြုပြီးနောက် မျှဝေမည့်အရာကို ရွေးပါ။", share: "သက်သေ မျှဝေမည်", revoke: "ပြန်ရုပ်သိမ်းမည်", creating: "ကိုယ်ပိုင် link ဖန်တီးနေသည်…", copied: "7 ရက်သက်တမ်းရှိ ကိုယ်ပိုင် link ကို ကူးယူပြီးပါပြီ", revoked: "Link ကို ချက်ချင်း ပြန်ရုပ်သိမ်းပြီးပါပြီ", shareError: "Link မဖန်တီးနိုင်ပါ။", revokeError: "Link ကို ပြန်ရုပ်သိမ်းမရပါ။" },
  privacy: { heading: "ကိုယ်ရေးလုံခြုံမှုနှင့် ထိန်းချုပ်မှု", title: "သင့်လက်ရာသည် သင့်အတွက်သာ ဖြစ်သည်။", body: "Lan Pya က journey အတွက်လိုအပ်သမျှကိုသာ သိမ်းထားပြီး သင်မျှဝေရန် ရွေးချယ်သည့်အထိ proof ကို ကိုယ်ပိုင်ထားသည်။", store: "ကျွန်ုပ်တို့ သိမ်းထားသည့်အရာ", public: "အများမြင် proof တွင် ပြသမည့်အရာ", deleteTitle: "အကောင့်ဖျက်ရန် တောင်းဆိုမည်", deleteBody: "ဤလုပ်ဆောင်မှုက ဖျက်ရန်တောင်းဆိုမှုကို မှတ်တမ်းတင်မည်။ မျှဝေထားသော link များကို ချက်ချင်း ပိတ်မည်ဖြစ်ပြီး အမြဲတမ်းဖျက်ခြင်းကို ထုတ်ပြန်ထားသော retention procedure အတိုင်း ဆောင်ရွက်မည်။", request: "ဖျက်ရန် တောင်းဆိုမည်", back: "ဒီနေ့သို့ ပြန်မည်", stored: ["အကောင့်သတ်မှတ်ချက်နှင့် ကိုယ်ပိုင်အီးမေးလ်", "Alias၊ ဘာသာစကား၊ အပတ်စဉ်အချိန်နှင့် placement အဖြေများ", "လုပ်ငန်း URL များ၊ reflection၊ review history နှင့် appeal များ", "Consent နှင့် လုံခြုံရေး audit event များ"], publicItems: ["သင်ရွေးချယ်ထားသော alias နှင့် အတည်ပြုထားသော project snapshot", "Rubric version၊ competency များနှင့် review tier", "ကိုယ်ပိုင်အီးမေးလ်ကို မူလအားဖြင့် မပြပါ", "သင်ထင်ရှားစွာ ရွေးချယ်သော proof ကိုသာ မျှဝေပါ" ] },
  pathTabs: {
    map: "မြေပုံ", missions: "လုပ်ငန်းများ", tutor: "သင်ပြသူ",
    missionsLocked: "ဤလမ်းကြောင်းကို စတင်မှ လုပ်ငန်းများ ဖွင့်ပါမည်။",
    missionsLockedAction: "ဤလမ်းကြောင်းကို ရွေးမည်",
    noMissionYet: "ဤလမ်းကြောင်းအတွက် လုပ်ငန်း မရေးဆွဲရသေးပါ။",
    noMissionYetBody: "ခရီးလမ်းတစ်ခုလုံးကို မြင်နိုင်ရန် လမ်းပြမြေပုံကို ထုတ်ပြန်ထားသည်။ ပထမလုပ်ငန်းကို ထိန်းသိမ်းသူမှ ထုတ်ပြန်သည့်အခါ ဖွင့်ပါမည်။",
    tutorTitle: "AI သင်ပြသူ",
    tutorPreview: "အစမ်း",
    tutorGreeting: "မင်္ဂလာပါ — သင့် {path} လမ်းပြမြေပုံအတွက် ဘာကူညီပေးရမလဲ? အင်္ဂလိပ် သို့မဟုတ် မြန်မာဘာသာဖြင့် မေးနိုင်ပါသည်။",
    tutorSuggestLead: "ဤလမ်းပြမြေပုံအကြောင်း မေးနိုင်သည့် မေးခွန်းအချို့:",
    tutorPlaceholder: "ဤလမ်းပြမြေပုံအကြောင်း မေးပါ…",
    tutorDisclaimer: "အဖြေများသည် သင့်လမ်းပြမြေပုံအချက်အလက်ကို အသုံးပြုသည် · အသုံးမပြုမီ link များကို စစ်ဆေးပါ",
    tutorScripted: "ဤသင်ပြသူသည် ယခုအချိန်တွင် ကြိုတင်ပြင်ဆင်ထားသော မှတ်စုများမှ ဖြေဆိုသည်။ လုပ်ငန်းပြီးစီးကြောင်း အမှတ်အသားမပြုပါ၊ သက်သေလည်း မဖန်တီးပါ။",
    tutorNewChat: "စကားဝိုင်းအသစ်",
    tutorSend: "ပို့မည်", tutorOpen: "သင်ပြသူ ဖွင့်မည်", tutorClose: "ပိတ်မည်", tutorNudge: "အဆင့်တစ်ခုမှာ ရပ်နေသလား? အင်္ဂလိပ် သို့မဟုတ် မြန်မာဘာသာဖြင့် မေးပါ။",
  },
  runner: {
    steps: ["အကျဉ်းချုပ်", "တည်ဆောက်", "တင်ပြ", "သုံးသပ်", "သက်သေ"] as [string,string,string,string,string],
    stepOf: "အဆင့် {a} / {b}",
    back: "နောက်သို့", next: "ဆက်လုပ်မည်", toSubmit: "တင်ပြရန် သွားမည်",
    savedLocally: "ဤစက်တွင် သိမ်းထားသည်",
    doneCount: "{b} ခုအနက် {a} ခု ပြီးပြီ",
    premise: "လုပ်ငန်း", deliverables: "တင်ပြရမည့်အရာများ", localNote: "မြန်မာ့မှတ်ချက်",
    weightNote: "လုပ်ပြီးတိုင်း အမှန်ခြစ်ပါ။ ရာခိုင်နှုန်းများသည် သုံးသပ်သူ အသုံးပြုမည့် စံနှုန်းဖြစ်သည်။",
    reviewWaiting: "သုံးသပ်သူထံတွင်",
    reviewWaitingBody: "သင်တင်ပြထားသည်ကို စစ်ဆေးနေသည်။ အလိုအလျောက်စစ်ဆေးမှု ဦးစွာလုပ်ပြီး လေ့ကျင့်ထားသော သုံးသပ်သူက စံနှုန်းနှင့် နှိုင်းယှဉ်ဖတ်ရှုမည်။ ပိတ်ထားနိုင်ပါသည်။",
    changesRequested: "ပြင်ဆင်ရန် တောင်းဆိုထားသည်",
    changesRequestedBody: "သုံးသပ်သူက ပြင်ဆင်ရန် တောင်းဆိုထားသည်။ link များ သို့မဟုတ် ပြန်လည်သုံးသပ်ချက်ကို ပြင်ပြီး ထပ်တင်ပါ — ယခင်တင်ပြမှု မှတ်တမ်းတွင် ကျန်ရှိပါမည်။",
    verified: "အတည်ပြုပြီး",
    verifiedBody: "သုံးသပ်သူက ဤလက်ရာကို အတည်ပြုပြီးပါပြီ။ ယခု portfolio မှတ်တမ်းဖြစ်ပြီး သင်မျှဝေရန် ရွေးချယ်သည်အထိ သီးသန့်ဖြစ်သည်။",
    notSubmitted: "မတင်ပြရသေးပါ",
    notSubmittedBody: "တင်ပြရမည့်အရာများ ပြီးအောင်လုပ်ပြီး သင့် link များကို တင်ပါ။",
    viewProof: "Portfolio တွင် ကြည့်မည် →",
  },
  missions: {
    heading: "သင့်လက်ရာ", title: "တစ်ကြိမ်လျှင် လုပ်ငန်းတစ်ခု။",
    body: "လုပ်ငန်းများသည် သင်ရောက်ရှိနေသော အဆင့်မှ လာသည်။ တစ်ခုပြီးအောင်လုပ်၊ သုံးသပ်ခံယူပါ၊ ပြသနိုင်သော သက်သေဖြစ်လာမည်။",
    active: "လုပ်ဆောင်နေသည်", activeEmpty: "ယခု ဖွင့်ထားသော လုပ်ငန်း မရှိပါ။",
    activeEmptyBody: "သင့်လမ်းပြမြေပုံကို ဖွင့်ပြီး ရောက်ရှိနေသော အဆင့်ကို စတင်ပါ။",
    openRoadmap: "လမ်းပြမြေပုံ ဖွင့်မည်", completed: "ပြီးစီးပြီး", completedNone: "အတည်ပြုထားသည် မရှိသေးပါ။",
    completedNoneBody: "သင့်ပထမဆုံး အတည်ပြုပြီးလုပ်ငန်းသည် ဤနေရာနှင့် Portfolio တွင် ပေါ်လာမည်။",
    stage: "အဆင့်", verifiedOn: "အတည်ပြုသည်", viewProof: "သက်သေ ကြည့်မည်", openMission: "လုပ်ငန်း ဖွင့်မည်",
    noPath: "လမ်းကြောင်းတစ်ခု ဦးစွာရွေးပါ။", noPathBody: "လုပ်ငန်းများသည် သင်လိုက်နေသော လမ်းကြောင်းမှ လာသည်။", choosePath: "လမ်းကြောင်း ရွေးမည်",
  },
  careers: {
    tab: "လမ်းကြောင်းများ", heading: "လေ့လာရန်", title: "ကျွန်ုပ်တို့ ထိန်းသိမ်းသော လမ်းကြောင်းအားလုံး။",
    body: "နယ်ပယ်အလိုက် ရှာဖွေပါ။ ပထမလုပ်ငန်း ထုတ်ပြန်သည့်အခါ လမ်းကြောင်းကို စတင်နိုင်မည်။",
    yourPathHere: "သင်ရှိရာ", startable: "စတင်နိုင်သည်", notReady: "မဖွင့်ရသေး",
    stages: "အဆင့်", switchTo: "ဤလမ်းကြောင်းသို့ ပြောင်းမည်",
  },
  carousel: {
    prev: "ယခင် အခွင့်အလမ်း", next: "နောက် အခွင့်အလမ်း",
    of: "{b} ခုအနက် {a}", select: "အသေးစိတ် ကြည့်မည်",
    apply: "ကြေညာချက် ဖွင့်မည်", supported: "သင့်သက်သေက ထောက်ခံသည်",
    gaps: "လိုအပ်နေသေးသည်", unknown: "မသိရသေးပါ",
    none: "မှတ်တမ်း မရှိပါ", scrollHint: "ဆွဲပါ၊ scroll လုပ်ပါ သို့မဟုတ် arrow key သုံးပါ",
  },
  board: {
    searchPlaceholder: "အခွင့်အလမ်းများ ရှာမည်",
    forYou: "သင့်အတွက်", all: "အားလုံး",
    filters: "အခွင့်အလမ်းများ စစ်ထုတ်မည်",
    everything: "အားလုံး",
    closingSoon: "ဤအပတ် ပိတ်မည်",
    closingSoonBody: "ခုနစ်ရက်အတွင်း ပိတ်မည့် သတ်မှတ်ရက်များ။",
    readyNow: "သင့်သက်သေက ထောက်ခံသည်",
    readyNowBody: "အတည်ပြုပြီး သက်သေက ဤအရာများကို လွှမ်းခြုံပြီးဖြစ်သည်။",
    buildToward: "ဆက်တည်ဆောက်ရန်",
    buildTowardBody: "လိုအပ်သော သက်သေ အတည်ပြုပြီးလျှင် ရနိုင်သည်။",
    explore: "သိထားသင့်သည်",
    exploreBody: "အချိန်ဖိအား မရှိသေးဘဲ သက်သေ ကိုက်ညီမှုလည်း မရှင်းသေးပါ။",
    viewMore: "ပိုမိုကြည့်မည်", showLess: "လျှော့ပြမည်",
    apply: "ကြေညာချက် ဖွင့်မည်",
    supported: "သင့်သက်သေက ထောက်ခံသည်", gaps: "လိုအပ်နေသေးသည်", unknown: "မခွဲခြားနိုင်သေးပါ",
    none: "မှတ်တမ်း မရှိပါ",
    noMatches: "ထို စစ်ထုတ်မှုနှင့် ကိုက်ညီသည် မရှိပါ",
    noMatchesBody: "အခြား အမျိုးအစား စမ်းကြည့်ပါ၊ သို့မဟုတ် ရှာဖွေမှုကို ရှင်းလင်းပါ။",
    clear: "စစ်ထုတ်မှု ရှင်းမည်",
    count: "အခွင့်အလမ်း {n} ခု", countOne: "အခွင့်အလမ်း {n} ခု",
    noteTitle: "မည်သို့ စီစဉ်ထားသနည်း",
    noteBody: "Lan Pya သည် ကိုက်ညီမှုရမှတ်ကို ဘယ်တော့မှ မတီထွင်ပါ။ ကြေညာချက်တိုင်းတွင် သင့်တွင်ရှိပြီးသား သက်သေ၊ လိုအပ်နေသေးသော သက်သေ၊ မူရင်းနှင့် နောက်ဆုံးစစ်ဆေးသည့်ရက်ကို ဖော်ပြသည်။",
    featured: {
      partner: "အတည်ပြု မိတ်ဖက်",
      featured: "အထူးပြု အခွင့်အလမ်း",
      challenge: "မိတ်ဖက် စိန်ခေါ်မှု",
      supported: "ကျွမ်းကျင်မှု {n} ခု ထောက်ခံ",
      gapsToClose: "{n} ခု ဖြည့်ရန်",
      proofSupports: "သင့်သက်သေက ထောက်ခံသည်",
      stillMissing: "လိုအပ်နေသေးသည်",
      none: "မှတ်တမ်း မရှိသေးပါ",
      view: "အခွင့်အလမ်း ကြည့်မည်",
      checked: "မူရင်း စစ်ဆေးသည့်ရက်",
    },
  },
  roadmap: { heading: "နည်းပညာ လမ်းကြောင်းများ", title: "လမ်းကြောင်းတစ်ခုရွေးပါ။ အရေးပါတဲ့ skill အားလုံးကို ကြည့်ပါ။", body: "နည်းပညာလမ်းကြောင်းတိုင်းက အခြေခံ၊ လက်တွေ့ skill၊ production quality နှင့် သက်သေပြနိုင်သော လက်ရာကို ချိတ်ဆက်ပေးသည်။ အသေးစိတ်ကြည့်ရန် milestone တစ်ခုကို ရွေးပါ။", careerTracks: "Career လမ်းကြောင်းများ", milestones: "milestone", selected: "ရွေးချယ်ထားသော လမ်းကြောင်း", stages: "အဆင့်", completeCurriculum: "သင်ရိုးအပြည့်အစုံ", verified: "အတည်ပြုပြီး", inProgress: "လုပ်ဆောင်နေသည်", next: "နောက်တစ်ဆင့်", upcoming: "လာမည့်အဆင့်", learn: "သင်ယူမည်", prove: "သက်သေပြမည်", selfPaced: "မိမိအချိန်ဖြင့်", complete: "ပြီးစီး", startHere: "ဤနေရာမှ စတင်ပါ ↓", jump: "လက်ရှိနေရာသို့ သွားမည် ↓", visibleNext: "နောက်တစ်ဆင့်ကို မြင်နိုင်သည်", step: "အဆင့်", proofTarget: "သက်သေပန်းတိုင်", estimated: "ခန့်မှန်းအချိန်", placement: "နေရာချထားမှု", whatCover: "သင်ယူရမည့်အကြောင်းအရာ", completion: "ပြီးစီးမှုသည် မိမိကိုယ်တိုင်အမှန်ခြစ်ခြင်းမဟုတ်ဘဲ တင်ပြထားသော လက်ရာအပေါ် အခြေခံသည်။", continueMission: "လက်ရှိလုပ်ငန်း ဆက်လုပ်မည် →", viewProof: "အတည်ပြုထားသော သက်သေ ကြည့်မည် →", visibleNote: "ဤအဆင့်ကို ယခုမြင်နိုင်သည်။ သက်သေအသစ် အတည်ပြုသည့်အခါ သင့်စတင်နေရာ ပြောင်းနိုင်သည်။", stage: "အဆင့်", milestone: "အဆင့်ငယ်", path: "လမ်းကြောင်း", comingSoon: "မကြာမီ ရောက်မည်" },
  onboarding: { brand: "သင့်ကိုယ်ပိုင်လမ်းကြောင်း ရှာဖွေပါ", step: "အဆင့် {current} / 5", compass: "Career Compass", interestsTitle: "ဘယ်လိုအလုပ်မျိုးတွေက သင့်ကို စိတ်ဝင်စားစေသလဲ?", interestsBody: "စိတ်ဝင်စားမှု သုံးခုအထိ ရွေးပါ။ “မသေချာသေးပါ” ဟူသော အဖြေလည်း အဆင်ပြေပြီး နောက်မှ လမ်းကြောင်းပြောင်းနိုင်သည်။", alias: "ပြသမည့်အမည် သို့မဟုတ် alias", selected: "{count}/3 ရွေးပြီး", workTitle: "ဘယ်ပုံစံနဲ့ ပါဝင်လုပ်ကိုင်ချင်သလဲ?", workBody: "ဤအဖြေက လမ်းကြောင်းကို ရှင်းပြရန်ကူညီသည်။ အလုပ်အကိုင်ခေါင်းစဉ်တစ်ခုထဲတွင် မပိတ်ထားပါ။", setup: "သင့်အခြေအနေ", setupTitle: "ယနေ့ သက်တောင့်သက်သာ အသုံးပြုနိုင်တာ ဘာလဲ?", setupBody: "သင်တကယ်ရှိထားသော device နှင့် connection အလိုက် ပထမလုပ်ငန်းကို ချိန်ညှိပေးမည်။", device: "ကိရိယာ", connection: "အင်တာနက်ချိတ်ဆက်မှု", rhythm: "သင့်အချိန်ပုံစံ", rhythmTitle: "ယခု ဘယ်လောက်အချိန် ပေးနိုင်သလဲ?", rhythmBody: "အချိန်နှင့် လက်ငင်းရည်မှန်းချက်ကို အသုံးပြု၍ ပထမသက်သေကို အလွန်မခက်ခဲစေဘဲ ဖြစ်နိုင်အောင် လုပ်ပေးမည်။", weekly: "အပတ်စဉ် အချိန်", nearGoal: "လက်ငင်းရည်မှန်းချက်", starting: "သင့်စတင်နေရာ", startingTitle: "ယခု သင်စတင်နိုင်သော လမ်းကြောင်းတစ်ခု ရှိပါသည်။", startingBody: "အဖြေများကို အသုံးပြု၍ အကြံပြုချက်ကို ရှင်းပြပေးသည်။ လက်တွေ့သက်သေသည် self-report ထက် အမြဲပိုအရေးကြီးသည်။", tried: "ယခင်က ဘာတွေ စမ်းလုပ်ဖူးသလဲ?", optional: "မရွေးလည်းရသည်", recommended: "သင့်အတွက် အကြံပြုသည်", alsoAvailable: "အသုံးပြုနိုင်သော အခြားရွေးချယ်စရာ", privatePath: "ကျွန်ုပ်၏ ကိုယ်ပိုင်လမ်းကြောင်း ဖန်တီးမည်", privateBody: "သင့်စိတ်ဝင်စားမှုနှင့် အခြေအနေကို ကိုယ်ပိုင်ထားမည်။ Reviewer များက ဤအဖြေများမဟုတ်ဘဲ သင့်လက်ရာကိုသာ မြင်မည်။", back: "နောက်သို့", continue: "ဆက်သွားမည် →", saving: "သိမ်းနေသည်…", creating: "လမ်းကြောင်း ဖန်တီးနေသည်…", create: "ကျွန်ုပ်၏လမ်းကြောင်း ဖန်တီးမည် →", savedDevice: "ဤစက်တွင် သိမ်းထားသည်", savedPrivate: "ကိုယ်ပိုင်သိမ်းထားသည်", aliasError: "ပြသမည့်အမည် သို့မဟုတ် alias ဖြည့်ပါ။", consentError: "ကိုယ်ပိုင်လမ်းကြောင်း မဖန်တီးမီ privacy notice ကို လက်ခံပါ။", chooseError: "ဆက်သွားရန် အသုံးပြုနိုင်သော လမ်းကြောင်းတစ်ခုရွေးပါ။", saveError: "သင့်အဖြေများကို ဤစက်တွင် သိမ်းထားသည်။ အဆင်သင့်ဖြစ်လျှင် ထပ်ကြိုးစားပါ။" },
  mission: { submitWork: "တကယ့်လက်ရာ တင်ပြမည်", projectEvidence: "Project သက်သေ", privateDraft: "ကိုယ်ပိုင် draft", draftSaved: "Draft ကို ဤစက်တွင် သိမ်းထားသည်", submitError: "တင်ပြမှု မအောင်မြင်ပါ။ သင့် draft ကို ဤစက်တွင် လုံခြုံစွာသိမ်းထားသည်။", submitted: "တင်ပြပြီးပါပြီ။ Deterministic စစ်ဆေးမှုများ စောင့်နေပြီး နောက်ဆုံးဆုံးဖြတ်ချက်ကို လူ reviewer က ပေးမည်။", screenshot: "Screenshot သို့မဟုတ် preview URL", optional: "မရွေးလည်းရသည်", reflection: "ပြန်လည်သုံးသပ်ချက်", before: "မတင်ပြမီ", beforeBody: "Automated check များက အကြံပြုနိုင်သော်လည်း သင့်ကို အတည်ပြုမပေးနိုင်ပါ။ နောက်ဆုံးရလဒ်သည် mission rubric ဖြင့် စစ်ဆေးသော လူ reviewer ထံမှ လာမည်။", submitting: "တင်ပြနေသည်…", submitReview: "သုံးသပ်ရန် တင်ပြမည် →", frontendTitle: "Responsive Profile Card", contentTitle: "သုံးပိုင်းပါ အသိပညာပေး campaign", backBuild: "Build သို့ ပြန်မည် →" },
};

export function getAppCopy(locale: string) {
  return locale === "my" ? myanmar : english;
}

const careerTerms: Record<string, { en: string; my: string }> = {
  "frontend-developer": { en: "Frontend Developer", my: "ဝဘ်ရှေ့ပိုင်း ဖန်တီးသူ" },
  "full-stack-developer": { en: "Full-Stack Developer", my: "ဝဘ်စနစ်အပြည့် ဖန်တီးသူ" },
  "ai-data-analyst": { en: "AI & Data Analyst", my: "ဉာဏ်ရည်တုနှင့် ဒေတာ ခွဲခြမ်းစိတ်ဖြာသူ" },
  "content-creator": { en: "Content Creator & Social Media Storyteller", my: "ဒစ်ဂျစ်တယ်အကြောင်းအရာ ဖန်တီးသူ" },
  "responsive-profile-card": { en: "Responsive Profile Card", my: "Responsive Profile Card" },
  "content-creator-awareness": { en: "Three-piece awareness campaign", my: "သုံးပိုင်းပါ အသိပညာပေး campaign" },
};

export function localizeCareerTerm(locale: string, key: string, fallback: string) {
  const term = careerTerms[key];
  return term ? term[locale === "my" ? "my" : "en"] : fallback;
}

export function localizeCareerDisplay(locale: string, fallback: string) {
  const entry = Object.values(careerTerms).find((term) => term.en === fallback || term.my === fallback);
  return entry ? entry[locale === "my" ? "my" : "en"] : fallback;
}

export function localizePathDescription(locale: string, key: string, fallback: string) {
  if (locale !== "my") return fallback;
  const descriptions: Record<string, string> = {
    "frontend-developer": "အသုံးပြုရလွယ်ကူပြီး device မျိုးစုံတွင် တုံ့ပြန်နိုင်သော production-quality web interface များ တည်ဆောက်ပါ။",
    "full-stack-developer": "Browser၊ server၊ data နှင့် cloud တစ်လျှောက် product အပြည့်အစုံ တည်ဆောက်ပြီး လည်ပတ်စေပါ။",
    "ai-data-analyst": "Data ကို တာဝန်ရှိသော analysis၊ dashboard နှင့် AI workflow များအဖြစ် ပြောင်းလဲပါ။",
    "content-creator": "အသုံးဝင်သောအကြောင်းအရာများကို ရှင်းလင်းပြီး ကျင့်ဝတ်နှင့်ညီသော platform-native content ဖြင့် မျှဝေပါ။",
  };
  return descriptions[key] ?? fallback;
}

const myanmarMilestones: Record<string, Partial<Milestone>> = {
  "content-awareness-campaign": {
    title: "ပရိသတ်နှင့် ပြဿနာ လေ့လာမှု",
    description: "တိကျသော ပရိသတ်တစ်စုကို ရွေးချယ်ပြီး သူတို့လိုအပ်ချက်ကို သက်သေအထောက်အထားဖြင့် လေ့လာကာ အသုံးဝင်သော campaign လမ်းကြောင်းတစ်ခု ဖန်တီးပါ။",
    proof: "ပရိသတ်နှင့် campaign အကျဉ်းချုပ်",
    leftLabel: "လေ့လာမည်",
    left: ["ပရိသတ်နှင့် စကားပြောခြင်း", "ပြဿနာ၏ သက်သေ"],
    rightLabel: "သတ်မှတ်မည်",
    right: ["Campaign ရည်မှန်းချက်", "ကျင့်ဝတ် စည်းမျဉ်း"],
    estimate: "၁–၂ ပတ်",
  },
  "content-story-system": {
    title: "ဇာတ်လမ်းနှင့် script ရေးသားမှု",
    description: "ရှင်းလင်းသော သတင်းစကားတစ်ခုကို ပရိသတ်နှင့် channel အလိုက် ဆက်စပ်နေသော content များအဖြစ် ပုံဖော်ပါ။",
    proof: "သုံးပိုင်းပါ ဇာတ်လမ်းနှင့် script",
    leftLabel: "ရေးမည်",
    left: ["အစပိုင်းနှင့် ဖွဲ့စည်းပုံ", "အသံပုံစံနှင့် ရှင်းလင်းမှု"],
    rightLabel: "စီစဉ်မည်",
    right: ["Content အစီအစဉ်", "လုပ်ဆောင်ရန် ဖိတ်ခေါ်ချက်"],
    estimate: "၁–၂ ပတ်",
  },
  "content-mobile-production": {
    title: "ဖုန်းဖြင့် content ထုတ်လုပ်မှု",
    description: "ယုံကြည်စိတ်ချရသော ဖုန်းအခြေပြု workflow ဖြင့် platform နှင့် ကိုက်ညီသည့် content များ ထုတ်လုပ်ပါ။",
    proof: "ထုတ်ဝေရန် အသင့်ဖြစ်သော visual နှင့် video draft",
    leftLabel: "ရိုက်ကူးမည်",
    left: ["မြင်ကွင်းနှင့် အလင်း", "ကြည်လင်သော အသံ"],
    rightLabel: "ပြင်ဆင်မည်",
    right: ["အရှိန်နှင့် layout", "Export အရည်အသွေး"],
    estimate: "၂–၃ ပတ်",
  },
  "content-safe-publishing": {
    title: "လူတိုင်းသုံးနိုင်ပြီး လုံခြုံသော ထုတ်ဝေမှု",
    description: "Source၊ မသေချာမှုနှင့် AI အသုံးပြုမှုကို မဖုံးကွယ်ဘဲ နားလည်လွယ်ပြီး ယုံကြည်ရသော content ထုတ်ဝေပါ။",
    proof: "လူတိုင်းသုံးနိုင်မှုနှင့် လုံခြုံမှု စစ်ဆေးစာရင်း",
    leftLabel: "ထည့်သွင်းမည်",
    left: ["စာတန်းနှင့် စာသား", "ဖတ်ရလွယ်သော ဖွဲ့စည်းပုံ"],
    rightLabel: "ကာကွယ်မည်",
    right: ["Source ဖော်ပြမှု", "သဘောတူညီမှုနှင့် လုံခြုံမှု"],
    estimate: "၁–၂ ပတ်",
  },
  "content-case-study": {
    title: "Campaign ဖြစ်ရပ်လေ့လာချက်",
    description: "Campaign၊ ပရိသတ်သက်သေ၊ ဆုံးဖြတ်ချက်၊ ရလဒ်နှင့် သင်ယူမှုတို့ကို portfolio အတွက် အသင့်ဖြစ်သော သက်သေအဖြစ် စုစည်းပါ။",
    proof: "မိတ်ဖက်သုံးသပ်ထားသော campaign ဖြစ်ရပ်လေ့လာချက်",
    leftLabel: "တိုင်းတာမည်",
    left: ["အသုံးဝင်သော အချက်ပြ", "ပရိသတ် တုံ့ပြန်မှု"],
    rightLabel: "ရှင်းပြမည်",
    right: ["ဆုံးဖြတ်ချက် အကြောင်းရင်း", "Portfolio ဇာတ်ကြောင်း"],
    estimate: "၂–၃ ပတ်",
  },
};

export function localizeRoadmapMilestone(locale: string, milestone: Milestone): Milestone {
  if (locale !== "my") return milestone;
  return { ...milestone, ...(myanmarMilestones[milestone.key] ?? {}) };
}

export function localizeTrackOutcome(locale: string, key: string, fallback: string) {
  if (locale !== "my") return fallback;
  const outcomes: Record<string, string> = {
    "frontend-developer": "ဝဘ်အခြေခံမှ မိတ်ဖက်သုံးသပ်ထားသော frontend product အထိ။",
    "full-stack-developer": "Client-server အခြေခံမှ production full-stack system အထိ။",
    "ai-data-analyst": "ဒေတာနားလည်မှုမှ မိတ်ဖက်သုံးသပ်ထားသော analysis case study အထိ။",
    "content-creator": "ပရိသတ်လေ့လာမှုမှ မိတ်ဖက်သုံးသပ်ထားသော campaign case study အထိ။",
  };
  return outcomes[key] ?? fallback;
}

const opportunityTranslations: Record<string, Partial<OpportunityCard>> = {
  "Digital Entrepreneurship Program Intern": { title: "ဒစ်ဂျစ်တယ် စွန့်ဦးတီထွင်မှု အစီအစဉ် အလုပ်သင်", organization: "Strategy First International College", type: "အလုပ်သင်", location: "ရန်ကုန် · ပေါင်းစပ်", supported: ["အဓိပ္ပါယ်ရှိသော HTML", "တုံ့ပြန်နိုင်သော CSS", "အသုံးပြုနိုင်သော ဖွဲ့စည်းပုံ"], gaps: ["Deployment မှတ်တမ်း"] },
  "Digital Entrepreneurship Community Challenge": { title: "ဒစ်ဂျစ်တယ် စွန့်ဦးတီထွင်မှု အသိုင်းအဝိုင်း စိန်ခေါ်ပွဲ", organization: "ရန်ကုန်ရှိ အမေရိကန် သံရုံး", type: "စိန်ခေါ်ပွဲ", location: "မြန်မာ · အဝေးမှ", supported: ["အဓိပ္ပါယ်ရှိသော HTML", "တုံ့ပြန်နိုင်သော CSS"], gaps: ["JavaScript အခြေခံ"] },
  "Junior Frontend Build Challenge": { title: "Frontend တည်ဆောက်မှု စိန်ခေါ်ပွဲ", organization: "လမ်းပြ စမ်းသပ်မိတ်ဖက်", type: "စိန်ခေါ်ပွဲ", location: "မြန်မာ · အဝေးမှ", supported: ["အဓိပ္ပါယ်ရှိသော HTML", "တုံ့ပြန်နိုင်သော CSS"] },
  "Digital Skills Scholarship": { title: "ဒစ်ဂျစ်တယ်ကျွမ်းကျင်မှု ပညာသင်ဆု", organization: "မြန်မာ့ အနာဂတ်ကျွမ်းကျင်မှု", type: "ပညာသင်ဆု", location: "အွန်လိုင်း", supported: ["Frontend စိတ်ဝင်စားမှု"], unknown: ["လက်ရှိ တက္ကသိုလ်ကျောင်းသားဖြစ်မှု"] },
};

export function localizeOpportunity(locale: string, opportunity: OpportunityCard): OpportunityCard {
  if (locale !== "my") return opportunity;
  return { ...opportunity, ...(opportunityTranslations[opportunity.title] ?? {}) };
}

export function localizeReadiness(locale: string, readiness: OpportunityCard["readiness"]) {
  if (locale !== "my") return readiness;
  return ({ "Ready now": "ယခုအဆင်သင့်", "Build toward": "ပြင်ဆင်ရန်လို", Explore: "စူးစမ်းရန်", "Cannot determine": "မသတ်မှတ်နိုင်" } as const)[readiness];
}

export function localizeRecommendationReason(locale: string, fallback: string) {
  return locale === "my" ? "သင်ရွေးချယ်ထားသော စိတ်ဝင်စားမှု၊ လက်ရာပုံစံနှင့် လက်ရှိကိရိယာတို့နှင့် ကိုက်ညီသောကြောင့် အကြံပြုထားခြင်းဖြစ်သည်။" : fallback;
}

export function localizeArena(locale: string, fallback: string) {
  if (locale !== "my") return fallback;
  return ({ "Technology & Data": "နည်းပညာနှင့် ဒေတာ", "Stories & Community": "အကြောင်းအရာနှင့် လူမှုအသိုင်းအဝိုင်း", "Visual Craft": "Visual ဖန်တီးမှု", "Business & Growth": "စီးပွားရေးနှင့် တိုးတက်မှု" } as Record<string, string>)[fallback] ?? fallback;
}

export function localizePreference(locale: string, value: string) {
  const labels: Record<string, { en: string; my: string }> = {
    make: { en: "Make", my: "ဖန်တီးလိုသည်" }, explain: { en: "Explain", my: "ရှင်းပြလိုသည်" }, design: { en: "Design", my: "ဒီဇိုင်းလုပ်လိုသည်" }, analyze: { en: "Analyze", my: "ခွဲခြမ်းစိတ်ဖြာလိုသည်" }, organize: { en: "Organize", my: "စီစဉ်လိုသည်" }, grow: { en: "Grow", my: "တိုးတက်စေလိုသည်" }, not_sure: { en: "Not sure yet", my: "မသေချာသေးပါ" }, explore: { en: "Explore options", my: "ရွေးချယ်စရာများ စူးစမ်းမည်" }, portfolio: { en: "Build a portfolio", my: "Portfolio တည်ဆောက်မည်" }, internship: { en: "Find an internship", my: "Internship ရှာမည်" }, first_job: { en: "Work toward a first job", my: "ပထမအလုပ်အတွက် ပြင်ဆင်မည်" }, freelance: { en: "Prepare for freelance", my: "Freelance အတွက် ပြင်ဆင်မည်" }, phone_only: { en: "Phone only", my: "ဖုန်းသာ" }, phone_and_laptop: { en: "Phone + laptop", my: "ဖုန်းနှင့် laptop" }, laptop: { en: "Laptop", my: "Laptop" }, reliable: { en: "Usually reliable", my: "အများအားဖြင့် အဆင်ပြေ" }, limited: { en: "Limited or expensive", my: "ကန့်သတ်ထားသည် သို့မဟုတ် ကုန်ကျစရိတ်များ" }, "Technology": { en: "Technology", my: "နည်းပညာ" }, "Startup": { en: "Startup", my: "လုပ်ငန်းသစ်" }, "Social impact": { en: "Social impact", my: "လူမှုအကျိုးသက်ရောက်မှု" }, "Business": { en: "Business", my: "စီးပွားရေး" }, "Arts & culture": { en: "Arts & culture", my: "အနုပညာနှင့် ယဉ်ကျေးမှု" }, "Fashion": { en: "Fashion", my: "ဖက်ရှင်" }, "Food": { en: "Food", my: "အစားအသောက်" }, "Math & physics": { en: "Math & physics", my: "သင်္ချာနှင့် ရူပဗေဒ" }, "Programming": { en: "Programming", my: "Programming" }, "Movie & shows": { en: "Movie & shows", my: "ရုပ်ရှင်နှင့် ဖျော်ဖြေရေး" }, "Music": { en: "Music", my: "ဂီတ" }, "Self growth": { en: "Self growth", my: "ကိုယ်တိုင်တိုးတက်မှု" }, "Basic CSS": { en: "Basic CSS", my: "အခြေခံ CSS" }, "Responsive design": { en: "Responsive design", my: "Responsive design" }, "Mobile video editing": { en: "Mobile video editing", my: "ဖုန်းဖြင့် ဗီဒီယိုပြင်ဆင်ခြင်း" }, "Writing or social posts": { en: "Writing or social posts", my: "စာရေးခြင်း သို့မဟုတ် social post များ" },
  };
  const label = labels[value];
  return label ? label[locale === "my" ? "my" : "en"] : value.replaceAll("_", " ");
}

export function formatAppDate(locale: string, value: string | Date) {
  return new Intl.DateTimeFormat(locale === "my" ? "my-MM" : "en-US", { dateStyle: "medium" }).format(new Date(value));
}
