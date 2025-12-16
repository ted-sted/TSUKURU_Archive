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
  // Keep CSS anchor offsets accurate for fixed header (prevents excessive gap on section jumps)
  const setHeaderHeightVar = () => {
    const header = document.querySelector('header');
    if (!header) return;
    const h = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--header-h', `${h}px`);
  };
  setHeaderHeightVar();
  window.addEventListener('resize', setHeaderHeightVar, { passive: true });
  // one more pass after fonts/layout settle
  window.setTimeout(setHeaderHeightVar, 250);


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

      const cssVar = (name, fallback) => {
        const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return v || fallback;
      };

      const baseColors = [
        cssVar("--cat-food",   "#38bdf8"),
        cssVar("--cat-system", "#a855f7"),
        cssVar("--cat-store",  "#f97316"),
        cssVar("--cat-retail", "#22c55e"),
        cssVar("--cat-fin",    "#e11d48"),
        cssVar("--cat-wood",   "#facc15"),
        cssVar("--cat-light",  "#0ea5e9"),
        cssVar("--cat-auto",   "#8b5cf6"),
        cssVar("--cat-azen",   "#f97373")
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


// Cross highlights (charts ↔ table ↔ timeline)
const rowByLabel = new Map();
const itemByLabel = new Map();
Object.keys(detailIdsByLabel).forEach(label => {
  const id = detailIdsByLabel[label];
  const it = document.getElementById(id);
  if (it) itemByLabel.set(label, it);
});

let crossActiveLabel = null;
const clearCross = () => {
  if (!crossActiveLabel) return;
  const row = rowByLabel.get(crossActiveLabel);
  const it = itemByLabel.get(crossActiveLabel);
  if (row) row.classList.remove('is-xlinked');
  if (it) it.classList.remove('is-xlinked');
  crossActiveLabel = null;
};

const applyCross = (label) => {
  if (!label || label === crossActiveLabel) return;
  clearCross();
  const row = rowByLabel.get(label);
  const it = itemByLabel.get(label);
  if (row) row.classList.add('is-xlinked');
  if (it) it.classList.add('is-xlinked');
  crossActiveLabel = label;
};

const preferReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
        const barChart = new Chart(barCtx.getContext("2d"), {
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
            onHover: (evt, elements) => {
              if (elements && elements.length) {
                const idx = elements[0].index;
                applyCross(barLabels[idx]);
              } else {
                clearCross();
              }
            },
            onClick: (evt, elements) => {
              if (!elements || !elements.length) return;
              const idx = elements[0].index;
              const label = barLabels[idx];
              const id = detailIdsByLabel[label];
              if (id && window.TSUKURU && typeof window.TSUKURU.openDetailById === 'function') {
                window.TSUKURU.openDetailById(id);
                return;
              }
              const el = id ? document.getElementById(id) : null;
              if (el) el.scrollIntoView({ behavior: preferReducedMotion ? 'auto' : 'smooth', block: 'start' });
            },

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

      barCtx.addEventListener('mouseleave', clearCross, { passive: true });

      const pieCtx = document.getElementById("pieChart");
      if (pieCtx && window.Chart) {
        const pieChart = new Chart(pieCtx.getContext("2d"), {
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
            onHover: (evt, elements) => {
              if (elements && elements.length) {
                const idx = elements[0].index;
                applyCross(pieLabels[idx]);
              } else {
                clearCross();
              }
            },
            onClick: (evt, elements) => {
              if (!elements || !elements.length) return;
              const idx = elements[0].index;
              const label = pieLabels[idx];
              const id = detailIdsByLabel[label];
              if (id && window.TSUKURU && typeof window.TSUKURU.openDetailById === 'function') {
                window.TSUKURU.openDetailById(id);
                return;
              }
              const el = id ? document.getElementById(id) : null;
              if (el) el.scrollIntoView({ behavior: preferReducedMotion ? 'auto' : 'smooth', block: 'start' });
            },

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

      pieCtx.addEventListener('mouseleave', clearCross, { passive: true });

      const tbody = document.getElementById("career-table-body");
      if (tbody) {
        entries.forEach(e => {
          const ym = convertDaysToYM(e.days);
          const percentage = e.days / totalDaysAll * 100;
          const tr = document.createElement("tr");
          tr.dataset.label = e.label;
          rowByLabel.set(e.label, tr);
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


      const revealTargets = document.querySelectorAll(".hero-main, .section-header, .section-label, h2, .card, .timeline-item, table");
      revealTargets.forEach((el, i) => {
        el.classList.add("fade-in-up");

        // “違いが分かるが重くない”程度のスタッガー（繰り返しで遅延が肥大しない）
        const delay = Math.min((i % 6) * 70, 280);
        el.style.setProperty("--reveal-delay", `${delay}ms`);

        // 見出し・セクションは少しだけ強める
        if (el.matches("h2, .section-header, .section-label")) {
          el.style.setProperty("--reveal-y", "24px");
          el.style.setProperty("--reveal-blur", "8px");
          el.style.setProperty("--reveal-scale", "0.98");
        } else {
          el.style.setProperty("--reveal-y", "18px");
          el.style.setProperty("--reveal-blur", "6px");
          el.style.setProperty("--reveal-scale", "0.985");
        }
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

      
      // --- ScrollSpy + 見出しハイライト（単一基準：見えているセクションに追従） ---
      (() => {
        const navLinks = Array.from(document.querySelectorAll('header nav a[href^="#"]'));
        if (!navLinks.length) return;

        const headerEl = document.querySelector("header");

        // section を nav 順に確定
        const sections = navLinks
          .map(a => document.querySelector(a.getAttribute("href")))
          .filter(el => el && el.tagName && el.tagName.toLowerCase() === "section");

        const linkById = new Map();
        navLinks.forEach(a => {
          const id = (a.getAttribute("href") || "").slice(1);
          if (id) linkById.set(id, a);
        });

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const setHeaderHVar = () => {
          if (!headerEl) return 0;
          const h = Math.ceil(headerEl.getBoundingClientRect().height || 0);
          if (h > 0) document.documentElement.style.setProperty('--header-h', `${h}px`);
          return h;
        };

        const getMarker = (sec) => {
          if (!sec) return null;
          // 視覚的な開始点を優先（SECTIONラベル/見出し位置）
          return (
            sec.querySelector(':scope > .container > .section-header') ||
            sec.querySelector(':scope > .container > .hero') ||
            sec.querySelector('.section-header') ||
            sec.querySelector('.hero') ||
            sec.querySelector('h1, h2') ||
            sec
          );
        };

        // “今見えている”を取るためのサンプリング点（ヘッダー直下）
        const samplePoint = () => {
          const h = headerEl ? headerEl.getBoundingClientRect().height : 0;
          const x = Math.floor(window.innerWidth * 0.5);
          const baseY = Math.min(window.innerHeight - 2, Math.ceil(h + 10));
          // header直下が空振りするケース（透明要素/ミニマップ等）に備えて複数候補
          return [
            { x, y: baseY },
            { x, y: Math.min(window.innerHeight - 2, baseY + 40) },
            { x, y: Math.min(window.innerHeight - 2, baseY + 90) },
          ];
        };

        const findSectionFromPoint = () => {
          // フォーカスパネル表示中は背面の現在地を更新しない（視覚的にも不要）
          if (document.querySelector('.focusPanel.is-open')) return null;

          for (const p of samplePoint()){
            const el = document.elementFromPoint(p.x, p.y);
            if (!el) continue;

            // ミニマップ/ヘッダーを踏んだら次候補へ
            if (el.closest && (el.closest('header') || el.closest('.miniMap'))) continue;

            const sec = el.closest ? el.closest('section[id]') : null;
            if (sec && sec.id && linkById.has(sec.id)) return sec.id;
          }
          return null;
        };

        let activeId = null;
        const setActive = (id) => {
          if (!id || id === activeId) return;

          // 前の active を解除
          if (activeId) {
            const prev = linkById.get(activeId);
            if (prev) {
              prev.classList.remove("is-active");
              prev.removeAttribute("aria-current");
            }
            const prevDot = document.querySelector(`.miniDot[data-target="${CSS.escape(activeId)}"]`);
            if (prevDot) {
              prevDot.classList.remove("is-active");
              prevDot.removeAttribute("aria-current");
            }
          }

          activeId = id;

          const next = linkById.get(id);
          if (next) {
            next.classList.add("is-active");
            next.setAttribute("aria-current", "page");
          }
          const nextDot = document.querySelector(`.miniDot[data-target="${CSS.escape(id)}"]`);
          if (nextDot) {
            nextDot.classList.add("is-active");
            nextDot.setAttribute("aria-current", "true");
          }
        };

        // 右側ミニマップ（ドット）
        const buildMiniMap = () => {
          // 既存があれば再利用（重複生成しない）
          let miniMapEl = document.querySelector('.miniMap');
          if (miniMapEl) return miniMapEl;

          if (sections.length < 2) return null;

          miniMapEl = document.createElement('div');
          miniMapEl.className = 'miniMap';
          miniMapEl.setAttribute('aria-label', 'セクションナビゲーション');

          sections.forEach(sec => {
            const id = sec.id;
            if (!id) return;
            const link = linkById.get(id);
            const label = (link ? link.textContent : id).trim();

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'miniDot';
            btn.dataset.target = id;
            // tooltip label is rendered via CSS (miniDot::after) to avoid layout overlap
            btn.dataset.label = label;
            btn.setAttribute('aria-label', label);

            btn.addEventListener('click', (e) => {
              e.preventDefault();
              const target = document.getElementById(id);
              if (!target) return;

              const headerH = setHeaderHVar();
              const gap = 2; // underlineと揃う程度にタイト
              const marker = getMarker(target);
              const y = (marker ? marker.getBoundingClientRect().top : target.getBoundingClientRect().top) + window.scrollY;
              const top = Math.max(0, Math.round(y - (headerH + gap)));

              // URLのhashも更新
              if (history && history.pushState) history.pushState(null, "", `#${id}`);
              else location.hash = `#${id}`;

              window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
              setActive(id);
            });

            miniMapEl.appendChild(btn);
          });

          document.body.appendChild(miniMapEl);
          return miniMapEl;
        };

        buildMiniMap();

        // 現在地判定：まず elementFromPoint、取れなければ marker top の順で決める
        let ticking = false;
        const update = () => {
          ticking = false;
          const fromPoint = findSectionFromPoint();
          if (fromPoint) {
            setActive(fromPoint);
            return;
          }

          const headerH = setHeaderHVar();
          const line = headerH + 10; // ヘッダー直下のライン

          let current = sections[0];
          for (const sec of sections) {
            const m = getMarker(sec);
            const top = (m ? m.getBoundingClientRect().top : sec.getBoundingClientRect().top);
            if (top <= line) current = sec;
            else break;
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
          setHeaderHVar();
          update();
        });

        // nav click はネイティブ遷移に頼らず、常に同じ計算でスクロールする
        navLinks.forEach(a => {
          a.addEventListener("click", (e) => {
            // 新規タブ等の意図は尊重
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

            const id = (a.getAttribute("href") || "").slice(1);
            if (!id) return;

            const target = document.getElementById(id);
            if (!target) return;

            e.preventDefault();

            const headerH = setHeaderHVar();
            const gap = 2;
            const marker = getMarker(target);
            const y = (marker ? marker.getBoundingClientRect().top : target.getBoundingClientRect().top) + window.scrollY;
            const top = Math.max(0, Math.round(y - (headerH + gap)));

            if (history && history.pushState) history.pushState(null, "", `#${id}`);
            else location.hash = `#${id}`;

            window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
            setActive(id);
          });
        });

        // 初期：hash があれば優先
        setHeaderHVar();
        if (location.hash) {
          const id = location.hash.slice(1);
          if (linkById.has(id)) setActive(id);
        }

        update();
      })();




// --- ぬるぬるスクロール（ホイール慣性）: 無効化（操作感優先） ---

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


/* =========================================================
   2025-26 UI Motion Patch (non-destructive)
   - KPI boot overlay (成分集計中) + slower count-up
   - Progress ring
   - Focus panel for timeline details + background scroll lock
   ========================================================= */
(() => {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fmt = new Intl.NumberFormat('ja-JP');

  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

  function animateNumber(el, to, ms){
    if (!el) return;
    if (reduceMotion){ el.textContent = fmt.format(to); return; }
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms);
      const v = Math.round(from + (to - from) * easeOutCubic(t));
      el.textContent = fmt.format(v);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- progress ring ---------- */
  // initProgressRing removed (right-bottom ring deleted)

  /* ---------- KPI boot overlay ---------- */
  
  function getHeroIndustries(){
    const stats = Array.from(document.querySelectorAll('.hero-stat'));
    for (const s of stats){
      const lbl = (s.querySelector('.hero-stat-label')?.textContent || '').trim();
      if (lbl === '成分'){
        const v = (s.querySelector('.hero-stat-value')?.textContent || '').trim();
        const m = v.match(/(\d+)/);
        if (m) return Number(m[1]);
      }
    }
    return null;
  }

  function getHeroTotalDays(){
    const el = document.getElementById('career-span-text');
    if (!el) return null;
    const txt = (el.textContent || '').trim();
    const m = txt.match(/([\d,]+)\s*日/);
    if (!m) return null;
    const n = Number(m[1].replace(/,/g,''));
    return Number.isFinite(n) ? n : null;
  }

function computeKpisFromTable(){
    const tbody = document.getElementById('career-table-body');
    if (!tbody) return null;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    if (!rows.length) return null;

    const industries = rows.length;

    let totalDays = 0;
    for (const r of rows){
      const td = r.children && r.children[1];
      const txt = (td ? td.textContent : '') || '';
      const n = Number(String(txt).replace(/[^\d]/g,''));
      if (!Number.isNaN(n)) totalDays += n;
    }
    if (!industries || !totalDays) return null;
    return { industries, totalDays };
  }

  function initKpiBoot(){
    // 既存JS（上部の累計日数表示）が先に入っている前提で、まずはトップ表示と一致させる
    const heroIndustries = getHeroIndustries();
    const heroTotalDays = getHeroTotalDays();

    // テーブルが取れるなら業種数の裏取りに使う（無い場合はトップ表示から）
    const tableKpis = computeKpisFromTable();

    const industries = (heroIndustries ?? tableKpis?.industries);
    // “累計日数”はトップ画面表示（career-span-text）を最優先
    const totalDays = (heroTotalDays ?? tableKpis?.totalDays);

    if (!industries || !totalDays) return;

    // 1回だけ
    if (document.querySelector('.kpiBoot')) return;

    const boot = document.createElement('div');
    boot.className = 'kpiBoot';
    boot.innerHTML = `
      <div class="kpiBootInner" role="status" aria-live="polite">
        <p class="kpiBootTitle">成分集計中</p>
        <div class="kpiGrid">
          <div class="kpiCard"><div class="kpiNum" data-k="ind">0</div><div class="kpiLbl">業種</div></div>
          <div class="kpiCard"><div class="kpiNum" data-k="day">0</div><div class="kpiLbl">累計日数</div></div>
        </div>
      </div>
    `;
    document.body.appendChild(boot);

    const indEl = boot.querySelector('[data-k="ind"]');
    const dayEl = boot.querySelector('[data-k="day"]');

    // 少し遅めに（体感：じっくり）
    const indMs = 1200;
    const dayMs = 1900;
    const delay = 180;

    setTimeout(() => {
      animateNumber(indEl, industries, indMs);
      animateNumber(dayEl, totalDays, dayMs);
    }, delay);

    const totalShow = delay + Math.max(indMs, dayMs) + 520;

    setTimeout(() => {
      if (reduceMotion){
        boot.remove();
        return;
      }
      boot.animate([{opacity:1},{opacity:0}], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' })
        .finished.then(() => boot.remove());
    }, totalShow);
  }

  /* ---------- scroll lock (prevents background scroll) ---------- */
  let scrollLockY = 0;
  let isLocked = false;

  function lockBodyScroll(){
    if (isLocked) return;
    isLocked = true;

    scrollLockY = window.scrollY || window.pageYOffset || 0;

    // scrollbar compensation to avoid layout shift
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;

    document.body.classList.add('modal-open');
    document.body.style.top = `-${scrollLockY}px`;
  }

  function unlockBodyScroll(){
    const { restore = true } = arguments.length ? (arguments[0] || {}) : { restore: true };
    if (!isLocked) return;
    isLocked = false;

    document.body.classList.remove('modal-open');
    document.body.style.top = '';
    document.body.style.paddingRight = '';

    if (!restore) return;

    // restore to the scroll position where the modal was opened
    const docEl = document.documentElement;
    const prevSB = docEl.style.scrollBehavior;
    docEl.style.scrollBehavior = 'auto';
    window.scrollTo(0, scrollLockY);
    requestAnimationFrame(() => { docEl.style.scrollBehavior = prevSB; });
  }

  /* ---------- return-scroll helpers ---------- */
  function getSection2TopY(){
    // SECTION 02 = 「成分構成」想定
    const h2 = Array.from(document.querySelectorAll('h2')).find(h => (h.textContent || '').trim() === '成分構成');
    const target = h2 ? (h2.closest('section') || h2) : null;
    if (!target) return null;

    const header = document.querySelector('header');
    const offset = Math.max(8, (header ? header.offsetHeight : 0) - 18);
    return target.getBoundingClientRect().top + window.scrollY - offset;
  }

  function scrollFromSection2TopTo(targetY){
    const sec2 = getSection2TopY();
    if (sec2 == null) {
      window.scrollTo({ top: targetY, behavior: reduceMotion ? 'auto' : 'smooth' });
      return;
    }

    const docEl = document.documentElement;
    const prevSB = docEl.style.scrollBehavior;
    docEl.style.scrollBehavior = 'auto';
    window.scrollTo(0, sec2);

    if (reduceMotion){
      window.scrollTo(0, targetY);
      requestAnimationFrame(() => { docEl.style.scrollBehavior = prevSB; });
      return;
    }

    requestAnimationFrame(() => {
      // keep CSS smooth behavior intact; use explicit smooth for this move
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      // restore any previous inline override
      setTimeout(() => { docEl.style.scrollBehavior = prevSB; }, 650);
    });
  }

  /* ---------- focus panel for timeline details ---------- */
  function initFocusPanel(){
    // 対象が無いなら何もしない
    const items = Array.from(document.querySelectorAll('.timeline-item.timeline-collapsible'));
    if (!items.length) return;

    // 既に生成済みなら何もしない
    if (document.querySelector('.focusPanel') || document.querySelector('.backdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'backdrop';
    backdrop.hidden = true;

    const panel = document.createElement('div');
    panel.className = 'focusPanel';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-hidden','true');
    panel.innerHTML = `
      <div class="focusTop">
        <div class="focusTitle">成分詳細</div>
        <button class="focusClose" type="button" aria-label="閉じる">✕</button>
      </div>
      <div class="focusBody"></div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    const body = panel.querySelector('.focusBody');
    const closeBtn = panel.querySelector('.focusClose');
    const titleEl = panel.querySelector('.focusTitle');

    let panelOrigin = 'timeline';
    let prevHash = '';



    function close(){
      const run = () => {
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden','true');
        backdrop.hidden = true;
        body.innerHTML = '';
        // Return-scroll: jump to SECTION 02 top, then smooth-scroll back to the position
        // where the panel was opened (avoids “scrolling from the very top”).
        const returnY = scrollLockY;

        if (panelOrigin === 'timeline'){
          unlockBodyScroll({ restore: false });
          scrollFromSection2TopTo(returnY);
        } else {
          // Product / other origins: return to the exact position (no section jump)
          unlockBodyScroll();
        }

        panelOrigin = 'timeline';

        // Restore previous hash (shareable deep link without trapping the user)
        try{
          const base = location.pathname + location.search;
          history.replaceState(null, '', prevHash ? (base + prevHash) : base);
        }catch(e){}

      };
      if (document.startViewTransition) document.startViewTransition(run);
      else run();
    }

    
    function stripDuplicateIds(root){
      if (!root || root.nodeType !== 1) return;
      root.removeAttribute('id');
      root.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    }

    function flyFromItem(item){
      if (reduceMotion) {
        // reduced motion: reveal content immediately
        if (body) body.style.visibility = '';
        return Promise.resolve();
      }

      try{
        const fromRect = item.getBoundingClientRect();
        const toRect = body.getBoundingClientRect();

        const ghost = item.cloneNode(true);
        stripDuplicateIds(ghost);

        // ghost should be a compact card during flight
        ghost.querySelectorAll('[hidden]').forEach(el => el.removeAttribute('hidden'));
        ghost.querySelectorAll('.timeline-indicator').forEach(el => el.textContent = '−');

        ghost.classList.add('flyGhost');
        ghost.style.position = 'fixed';
        ghost.style.left = fromRect.left + 'px';
        ghost.style.top = fromRect.top + 'px';
        ghost.style.width = fromRect.width + 'px';
        ghost.style.height = fromRect.height + 'px';
        ghost.style.margin = '0';
        ghost.style.zIndex = '1105';
        ghost.style.pointerEvents = 'none';
        ghost.style.transformOrigin = 'top left';

        document.body.appendChild(ghost);

        const dx = toRect.left - fromRect.left;
        const dy = toRect.top - fromRect.top;

        // uniform scale to avoid distortion
        const s = Math.min(1, Math.max(0.72, toRect.width / fromRect.width));

        const anim = ghost.animate([
          { transform: 'translate(0px,0px) scale(1)', opacity: 1, filter: 'blur(0px)' },
          { transform: `translate(${dx}px,${dy}px) scale(${s})`, opacity: 0.05, filter: 'blur(1px)' }
        ], {
          duration: 520,
          easing: 'cubic-bezier(.2,.8,.2,1)',
          fill: 'forwards'
        });

        return anim.finished.then(() => {
          ghost.remove();
          body.style.visibility = '';
        }).catch(() => {
          ghost.remove();
          body.style.visibility = '';
        });
      } catch (e){
        if (body) body.style.visibility = '';
        return Promise.resolve();
      }
    }

function openFromItem(item){
      const title = (item.querySelector('.timeline-title')?.textContent || '成分詳細').trim();

      const run = () => {

        // Deep-link: reflect the opened card in the URL hash (restored on close)
        try{
          const base = location.pathname + location.search;
          prevHash = location.hash || '';
          if (item && item.id) history.replaceState(null, '', base + '#' + item.id);
        }catch(e){}

        // clone without changing original content
        const clone = item.cloneNode(true);
        stripDuplicateIds(clone);

        // panel内では全文を見せる
        clone.querySelectorAll('[hidden]').forEach(el => el.removeAttribute('hidden'));
        // 開閉インジケータは常に「−」に寄せる（見た目のノイズを減らす）
        clone.querySelectorAll('.timeline-indicator').forEach(el => el.textContent = '−');

        titleEl.textContent = title;

        // フライト中は“二重表示”にならないよう一旦隠す
        body.style.visibility = 'hidden';
        body.innerHTML = '';
        body.appendChild(clone);

        backdrop.hidden = false;
        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden','false');

        // 背景スクロールを完全に止める
        lockBodyScroll();
      };

      const after = () => flyFromItem(item);

      if (document.startViewTransition){
        const t = document.startViewTransition(run);
        // DOMが更新されたタイミングで飛来アニメを走らせる
        (t.ready || t.finished).then(after).catch(after);
      } else {
        run();
        after();
      }
    }

    

// Expose a safe opener for cross-links (charts, etc.)
window.TSUKURU = window.TSUKURU || {};
window.TSUKURU.openDetailById = (id) => {
  const el = id ? document.getElementById(id) : null;
  if (el) openFromItem(el);
};

// Product cards → open in the same focus panel (Ctrl/⌘ keeps inline behavior if present)
const productCards = Array.from(document.querySelectorAll('#products .product-card'));
function openFromProduct(card){
  const title = (card.querySelector('h3')?.textContent || '製品').trim();

  panelOrigin = 'product';

  const run = () => {

    // Deep-link: reflect the opened card in the URL hash (restored on close)
    try{
      const base = location.pathname + location.search;
      prevHash = location.hash || '';
      if (card && card.id) history.replaceState(null, '', base + '#' + card.id);
    }catch(e){}

    const clone = card.cloneNode(true);
    stripDuplicateIds(clone);

    // show all text inside panel
    clone.querySelectorAll('[hidden]').forEach(el => el.removeAttribute('hidden'));
    clone.querySelectorAll('.product-indicator').forEach(el => el.textContent = '−');

    titleEl.textContent = title;

    body.style.visibility = 'hidden';
    body.innerHTML = '';
    body.appendChild(clone);

    backdrop.hidden = false;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden','false');

    lockBodyScroll();
  };

  const after = () => flyFromItem(card);

  if (document.startViewTransition){
    const t = document.startViewTransition(run);
    (t.ready || t.finished).then(after).catch(after);
  } else {
    run();
    after();
  }
}

productCards.forEach(card => {
  const header = card.querySelector('.product-header') || card.querySelector('h3');
  if (!header) return;

  header.addEventListener('click', (e) => {
    if (e.ctrlKey || e.metaKey) return; // keep legacy inline toggle
    // ignore clicks on real links inside header
    if (e.target && e.target.closest && e.target.closest('a')) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    openFromProduct(card);
  }, true);

  header.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopImmediatePropagation();
      openFromProduct(card);
    }
  }, true);
});

// Like a California Roll quick link → open panel (Ctrl/⌘ keeps the original scroll+inline expand)
const caliLink = document.querySelector('.js-open-california');
const caliCard = document.getElementById('california-roll');
if (caliLink && caliCard){
  caliLink.addEventListener('click', (e) => {
    if (e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openFromProduct(caliCard);
  }, true);

  caliLink.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopImmediatePropagation();
      openFromProduct(caliCard);
    }
  }, true);
}

    /* ---------- table click -> guided attention + open ---------- */
    const tbody = document.getElementById('career-table-body');
    if (tbody){
      tbody.addEventListener('click', (e) => {
        const a = e.target && e.target.closest ? e.target.closest('a.career-link') : null;
        if (!a) return;

        const href = a.getAttribute('href') || '';
        if (!href.startsWith('#')) return;

        const id = href.slice(1);
        const item = document.getElementById(id);
        if (!item) return;

        e.preventDefault();

        // If panel is open, close first (restores scroll, then we guide)
        if (panel.classList.contains('is-open')){
          close();
        }

        const header = document.querySelector('header');
        const offset = (header ? header.offsetHeight : 0) + 8;
        const top = item.getBoundingClientRect().top + window.scrollY - offset;

        // Guided scroll (background)
        window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });

        // Pulse highlight on the target card
        item.classList.add('is-peek');
        window.setTimeout(() => item.classList.remove('is-peek'), 950);

        // Open the focus panel after the scroll has mostly settled
        const delay = reduceMotion ? 0 : 620;
        window.setTimeout(() => openFromItem(item), delay);
      }, { passive: false });
    }


    // close interactions
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    window.addEventListener('keydown', (e) => {
      if (!panel.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
    });

    // Allow only panel to scroll on touch (extra safety for iOS)
    document.addEventListener('touchmove', (e) => {
      if (!panel.classList.contains('is-open')) return;
      const inside = panel.contains(e.target);
      if (!inside) e.preventDefault();
    }, { passive: false });

    // Intercept existing inline toggle:
    // - Normal click opens focus panel
    // - Ctrl/⌘ + click keeps the original inline open/close behavior
    items.forEach(item => {
      const header = item.querySelector('.timeline-header');
      if (!header) return;

      header.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey) return; // keep legacy behavior
        e.preventDefault();
        e.stopImmediatePropagation();
        openFromItem(item);
      }, true);

      header.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopImmediatePropagation();
          openFromItem(item);
        }
      }, true);

    // Table ↔ Timeline linking (hover/focus highlight + click to open panel)
    const tbody = document.getElementById('career-table-body');
    if (tbody){
      let lastItem = null;
      let lastRow = null;

      const clearLink = () => {
        if (lastItem) lastItem.classList.remove('is-linked');
        if (lastRow) lastRow.classList.remove('is-linked');
        lastItem = null;
        lastRow = null;
      };

      const resolveItemFromAnchor = (a) => {
        const href = (a.getAttribute('href') || '').trim();
        if (!href.startsWith('#')) return null;
        const id = href.slice(1);
        const it = document.getElementById(id);
        return (it && it.classList.contains('timeline-item')) ? it : null;
      };

      const applyLink = (a) => {
        const row = a.closest('tr');
        const it = resolveItemFromAnchor(a);
        if (!row || !it) return;

        if (lastItem === it && lastRow === row) return;

        clearLink();
        lastItem = it;
        lastRow = row;

        it.classList.add('is-linked');
        row.classList.add('is-linked');
      };

      tbody.addEventListener('pointerover', (e) => {
        const a = e.target.closest('a.career-link');
        if (!a) return;
        applyLink(a);
      });

      tbody.addEventListener('pointerout', (e) => {
        // move between cells should not clear; clear only when leaving tbody
        if (e.relatedTarget && tbody.contains(e.relatedTarget)) return;
        clearLink();
      });

      tbody.addEventListener('focusin', (e) => {
        const a = e.target.closest('a.career-link');
        if (!a) return;
        applyLink(a);
      });

      tbody.addEventListener('focusout', (e) => {
        if (e.relatedTarget && tbody.contains(e.relatedTarget)) return;
        clearLink();
      });

      // click row → open focus panel (Ctrl/⌘ click keeps native anchor jump)
      tbody.addEventListener('click', (e) => {
        const a = e.target.closest('a.career-link');
        if (!a) return;
        if (e.ctrlKey || e.metaKey) return;

        const it = resolveItemFromAnchor(a);
        if (!it) return;

        e.preventDefault();
        e.stopPropagation();
        openFromItem(it);
      }, true);
    }

    });
  }
  // (v9) stray token removed – it caused a syntax error and prevented JS from running.
/* ========= header metrics (fixed header offset) ========= */
function initHeaderMetrics(){
  const header = document.querySelector('header');
  if (!header) return;

  const set = () => {
    const h = header.getBoundingClientRect().height || header.offsetHeight || 0;
    if (h > 0) document.documentElement.style.setProperty('--header-h', `${Math.ceil(h)}px`);
  };

  set();
  window.addEventListener('resize', set, { passive: true });

  // React to font-load/layout changes
  if ('ResizeObserver' in window){
    const ro = new ResizeObserver(() => set());
    ro.observe(header);
  } else {
    window.addEventListener('load', set, { once: true });
  }
}


addEventListener('DOMContentLoaded', ()=>{
  initHeaderMetrics();
// テーブルが埋まるのを一拍待ってから集計（既存JSの後）
    requestAnimationFrame(() => {
      initKpiBoot();
      initFocusPanel();
    });
  });
})();
