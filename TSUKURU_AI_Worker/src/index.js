export default {
    async fetch(request, env, ctx) {
        // 1. CORSプリフライトリクエストの処理（Webサイトからのアクセスを許可）
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*", // 特定のドメインのみに絞る場合はここにGitHub PagesのURLを指定
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Max-Age": "86400",
                }
            });
        }

        if (request.method !== "POST") {
            return new Response("Method not allowed", { status: 405 });
        }

        // CORSヘッダー設定（本番応答用）
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json; charset=UTF-8"
        };

        // 2. ブラウザからの質問（JSON）を受け取る
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return new Response(JSON.stringify({ error: "Invalid JSON format" }), {
                status: 400, headers: corsHeaders
            });
        }

        const { messages } = body;
        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: "'messages' array is required" }), {
                status: 400, headers: corsHeaders
            });
        }

        // 3. 環境変数からAPIキーを取得
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured on server" }), {
                status: 500, headers: corsHeaders
            });
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        // 4. システムプロンプト（RAG：回答の土台となるデータと人格設定）の注入
        const systemInstruction = {
            parts: [
                {
                    text: `あなたは「成分表示」サイト（つくるアーカイブ）の専属AIアシスタント「つくるAI」です。
ウェブサイトの来訪者から、制作者「つくる」の経歴や成分、相性などについての質問を受け付けます。
以下の「つくる（制作者）」の正確なデータを元に、親しみやすく、かつプロフェッショナルなトーンで回答してください。
回答はチャットウィンドウで読みやすいよう簡潔にし（長くても250〜300文字程度）、適度な改行や箇条書きを行ってください。

【つくるの基本・キャリア成分データ】
累計就業期間：1984年9月〜現在 (15,000日以上 / 40年以上のキャリア)

＜9つの業種成分と割合＞
1. 洋食調理・接客／小売販売（16.3%）: 飲食とアパレル販売で培ったホスピタリティと"段取り・仕込み"の基礎。
2. 情報処理・社内SE（13.8%）: ITの力で業務課題を解決するシステム思考。
3. 照明機器・製造／販売（13.8%）: ものづくりの現場と、製品を世に送り出す営業。
4. 営業・ソリューション企画（11.3%）: 顧客の課題を見極め、解決策を企画提案する力。
5. 事業管理・プロジェクト推進（5.9%）: 複数部署を巻き込み、プロジェクトを成功に導くマネジメント。
6. サイン・看板・ディスプレイ制作（6.1%）: 空間における視覚的なコミュニケーションデザイン。
7. 店舗企画・デザイン設計（1.3%）: 商業空間の実務的なレイアウト設計と顧客体験づくり。
8. プロモーション・企画制作（2.6%）: 広告や販促などのプロモーション施策全体を形にする力。
9. クリエイティブ全般・フロントエンド（12.2%）: 2021年〜現在。コードやデザイン技術を駆使し、デジタル領域でモノをつくる現在のメイン領域。

【基本理念・仕事観】
「カリフォルニアロール」のような仕事をすることを理念としています。これは「既存の伝統ルールにとらわれず、相手（海外の人など）のニーズに合わせて要素（アボカドやマヨネーズ）を柔軟に組み合わせ、全く新しい価値（カリフォルニアロール）として昇華して喜んでもらう」思考法です。様々な業種を渡り歩いて得た多様な成分（知識・経験）を掛け合わせ、目の前の人のために最適な形を"つくる"ことを得意としています。

【相性診断のアドバイスについて】
ユーザーが自身の職種や得意なことを教えてくれた場合は、上記の成分データと比較して「どの部分で共有・共鳴できるか」「どの部分で能力を補い合えるか（シナジーが生まれるか）」をポジティブに分析して回答してください。`
                }
            ]
        };

        // リクエストの組み立て
        const payload = {
            systemInstruction: systemInstruction,
            contents: messages,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2000,
            }
        };

        try {
            // 5. Gemini APIへのリクエスト実行
            const geminiResponse = await fetch(geminiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await geminiResponse.json();

            // エラーハンドリング
            if (!geminiResponse.ok) {
                console.error("Gemini API Error:", data);
                return new Response(JSON.stringify({ error: data.error?.message || "Error from Gemini" }), {
                    status: geminiResponse.status, headers: corsHeaders
                });
            }

            // 正常完了：Geminiから返ってきたJSONをそのままブラウザに返す
            return new Response(JSON.stringify(data), {
                headers: corsHeaders
            });

        } catch (error) {
            console.error("Worker fetch error:", error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500, headers: corsHeaders
            });
        }
    }
};
