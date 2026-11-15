ASHEN DEPTHS / 灰の深淵

ブラウザで遊ぶ開発中のアクションRPGです。
この公開用スナップショットは release.json のリビジョンに対応します。

Cloudflare Workers で公開（今回の公開先）
1. Workers & Pages からこのGitHubリポジトリを接続します。
2. 名前 ashen-depths、ブランチ main、ルートはリポジトリ直下、ビルドコマンドは空欄。
3. デプロイコマンド npx wrangler deploy で配信します。
4. ランキングと村の共有には、下記のD1とGoogleログイン設定が必要です。
現在は配信用ソースの公開段階で、本番サーバー接続済みではありません。

GitHub Pages で公開（任意のシングルプレイ配信）
1. このフォルダの内容をリポジトリの main ブランチへ配置します。
2. リポジトリ Settings > Pages > Build and deployment > Source を GitHub Actions にします。
3. Actions の Publish game to GitHub Pages を手動実行し、成功すると公開URLが表示されます。
4. この任意の配信は手動実行のみです。Cloudflareの公開とは別です。

現状
- GitHub Pages版はシングルプレイ用です。セーブはブラウザ内に保存します。
- ランキングAPIは server/ にありますが、Pagesではサーバーを実行できません。
- 最大4人の村の集会所はゲームとサーバーのコードを接続済みです。Pages単体では利用できません。
- 村の共有は移動・参加・退出です。探索・戦闘・依頼・報酬は個別です。
- 接続メニューと通信の自動テストは実施済みですが、公開サーバー・複数ブラウザ・実機コントローラーの検証は未実施です。
- 別のURLに移るとブラウザの保存領域も変わります。移行前にゲーム内の保存書き出し機能を使ってください。

ランキングと集会所を有効にするサーバー構成
Cloudflare Workers の静的アセット配信でゲームと /api/ を同じオリジンに置きます。
wrangler.jsonc に静的配信と集会所のDurable Objectバインディングを宣言しています。
実際のD1を作成してDBバインディングを追加し、server/migrations/ のSQLを番号順に適用し、
GOOGLE_CLIENT_IDを設定する必要があります。ホスティング契約・DB・ログイン設定は未完了です。
Google OAuth の許可するJavaScript生成元には実際の公開URLのオリジンを登録します。
APIキーやCloudflareトークンをリポジトリへ追加しないでください。
詳細と現状の制約は server/DEPLOYMENT.txt を参照してください。
ランキングはクライアント計測値であり、不正耐性のある競技ランキングではありません。

素材
BGMの著作者・配布元・利用条件は dist/AUDIO-LICENSES.txt に記載しています。
画像には生成素材を使用しています。他作品の公式素材を含むことを意図していません。
このスナップショットに汎用のオープンソースライセンスは付与していません。

公式手順
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
https://developers.cloudflare.com/workers/static-assets/
