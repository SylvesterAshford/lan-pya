import { Check, CircleHelp, X } from "lucide-react";
import type { CheckObservation } from "@/lib/data/app-data";

type CheckLabels = { checkPass: string; checkUnsure: string; checkHttp: string; checkMalformed: string; checkFail: string };

/**
 * One line per checked link: its name, and what the link checker found.
 * Shared by the learner's runner and the reviewer's page, so both read a
 * result the same way. The checker's own detail is English; only the HTTP
 * code is carried over, the rest is said in the reader's language.
 */
export function CheckList({ observations, labels, linkName }: { observations: CheckObservation[]; labels: CheckLabels; linkName: (check: string) => string }) {
  const result = (item: CheckObservation) => {
    if (item.status === "pass") return labels.checkPass;
    if (item.status === "inconclusive") return labels.checkUnsure;
    const code = /HTTP (\d{3})/.exec(item.detail)?.[1];
    if (code) return labels.checkHttp.replace("{code}", code);
    return /malformed/i.test(item.detail) ? labels.checkMalformed : labels.checkFail;
  };
  return (
    <ul className="runner-checks">
      {observations.map((item) => (
        <li key={item.check} className={`is-${item.status}`}>
          <span className="runner-check-icon" aria-hidden="true">
            {item.status === "pass" ? <Check size={13} /> : item.status === "fail" ? <X size={13} /> : <CircleHelp size={13} />}
          </span>
          <span><strong>{linkName(item.check)}</strong> · {result(item)}</span>
        </li>
      ))}
    </ul>
  );
}
