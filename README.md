# TOKYO SHIBUYA DEV

---

TOKYO SHIBUYA DEV はホームページ手作り用キットです。<br>
完全に個人目線で開発をしていますが、ありきたりな構成ではあるので、clone してくればだれでもすぐに開発が始められるでしょう。

## 構成

### node

* > = 9.0.0

他でも動くと思うけど、動作してるのは 9.4.0

### パッケージマネージャ

* yarn

入っていれば`yarn`で、なければ homebrew なりで yarn を落としてくるか、`npm i`でも叩きましょう。おそらくそれでも入ってくると思います。

### タスクランナーなどの構成

* gulp

  * pug -- html をどうこうするのに
  * gulp-file-include -- pug 使わないときのために一応置いてる。
  * sass(scss でない)
  * pleeease -- css をいい感じに
  * webpack4 -- js をどうこうするのに
  * imagemin -- 画像圧縮
  * browser-sync -- ローカルホスト立ち上げ用

* babel
  * env
  * babel-plugin-transform-object-rest-spread
  * babel-polyfill

大まかには以上で、詳しいことは package.json で

### 元から入れてるプラグイン

**css**

* TOKYO SHIBUYA RESET -- 僕が作った全消しリセット

**js**

* jquery -- どこでも使えるようにしてある
* modernizr -- touch event だけ
* gsap
* imagesloaded
* webfontloader

## コマンド

開発タスク -- watch

    $ yarn start

開発タスク -- 吐き出しだけ

    $ yarn run build

eslint

    $ yarn run lint

リリースタスク

    $ yarn run release

リリースされたものの確認

    $ yarn run server

## 詳細

### ディレクトリとファイル

ディレクトリは以下

    app -- _release リリースフォルダ
      |  ├ dest ステージング
      |  ├ src 開発
      |     ├ assets
      |       ├ js
      |       ├ img
      |       ├ sass
      |         ├ lib
      |           ├ modules...
      |
    package.json ...

ディレクトリは package.json とどう階層においてある DirectoryManager.js を gulpfile と webpack config で使っています。<br>
それぞれ、path の書き方が違うので、そこを柔軟にするために関数化して、必要なら引数を食わせることにしました。  
ディレクトリ構成を変更する場合はそこも確認してみてください。

### webpack と babel と eslint

**webpack config について**

現在主流なのは webpack config を commmon/dev/prod の 3 枚とかに分けることだとおもうのですが、今回は対して違いがないので、全て 1 枚のファイルにまとめています。そしてオブジェクトにぶら下げてわたすことで、gulp で読み込むときにどの設定を読み込むかを分けています。現状 2 パターンあります。(dev/prod)

**eslint**

FREE CODE CAMP のものをパクってきて使ってます。

**prettier**

考えたんですが、エディタに入れてください。

### special thanks

inagaki 氏の sass ファイルから mixins, variables の utils, color ファイルの構成を使用させてもらってます。<br>
thunk you inagakiiii!!
