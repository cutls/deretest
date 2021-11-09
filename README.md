# deretest

デレマスクイズを作りたかったので、そういうツール

AWSの各サービスの利用が前提で、作成者は静的ファイルを置くためにNetlifyを利用しています。

[![Netlify Status](https://api.netlify.com/api/v1/badges/550ed300-892b-4d2f-881a-b21ee4c986ee/deploy-status)](https://app.netlify.com/sites/cutls-deretest/deploys)

## router

* `/`: トップページ  
テキストボックスにIDを入れてクイズのホーム画面へ
* `/q/:id`: クイズのホーム画面
* `/make`: クイズの作成画面  
後述の「どうでもいいパスフレーズ」で保護されています

## config

proccess.env(または.env)にENV=(config JSON)を入力

.env.sample参照

config JSON
```
{
    "uploader": "uploader APIのendpoint",
    "get": "get APIのendpoint",
    "post": "post APIのendpoint",
    "auth": "簡易パスワード",
    "cdn": "CDNのエンドポイント"
}
```

これを1行にminifyして環境変数または.envに記入します。

## API

各APIは全てLambdaで組むことを想定しています。(lambda-sample参照)

これらを全て別々の関数として登録し、API Gatewayで認証のないHTTP APIを作製して、URLをconfigに書きます。
(例: https://xxxxxxxxxx.execute-api.ap-northeast-n.amazonaws.com/default/deretest-lambda-sample-upload)

(最低でもuploaderの)実行ロールがS3にアクセスできるようにしてください。

### 「どうでもいいパスフレーズ」について

アップロードイベントが発火するときにフロントがpromptを出して入力させるので、
パスフレーズを入力しないとアップロード(問題作成)ができないようになっています。

## DB

DynamoDBでidをパーティションキー(文字列)にしたテーブルを作って、Lambdaの「DYNAMODB-TABLE-NAME」をテーブル名で埋めます。

## S3

バケットを作り、バケット名をLambdaの「YOUR BUCKET NAME」に入れます。

### 権限とCDN

CloudFront CDNを使用する場合、最低でもCloudFrontで読み込める権限にする必要があります。

そうでない場合は全公開にする必要があります。

`https://cdn.example.com/garage/`以下に置かれる画像にアクセスできるようにconfigのcdnのエンドポイントを`https://cdn.example.com/garage/`と記入します。

## ビルドと開発

開発: `yarn serve`

ビルド: `yarn build`

dist以下にビルドされます。dist以下を静的ファイルとして配置するとアクセスできます。

以下のボタンを押すとforkまでやってNetlifyに展開できますが、環境変数を自分で設定して再ビルドする必要があります。

[![Netlify Status](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/cutls/deretest)

