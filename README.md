# deretest

デレマスクイズを作りたかったので、そういうツール

proccess.env(.env)にENV=(config JSON)を入力

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

あとは何をする感じかソースコードを読んでください