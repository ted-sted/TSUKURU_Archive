    function calculateSpan(startY, startM, startD) {
      const start = new Date(startY, startM - 1, startD);
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let years = end.getFullYear() - start.getFullYear();
      let months = end.getMonth() - start.getMonth();
      let days = end.getDate() - start.getDate();

      if (days < 0) {
        months -= 1;
        const prevMonthEnd = new Date(end.getFullYear(), end.getMonth(), 0);
        days += prevMonthEnd.getDate();
      }

      if (months < 0) {
        years -= 1;
        months += 12;
      }

      const totalDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
      return { years, months, days, totalDays, end };
    }

    function convertDaysToYM(days) {
      const years = Math.floor(days / 365);
      const remaining = days % 365;
      const months = Math.floor(remaining / 30);
      return { years, months };
    }

    function formatDate(d) {
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const day = d.getDate();
      return y + "/" + m + "/" + day;
    }

    document.addEventListener("DOMContentLoaded", function () {
      const careerSpan = calculateSpan(1984, 4, 1);
      const careerSpanTextEl = document.getElementById("career-span-text");
      if (careerSpanTextEl) {
        careerSpanTextEl.textContent =
          careerSpan.totalDays.toLocaleString() + "日（" +
          careerSpan.years + "年" +
          careerSpan.months + "ヶ月" +
          careerSpan.days + "日）";
      }

      const azenSpan = calculateSpan(2021, 9, 11);
      const azenPeriodEl = document.getElementById("azen-period");
      if (azenPeriodEl) {
        azenPeriodEl.textContent =
          "2021/9/11 〜 " +
          formatDate(azenSpan.end) +
          "（" + azenSpan.totalDays.toLocaleString() + "日）";
      }

      const labels = [
        "洋食調理スタッフ",
        "流通店舗向けシステム開発",
        "店舗什器板金製造",
        "リテールソリューション営業",
        "金融機器導入スケジュール管理",
        "木工小物製造",
        "照明器具製造",
        "自動車カスタムパーツデザイン製造",
        "A-Zen"
      ];

      const baseDays = [
        2496,
        1702,
        3530,
        1156,
        1278,
        730,
        1884,
        893
      ];

      const azenDays = azenSpan.totalDays;

      const entries = labels.map((label, index) => ({
        label,
        days: index < baseDays.length ? baseDays[index] : azenDays
      }));

      const totalDaysAll = entries.reduce((sum, e) => sum + e.days, 0);

      const baseColors = [
        "#38bdf8",
        "#a855f7",
        "#f97316",
        "#22c55e",
        "#e11d48",
        "#facc15",
        "#0ea5e9",
        "#8b5cf6",
        "#f97373"
      ];

      const colorByLabel = {};
      entries.forEach((e, index) => {
        colorByLabel[e.label] = baseColors[index];
      });

      const detailIdsByLabel = {
        "洋食調理スタッフ": "career-food",
        "流通店舗向けシステム開発": "career-system",
        "店舗什器板金製造": "career-store",
        "リテールソリューション営業": "career-retail",
        "金融機器導入スケジュール管理": "career-finance",
        "木工小物製造": "career-wood",
        "照明器具製造": "career-light",
        "自動車カスタムパーツデザイン製造": "career-auto",
        "A-Zen": "career-azen"
      };

      const sortedEntries = [...entries].sort((a, b) => b.days - a.days);
      const pieLabels = sortedEntries.map(e => e.label);
      const pieDays = sortedEntries.map(e => e.days);
      const piePercentages = pieDays.map(d => d / totalDaysAll * 100);
      const pieColors = pieLabels.map(label => colorByLabel[label]);

      const barLabels = entries.map(e => e.label);
      const barDays = entries.map(e => e.days);
      const barColors = barLabels.map(label => colorByLabel[label]);

      const barCtx = document.getElementById("barChart");
      if (barCtx && window.Chart) {
        new Chart(barCtx.getContext("2d"), {
          type: "bar",
          data: {
            labels: barLabels,
            datasets: [{
              label: "日数",
              data: barDays,
              backgroundColor: barColors,
              borderColor: barColors,
              borderWidth: 1.2,
              borderRadius: 4
            }]
          },
          options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const value = context.raw;
                    return value.toLocaleString() + " 日";
                  }
                }
              }
            },
            scales: {
              x: {
                ticks: {
                  color: "#4b5563",
                  callback: value => value.toLocaleString()
                },
                grid: { color: "rgba(209, 213, 219, 0.8)" },
                title: {
                  display: true,
                  text: "日数",
                  color: "#111827"
                }
              },
              y: {
                ticks: {
                  autoSkip: false,
                  color: "#111827"
                },
                grid: { color: "rgba(229, 231, 235, 0.9)" }
              }
            }
          }
        });
      }

      const pieCtx = document.getElementById("pieChart");
      if (pieCtx && window.Chart) {
        new Chart(pieCtx.getContext("2d"), {
          type: "doughnut",
          data: {
            labels: pieLabels,
            datasets: [{
              data: piePercentages,
              backgroundColor: pieColors,
              borderColor: "#ffffff",
              borderWidth: 1.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            rotation: -0.25 * Math.PI,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.label || "";
                    const value = context.raw;
                    return label + "： " + value.toFixed(1) + " %";
                  }
                }
              },
              legend: {
                position: "bottom",
                labels: {
                  color: "#111827",
                  boxWidth: 16
                }
              }
            },
            cutout: "55%"
          }
        });
      }

      const tbody = document.getElementById("career-table-body");
      if (tbody) {
        entries.forEach(e => {
          const ym = convertDaysToYM(e.days);
          const percentage = e.days / totalDaysAll * 100;
          const tr = document.createElement("tr");
          const color = colorByLabel[e.label];
          const detailId = detailIdsByLabel[e.label];

          let labelCellHtml = "";
          if (detailId) {
            labelCellHtml =
              "<a href=\"#" + detailId + "\" class=\"career-link\">" +
                "<span class=\"career-color-dot\" style=\"background:" + color + ";\"></span>" +
                e.label +
              "</a>";
          } else {
            labelCellHtml =
              "<span class=\"career-color-dot\" style=\"background:" + color + ";\"></span>" +
              e.label;
          }

          tr.innerHTML =
            "<td>" + labelCellHtml + "</td>" +
            "<td>" + e.days.toLocaleString() + " 日</td>" +
            "<td>" + ym.years + "年" + ym.months + "ヶ月</td>" +
            "<td>" + percentage.toFixed(1) + " %</td>";
          tbody.appendChild(tr);
        });
      }

      const toggleBtn = document.getElementById("list-toggle-btn");
      const listPanel = document.getElementById("list-panel");
      if (toggleBtn && listPanel) {
        const indicator = toggleBtn.querySelector(".list-toggle-indicator");
        toggleBtn.addEventListener("click", () => {
          const isHidden = listPanel.hasAttribute("hidden");
          if (isHidden) {
            listPanel.removeAttribute("hidden");
            toggleBtn.setAttribute("aria-expanded", "true");
            if (indicator) indicator.textContent = "−";
          } else {
            listPanel.setAttribute("hidden", "");
            toggleBtn.setAttribute("aria-expanded", "false");
            if (indicator) indicator.textContent = "＋";
          }
        });
      }

      document.querySelectorAll(".timeline-collapsible").forEach(item => {
        const header = item.querySelector(".timeline-header");
        const body = item.querySelector(".timeline-body");
        const indicator = item.querySelector(".timeline-indicator");
        if (!header || !body) return;

        header.setAttribute("tabindex", "0");

        const toggle = () => {
          const isHidden = body.hasAttribute("hidden");
          if (isHidden) {
            body.removeAttribute("hidden");
            item.classList.add("is-open");
            if (indicator) indicator.textContent = "−";
          } else {
            body.setAttribute("hidden", "");
            item.classList.remove("is-open");
            if (indicator) indicator.textContent = "＋";
          }
        };

        header.addEventListener("click", toggle);
        header.addEventListener("keydown", e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        });
      });

      document.querySelectorAll(".product-card-collapsible").forEach(card => {
        const header = card.querySelector(".product-header");
        const body = card.querySelector(".product-body");
        const indicator = card.querySelector(".product-indicator");
        if (!header || !body) return;

        header.setAttribute("tabindex", "0");

        const toggle = () => {
          const isHidden = body.hasAttribute("hidden");
          if (isHidden) {
            body.removeAttribute("hidden");
            card.classList.add("is-open");
            if (indicator) indicator.textContent = "−";
          } else {
            body.setAttribute("hidden", "");
            card.classList.remove("is-open");
            if (indicator) indicator.textContent = "＋";
          }
        };

        header.addEventListener("click", toggle);
        header.addEventListener("keydown", e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        });
      });

      // 「基本理念」カードから Like a California Roll の全文へジャンプ＋自動展開
      const caliLink = document.querySelector(".js-open-california");
      const caliCard = document.getElementById("california-roll");

      if (caliLink && caliCard) {
        const openCaliforniaCard = () => {
          const body = caliCard.querySelector(".product-body");
          const indicator = caliCard.querySelector(".product-indicator");
          if (!body) return;

          if (body.hasAttribute("hidden")) {
            body.removeAttribute("hidden");
            caliCard.classList.add("is-open");
            if (indicator) indicator.textContent = "−";
          }
        };

        const scrollAndOpen = () => {
          caliCard.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
          openCaliforniaCard();
        };

        // クリック時
        caliLink.addEventListener("click", (e) => {
          e.preventDefault();
          scrollAndOpen();
        });

        // キーボード操作（Enter / Space）でも動くように
        caliLink.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            scrollAndOpen();
          }
        });

        // URL に #california-roll が付いている状態で開いたときも自動展開
        if (location.hash === "#california-roll") {
          openCaliforniaCard();
        }
      }


      document.querySelectorAll(".card, .timeline-item, .hero-main").forEach(el => {
        el.classList.add("fade-in-up");
      });

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15 });

        document.querySelectorAll(".fade-in-up").forEach(el => observer.observe(el));
      } else {
        document.querySelectorAll(".fade-in-up").forEach(el => {
          el.classList.add("is-visible");
        });
      }

      // --- ScrollSpy + 見出しハイライト（安定版：位置で判定） ---
      (() => {
        const navLinks = Array.from(document.querySelectorAll('header nav a[href^="#"]'));
        const sections = navLinks
          .map(a => document.querySelector(a.getAttribute("href")))
          .filter(el => el && el.tagName.toLowerCase() === "section");

        const linkById = new Map();
        navLinks.forEach(a => {
          const id = (a.getAttribute("href") || "").slice(1);
          if (id) linkById.set(id, a);
        });

        const headerEl = document.querySelector("header");
        const getOffset = () => (headerEl ? headerEl.offsetHeight : 0) + 16; // ←調整ポイント

        let activeId = null;
        const setActive = (id) => {
          if (!id || id === activeId) return;

          // nav
          if (activeId) {
            const prevLink = linkById.get(activeId);
            if (prevLink) {
              prevLink.classList.remove("is-active");
              prevLink.removeAttribute("aria-current");
            }
            const prevSec = document.getElementById(activeId);
            if (prevSec) prevSec.classList.remove("is-active");
          }

          activeId = id;

          const nextLink = linkById.get(id);
          if (nextLink) {
            nextLink.classList.add("is-active");
            nextLink.setAttribute("aria-current", "page");
          }
          const nextSec = document.getElementById(id);
          if (nextSec) nextSec.classList.add("is-active");
        };

        // スクロール位置から現在の section を決定
        let ticking = false;
        const update = () => {
          ticking = false;

          const offset = getOffset();
          let current = sections[0];

          for (const sec of sections) {
            const top = sec.getBoundingClientRect().top;
            if (top - offset <= 0) {
              current = sec; // ヘッダー直下を通過した最新の section
            } else {
              break; // DOM順なのでここで止めてOK
            }
          }
          if (current && current.id) setActive(current.id);
        };

        const onScroll = () => {
          if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
          }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", () => {
          // ヘッダー高さが変わる可能性があるので即更新
          update();
        });

        // 初期状態：hash があれば優先
        if (location.hash) {
          const id = location.hash.slice(1);
          if (linkById.has(id)) setActive(id);
        }

        // 初回反映
        update();

        // クリック直後も追従（スムーススクロール中の違和感を減らす）
        navLinks.forEach(a => {
          a.addEventListener("click", () => {
            const id = (a.getAttribute("href") || "").slice(1);
            if (id) setActive(id);
          });
        });
      })();

      // --- ぬるぬるスクロール（ホイール慣性）: 任意 ---
      (() => {
        // 動きを減らす設定の人には適用しない
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        // タッチ端末はOS側で慣性があるので触らない
        const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        if (isTouch) return;

        let target = window.scrollY;
        let current = window.scrollY;
        let rafId = null;

        // 好みで微調整（まずはこのままでOK）
        const maxDelta = 160; // 1回のホイール入力の最大移動量
        const ease = 0.12;    // 小さいほど“ぬるっ”、大きいほど“キビキビ”

        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

        const isEditable = () => {
          const ae = document.activeElement;
          if (!ae) return false;
          const tag = ae.tagName;
          return ae.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
        };

        const canScrollInDirection = (el, deltaY) => {
          const style = window.getComputedStyle(el);
          const overflowY = style.overflowY;
          if (!(overflowY === "auto" || overflowY === "scroll")) return false;
          if (el.scrollHeight <= el.clientHeight + 1) return false;

          if (deltaY > 0) {
            return el.scrollTop + el.clientHeight < el.scrollHeight - 1;
          } else {
            return el.scrollTop > 0;
          }
        };

        const findScrollableParent = (startEl, deltaY) => {
          let el = startEl;
          while (el && el !== document.body) {
            if (el instanceof HTMLElement && canScrollInDirection(el, deltaY)) return el;
            el = el.parentElement;
          }
          return null;
        };

        const animate = () => {
          current += (target - current) * ease;

          if (Math.abs(target - current) < 0.5) {
            window.scrollTo(0, target);
            rafId = null;
            return;
          }
          window.scrollTo(0, current);
          rafId = requestAnimationFrame(animate);
        };

        window.addEventListener(
          "wheel",
          (e) => {
            // ズーム操作や修飾キーは邪魔しない
            if (e.ctrlKey || e.metaKey) return;

            // 入力中は邪魔しない
            if (isEditable()) return;

            // トラックパッド由来の“細かい”deltaは触らない（元からぬるぬるなので）
            if (Math.abs(e.deltaY) < 15) return;

            // 内側にスクロール可能領域があり、まだスクロールできるなら奪わない
            const scrollParent = findScrollableParent(e.target, e.deltaY);
            if (scrollParent) return;

            e.preventDefault();

            const delta = clamp(e.deltaY, -maxDelta, maxDelta);
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

            target = clamp(target + delta, 0, maxScroll);

            if (!rafId) rafId = requestAnimationFrame(animate);
          },
          { passive: false }
        );

        window.addEventListener("resize", () => {
          target = window.scrollY;
          current = window.scrollY;
        });
      })();

    });

      // --- 音声ミニプレイヤー制御 ---
      const miniPlayer = document.getElementById("audio-mini-player");
      const miniAudio = document.getElementById("audio-mini-element");
      const miniTitle = document.getElementById("audio-mini-title");
      const miniClose = document.querySelector(".audio-mini-close");

      if (miniPlayer && miniAudio && miniTitle) {
        document.querySelectorAll("#audio .audio-link-label").forEach(label => {
          label.style.cursor = "pointer";

          label.addEventListener("click", () => {
            const src = label.getAttribute("data-audio-src");
            const titleText = label.textContent.trim();

            if (!src) return;

  // いったん全タイトルから「再生中」クラスを外す
  document.querySelectorAll("#audio .audio-link-label").forEach(l => {
    l.classList.remove("is-playing");
  });
  // クリックされたタイトルにだけ付ける
  label.classList.add("is-playing");

            // 別の音源に切り替えるときは一度停止して差し替え
            if (miniAudio.getAttribute("src") !== src) {
              miniAudio.pause();
              miniAudio.setAttribute("src", src);
            }

            miniTitle.textContent = titleText;
            miniPlayer.classList.add("is-visible");
            miniPlayer.setAttribute("aria-hidden", "false");

            // 自動再生（ブラウザによってはユーザー操作扱いにならず無視される場合もあるので、失敗しても無視）
            miniAudio.play().catch(() => {});
          });
        });

const hideMiniPlayer = () => {
  miniPlayer.classList.remove("is-visible");
  miniPlayer.setAttribute("aria-hidden", "true");
  miniAudio.pause();

  // 再生中バッジをすべて解除
  document.querySelectorAll("#audio .audio-link-label").forEach(l => {
    l.classList.remove("is-playing");
  });

miniAudio.addEventListener("ended", hideMiniPlayer);

};

        if (miniClose) {
          miniClose.addEventListener("click", hideMiniPlayer);
        }
      }

  
