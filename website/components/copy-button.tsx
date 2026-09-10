"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSite } from "../lib/site-context";

const RESET_MS = 2200;

export function CopyButton({ value, label }: { value: string; label: string }) {
  const { locale } = useSite();
  const [state, setState] = useState("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        new URL(value, window.location.href).href,
      );
      setState("copied");
    } catch {
      setState("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), RESET_MS);
  }
  const copied = locale === "zh-CN" ? "已复制" : "Copied";
  const failed = failureLabel(locale);
  return (
    <div className="copy-control">
      <button
        type="button"
        className="button secondary-button"
        aria-label={label}
        onClick={copy}
      >
        {state === "copied" ? <Check size={16} /> : <Copy size={16} />}
        <span role="status">
          {state === "copied" ? copied : state === "failed" ? failed : label}
        </span>
      </button>
      {state === "failed" ? (
        <input
          readOnly
          aria-label="URL"
          value={value}
          onFocus={(event) => event.target.select()}
        />
      ) : null}
    </div>
  );
}

function failureLabel(locale: string) {
  return locale === "zh-CN"
    ? "复制失败，请手动复制"
    : "Copy failed; select the URL below";
}
