// ===================================
// BENTO STYLE DASHBOARD JAVASCRIPT
// ===================================

// Chart Data
const chartData = {
  labels: [
    '洋食調理スタッフ',
    '流通店舗向けシステム開発',
    '店舗什器板金製造',
    'リテールソリューション営業',
    '金融機器導入スケジュール管理',
    '木工小物製造',
    '照明器具製造',
    '自動車カスタムパーツデザイン製造',
    'A-Zen'
  ],
  data: [2496, 1702, 3530, 1156, 1278, 730, 1884, 893, 0], // A-Zenは後で計算
  colors: [
    '#055584', // 濃い青
    '#459cce', // 明るい青
    '#84bcda', // 薄い青
    '#9ebea7', // 緑がかったグレー
    '#b8c073', // 黄緑
    '#ecc30b', // 黄色
    '#f09d2a', // オレンジ
    '#f37748', // 明るいオレンジ
    '#d56062'  // 赤がかったオレンジ
  ],
  periods: [
    '1984/4/1 〜 1991/1/31',
    '1991/2/1 〜 1995/9/30',
    '1995/10/1 〜 2005/8/31',
    '2005/9/1 〜 2008/12/31',
    '2009/1/1 〜 2012/12/31',
    '2013/1/1 〜 2014/12/31',
    '2015/1/1 〜 2019/12/31',
    '2020/1/1 〜 2021/9/10',
    '' // A-Zenは動的に生成
  ]
};

// Modal chart instances
let modalBarChart = null;
let modalPieChart = null;
let modalHistory = [];

// Calculate career span
function calculateSpan(startYear, startMonth, startDay) {
  const startDate = new Date(startYear, startMonth - 1, startDay);
  const currentDate = new Date();

  let years = currentDate.getFullYear() - startDate.getFullYear();
  let months = currentDate.getMonth() - startDate.getMonth();
  let days = currentDate.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    days += lastMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));

  return {
    years,
    months,
    days,
    totalDays
  };
}

// Count up animation
function animateCountUp(element, targetValue, duration = 2000, suffix = '') {
  const startTime = performance.now();
  const startValue = 0;

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);

    element.textContent = currentValue.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    }
  }

  requestAnimationFrame(updateCount);
}

// Setup Opening Animation
function setupOpeningAnimation() {
  const splash = document.getElementById('splash-screen');
  const enterBtn = document.getElementById('splash-enter-btn');
  const progressBar = document.getElementById('splash-progress-bar');
  const splashDays = document.getElementById('splash-days');
  const main = document.querySelector('.bento-main');
  const grid = document.getElementById('bento-grid');

  // ── M-1: sessionStorage でスプラッシュを初回のみ表示 ──
  const hasVisited = sessionStorage.getItem('tsukuru_visited');

  // Dismiss function
  const dismissSplash = () => {
    if (splash.classList.contains('hidden')) return;
    sessionStorage.setItem('tsukuru_visited', '1');
    splash.classList.add('hidden');
    main.classList.add('focused');

    setTimeout(() => {
      grid.classList.add('animate-in');
    }, 500);

    const headerTimeline = document.getElementById('header-timeline-bar');
    if (headerTimeline) {
      buildSegmentBar(headerTimeline); // 業種カラー帯グラフに切り替え
    }
  };

  if (hasVisited) {
    // 2回目以降：スプラッシュをスキップして即ダッシュボード表示
    splash.classList.add('hidden');
    main.classList.add('focused');
    grid.classList.add('animate-in');
    const headerTimeline = document.getElementById('header-timeline-bar');
    if (headerTimeline) {
      buildSegmentBar(headerTimeline); // 業種カラー帯グラフに切り替え
    }
    return; // 以降の初回アニメーション処理をスキップ
  }

  // 初回のみ：カウントアップアニメーションを実行
  const careerSpan = calculateSpan(1984, 4, 1);

  if (splashDays) {
    animateCountUp(splashDays, careerSpan.totalDays, 2500);
  }

  // Animate Progress Bar
  setTimeout(() => {
    if (progressBar) progressBar.style.width = '100%';
  }, 100);

  // Enable click to skip immediately
  if (splash) {
    splash.style.cursor = 'pointer';
    splash.addEventListener('click', dismissSplash);
  }

  // Show Enter Button after animation
  setTimeout(() => {
    if (enterBtn) {
      enterBtn.classList.add('visible');
      enterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismissSplash();
      });
    }
  }, 2800); // Wait for count up + buffer
}

/**
 * 業種カラー帯グラフを生成する関数
 * chartData の labels / data / colors / periods を元に
 * 割合に応じた幅の divセグメントを並べる
 */
function buildSegmentBar(container) {
  // A-Zen の日数を取得（初期化済みであれば更新されている）
  const data = chartData.data.map((d, i) =>
    i === 8 ? calculateSpan(2021, 9, 11).totalDays : d
  );
  const total = data.reduce((s, v) => s + v, 0);

  container.innerHTML = ''; // 旧内容クリア
  container.style.width = '100%'; // コンテナ幅を明示設定

  chartData.labels.forEach((label, i) => {
    const pct = (data[i] / total) * 100;
    const period = i === 8
      ? `2021/9/11 \u301c \u73fe\u5728`
      : chartData.periods[i];

    const seg = document.createElement('div');
    seg.className = 'timeline-segment';
    seg.style.width = `${pct}%`;
    seg.style.backgroundColor = chartData.colors[i];
    // titleはコンテナ側（timeline-tooltip-wrap）に駑せる
    container.appendChild(seg);
  });
}

// Initialize Bento Dashboard
function initializeBento() {
  // Calculate A-Zen days (2021/9/11 〜 現在)
  const azenSpan = calculateSpan(2021, 9, 11);
  chartData.data[8] = azenSpan.totalDays; // A-Zenの日数を更新

  // Update header stats
  const careerSpan = calculateSpan(1984, 4, 1);

  // Update header days and years
  const headerDaysEl = document.getElementById('header-days');
  const headerYearsEl = document.getElementById('header-years');
  if (headerDaysEl && headerYearsEl) {
    // ヘッダーの数値はアニメーションせず、最終値をセット（オープニングで見せているため）
    headerDaysEl.textContent = careerSpan.totalDays.toLocaleString();
    headerYearsEl.textContent = `${careerSpan.years}年${careerSpan.months}ヶ月${careerSpan.days}日`;
  }

  // Start Opening Sequence
  setupOpeningAnimation();

  // Set current year in footer
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Initialize modal
  const modal = document.getElementById('detail-modal');
  const modalClose = document.getElementById('modal-close');
  const modalBody = document.getElementById('modal-body');

  // Card click handlers
  const cards = document.querySelectorAll('.bento-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();

      const type = card.dataset.type;
      const id = card.dataset.id;

      if (type === 'chart') {
        const chartType = card.dataset.chart;
        openModalFor(() => showChartDetail(chartType));
      } else if (type === 'philosophy') {
        openModalFor(showPhilosophyDetail);
      } else if (type === 'activities') {
        openModalFor(showActivitiesDetail);
      } else if (type === 'audio') {
        openModalFor(showAudioDetail);
      } else if (type === 'message') {
        openModalFor(showMessageDetail);
      } else if (type === 'list') {
        openModalFor(showListDetail);
      }
    });
  });

  // Close modal handlers
  if (modalClose && modal) {
    modalClose.addEventListener('click', () => {
      navigateBackModal();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        navigateBackModal();
      }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        navigateBackModal();
      }
    });

    // Swipe to close (Right swipe)
    let touchStartX = 0;
    let touchStartY = 0;

    modal.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    modal.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;

      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      if (Math.abs(diffX) > Math.abs(diffY) && diffX > 50) {
        navigateBackModal();
      }
    }, { passive: true });
  }

  // Initialize component list
  initializeComponentList();

  // Initialize audio player
  initializeAudioPlayer();

  // Initialize charts
  initializeCharts();

  // Setup Mouse Spotlight Effect
  const grid = document.getElementById('bento-grid');
  if (grid) {
    grid.addEventListener('mousemove', (e) => {
      const cards = document.querySelectorAll('.bento-card');
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      }
    });
  }
}

// Show activities detail
function showActivitiesDetail() {
  const modalBody = document.getElementById('modal-body');
  if (!modalBody) return;

  const activities = [
    { text: '店舗まるごと整える！', desc: '什器・設備の制作から、システム関連の導入・管理・保守まで対応いたします。\n状況に合わせたベストなご提案を差し上げます。お気軽にご相談、ご用命ください！' },
    { text: 'デコランタンワークショップ開催', desc: 'あかり ＋ ものづくり ＝ デコランタン\n"かんたん！かわいい！きれい！" を合言葉に自分だけのランタンを作りましょう。\n\n身の周りにある物や簡単に手に入れられる材料を使って「あかり」と「ものづくり」を楽しむ、ものづくりワークショップです。ご興味ありましたら、お声掛けください。出張もオンラインも開催可能です。' },
    { text: '製造やアートの展示や現場に行く', desc: '工場も美術館も博物館も\n百聞は一見に如かず\n現場からしか摂取できない栄養がある' },
    { text: '気になるイベントに参加する', desc: '分野を限らず\n思い立ったが吉日\n予定を立てると忘れがち' },
    { text: '楽しく美味しく飲み食べる', desc: 'おいしいものが好き\n楽しい時間が好き\n最近は日本酒多め' },
    { text: '銭湯に浸かる', desc: '銭湯も温泉も\n熱めより温め\n出先でも時間を作って湯ったり！' },
    { text: 'ランニングという名の徘徊をする', desc: '練習は短くイメトレ多用\n距離：トレーニング ＜ レース（ハーフ限界）\n齢には抗えず…' }
  ];

  modalBody.innerHTML = `
    <h2>活動・興味・関心</h2>
    <ul class="activities-list accordion-list">
      ${activities.map((item, i) => `
        <li class="activity-item accordion-item" id="activity-${i}" onclick="toggleActivityItem(${i})">
          <div class="accordion-header">
            <span class="accordion-arrow" aria-hidden="true">&#9654;</span>
            <span class="accordion-label">・${item.text}</span>
          </div>
          <div class="accordion-body" id="activity-body-${i}">
            <p>${item.desc.replace(/\n/g, '<br>')}</p>
          </div>
        </li>
      `).join('')}
    </ul>
    <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 1.5rem; opacity: 0.6;">※各項目をクリック・タップすると詳細が展開します。</p>
  `;
}

// 3-1: アコーディオンとぐる
window.toggleActivityItem = function (index) {
  const item = document.getElementById(`activity-${index}`);
  item.classList.toggle('expanded');
};

// Show audio detail
function showAudioDetail() {
  const modalBody = document.getElementById('modal-body');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <h2>音声</h2>
    <div class="audio-content">
      <div class="audio-item" onclick="playAudio('overview')" style="cursor: pointer;">
        <div class="audio-info">
          <span class="play-icon">▶</span>
          <div class="audio-details">
            <p class="audio-title">聴く概要 『つくる』アーカイブ</p>
            <p class="audio-description">AIがまとめたサイト概要音声データです。[約16分]</p>
            <p class="audio-source">NotebookLM -> TXT Edit -> Gemini 2.5 Pro TTS Preview</p>
          </div>
        </div>
      </div>
      
      <div class="audio-item" onclick="playAudio('debate')" style="cursor: pointer;">
        <div class="audio-info">
          <span class="play-icon">▶</span>
          <div class="audio-details">
            <p class="audio-title">AIディベート 「この 軌跡 は偶然か必然か？」</p>
            <p class="audio-description">この成分構成は偶然の産物なのか、または必然か。</p>
            <p class="audio-subtitle">AIが冷静に深くディベートを繰り広げます。[約14分]</p>
            <p class="audio-source">NotebookLM</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Show message detail
function showMessageDetail() {
  const modalBody = document.getElementById('modal-body');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <h2>みなさんへ</h2>
    <div class="message-content">
      <p class="message-tagline" style="margin-bottom: 0.2rem;">『つくる』で 暮らしを しなやかに</p>
      <p class="message-subtitle">Imagining and Creating Better Days</p>
      
      <br>
      
      <div class="message-text">
        <p>しなやかとは、柔らかくて芯があり、状況に応じてかたちを変えながら続いていくあり方のことです。しなやかさは、物や身体、心など私たちを形づくるあらゆるものに宿り、日々の小さな豊かさにつながっています。私にとっての『つくる』は、そのしなやかさを暮らしのそばで想像し創造へとつなげていく imagineering です。</p>
        <p>長年積み重ねてきた知識や経験、人とのつながりを手がかりに、新しいプロジェクトやアイデアがほどよく形になるようお手伝いできればうれしく思います。</p>
        <p>ここまで読んでみても、結局「何をやっている人」なのかは、つかめなかったかもしれません。それでも、どこかひとつでも気になる成分がありましたら、どうぞ気軽に声をかけてみてください。</p>
        <p class="message-closing">またお会いしましょう</p>
      </div>
    </div>
  `;
}

// Show list detail
function showListDetail() {
  const modalBody = document.getElementById('modal-body');
  if (!modalBody) return;

  const tableBodyHTML = getComponentListTableHTML();

  modalBody.innerHTML = `
    <h2>成分一覧</h2>
    <p>業種名クリックで詳細表示します。</p>
    <div class="modal-list-container">
      <table class="component-list-table">
        <thead>
          <tr>
            <th>業種</th>
            <th>日数</th>
            <th>年数</th>
            <th>割合</th>
          </tr>
        </thead>
        <tbody>
          ${tableBodyHTML}
        </tbody>
      </table>
    </div>
  `;
}

// Get component list table HTML
function getComponentListTableHTML() {
  // Calculate current data including A-Zen
  const azenSpan = calculateSpan(2021, 9, 11);
  const currentData = [...chartData.data];
  currentData[8] = azenSpan.totalDays;

  // Calculate total days and percentages
  const totalDays = currentData.reduce((sum, days) => sum + days, 0);
  const percentages = currentData.map(days => ((days / totalDays) * 100).toFixed(1));

  // Generate table rows
  let tableHTML = '';

  chartData.labels.forEach((label, index) => {
    const days = currentData[index];
    const percentage = percentages[index];
    const years = calculateYearsFromDays(days);
    const color = chartData.colors[index];

    tableHTML += `
      <tr onclick="handleComponentRowClick(${index})" data-index="${index}">
        <td class="industry-name" style="color: ${color};">
          <span class="color-indicator" style="display: inline-block; width: 8px; height: 8px; background: ${color}; border-radius: 50%; margin-right: 8px;"></span>
          ${label}
        </td>
        <td class="card-days">${days.toLocaleString()}日</td>
        <td class="card-period">${years}</td>
        <td class="card-percentage">${percentage}%</td>
      </tr>
    `;
  });

  return tableHTML;
}

// Initialize component list
function initializeComponentList() {
  const tbody = document.getElementById('component-list-tbody');
  if (!tbody) return;

  // メインページのタイルではヘッダーのみ表示するため、tbodyは空にする
  tbody.innerHTML = '';
}

// Handle component row click
function handleComponentRowClick(index) {
  const modal = document.getElementById('detail-modal');
  const renderFunc = () => showComponentDetail(index);

  if (modal.classList.contains('active')) {
    // We are already in a modal (the list modal)
    navigateToModal(renderFunc);
  } else {
    // We are on the main page
    openModalFor(renderFunc);
  }
}

// Calculate years from days (round up to months)
function calculateYearsFromDays(days) {
  const years = Math.floor(days / 365);
  const remainingDays = days % 365;
  const months = Math.ceil(remainingDays / 30); // Round up to months

  if (years === 0) {
    return `${months}ヶ月`;
  } else if (months === 0) {
    return `${years}年`;
  } else {
    return `${years}年${months}ヶ月`;
  }
}

// Show component detail
function showComponentDetail(index) {
  const modalBody = document.getElementById('modal-body');
  if (!modalBody) return;

  const industry = chartData.labels[index];
  const color = chartData.colors[index];
  let period = chartData.periods[index];

  // A-Zenの場合は現在日付を設定
  if (index === 8) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    period = `2021/9/11 〜 ${year}/${month}/${day}`;
  }

  // Calculate current data including A-Zen
  const azenSpan = calculateSpan(2021, 9, 11);
  const currentData = [...chartData.data];
  currentData[8] = azenSpan.totalDays;

  const days = currentData[index];
  const years = calculateYearsFromDays(days);
  const totalDays = currentData.reduce((sum, d) => sum + d, 0);
  const percentage = ((days / totalDays) * 100).toFixed(1);

  const content = `
    <div class="component-detail">
      <button class="detail-back-btn" onclick="navigateBackModal()">
        &#8592; 成分一覧へ戻る
      </button>
      <div class="detail-header" style="border-left: 4px solid ${color}; padding-left: 1rem; margin-top: 1rem;">
        <h2 style="color: ${color}; margin-bottom: 0.5rem; font-size: 1.5rem;">${industry}</h2>
        <p style="color: var(--text-primary); margin: 0; font-weight: 500; font-size: 1.1rem;">${period}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.75rem;">
          <span style="background: var(--bg-secondary); padding: 0.5rem 1rem; border-radius: var(--radius-md); color: var(--text-primary); font-weight: 300;">${days.toLocaleString()}日</span>
          <span style="background: var(--bg-secondary); padding: 0.5rem 1rem; border-radius: var(--radius-md); color: ${color}; font-weight: 600;">${years}</span>
          <span style="background: var(--bg-secondary); padding: 0.5rem 1rem; border-radius: var(--radius-md); color: var(--accent-secondary); font-weight: 600;">${percentage}%</span>
        </div>
      </div>
      
      <div class="detail-description" style="margin-top: 2rem;">
        ${getIndustryDetail(industry)}
      </div>
    </div>
  `;

  modalBody.innerHTML = content;
}

// Get industry detail
function getIndustryDetail(industry) {
  const details = {
    '洋食調理スタッフ': `
      <div style="color: var(--text-secondary); line-height: 1.6;">
        <p style="margin-bottom: 1rem;"><strong>6店舗</strong>（芝生、Vert Point、CASA、銀座ライオン、BEI RUDI、LA JOLLA）</p>
        
        <p style="margin-bottom: 1rem;"><strong>バブル期飲食業界変革を経験</strong></p>
        
        <hr style="border: none; border-top: 1px solid var(--border-primary); margin: 1.5rem 0;">
        
        <p style="margin-bottom: 1rem;">全くの素人から洋食調理全般を習得。カフェバー業態立上げをコンサルと協働。副業で清掃サービス事業も展開。</p>
        
        <p style="margin-bottom: 1rem;">高校卒業後デザイン専門学校を一日で退学。アルバイトニュースで見つけた未経験調理求人からスタート。6店舗を経験し、「でもしか商売」から専門職への業界変革を最前線で体験。芝生（中曽根商事）で洋食の基礎を習得、Vert Pointではカフェバー業態立上げを飲食店コンサルと協働。BEI RUDI勤務時には副業で清掃サービス事業を展開し、顧客から出資話も。</p>
        
        <p style="margin-bottom: 1rem;">調理とはものづくりであり、ここで身に付けた思考方法がその後のキャリアすべてに影響。バブルで業界が変容し転職を決意。</p>
        
        <p>シグマとの意外な接点として、中曽根商事にはシグマ会長／社長がコマツソフト時代に開発した店舗SOLが後に導入されることに。</p>
      </div>
    `,
    '流通店舗向けシステム開発': `
      <div style="color: var(--text-secondary); line-height: 1.6;">
        <p style="margin-bottom: 1rem;"><strong>アドバンストシステムエンジニアリング（東京都千代田区）</strong></p>
        
        <p style="margin-bottom: 1rem;"><strong>IT黎明期のベンチャー挑戦</strong></p>
        
        <hr style="border: none; border-top: 1px solid var(--border-primary); margin: 1.5rem 0;">
        
        <p style="margin-bottom: 1rem;">未経験プログラマーから技術習得。画期的な小売店向け店舗本部間システム開発。AR技術の先駆け（30年!?）となる画像合成システムも手がける。</p>
        
        <p style="margin-bottom: 1rem;">子供時代からのコンピューター興味により転身。NCR、NEC、日電東芝出身の技術者たちと共に働く10名規模ベンチャー。オフコンからPC移行期を経験し、COBOL、BASICを習得。</p>
        
        <p style="margin-bottom: 1rem;">ネットウェーブ：小規模チェーン向け店舗本部間システム。まだ信頼の薄いPCでネットワーク（P2P）構築した画期的システム。</p>
        
        <p style="margin-bottom: 1rem;">画像合成システム：靴販売店での顧客画像と商品画像のバーチャル合成。画像データはレーザーディスク保存。</p>
        
        <p>営業責任者の脳梗塞により販売体制崩壊、給料未払い発生。経営難によりネットウェーブをカテナに売却、これが後のキャリアにもつながる布石に。</p>
      </div>
    `,
    '店舗什器板金製造': `
      <div style="color: var(--text-secondary); line-height: 1.6;">
        <p style="margin-bottom: 1rem;"><strong>ナビ工業（埼玉県川口市）</strong></p>
        
        <p style="margin-bottom: 1rem;"><strong>コンビニATM革命のパイオニア</strong></p>
        
        <hr style="border: none; border-top: 1px solid var(--border-primary); margin: 1.5rem 0;">
        
        <p style="margin-bottom: 1rem;">経営・経理以外すべてを担当。コンビニATM導入プロジェクトでIBM共同特許取得。現シグマ会長・社長との関係構築。</p>
        
        <p style="margin-bottom: 1rem;">前職の倒れた営業員の紹介で入社。社員数40名前後の創業社長ワンマン経営町工場。営業・提案・設計・製造・組立・納品・アフターフォローまで担当。</p>
        
        <p style="margin-bottom: 1rem;">入社当初はPOS関連特注什器製造がメインで全国の百貨店やスーパーに展開。その後コンビニATM事業が立ち上がり、ATM＋キャビネット（運用周辺機器内蔵）の店内設置モデルを開発しIBMと共同特許取得。</p>
        
        <p style="margin-bottom: 1rem;">それにより独占的シェアを獲得し、長期ビジネス化に成功。POSSOLを扱うSIerの営業部長・課長（現シグマ会長・社長）も当時のお客様で、ここで関係を構築。</p>
        
        <p>残業200時間超が何ヶ月も連続する労働環境だったが、すべてが学びとなり「仕事をする自分」が形成された。現シグマ会長がSIer退職後ナビ工業に入社し上場を目指すも、最終的に黒字清算となる。</p>
      </div>
    `,
    'リテールソリューション営業': `
      <div style="color: var(--text-secondary); line-height: 1.6;">
        <p style="margin-bottom: 1rem;"><strong>カテナ（東京都江東区 : 現システナ）</strong></p>
        
        <p style="margin-bottom: 1rem;"><strong>IBM販売代理店として全国にITソリューションを展開</strong></p>
        
        <hr style="border: none; border-top: 1px solid var(--border-primary); margin: 1.5rem 0;">
        
        <p style="margin-bottom: 1rem;">IBMビジネスパートナーとしてPOS/IT機器販売。廉価版POSディストリビューター責任者として全国各地のISVと協業。</p>
        
        <p style="margin-bottom: 1rem;">カテナの流通ソリューション部署部長からの誘いで転職。当時東証二部上場企業で、IBMの販売特約店としてPOS機器を販売。各種ソフトウェアを提案開発し、ソリューションとして納品。</p>
        
        <p style="margin-bottom: 1rem;">IBM廉価版POS機器（100万円→40万円）のディストリビューター契約を獲得し、責任者として活動。様々なISVと協業し、精神科売店専門POS、クリーニング、美容室、中古品販売など多業界でソリューションを立ち上げ。</p>
        
        <p style="margin-bottom: 1rem;">ナビ工業と重複する顧客が多く、流通店舗向けシステム開発の経験も大きく活用。その後IBMはアジアパシフィック地区からPOS事業撤退し東芝テックに売却。それを機に転職を決意。</p>
        
        <p>シグマ社長（現会長）から「これまでのコンビニATM導入プロジェクト知見を活かして仕事しないか？」と声掛けを受ける。</p>
      </div>
    `,
    '金融機器導入スケジュール管理': `
      <div style="color: var(--text-secondary); line-height: 1.6;">
        <p style="margin-bottom: 1rem;"><strong>個人事業主（東京都江東区 : IBM豊洲事業所他）</strong></p>
        
        <p style="margin-bottom: 1rem;"><strong>3万件規模ATMプロジェクト統括</strong></p>
        
        <hr style="border: none; border-top: 1px solid var(--border-primary); margin: 1.5rem 0;">
        
        <p style="margin-bottom: 1rem;">ATM導入PJTチーム一員として約3万件の導入店舗スケジュール管理を実施。ほとんどのコンビニATM導入に携わる。</p>
        
        <p style="margin-bottom: 1rem;">個人事業主としてIBM豊洲事業所内のプロジェクトルームに勤務。E-net、LANs（ローソン）関連すべて（7/11以外のほとんど）約3万件の導入店舗のスケジュール作成を統括。</p>
        
        <p style="margin-bottom: 1rem;">電気工事、ATM輸送経路、警備、店舗搬入、現地キッティング、現金装填まで、全工程の導入調整業務をほぼ一人で実施。非常に多くの業者間調整業務を経験し、バランスを取りマネジメントするスキルを身に付ける。</p>
        
        <p style="margin-bottom: 1rem;">シグマ現会長とは定期的な情報交換を実施し、信頼関係を構築。東日本大震災もあったが、幸い業務関連の大きな事故はなし。</p>
        
        <p>ファミリーマート大規模展開がひと段落し、プロジェクトチームメンバー見直しのタイミングで業務終了。</p>
      </div>
    `,
    '木工小物製造': `
      <div style="color: var(--text-secondary); line-height: 1.6;">
        <p style="margin-bottom: 1rem;"><strong>木工ミシンてづか（東京都足立区）</strong></p>
        
        <p style="margin-bottom: 1rem;"><strong>家庭内手工業とイノベーション</strong></p>
        
        <hr style="border: none; border-top: 1px solid var(--border-primary); margin: 1.5rem 0;">
        
        <p style="margin-bottom: 1rem;">父の糸鋸加工業を手伝い。独自技法開発で立体組み上げ照明器具製作。電気用品安全法をクリアしオリジナル照明完成。</p>
        
        <p style="margin-bottom: 1rem;">ATMプロジェクト終了後、父が営む糸鋸加工業を手伝うこと（緩やかな廃業に向けた協業）を決意。仏壇部品から看板切り文字まで手がける家庭内手工業で、バブル期はそれなりに仕事があったがNCルーター等機械加工に仕事を取られ成立困難な状況。</p>
        
        <p style="margin-bottom: 1rem;">下請けから脱却し「自分の作品」を作り販売することを目指し「木工小物」を手掛ける。装飾用置物では差別化困難だったため、一枚の板から相似形複数部品を切り出し立体的に組み上げる独自技法を開発。</p>
        
        <p style="margin-bottom: 1rem;">この技法で照明器具（ランプシェード）製作にたどり着き、近所の照明器具メーカーと協業し電気用品安全法をクリア、オリジナル照明完成。</p>
        
        <p>その照明器具メーカーは大手電器メーカー特注照明部門の認定工場で、下請け脱却を目指す社長より営業部立ち上げのため入社要請をいただく。</p>
      </div>
    `,
    '照明器具製造': `
      <div style="color: var(--text-secondary); line-height: 1.6;">
        <p style="margin-bottom: 1rem;"><strong>昭興電器製作所（埼玉県八潮市）</strong></p>
        
        <p style="margin-bottom: 1rem;"><strong>企業改革とデコランタンおぢさん誕生</strong></p>
        
        <hr style="border: none; border-top: 1px solid var(--border-primary); margin: 1.5rem 0;">
        
        <p style="margin-bottom: 1rem;">営業部立ち上げ→経営企画室長→製造部長兼任。大手メーカー下請脱却5年計画立案・実行。ものづくりワークショップ開発。</p>
        
        <p style="margin-bottom: 1rem;">大手電器メーカー下請脱却を目標に、営業部立ち上げから経営企画室長、最終的に板金製造部長兼任。5年計画で「売上比率既存50％ : 新規50％」の売上倍増事業計画を立案。</p>
        
        <p style="margin-bottom: 1rem;">大手・中堅照明メーカーとの新規取引開始、著名デザイナー案件などを実現。デザイナー・建築家の電気用品安全法のハードル解決を支援。</p>
        
        <p style="margin-bottom: 1rem;">照明に関わるものづくりワークショップ「デコランタンワークショップ」を開発。八潮地区で大規模ものづくりイベントを複数回開催し、全国規模で製造企業・ものづくりイベント団体と協力関係を構築。</p>
        
        <p style="margin-bottom: 1rem;">「デコランタンおぢさん」としてキャラクター化され、製造仲間のインフルエンサーがSNSで拡散し全国に知られる。しかし本業を振り返れば、数十年大手の傘に守られた社員のマインド変更は困難で、営業部は事実上解散。</p>
        
        <p>社内既存勢力との権力抗争に敗れ、5年計画未達で退職。「デコランタンワークショップ」は退職後も個人コンテンツとして継続。</p>
      </div>
    `,
    '自動車カスタムパーツデザイン製造': `
      <div style="color: var(--text-secondary); line-height: 1.6;">
        <p style="margin-bottom: 1rem;"><strong>フォリオデザイン（千葉県野田市）</strong></p>
        
        <p style="margin-bottom: 1rem;"><strong>デザインと製造の統合体験</strong></p>
        
        <hr style="border: none; border-top: 1px solid var(--border-primary); margin: 1.5rem 0;">
        
        <p style="margin-bottom: 1rem;">FRP・カーボン外装部品製造に挑戦。デザイン工程から製造まで一貫体験。DAS関連でIT機器取付パーツ開発。</p>
        
        <p style="margin-bottom: 1rem;">自動車外装部品やプロダクトデザインを手掛けるデザインオフィスで、社長がデザイン、私が製造を担当。スポーツタイプから高級車まで、FRPやカーボンを利用したカスタムパーツを手掛ける。</p>
        
        <p style="margin-bottom: 1rem;">樹脂加工は初挑戦だったが、これまでの加工経験が活きる。デザイン工程から製造まで一貫で扱う環境で、「少しデザインに近づけた気がした」貴重な体験となる。</p>
        
        <p style="margin-bottom: 1rem;">様々な製造に関わってきたが、製造業の根幹ともいえる自動車産業に思わぬ形で関われて良かった。その他、デジタルアソートシステム（DAS）関連や倉庫内専用カート、IT機器取付パーツを開発し作業効率化に携わる。</p>
        
        <p>しかしコロナ禍が事業を直撃。昭興時代から継続していたシグマからの声掛けもあり転職を決断。</p>
      </div>
    `,
    'A-Zen': `
      <div style="color: var(--text-secondary); line-height: 1.6;">
        <p style="margin-bottom: 1rem;"><strong>シグマソフトサービス（東京都中央区）</strong></p>
        
        <p style="margin-bottom: 1rem;"><strong>キャリア集大成：全経験統合</strong></p>
        
        <hr style="border: none; border-top: 1px solid var(--border-primary); margin: 1.5rem 0;">
        
        <p style="margin-bottom: 1rem;">A-Zen部署を立ち上げ。「店舗まるごと整える！」をスローガンにサービス開始。四十数年間の知識・経験・人脈すべてを活用。</p>
        
        <p style="margin-bottom: 1rem;">新規事業としてA-Zenサービスを運営。「店舗まるごと整える！」をスローガンに、ITサポート＋店舗什器のお困りごと解決サービスを提供。</p>
        
        <p style="margin-bottom: 1rem;">什器や設備の（提案／製造を含めた）営繕を請け負い、大手什器メーカーが対応できない細かなカスタマイズなどに対応。これまで携わってきた外食・システム・製造などの知識・経験・人脈などすべてが活かされ、現在・過去の経験がマージされ、個別に切り分けて評価するのが難しいほど統合されている。</p>
        
        <p style="margin-bottom: 1rem;">ナビ工業時代に会長と面接採用した製造責任者を、A-Zenスタッフとして迎え入れる。</p>
        
        <p>→ そして A-Zen 完全体へ！</p>
      </div>
    `
  };

  return details[industry] || '<div style="color: var(--text-secondary); line-height: 1.6;"><p>詳細情報を準備中です。</p></div>';
}

// Show philosophy detail
function showPhilosophyDetail() {
  const modalBody = document.getElementById('modal-body');
  if (!modalBody) return;

  const content = `
    <div class="philosophy-detail">
      <div class="philosophy-header">
        <h2>基本理念</h2>
        <h3 style="color: var(--text-primary); margin-bottom: 0.5rem; margin-top: 0; font-weight: 600; line-height: 1.2;">謙虚に真摯に</h3>
        <h3 style="color: var(--text-primary); margin-bottom: 2rem; margin-top: 0; font-weight: 600; line-height: 1.2;">常に新鮮であり続ける</h3>
        <h2 style="color: var(--text-primary); margin-bottom: 1rem; margin-top: 0; font-weight: 600; line-height: 1.2;">Like a California Roll</h2>
        <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">
          カリフォルニアロールのような仕事をしてきました。<br>
          本道ではないが味がある、異なるアプローチでも同じ価値を創造する仕事です。
        </p>
        <button class="philosophy-expand-btn" id="philosophy-expand-btn" onclick="togglePhilosophyFullText()">
          <span class="expand-btn-icon">&#9660;</span>
          全文を読む
        </button>
      </div>
      
      <div id="philosophy-full-text" style="display: none; margin-top: 2rem;">
        <hr style="border: none; border-top: 1px solid var(--border-primary); margin: 1.5rem 0;">
        
        <h3 style="color: var(--text-primary); margin-bottom: 0.2rem; font-weight: 600; font-size: 1rem;">カリフォルニアロール</h3>
        <p style="color: var(--text-primary); font-weight: 600; margin-bottom: 1rem; font-size: 1rem;">或いはナポリタンという「ものづくり」について</p>
        
        <div style="color: var(--text-secondary); line-height: 1.8;">
          <p style="margin-bottom: 1rem;">何十年も前、私が町工場で働いていたころの話です。当時お付き合いのあった、世界の巨人と呼ばれていた企業の営業責任者から、こんな言葉を浴びせられました。</p>
          
          <p style="margin-bottom: 1rem; font-style: italic; border-left: 3px solid var(--border-primary); padding-left: 1rem;">
            「お前らと俺たちを一緒にするな！<br>
            お前らの描いているのは図面なんて呼べるものじゃない。<br>
            やっていることは製造ってレベルじゃない。<br>
            俺たちが生きているのは、そんなぬるい世界じゃないんだ。」
          </p>
          
          <p style="margin-bottom: 1rem;">じゃあ、なぜ私たちにものづくりを依頼するのか。安いからだけ？　でも世の中に出すときは、自分たちの銘板をしっかり貼っている。鼓舞してくれているのか、育てようとしているのか、あるいは愛なのか。</p>
          
          <p style="margin-bottom: 1rem;">いろいろな思いが頭をよぎりつつも、「言われていることは現実だな」とも感じました。たしかに意識もレベルも低く、見えている世界も違う。そう言われても仕方がなかったのかもしれません。</p>
          
          <p style="margin-bottom: 1rem;">あのときは本当に混乱しました。いまでも忘れられない言葉です。ただ、あれから長く仕事に携わるうちに、仕事の捉え方も少しずつ変化していきました。</p>
          
          <p style="margin-bottom: 1rem;">いわゆるグローバル規模のものづくりの世界では、「大規模」であることが圧倒的に支持されます。けれど、ものづくりを料理にたとえるとどうでしょうか。</p>
          
          <p style="margin-bottom: 1rem;">好きなレストランの一皿、実家で並ぶいつもの食事、家に帰って食べるごはん、腹が減って急いでさっと作る飯。どれも決して大規模ではないけれど「美味しい」はそこにちゃんとあります。結局のところ、美味しいは正義です。</p>
          
          <p style="margin-bottom: 1rem;">大きなものづくりにも、小さなものづくりにも、それぞれ「自分が信じる絶対」や「自分なりの真ん中」という正義があります。慢心はもちろん論外ですが、誰もが「良いものを作りたい」「美味しいものを届けたい」と思っているはずです。だからこそ、お互いをリスペクトし合えるといいな、と私は感じています。</p>
          
          <p style="margin-bottom: 1rem;">私が昔やっていた料理は、「洋食」と呼ばれるものでした。カテゴリーで言えば、フランス、中華、和食、イタリア……といった本流のどれでもなく、どこかに似ていて、どこにも属さない亜流の世界です。ある意味、町工場のものづくりにも似た立ち位置かもしれません。</p>
          
          <p style="margin-bottom: 1rem;">ここで、少し分かりやすい例に置き換えて話を進めます。寿司が世界に広まり、アメリカでは「カリフォルニアロール」が生まれました。同世代の方は、その誕生や広がりをリアルタイムで見ていたと思います。</p>
          
          <p style="margin-bottom: 1rem;">当時の日本では、寿司職人はおろか、多くの日本人がそれを笑いました。蟹かと思ったらカニカマ、胡瓜かと思ったらアボカド。海苔はなぜか内側に巻き、外には胡麻がふってある。「そんなん寿司じゃねぇだろう」と。ナポリタンなんてものを当たり前に食べているくせに！です。</p>
          
          <p style="margin-bottom: 1rem;">実はこのカリフォルニアロールこそ、私自身のものづくりそのものだと思っています。いつも本道ではなかったし、本家から見れば認められにくい存在です。それでも、「美味しいカリフォルニアロールを食べたい」と思ってくれるお客さまは、たしかにいるのです。</p>
          
          <p style="margin-bottom: 1rem;">私は、料理というものづくりから始まり、製造と呼ばれるさまざまな仕事まで、ずっと亜流の道を歩んできました。それでも、自分なりに真摯にものづくりと向き合ってきたつもりです。</p>
          
          <p style="margin-bottom: 1rem;">あのお客さまの言葉に激しく揺さぶられた日があって、いまではこうした例えばなしとして語れるようになりました。</p>
          
          <p style="margin-bottom: 1rem;">仕事には「端っこ」も「片隅」もありません。私たちが立っている場所こそが、いつだって自分たちの世界の真ん中です。そして、私たちのまわりは、いつもものづくりであふれています。</p>
          
          <p style="margin-bottom: 1rem;">これからも、私なりのカリフォルニアロールを真剣に作り続けていきます。もし、いつもの味に少し飽きてしまったり、正攻法だけでは解けない壁にぶつかったときは、たまには脇道にそれて、私に声を掛けてください。</p>
          
          <p>美味しいカリフォルニアロールを用意して、お待ちしております。</p>
        </div>
      </div>
    </div>
  `;

  modalBody.innerHTML = content;
}

// 3-2: 哲学全文とぐる
function togglePhilosophyFullText() {
  const fullText = document.getElementById('philosophy-full-text');
  const btn = document.getElementById('philosophy-expand-btn');
  if (!fullText) return;

  const isExpanded = fullText.style.display !== 'none';
  fullText.style.display = isExpanded ? 'none' : 'block';

  if (btn) {
    const icon = btn.querySelector('.expand-btn-icon');
    if (isExpanded) {
      if (icon) icon.textContent = '\u25BC';
      btn.innerHTML = btn.innerHTML.replace(/閉じる/, '全文を読む');
      btn.classList.remove('expanded');
    } else {
      if (icon) icon.innerHTML = '&#9650;';
      btn.innerHTML = btn.innerHTML.replace(/全文を読む/, '閉じる');
      btn.classList.add('expanded');
    }
  }
}

// Play audio
function playAudio(type) {
  const fixedPlayer = document.getElementById('fixed-audio-player');
  const audioElement = document.getElementById('audio-element');
  const playerTitle = document.getElementById('player-title');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const playerTime = document.getElementById('player-time');
  const progressBar = document.getElementById('progress-bar');
  const progressFill = document.getElementById('progress-fill');
  const visualizer = document.querySelector('.audio-visualizer');

  if (!fixedPlayer || !audioElement || !playerTitle || !playPauseBtn) return;

  // 現在の音声を停止
  if (currentAudio && currentAudio !== audioElement) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  let title = '';
  let audioSrc = '';

  if (type === 'overview') {
    title = '聴く概要 『つくる』アーカイブ';
    audioSrc = 'audio/TSUKURU.mp3'; // 実際の音声ファイルパス
  } else if (type === 'debate') {
    title = 'AIディベート 「この 軌跡 は偶然か必然か？」';
    audioSrc = 'audio/debate.mp3'; // 実際の音声ファイルパス
  }

  console.log(`音声ファイルパス: ${audioSrc}`);
  // プレーヤー情報を設定
  playerTitle.textContent = title;
  audioElement.src = audioSrc;

  // プレーヤーを表示
  fixedPlayer.style.display = 'block';

  // 既存の手動再生ボタンがあれば削除
  const existingBtn = fixedPlayer.querySelector('.manual-play-btn');
  if (existingBtn) {
    existingBtn.remove();
  }

  // 音声の読み込みを待ってから再生
  audioElement.load();

  // 音声読み込み完了後に再生を試行
  const attemptPlay = () => {
    audioElement.play().then(() => {
      playPauseBtn.textContent = '⏸';
      currentAudio = audioElement;
      console.log('音声再生開始');

      // 3-4: 音声再生中のカード発光エフェクト
      const audioTile = document.querySelector('.audio-tile');
      if (audioTile) audioTile.classList.add('is-playing');

      // ビジュアライザーを活性化
      if (visualizer) {
        visualizer.classList.add('playing');
      }

      // 再生開始時にモーダルを閉じる
      _hideModal();
    }).catch(error => {
      console.log('再生エラー:', error);
      playPauseBtn.textContent = '▶';
      if (playerTime) {
        playerTime.textContent = '再生エラー';
      }

      // エラーメッセージを表示
      setTimeout(() => {
        if (audioElement.error) {
          console.log('音声エラーコード:', audioElement.error.code);
          console.log('音声エラーメッセージ:', audioElement.error.message);
        }
      }, 100);
    });
  };

  // 少し遅延して再生を試行
  setTimeout(attemptPlay, 100);
}

// Make playAudio globally available
window.playAudio = playAudio;

// グローバル変数
let currentAudio = null;

// 初期化関数
function initializeAudioPlayer() {
  const audioElement = document.getElementById('audio-element');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const closePlayerBtn = document.getElementById('close-player-btn');
  const playerTime = document.getElementById('player-time');
  const progressBar = document.getElementById('progress-bar');
  const progressFill = document.getElementById('progress-fill');
  const visualizer = document.querySelector('.audio-visualizer');

  if (!audioElement || !playPauseBtn || !closePlayerBtn || !playerTime) return;

  // 再生/一時停止ボタン
  playPauseBtn.addEventListener('click', () => {
    if (audioElement.paused) {
      audioElement.play();
      if (visualizer) visualizer.classList.add('playing');
      playPauseBtn.textContent = '⏸';
    } else {
      audioElement.pause();
      if (visualizer) visualizer.classList.remove('playing');
      playPauseBtn.textContent = '▶';
    }
  });

  // 閉じるボタン
  closePlayerBtn.addEventListener('click', () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
      if (visualizer) visualizer.classList.remove('playing');
    }
    // 3-4: カード発光解除
    const audioTile = document.querySelector('.audio-tile');
    if (audioTile) audioTile.classList.remove('is-playing');

    document.getElementById('fixed-audio-player').style.display = 'none';
    playPauseBtn.textContent = '▶';
    playerTime.textContent = '0:00';
    if (progressFill) {
      progressFill.style.width = '0%';
    }
  });

  // プログレスバークリックでシーク
  if (progressBar) {
    progressBar.addEventListener('click', (e) => {
      if (audioElement.duration) {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        const newTime = percentage * audioElement.duration;

        audioElement.currentTime = newTime;

        // プログレスバーを即時更新
        if (progressFill) {
          progressFill.style.width = `${percentage * 100}%`;
        }
      }
    });
  }

  // 時間更新
  audioElement.addEventListener('timeupdate', () => {
    const currentTime = audioElement.currentTime;
    const duration = audioElement.duration || 0;

    if (duration) {
      const currentMinutes = Math.floor(currentTime / 60);
      const currentSeconds = Math.floor(currentTime % 60);
      const durationMinutes = Math.floor(duration / 60);
      const durationSeconds = Math.floor(duration % 60);

      playerTime.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;

      // プログレスバー更新
      if (progressFill) {
        const progress = (currentTime / duration) * 100;
        progressFill.style.width = `${progress}%`;
      }
    } else {
      const currentMinutes = Math.floor(currentTime / 60);
      const currentSeconds = Math.floor(currentTime % 60);
      playerTime.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
    }
  });

  // 再生終了
  audioElement.addEventListener('ended', () => {
    playPauseBtn.textContent = '▶';
    if (visualizer) visualizer.classList.remove('playing');
    // 3-4: 再生終了で発光解除
    const audioTile = document.querySelector('.audio-tile');
    if (audioTile) audioTile.classList.remove('is-playing');
    playerTime.textContent = '0:00';
    if (progressFill) {
      progressFill.style.width = '0%';
    }
  });

  // 読み込みエラー
  audioElement.addEventListener('error', (e) => {
    console.log('音声読み込みエラー:', e);
    playPauseBtn.textContent = '▶';
    playerTime.textContent = 'エラー';
    if (progressFill) {
      progressFill.style.width = '0%';
    }
  });

  // 音声読み込み完了
  audioElement.addEventListener('loadeddata', () => {
    console.log('音声データ読み込み完了');
    if (audioElement.duration) {
      const durationMinutes = Math.floor(audioElement.duration / 60);
      const durationSeconds = Math.floor(audioElement.duration % 60);
      console.log(`音声長さ: ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`);
    }
  });

  // 音声読み込み可能
  audioElement.addEventListener('canplay', () => {
    console.log('音声再生可能');
    // 音声読み込み完了時に自動再生を試行
    if (fixedPlayer.style.display === 'block' && playPauseBtn.textContent === '▶') {
      audioElement.play().then(() => {
        playPauseBtn.textContent = '⏸';
        currentAudio = audioElement;
        console.log('音声自動再生開始');
      }).catch(error => {
        console.log('自動再生エラー:', error);
      });
    }
  });
}
function showChartDetail(chartType) {
  const modalBody = document.getElementById('modal-body');
  if (!modalBody) return;

  let content = '';

  if (chartType === 'bar') {
    content = `
      <h2>成分（業種）別 日数</h2>
      <p>就業順に携わった日数をバーの長さで表しています。</p>
    `;
  } else if (chartType === 'pie') {
    content = `
      <h2>成分（業種）別 割合</h2>
      <p>各業種の割合</p>
    `;
  }

  modalBody.innerHTML = content;
  createModalCharts(chartType);
}

// Create modal charts
function createModalCharts(chartType) {
  // Calculate current data including A-Zen
  const azenSpan = calculateSpan(2021, 9, 11);
  const currentData = [...chartData.data];
  currentData[8] = azenSpan.totalDays;

  // Create sorted data for pie chart
  const sortedIndices = currentData
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value)
    .map(item => item.index);

  const sortedLabels = sortedIndices.map(i => chartData.labels[i]);
  const sortedData = sortedIndices.map(i => currentData[i]);
  const sortedColors = sortedIndices.map(i => chartData.colors[i]);

  if (chartType === 'bar') {
    // Create bar chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'modal-chart-container';
    chartContainer.style.height = '400px';
    chartContainer.style.margin = '1rem 0';

    const canvas = document.createElement('canvas');
    canvas.id = 'modalBarChart';
    chartContainer.appendChild(canvas);

    // Add to modal
    const modalBody = document.getElementById('modal-body');
    modalBody.appendChild(chartContainer);

    // Create chart
    setTimeout(() => {
      modalBarChart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: '経験日数',
            data: currentData,
            backgroundColor: chartData.colors,
            borderColor: chartData.colors,
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return context.label + ': 経験日数 ' + context.parsed.x.toLocaleString() + '日';
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#a0a0a0'
              }
            },
            y: {
              grid: {
                display: false
              },
              ticks: {
                color: '#a0a0a0'
              }
            }
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              navigateToModal(() => showComponentDetail(index));
            }
          },
          onHover: (event, elements) => {
            event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
          }
        }
      });
    }, 100);

  } else if (chartType === 'pie') {
    // Create pie chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'modal-chart-container';
    chartContainer.style.height = '400px';
    chartContainer.style.margin = '1rem 0';

    const canvas = document.createElement('canvas');
    canvas.id = 'modalPieChart';
    chartContainer.appendChild(canvas);

    // Add to modal
    const modalBody = document.getElementById('modal-body');
    modalBody.appendChild(chartContainer);

    // Create chart
    setTimeout(() => {
      modalPieChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: sortedLabels,
          datasets: [{
            data: sortedData,
            backgroundColor: sortedColors,
            borderColor: '#1a1a1a',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#a0a0a0',
                padding: 10,
                font: {
                  size: 11
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  // モーダルも%表示に統一（日数タイルと割合タイルの一貫性）
                  const total = context.chart.data.datasets[0].data
                    .reduce(function (a, b) { return a + b; }, 0);
                  const pct = total > 0
                    ? ((context.parsed / total) * 100).toFixed(1)
                    : '0.0';
                  return context.label + ': ' + pct + '%';
                }
              }
            }
          },
          rotation: 0,
          circumference: 360,
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const chartIndex = elements[0].index;
              const originalIndex = sortedIndices[chartIndex];
              navigateToModal(() => showComponentDetail(originalIndex));
            }
          },
          onHover: (event, elements) => {
            event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
          }
        }
      });
    }, 100);
  }
}

// Modal navigation functions
function openModalFor(renderFunc) {
  modalHistory = [renderFunc];
  renderFunc();
  _displayModal();
}

function navigateToModal(renderFunc) {
  modalHistory.push(renderFunc);
  renderFunc();
}

function navigateBackModal() {
  modalHistory.pop();

  if (modalHistory.length > 0) {
    const lastRenderFunc = modalHistory[modalHistory.length - 1];
    lastRenderFunc();
  } else {
    _hideModal();
  }
}

function _displayModal() {
  const modal = document.getElementById('detail-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function _hideModal() {
  // Destroy modal charts
  if (modalBarChart) {
    modalBarChart.destroy();
    modalBarChart = null;
  }
  if (modalPieChart) {
    modalPieChart.destroy();
    modalPieChart = null;
  }
  const modal = document.getElementById('detail-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  modalHistory = []; // Clear history on final close
}

// Initialize Charts
function initializeCharts() {
  // Check if Chart.js is loaded
  if (typeof Chart === 'undefined') {
    console.error('Chart.js is not loaded');
    return;
  }

  // Calculate A-Zen days first
  const azenSpan = calculateSpan(2021, 9, 11);
  const currentData = [...chartData.data];
  currentData[8] = azenSpan.totalDays;

  // Create sorted data for pie chart (descending order)
  const sortedIndices = currentData
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value)
    .map(item => item.index);

  const sortedLabels = sortedIndices.map(i => chartData.labels[i]);
  const sortedData = sortedIndices.map(i => currentData[i]);
  const sortedColors = sortedIndices.map(i => chartData.colors[i]);

  // Bar Chart
  const barCtx = document.getElementById('barChart');
  if (barCtx) {
    try {
      const barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: '経験日数',
            data: currentData,
            backgroundColor: chartData.colors,
            borderColor: chartData.colors,
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y', // 横向き棒グラフ
          responsive: true,
          maintainAspectRatio: false,
          clip: false, // H-1: ラベルのクリッピングを無効化
          layout: {
            padding: {
              left: 0,
              right: 10
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return context.label + ': 経験日数 ' + context.parsed.x.toLocaleString() + '日';
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#a0a0a0'
              }
            },
            y: {
              grid: {
                display: false
              },
              ticks: {
                color: '#a0a0a0',
                // H-1: ラベル幅を固定してテキストが切れないように
                maxTicksLimit: 9,
                callback: function (value, index) {
                  const label = chartData.labels[index];
                  // コンテナ幅に応じて短縮
                  const maxLen = window.innerWidth < 800 ? 8 :
                    window.innerWidth < 1000 ? 10 : 20;
                  return label && label.length > maxLen
                    ? label.substring(0, maxLen) + '…'
                    : label;
                }
              }
            }
          },
          // L-3: グラフクリックで業種詳細を開く
          onClick: (event, elements) => {
            if (elements.length > 0) {
              handleComponentRowClick(elements[0].index);
            }
          },
          // グラフホバー時にカーソルを指マークに
          onHover: (event, elements) => {
            event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
          }
        }
      });
    } catch (error) {
      console.error('Error creating bar chart:', error);
    }
  } else {
    console.error('barChart canvas not found');
  }

  // Pie Chart (sorted by days, clockwise)
  const pieCtx = document.getElementById('pieChart');
  if (pieCtx) {
    try {
      const pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
          labels: sortedLabels,
          datasets: [{
            data: sortedData,
            backgroundColor: sortedColors,
            borderColor: '#1a1a1a',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              // H-1: 小画面では下部に切り替え、処理がないと切れる
              position: window.innerWidth < 900 ? 'bottom' : 'right',
              labels: {
                color: '#a0a0a0',
                padding: window.innerWidth < 900 ? 8 : 10,
                font: {
                  size: window.innerWidth < 900 ? 10 : 11
                },
                // H-1: 処理幅を超えるラベルは省略表示し、ツールチップで全文を見せる
                generateLabels: function (chart) {
                  const data = chart.data;
                  if (data.labels.length && data.datasets.length) {
                    const maxLen = window.innerWidth < 700 ? 7 :
                      window.innerWidth < 900 ? 9 : 20;
                    return data.labels.map(function (label, i) {
                      const ds = data.datasets[0];
                      const displayLabel = label.length > maxLen
                        ? label.substring(0, maxLen) + '…'
                        : label;
                      return {
                        text: displayLabel,
                        fullText: label, // ツールチップ用
                        fillStyle: ds.backgroundColor[i],
                        strokeStyle: '#1a1a1a',
                        lineWidth: ds.borderWidth || 2,
                        fontColor: '#a0a0a0', // 凡例テキスト色を明示指定
                        hidden: false,
                        index: i
                      };
                    });
                  }
                  return [];
                }
              },
              // H-1: ラベルクリックにツールチップを表示
              onHover: function (event, legendItem, legend) {
                if (legendItem && legendItem.fullText) {
                  event.native.target.title = legendItem.fullText;
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  // 割合タイル：日数ではなく割合（%）で表示
                  const total = context.chart.data.datasets[0].data
                    .reduce(function (a, b) { return a + b; }, 0);
                  const pct = total > 0
                    ? ((context.parsed / total) * 100).toFixed(1)
                    : '0.0';
                  return context.label + ': ' + pct + '%';
                }
              }
            }
          },
          rotation: 0,
          circumference: 360,
          // L-3: ドーナツグラフクリックで業種詳細を開く
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const originalIndex = sortedIndices[elements[0].index];
              handleComponentRowClick(originalIndex);
            }
          },
          // グラフホバー時にカーソルを指マークに
          onHover: (event, elements) => {
            event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
          }
        }
      });
    } catch (error) {
      console.error('Error creating pie chart:', error);
    }
  } else {
    console.error('pieChart canvas not found');
  }
}

// ============================================================
// ② 来訪者の成分比較機能
// ============================================================

const quizQuestions = [
  {
    id: 'domain', question: 'メインの仕事領域は？', multiple: false,
    options: [
      { label: 'IT・システム開発', value: 'it', icon: '💻' },
      { label: 'ものづくり・製造', value: 'manufacturing', icon: '🔧' },
      { label: '飲食・サービス', value: 'food', icon: '🍽️' },
      { label: '営業・マーケ', value: 'sales', icon: '📊' },
      { label: 'デザイン・クリエイティブ', value: 'creative', icon: '🎨' },
      { label: '管理・経営', value: 'management', icon: '📋' },
      { label: '教育・医療・福祉', value: 'care', icon: '🏥' },
      { label: 'その他・複合', value: 'other', icon: '✨' }
    ]
  },
  {
    id: 'years', question: '総キャリア年数は？', multiple: false,
    options: [
      { label: '〜5年', value: 'short', icon: '🌱' },
      { label: '5〜15年', value: 'mid', icon: '🌿' },
      { label: '15〜30年', value: 'long', icon: '🌳' },
      { label: '30年以上', value: 'veteran', icon: '🏆' }
    ]
  },
  {
    id: 'strength', question: '得意なことは？（複数選択可）', multiple: true,
    options: [
      { label: '手を動かす・つくる', value: 'making', icon: '🛠️' },
      { label: '仕組みを設計する', value: 'system', icon: '⚙️' },
      { label: 'チームをまとめる', value: 'lead', icon: '👥' },
      { label: 'アイデアを発想する', value: 'idea', icon: '💡' },
      { label: '数字で考える', value: 'logic', icon: '📐' },
      { label: 'お客様と向き合う', value: 'client', icon: '🤝' }
    ]
  },
  {
    id: 'style', question: 'キャリアスタイルは？', multiple: false,
    options: [
      { label: '1つを深く掘る専門職型', value: 'specialist', icon: '🎯' },
      { label: '幅広いゼネラリスト型', value: 'generalist', icon: '🌐' },
      { label: 'つくるのような〝転々型〟', value: 'wanderer', icon: '🚀' }
    ]
  }
];

let quizCurrentStep = 0;
let quizAnswers = {};

function startComparison() {
  quizCurrentStep = 0;
  quizAnswers = {};
  openModalFor(() => renderQuizStep(0));
}

function renderQuizStep(step) {
  quizCurrentStep = step;
  const q = quizQuestions[step];
  const total = quizQuestions.length;
  const modalBody = document.getElementById('modal-body');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div class="quiz-container">
      ${step === 0 ? `
      <div class="quiz-intro-box" style="margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1.5rem;">
        <p style="margin:0 0 0.5rem; font-size:1.05rem; font-weight:600; color:var(--text-primary);">🔍 あなたとの成分相性を診断します</p>
        <p style="margin:0; font-size:0.85rem; color:var(--text-secondary); line-height:1.5;">いくつかの質問であなたの「成分」を分析し、私との相性を算出します。</p>
      </div>
      ` : ''}
      <div class="quiz-progress">
        ${Array.from({ length: total }, (_, i) =>
    `<div class="quiz-dot ${i < step ? 'done' : i === step ? 'active' : ''}"></div>`
  ).join('')}
      </div>
      <p class="quiz-step-label">Q${step + 1} / ${total}</p>
      <h2 class="quiz-question">${q.question}</h2>
      <p class="quiz-hint">${q.multiple ? '複数選択できます' : '1つ選んでください'}</p>
      <div class="quiz-options">
        ${q.options.map(opt => `
          <button class="quiz-option-btn" id="qopt-${opt.value}"
            onclick="selectQuizAnswer('${q.id}','${opt.value}',${q.multiple},${step})">
            <span class="quiz-option-icon">${opt.icon}</span>
            <span class="quiz-option-label">${opt.label}</span>
          </button>
        `).join('')}
      </div>
      <div class="quiz-nav">
        ${step > 0
      ? `<button class="quiz-back-btn" onclick="renderQuizStep(${step - 1})">← 戻る</button>`
      : '<div></div>'}
        ${q.multiple
      ? `<button class="quiz-next-btn" id="quiz-next-btn"
               onclick="advanceQuiz(${step})" disabled>次へ →</button>`
      : '<div></div>'}
      </div>
    </div>
  `;

  // 前の選択を復元
  if (quizAnswers[q.id]) {
    const prev = Array.isArray(quizAnswers[q.id]) ? quizAnswers[q.id] : [quizAnswers[q.id]];
    prev.forEach(val => {
      const btn = document.getElementById(`qopt-${val}`);
      if (btn) btn.classList.add('selected');
    });
    if (q.multiple) {
      const next = document.getElementById('quiz-next-btn');
      if (next) next.disabled = false;
    }
  }
}

function selectQuizAnswer(questionId, value, multiple, step) {
  if (multiple) {
    if (!quizAnswers[questionId]) quizAnswers[questionId] = [];
    const arr = quizAnswers[questionId];
    const idx = arr.indexOf(value);
    const btn = document.getElementById(`qopt-${value}`);
    if (idx === -1) { arr.push(value); if (btn) btn.classList.add('selected'); }
    else { arr.splice(idx, 1); if (btn) btn.classList.remove('selected'); }
    const next = document.getElementById('quiz-next-btn');
    if (next) next.disabled = arr.length === 0;
  } else {
    quizAnswers[questionId] = value;
    const btn = document.getElementById(`qopt-${value}`);
    if (btn) btn.classList.add('selected');
    setTimeout(() => advanceQuiz(step), 260);
  }
}

function advanceQuiz(step) {
  if (step + 1 < quizQuestions.length) {
    renderQuizStep(step + 1);
  } else {
    showAnalyzing();
  }
}

function showAnalyzing() {
  const modalBody = document.getElementById('modal-body');
  if (!modalBody) return;
  modalBody.innerHTML = `
    <div class="quiz-analyzing">
      <div class="analyzing-spinner"></div>
      <p class="analyzing-text">成分を分析中...</p>
      <p class="analyzing-sub">あなたと『つくる』の成分を照合しています</p>
    </div>
  `;
  setTimeout(() => {
    const result = calculateComparison();
    renderComparisonResult(result);
  }, 2000);
}

function calculateComparison() {
  const { domain, years, strength, style } = quizAnswers;
  const azenDays = calculateSpan(2021, 9, 11).totalDays;
  const currentData = [...chartData.data];
  currentData[8] = azenDays;

  // 制作者の5大カテゴリー
  const creatorProfile = {
    food: { label: '食・サービス', days: currentData[0], color: chartData.colors[0] },
    it: { label: 'IT・システム', days: currentData[1], color: chartData.colors[1] },
    manufacturing: { label: 'ものづくり・製造', days: currentData[2] + currentData[5] + currentData[6] + currentData[7], color: '#7a9cbf' },
    sales: { label: '営業・ソリューション', days: currentData[3], color: chartData.colors[3] },
    management: { label: '管理・プロジェクト', days: currentData[4], color: chartData.colors[4] },
    creative: { label: 'クリエイティブ', days: currentData[8], color: chartData.colors[8] }
  };
  const totalCreatorDays = Object.values(creatorProfile).reduce((s, c) => s + c.days, 0);

  // 来訪者のカテゴリーウェイト
  const vW = { food: 0, it: 0, manufacturing: 0, sales: 0, management: 0, creative: 0 };
  if (domain) { if (vW[domain] !== undefined) vW[domain] += 3; }
  if (strength && Array.isArray(strength)) {
    const map = { making: 'manufacturing', system: 'it', lead: 'management', idea: 'creative', logic: 'management', client: 'sales' };
    strength.forEach(s => { const cat = map[s]; if (cat) vW[cat] += 1; });
  }

  // マッチスコア計算
  let matchDays = 0;
  const matched = [], complement = [];
  Object.entries(creatorProfile).forEach(([cat, info]) => {
    if ((vW[cat] || 0) > 0) { matchDays += info.days; matched.push({ ...info, cat }); }
    else { complement.push({ ...info, cat }); }
  });

  let score = (matchDays / totalCreatorDays) * 100;
  if (style === 'wanderer') score = Math.min(score + 20, 99);
  else if (style === 'generalist') score = Math.min(score + 10, 99);
  if (years === 'veteran') score = Math.min(score + 5, 99);
  score = Math.round(score);

  const stars = score >= 85 ? 5 : score >= 70 ? 4 : score >= 55 ? 3 : score >= 40 ? 2 : 1;
  const msgs = [
    { min: 85, title: '驚くほど似た成分構成！', body: '業界は違えど、あなたと『つくる』は同じDNAで動いています。一緒に仕事をしたら化学反応が起きるはず。' },
    { min: 70, title: '共通のDNAで繋がれる関係', body: 'キャリアの核心に共鳴するものがあります。互いの経験を語り合うと面白い発見がありそうです。' },
    { min: 55, title: '補完し合える組み合わせ', body: '異なる強みが補い合う関係性。あなたが持つものと『つくる』が持つものを合わせると、大きな力になります。' },
    { min: 40, title: '異なる強みを持つ存在', body: 'バックグラウンドは違いますが、だからこそ新鮮な視点を交換できます。異業種こそが刺激の源。' },
    { min: 0, title: 'まったく異なる成分の持ち主', body: 'ここまで違う成分は逆に貴重！互いの世界を見せ合う対話は、新しい発見に満ちているはずです。' }
  ];
  const msg = msgs.find(m => score >= m.min);

  // 来訪者ドーナツ用データを生成
  const visitorChart = Object.entries(vW)
    .filter(([, v]) => v > 0)
    .map(([cat, v]) => ({ label: creatorProfile[cat].label, value: v, color: creatorProfile[cat].color }));
  if (visitorChart.length === 0)
    visitorChart.push({ label: 'ユニークな領域', value: 1, color: '#888' });

  return { score, stars, msg, matched, complement, visitorChart, creatorProfile };
}

function renderComparisonResult(result) {
  const modalBody = document.getElementById('modal-body');
  if (!modalBody) return;
  const { score, stars, msg, matched, complement, visitorChart, creatorProfile } = result;
  const starsHtml = '★'.repeat(stars) + '☆'.repeat(5 - stars);

  modalBody.innerHTML = `
    <div class="comparison-result">
      <h2 class="comp-title">成分比較 結果</h2>
      <div class="comp-score-wrap">
        <div class="comp-stars">${starsHtml}</div>
        <div class="comp-score">${score}<span class="comp-score-unit">%</span></div>
        <div class="comp-msg-title">${msg.title}</div>
      </div>
      <div class="comp-charts-wrap">
        <div class="comp-chart-box">
          <p class="comp-chart-label">あなたの成分</p>
          <canvas id="visitorDonut" width="150" height="150"></canvas>
        </div>
        <div class="comp-vs">VS</div>
        <div class="comp-chart-box">
          <p class="comp-chart-label">『つくる』の成分</p>
          <canvas id="creatorDonut" width="150" height="150"></canvas>
        </div>
      </div>
      <p class="comp-msg-body">${msg.body}</p>
      ${matched.length > 0 ? `
        <div class="comp-section">
          <h4>🔗 共通成分</h4>
          <div class="comp-tags">
            ${matched.map(c => `<span class="comp-tag matched" style="border-color:${c.color};color:${c.color}">${c.label}</span>`).join('')}
          </div>
        </div>` : ''}
      ${complement.length > 0 ? `
        <div class="comp-section">
          <h4>⚡ 補完し合える成分</h4>
          <div class="comp-tags">
            ${complement.map(c => `<span class="comp-tag">${c.label}</span>`).join('')}
          </div>
        </div>` : ''}
      <button class="comp-retry-btn" onclick="startComparison()">もう一度分析する</button>
    </div>
  `;

  setTimeout(() => {
    const vCtx = document.getElementById('visitorDonut');
    if (vCtx) new Chart(vCtx, {
      type: 'doughnut',
      data: { labels: visitorChart.map(d => d.label), datasets: [{ data: visitorChart.map(d => d.value), backgroundColor: visitorChart.map(d => d.color), borderColor: '#1a1a1a', borderWidth: 2 }] },
      options: { responsive: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.label } } }, cutout: '62%' }
    });
    const cats = Object.values(creatorProfile);
    const cCtx = document.getElementById('creatorDonut');
    if (cCtx) new Chart(cCtx, {
      type: 'doughnut',
      data: { labels: cats.map(c => c.label), datasets: [{ data: cats.map(c => c.days), backgroundColor: cats.map(c => c.color), borderColor: '#1a1a1a', borderWidth: 2 }] },
      options: { responsive: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => { const tot = cats.reduce((s, c) => s + c.days, 0); return ctx.label + ': ' + ((ctx.parsed / tot * 100).toFixed(1)) + '%'; } } } }, cutout: '62%' }
    });
  }, 100);
}

// ============================================================
// ③ 成分タイムライン機能
// ============================================================

function _tlParseDate(str) {
  const p = str.trim().split('/');
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

function _buildTlItems() {
  const today = new Date();
  const azenDays = calculateSpan(2021, 9, 11).totalDays;
  const cd = [...chartData.data]; cd[8] = azenDays;
  return chartData.labels.map((label, i) => {
    let start, end;
    if (i === 8) { start = new Date(2021, 8, 11); end = today; }
    else { const pts = chartData.periods[i].split(' 〜 '); start = _tlParseDate(pts[0]); end = _tlParseDate(pts[1]); }
    return { label, start, end, color: chartData.colors[i], index: i, days: cd[i] };
  });
}

function showTimeline() {
  const items = _buildTlItems();
  const totalStart = items[0].start;
  const totalEnd = new Date();
  const totalMs = totalEnd - totalStart;

  items.forEach(it => {
    it.leftPct = ((it.start - totalStart) / totalMs) * 100;
    it.widthPct = ((it.end - totalStart) / totalMs) * 100 - it.leftPct;
  });

  // 年ラベル（4年ごと）
  const startYear = totalStart.getFullYear();
  const endYear = totalEnd.getFullYear();
  const yearLabels = [];
  for (let y = Math.ceil(startYear / 4) * 4; y <= endYear; y += 4) {
    const pct = ((new Date(y, 0, 1) - totalStart) / totalMs) * 100;
    if (pct >= 0 && pct <= 100) yearLabels.push({ year: y, pct });
  }

  const modalBody = document.getElementById('modal-body');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div class="tl-container">
      <div class="tl-header">
        <h2 class="tl-title">成分タイムライン</h2>
        <p class="tl-subtitle">${startYear}年 〜 現在 ／ 年表のスライダーを動かして、あの頃の社会と自分の歩みを振り返る</p>
      </div>
      <div class="tl-controls">
        <button class="tl-play-btn" id="tl-play-btn" onclick="toggleTimelinePlay()">▶ 再生</button>
        <span class="tl-year-display" id="tl-year-display">${startYear}年</span>
      </div>
      <div class="tl-chart-wrap">
        <div class="tl-axis">
          ${yearLabels.map(l => `<div class="tl-year-label" style="left:${l.pct.toFixed(2)}%">${l.year}</div>`).join('')}
        </div>
        <div class="tl-bars" id="tl-bars">
          ${items.map(it => `
            <div class="tl-bar-row">
              <div class="tl-bar"
                style="left:${it.leftPct.toFixed(2)}%;width:${it.widthPct.toFixed(2)}%;background:${it.color};"
                onmouseenter="tlBarHover(${it.index})"
                onmouseleave="tlBarUnhover()">
              </div>
            </div>
          `).join('')}
          <div class="tl-scrubber-line" id="tl-scrubber-line" style="left:0%"></div>
          <input type="range" class="tl-scrubber-input" id="tl-scrubber-input"
            min="0" max="1000" value="0" oninput="tlScrub(this.value)">
        </div>
        <div class="tl-now-label" style="left:100%">現在</div>
      </div>
      <div class="tl-info-panel" id="tl-info-panel">
        <div class="tl-wiki-section">
          <div class="tl-wiki-header" id="tl-wiki-header">🌏 社会との接続</div>
          <div class="tl-wiki-text" id="tl-wiki-text">バーにカーソルを合わせるか、▶ 再生で年代を探索してください</div>
        </div>
        <div class="tl-career-section" id="tl-career-section">
          <p class="tl-career-hint">業種バーをホバーすると詳細が表示されます</p>
        </div>
      </div>
    </div>
  `;

  window._tlState = { items, totalStart, totalMs, playing: false };
}

// Wikipedia キャッシュ・デバウンス
const _tlYearCache = new Map();
let _tlLastYear = null;
let _tlWikiDebounce = null;

// バーの直接ホバー（手動操作時）
function tlBarHover(index) {
  if (!window._tlState) return;
  const sc = document.getElementById('tl-scrubber-input');
  const { totalStart, totalMs, items } = window._tlState;
  let year;
  if (sc && Number(sc.value) > 0) {
    const pct = Number(sc.value) / 10;
    year = new Date(totalStart.getTime() + (pct / 100) * totalMs).getFullYear();
  } else {
    year = items[index].start.getFullYear();
  }
  _tlUpdateCareer(index);
  _tlFetchWiki(year);
  document.querySelectorAll('.tl-bar').forEach((b, i) => {
    b.style.opacity = i === index ? '1' : '0.25';
    b.style.filter = i === index ? 'brightness(1.3)' : 'none';
  });
}

function tlBarUnhover() {
  // スクラバーが動いていない時のみリセット
  const sc = document.getElementById('tl-scrubber-input');
  if (!sc || Number(sc.value) === 0) {
    document.querySelectorAll('.tl-bar').forEach(b => { b.style.opacity = '1'; b.style.filter = 'none'; });
  }
}

// キャリア情報の更新（下段）
function _tlUpdateCareer(index) {
  if (!window._tlState) return;
  const { items } = window._tlState;
  const it = items[index];
  const totalDays = items.reduce((s, x) => s + x.days, 0);
  const pct = ((it.days / totalDays) * 100).toFixed(1);
  const yrs = calculateYearsFromDays(it.days);
  const yStart = it.start.getFullYear() + '/' + String(it.start.getMonth() + 1).padStart(2, '0');
  const yEnd = it.index === 8 ? '現在' : it.end.getFullYear() + '/' + String(it.end.getMonth() + 1).padStart(2, '0');
  const cs = document.getElementById('tl-career-section');
  if (cs) cs.innerHTML = `
    <div class="tl-career-name" style="color:${it.color}">${it.label}</div>
    <div class="tl-career-period" style="color:${it.color}">${yStart} 〜 ${yEnd} &nbsp;${it.days.toLocaleString()}日 ${yrs} ${pct}%</div>
  `;
}

// Wikipedia 取得（上段）
function _tlFetchWiki(year) {
  const header = document.getElementById('tl-wiki-header');
  if (header) header.innerHTML = `🌏 ${year}年 の社会　<a href="https://ja.wikipedia.org/wiki/${year}%E5%B9%B4#%E3%81%A7%E3%81%8D%E3%81%94%E3%81%A8" target="_blank" rel="noopener" class="tl-wiki-link">Wikipedia で詳細を見る →</a>`;
  if (_tlLastYear === year) return;
  _tlLastYear = year;
  if (_tlWikiDebounce) clearTimeout(_tlWikiDebounce);
  const wt = document.getElementById('tl-wiki-text');
  if (wt && !_tlYearCache.has(year)) {
    wt.innerHTML = '<span class="tl-wiki-loading">読み込み中…</span>';
  } else if (wt && _tlYearCache.has(year)) {
    wt.innerHTML = _tlYearCache.get(year);
    return;
  }
  _tlWikiDebounce = setTimeout(() => _tlDoFetch(year), 400);
}

async function _tlDoFetch(year) {
  const wt = document.getElementById('tl-wiki-text');
  if (!wt) return;
  if (_tlYearCache.has(year)) { wt.innerHTML = _tlYearCache.get(year); return; }
  try {
    // 概要ではなく全文(plaintext)を取得してパース
    const res = await fetch(`https://ja.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${year}年&format=json&origin=*`);
    if (!res.ok) throw new Error('err');
    const json = await res.json();
    const pages = json.query.pages;
    const pageId = Object.keys(pages)[0];
    const extract = pages[pageId].extract || '';

    let text = '';
    // 「== できごと ==」セクションを抽出（前後の空白に耐性を持たせる強固な正規表現）
    const m = extract.match(/==\s*できごと\s*==\s*([\s\S]*?)(?=\n==\s*[^=]|$)/);
    if (m) {
      let lines = m[1].split('\n')
        .map(l => l.trim())
        // 空行や、=== 1月 === などの小見出しを削除
        .filter(l => l.length > 0 && !l.startsWith('='));

      if (lines.length > 0) {
        // 先頭3行を取得
        const topLines = lines.slice(0, 3).map(l => {
          // 「*」や「-」などで始まる箇条書き記号を掃除して、統一的に「・」を付与
          return '・' + l.replace(/^[\*\-\・]\s*/, '');
        });
        // リンクはヘッダーに移動したのでテキストのみ
        text = topLines.join('<br>');
      }
    }

    // できごとが取れなかった場合はREST API(概要)にフォールバック
    if (!text) {
      const sumRes = await fetch(`https://ja.wikipedia.org/api/rest_v1/page/summary/${year}年`, { headers: { Accept: 'application/json' } });
      if (sumRes.ok) {
        const sumJson = await sumRes.json();
        text = sumJson.extract ? sumJson.extract.replace(/\n/g, ' ').slice(0, 100) + '…' : '';
      }
    }

    if (!text) text = 'この年のWikipediaデータが見つかりませんでした。';

    _tlYearCache.set(year, text);
    const el = document.getElementById('tl-wiki-text');
    if (el) el.innerHTML = text;
  } catch {
    const el = document.getElementById('tl-wiki-text');
    if (el) el.innerHTML = 'データを取得できませんでした。';
  }
}

// スクラバー操作
function tlScrub(value) {
  if (!window._tlState) return;
  const { items, totalStart, totalMs } = window._tlState;
  const pct = Number(value) / 10;

  // ラインを動かす
  const line = document.getElementById('tl-scrubber-line');
  if (line) line.style.left = pct + '%';

  // 年号を更新
  const currentDate = new Date(totalStart.getTime() + (pct / 100) * totalMs);
  const year = currentDate.getFullYear();
  const yd = document.getElementById('tl-year-display');
  if (yd) yd.textContent = year + '年';

  // アクティブ業種を判定
  const ct = currentDate.getTime();
  const activeIdx = items.findIndex(it => ct >= it.start.getTime() && ct <= it.end.getTime());
  if (activeIdx >= 0) {
    document.querySelectorAll('.tl-bar').forEach((b, i) => {
      b.style.opacity = i === activeIdx ? '1' : '0.25';
      b.style.filter = i === activeIdx ? 'brightness(1.3)' : 'none';
    });
    _tlUpdateCareer(activeIdx);
  } else {
    document.querySelectorAll('.tl-bar').forEach(b => { b.style.opacity = '0.4'; b.style.filter = 'none'; });
  }

  // Wikipedia は年が変わった時だけ
  _tlFetchWiki(year);
}

let _tlRaf = null;
let _tlStart = null;
const _tlDuration = 7000; // 7秒で1984→現在

function toggleTimelinePlay() {
  if (!window._tlState) return;
  const btn = document.getElementById('tl-play-btn');
  if (!btn) return;

  if (window._tlState.playing) {
    window._tlState.playing = false;
    if (_tlRaf) cancelAnimationFrame(_tlRaf);
    btn.textContent = '▶ 再生';
    return;
  }

  const scrubber = document.getElementById('tl-scrubber-input');
  const currentVal = scrubber ? Number(scrubber.value) : 0;
  if (currentVal >= 1000) { // 最後まで行ったらリセット
    if (scrubber) scrubber.value = 0;
    tlScrub(0);
  }
  window._tlState.playing = true;
  btn.textContent = '⏸ 停止';

  const startOffset = (Number(document.getElementById('tl-scrubber-input')?.value || 0) / 1000) * _tlDuration;
  _tlStart = performance.now() - startOffset;

  function step(now) {
    if (!window._tlState || !window._tlState.playing) return;
    const progress = Math.min((now - _tlStart) / _tlDuration, 1);
    const val = Math.round(progress * 1000);
    const sc = document.getElementById('tl-scrubber-input');
    if (sc) sc.value = val;
    tlScrub(val);
    if (progress < 1) {
      _tlRaf = requestAnimationFrame(step);
    } else {
      window._tlState.playing = false;
      const b = document.getElementById('tl-play-btn');
      if (b) b.textContent = '▶ 再生';
    }
  }
  _tlRaf = requestAnimationFrame(step);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure everything is loaded
  setTimeout(() => {
    initializeBento();
  }, 100);
});


// ============================================================
// ④ 成分分析AIチャット機能
// ============================================================

const AI_WORKER_URL = "https://tsukuru-ai-chat.tsukuru-archive.workers.dev"; // ← 今回構築するCloudflare WorkerのURL

const chatBtn = document.getElementById('ai-chat-btn');
const chatWindow = document.getElementById('ai-chat-window');
const chatClose = document.getElementById('ai-chat-close');
const chatInput = document.getElementById('ai-chat-input');
const chatSend = document.getElementById('ai-chat-send');
const chatBody = document.getElementById('ai-chat-body');

let chatHistory = [];

if (chatBtn) {
  chatBtn.addEventListener('click', () => {
    chatWindow.classList.add('active');
    setTimeout(() => chatInput.focus(), 100);
  });
}

if (chatClose) {
  chatClose.addEventListener('click', () => {
    chatWindow.classList.remove('active');
  });
}

if (chatSend) {
  chatSend.addEventListener('click', handleChatSubmit);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatSubmit();
  });
}

async function handleChatSubmit() {
  const text = chatInput.value.trim();
  if (!text) return;

  // 1. ユーザーメッセージ追加
  appendMessage('user', text);
  chatInput.value = '';
  chatHistory.push({ role: "user", parts: [{ text }] });

  // 2. ローディングアニメーション追加
  const loadingId = 'loading-' + Date.now();
  chatBody.insertAdjacentHTML('beforeend', `
    <div class="chat-loading" id="${loadingId}">
      <span></span><span></span><span></span>
    </div>
  `);
  chatBody.scrollTop = chatBody.scrollHeight;

  try {
    // 3. Cloudflare Worker にリクエスト送信
    const response = await fetch(AI_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory })
    });

    if (!response.ok) throw new Error('API Error');

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "すみません、エラーが発生しました。";

    // 4. 返信表示
    document.getElementById(loadingId)?.remove();
    appendMessage('ai', reply);
    chatHistory.push({ role: "model", parts: [{ text: reply }] });

  } catch (error) {
    console.error(error);
    document.getElementById(loadingId)?.remove();
    appendMessage('ai', "現在AIサーバーが準備中です！もうしばらくお待ちください🙇‍♂️");
  }
}

function appendMessage(sender, text) {
  const msgClass = sender === 'user' ? 'user-message' : 'ai-message';

  // URLのような文字列があれば安全なリンクに変換する簡易処理
  let formattedText = text.replace(/\n/g, '<br>');
  formattedText = formattedText.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:inherit;text-decoration:underline;">$1</a>');

  chatBody.insertAdjacentHTML('beforeend', `
    <div class="chat-message ${msgClass}">${formattedText}</div>
  `);
  chatBody.scrollTop = chatBody.scrollHeight;
}
