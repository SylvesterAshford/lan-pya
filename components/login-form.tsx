import { Lock } from "lucide-react";
import { FieldGroup, FieldSeparator } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function LoginForm({
  title,
  description,
  provider,
  credentials,
  separator,
  privacy,
  className,
}: {
  title: string;
  description: string;
  provider: React.ReactNode;
  credentials: React.ReactNode;
  separator: string;
  privacy: string;
  className?: string;
}) {
  return (
    <div className={cn("auth-card auth-card-shadcn w-full max-w-md", className)}>
      <FieldGroup className="gap-5">
        <header className="auth-form-heading text-center">
          <h1 className="text-balance text-2xl font-bold tracking-[-0.03em] text-foreground">{title}</h1>
          <p className="mt-2 text-pretty text-base leading-6 text-muted-foreground">{description}</p>
        </header>

        {provider ? (
          <>
            {provider}
            <FieldSeparator className="auth-shadcn-separator">{separator}</FieldSeparator>
          </>
        ) : null}

        {credentials}

        <p className="privacy-copy">
          <Lock className="mt-0.5 size-4" aria-hidden="true" />
          <span>{privacy}</span>
        </p>
      </FieldGroup>
    </div>
  );
}
