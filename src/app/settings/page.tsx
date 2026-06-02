"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Image, Moon, Sun } from "lucide-react";

import { getAccessToken } from "@/lib/auth";

type ThemeMode = "dark" | "light";

type BackgroundPreset = "default" | "gradient" | "blue" | "gray";

const THEME_STORAGE_KEY = "rag-chatbot-theme";
const BACKGROUND_STORAGE_KEY = "rag-chatbot-background";

const backgroundOptions: {
  value: BackgroundPreset;
  label: string;
  description: string;
}[] = [
  {
    value: "default",
    label: "Mặc định",
    description: "Nền đơn giản, phù hợp với giao diện hiện tại.",
  },
  {
    value: "gradient",
    label: "Gradient",
    description: "Nền chuyển sắc nhẹ, tạo cảm giác hiện đại hơn.",
  },
  {
    value: "blue",
    label: "Xanh đậm",
    description: "Tông xanh, phù hợp với giao diện học tập và tài liệu.",
  },
  {
    value: "gray",
    label: "Xám",
    description: "Nền xám trung tính, ít tương phản hơn nền mặc định.",
  },
];

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

export default function SettingsPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [background, setBackground] = useState<BackgroundPreset>("default");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const savedTheme =
      (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null) || "dark";

    const savedBackground =
      (localStorage.getItem(
        BACKGROUND_STORAGE_KEY
      ) as BackgroundPreset | null) || "default";

    setTheme(savedTheme);
    setBackground(savedBackground);

    applyTheme(savedTheme);
    applyBackground(savedBackground);

    setCheckingAuth(false);
  }, [router]);

  function handleChangeTheme(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    setSaved(false);

    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  function handleChangeBackground(nextBackground: BackgroundPreset) {
    setBackground(nextBackground);
    setSaved(false);

    localStorage.setItem(BACKGROUND_STORAGE_KEY, nextBackground);
    applyBackground(nextBackground);
  }

  function handleSave() {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    localStorage.setItem(BACKGROUND_STORAGE_KEY, background);

    applyTheme(theme);
    applyBackground(background);

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 1800);
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-transparent text-[var(--text-main)]">
        <div className="rounded-2xl border border-[var(--border-main)] bg-[var(--panel-bg)] px-6 py-4 text-sm text-[var(--text-muted)]">
          Đang kiểm tra đăng nhập...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent px-6 py-8 text-[var(--text-main)]">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => router.push("/chat")}
          className="mb-6 flex items-center gap-2 rounded-xl border border-[var(--border-main)] bg-[var(--panel-bg)] px-4 py-2 text-sm text-[var(--text-muted)] transition hover:bg-[var(--panel-bg-soft)] hover:text-[var(--text-main)]"
        >
          <ArrowLeft size={17} />
          Quay lại chat
        </button>

        <section className="rounded-3xl border border-[var(--border-main)] bg-[var(--panel-bg)] p-6 shadow-2xl">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)]">
              Cài đặt
            </h1>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Tùy chỉnh giao diện hiển thị của RAG Chatbot.
            </p>
          </div>

          <div className="mt-8 space-y-8">
            <div>
              <div className="flex items-center gap-2">
                <Moon size={18} className="text-[var(--text-muted)]" />
                <h2 className="text-base font-semibold text-[var(--text-main)]">
                  Chủ đề giao diện
                </h2>
              </div>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Chọn chế độ màu phù hợp với môi trường sử dụng.
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleChangeTheme("dark")}
                  className={[
                    "rounded-2xl border p-4 text-left transition",
                    theme === "dark"
                      ? "border-blue-600 bg-blue-950/40"
                      : "border-[var(--border-main)] bg-[var(--card-bg)] hover:bg-[var(--panel-bg-soft)]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-[var(--text-main)]">
                        <Moon size={18} />
                        <p className="font-semibold">Dark mode</p>
                      </div>

                      <p className="mt-2 text-sm text-[var(--text-muted)]">
                        Giao diện nền tối, phù hợp với thiết kế hiện tại.
                      </p>
                    </div>

                    {theme === "dark" && (
                      <Check size={18} className="text-blue-400" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleChangeTheme("light")}
                  className={[
                    "rounded-2xl border p-4 text-left transition",
                    theme === "light"
                      ? "border-blue-600 bg-blue-950/40"
                      : "border-[var(--border-main)] bg-[var(--card-bg)] hover:bg-[var(--panel-bg-soft)]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-[var(--text-main)]">
                        <Sun size={18} />
                        <p className="font-semibold">Light mode</p>
                      </div>

                      <p className="mt-2 text-sm text-[var(--text-muted)]">
                        Lựa chọn thử nghiệm cho giao diện sáng.
                      </p>
                    </div>

                    {theme === "light" && (
                      <Check size={18} className="text-blue-400" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Image size={18} className="text-[var(--text-muted)]" />
                <h2 className="text-base font-semibold text-[var(--text-main)]">
                  Hình nền
                </h2>
              </div>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Chọn một kiểu nền có sẵn cho giao diện.
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {backgroundOptions.map((option) => {
                  const active = background === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleChangeBackground(option.value)}
                      className={[
                        "rounded-2xl border p-4 text-left transition",
                        active
                          ? "border-blue-600 bg-blue-950/40"
                          : "border-[var(--border-main)] bg-[var(--card-bg)] hover:bg-[var(--panel-bg-soft)]",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-[var(--text-main)]">
                            {option.label}
                          </p>

                          <p className="mt-2 text-sm text-[var(--text-muted)]">
                            {option.description}
                          </p>
                        </div>

                        {active && (
                          <Check size={18} className="text-blue-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-[var(--border-main)] pt-5">
            <p className="text-sm text-[var(--text-muted)]">
              Cài đặt hiện được lưu trên trình duyệt bằng localStorage.
            </p>

            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              {saved ? "Đã lưu" : "Lưu thay đổi"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
