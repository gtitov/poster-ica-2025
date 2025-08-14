"use client";
import { cva } from "class-variance-authority";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
} from "fumadocs-ui/components/ui/collapsible";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import posthog from "posthog-js";
import { type SyntheticEvent, useEffect, useState } from "react";
import { twMerge as cn } from "tailwind-merge";

const rateButtonVariants = cva(
  "inline-flex items-center gap-2 px-3 py-2 rounded-full font-medium border text-sm [&_svg]:size-4 disabled:cursor-not-allowed",
  {
    variants: {
      active: {
        true: "bg-fd-accent text-fd-accent-foreground [&_svg]:fill-current",
        false: "text-fd-muted-foreground",
      },
    },
  }
);

export interface Feedback {
  opinion: "good" | "bad";
  url?: string;
  message: string;
}

export function Rate() {
  const [opinion, setOpinion] = useState<"good" | "bad" | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (opinion === null) return;
    posthog.capture("vote", { opinion: opinion });
  }, [opinion]);

  function submit(e?: SyntheticEvent) {
    console.log(opinion, message);
    if (opinion == null) return;

    e?.preventDefault();

    posthog.capture("feedback", {
      opinion: opinion,
      message: message,
    });

    setSubmitted(true);
  }

  return (
    <Collapsible
      open={opinion !== null}
      onOpenChange={(v) => {
        if (!v) setOpinion(null);
      }}
      className="border-y py-3"
    >
      <div className="flex flex-row items-center gap-2">
        <p className="text-sm font-medium pe-2">How is this poster?</p>
        <button
          className={cn(
            rateButtonVariants({
              active: opinion === "good",
            })
          )}
          onClick={() => {
            setOpinion("good");
          }}
          disabled={submitted}
        >
          <ThumbsUp />
          Good
        </button>
        <button
          className={cn(
            rateButtonVariants({
              active: opinion === "bad",
            })
          )}
          onClick={() => {
            setOpinion("bad");
          }}
          disabled={submitted}
        >
          <ThumbsDown />
          Bad
        </button>
      </div>
      <CollapsibleContent className="mt-3">
        {submitted ? (
          <div className="px-3 py-6 flex flex-col items-center gap-3 bg-fd-card text-fd-muted-foreground text-sm text-center rounded-xl">
            <p>Thank you for your feedback!</p>
          </div>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={submit}>
            <textarea
              autoFocus
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border rounded-lg bg-fd-secondary text-fd-secondary-foreground p-3 resize-none focus-visible:outline-none placeholder:text-fd-muted-foreground"
              placeholder="Leave your feedback..."
              onKeyDown={(e) => {
                if (!e.shiftKey && e.key === "Enter") {
                  submit(e);
                }
              }}
            />
            <button
              className={cn(buttonVariants({ color: "outline" }), "w-fit px-3")}
              onClick={submit}
            >
              Submit
            </button>
          </form>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
