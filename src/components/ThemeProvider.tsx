"use client";

import { useEffect } from "react";

type ThemeMode = "dark" | "light";
type BackgroundPreset = "default" | "gradient" | "blue" | "gray";

const THEME_STORAGE_KEY = "rag-chatbot-theme";
const BACKGROUND_STORAGE_KEY = "rag-chatbot-background";

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;

  root.dataset.theme = theme;

  if (theme === "light") {
    root.classList.add("light-theme");
  } else {
    root.classList.remove("light-theme");
  }
}

function applyBackground(background: BackgroundPreset) {
  const body = document.body;

  body.classList.remove(
    "bg-preset-default",
    "bg-preset-gradient",
    "bg-preset-blue",
    "bg-preset-gray"
  );

  body.classList.add(`bg-preset-${background}`);
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const savedTheme =
      (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null) || "dark";

    const savedBackground =
      (localStorage.getItem(
        BACKGROUND_STORAGE_KEY
      ) as BackgroundPreset | null) || "default";

    applyTheme(savedTheme);
    applyBackground(savedBackground);
  }, []);

  return <>{children}</>;
}