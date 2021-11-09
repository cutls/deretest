<template>
	<div class="home make">
		<div v-show="loading" id="loadingWrap">
			<p id="loading">処理中…</p>
		</div>
		<div>
			<h3>クイズを作成する</h3>
			<h4>ID</h4>
			他の質問と被らないように半角英数字で指定します。(例: 5やquiz20211001など)<br />
			<input type="text" v-model="quizId" pattern="[a-zA-Z0-9-_]+" />
			<h4>タイトル</h4>
			適当に付けてください。<br />
			<input type="text" v-model="quizTitle" />
			<h4>説明</h4>
			クイズの説明を記入できます。空欄でもOK。<br />
			<textarea v-model="quizDesc" />
			<h4>設問</h4>
			<div v-for="[i, q] of quiz.entries()" :key="`i${i}`">
				<h5>第{{ i + 1 }}問</h5>
				問題文<br />
				<textarea v-model="q.string" /><br />
				問題タイプ(画像付き・音声付きなど)<br />
				<select v-model="q.questionType">
					<option value="normal">通常</option>
					<option value="withImage">画像付き</option>
					<option value="withAudio">音声付き</option>
					<option value="withYouTube">YouTube付き</option>
				</select>
				<br />
				<div v-if="q.questionType === 'withImage' || q.questionType === 'withAudio'">
					画像や音声<br />
					<input type="file" @change="changeFile(i)" :id="`asset${i}`" /><button @click="delImage(i)">削除</button>
				</div>
				<div v-if="q.questionType === 'withYouTube'">
					動画URL<br />
					<input type="text" v-model="q.attached" placeholder="https://youtu.be/..." ptn="11文字" />
				</div>

				<img :src="q.attached" v-if="q.questionType === 'withImage'" class="attach" />
				<audio :src="q.attached" v-if="q.questionType === 'withAudio'" controls />
				<div class="youtube" v-if="q.attached.match(/https:\/\/youtu.be\/[a-zA-Z0-9]{11}/)">
					<iframe
						width="783"
						height="440"
						:src="q.attached.replace('https://youtu.be/', 'https://www.youtube.com/embed/')"
						title="YouTube video player"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
					></iframe>
				</div>

				<p class="noPadding">点数</p>
				<input type="number" v-model="q.point" /><br />
				解答タイプ<br />
				<select v-model="q.answerType">
					<option value="input">テキスト</option>
					<option value="select">選択肢</option>
					<option value="song">曲名</option>
					<option value="idol">アイドル名</option>
					<option value="card">カード名</option>
				</select>
				<div v-if="q.answerType === 'input'">
					入力値を制限する正規表現<br />
					<input type="text" v-model="q.inputTypeRegExp" required /><br />
					<button @click="q.inputTypeRegExp = '.+'">特に指定しない</button>
					<button @click="q.inputTypeRegExp = '[0-9]+'">数字だけ可</button>
					<button @click="q.inputTypeRegExp = '[A-Za-z]+'">英字だけ可</button>
					<button @click="q.inputTypeRegExp = '[A-Z]+'">大文字だけ可</button>
				</div>
				<div v-if="q.answerType === 'select'">
					選択肢<button @click="q.answers = []">リセット</button><br />
					<div v-for="[j] of q.answers.entries()" :key="`i${i}j${j}`">
						<input type="text" v-model="q.answers[j]" />
					</div>
					<p class="noPadding">{{ q.answers.length }}個の選択肢が用意されています</p>
					<input type="text" v-model="addNewAnswer[i]" />
					<button @click="doAddNewAnswer(i)">追加</button>
				</div>
				<div v-if="q.answerType === 'card'">
					設定<br />
					<select v-model="q.config.filter">
						<option value="allSsr">SSR特訓前後</option>
						<option value="ssr">SSR特訓前</option>
						<option value="ssr+">SSR特訓後</option>
						<option value="sr">SR特訓前</option>
						<option value="sr+">SR特訓後</option>
						<option value="r">R特訓前</option>
						<option value="r+">R特訓後</option>
						<option value="n">ノーマル特訓前</option>
						<option value="n+">ノーマル特訓後</option>
						<option value="all">全てのカード</option>
					</select>
					<br />
					<input type="checkbox" v-model="q.config.showImage" :id="`card${i}`" />
					<label :for="`card${i}`">カードの画像を表示する</label>
				</div>
				<br />
				答え
				<button @click="resetCAnswer(i)">リセット</button>
				<p class="noPadding">{{ q.correctAnswer.length }}パターンの答えが用意されています</p>
				<div v-for="[l] of q.correctAnswer.entries()" :key="`i${i}l${l}`">
					<div>
						{{ l + 1 }}: {{ q.correctAnswer[l] }}
						傾斜: <input type="number" v-model="q.correctAnswerIncline[l]" style="width: 50px" />%
					</div>
				</div>
				<div>
					<div v-if="q.answerType === 'input'">
						解答を入力:
						<input :pattern="q.inputTypeRegExp" v-model="addNewCollectAnswer[i]" />
						<button @click="doAddNewCollectAnswer(i)">OK</button>
					</div>
					<div v-if="q.answerType === 'select'">
						解答を入力:
						<select v-model="addNewCollectAnswer[i]">
							<option v-for="s of q.answers" :key="`i${i}s${s}`" :value="s">
								{{ s }}
							</option>
						</select>
						<button @click="doAddNewCollectAnswer(i)">OK</button>
					</div>
					<div v-if="q.answerType === 'card'">
						{{ toJaCardType(q.config.filter) }}のカードの名前(肩書き含む)の一部を入力して検索:
						<input type="text" v-model="query[i]" />
						<button @click="cardSearch(q.config, i)">検索</button>
						<div class="cards">
							<div class="card" v-for="c of cards" :key="`i${i}${c.id}`" @click="select(c.title, i)">
								<img :src="`https://hidamarirhodonite.kirara.ca/icon_card/${c.id}.png`" v-show="q.config.showImage" />
								<div>{{ c.title }}{{ c.plus ? `+` : '' }}</div>
							</div>
						</div>
						<input type="hidden" v-model="addNewCollectAnswer[i]" />
					</div>
					<div v-if="q.answerType === 'idol'">
						アイドル名の一部を入力して検索:
						<input type="text" v-model="query[i]" />
						<button @click="idolSearch(i)">検索</button>
						<div class="cards">
							<div class="card" v-for="c of idols" :key="`i${i}${c.name}`" @click="select(c.name, i)">
								<div>{{ c.name }}</div>
							</div>
						</div>
						<input type="hidden" v-model="addNewCollectAnswer[i]" />
					</div>
					<div v-if="q.answerType === 'song'">
						楽曲の一部を入力して検索:
						<input type="text" v-model="query[i]" />
						<button @click="songSearch(i)">検索</button>
						<div class="cards">
							<div class="card" v-for="c of songs" :key="c.song_id ? `i${i}${c.song_id}` : `i${i}${c.id}`" @click="select(c.name, i)">
								<div>{{ c.name }}</div>
							</div>
						</div>
						<input type="hidden" v-model="addNewCollectAnswer[i]" />
					</div>
					<p>解説</p>
					<textarea v-model="q.comment" /><br />
					<input type="file" @change="changeFile(i, true)" :id="`assetComment${i}`" />
					<button @click="delImage(i, true)">削除</button><br />
					<img :src="q.commentAttached" v-if="q.commentAttached" class="attach" />
				</div>
			</div>
			<br />
			<br />
			<br />
			<hr />
			<button @click="add" class="large">問題を追加</button>
			<button @click="deleteQ" class="large">最後の問題を削除</button>
			<br />
			<br />
			<br />
			<hr />
			<button @click="complete" class="large">登録</button>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Quiz from '../components/Quiz.vue'
import Result from '../components/Result.vue'
import { IConfig, IQuiz, IFujiwarahajime, IKirara, AppCard, ICard, ENV } from '../../interfaces/question'
import { v4 } from 'uuid'
import { getEndpoint, getCDN } from '../util'
import Idols from '../assets/data'
export default Vue.extend({
	name: 'Home',
	components: { Quiz, Result },
	data() {
		return {
			loading: false,
			quiz: [] as IQuiz[],
			quizId: '',
			quizTitle: '',
			quizDesc: '',
			addNewAnswer: [] as string[],
			addNewCollectAnswer: [] as string[],
			query: [] as string[],
			cards: [] as AppCard[],
			songs: [] as any,
			idols: [] as any,
		}
	},
	mounted: async function () {
		document.title = 'クイズを作成する'
		localStorage.removeItem('pwd')
		try {
			this.loading = true
			const songsRaw = await fetch('https://api.fujiwarahaji.me/v1/list?type=music&music_type=cg')
			const songs = (await songsRaw.json()) as IFujiwarahajime[]
			localStorage.setItem('songs', JSON.stringify(songs))
			const cardRaw = await fetch('https://starlight.kirara.ca/api/v1/list/card_t?keys=title,name_only,rarity_dep,id,evolution_id')
			const cards = (await cardRaw.json()) as IKirara
			localStorage.setItem('cards', JSON.stringify(cards.result))
			const envRaw = await fetch('/env.json')
			const env = (await envRaw.json()) as ENV
			localStorage.setItem('env', JSON.stringify(env))
			this.loading = false
			const template = []
			for (let i = 0; i <= 150; i++) {
				template.push('')
			}
			this.addNewAnswer = template
			this.addNewCollectAnswer = template
			this.query = template
			this.add()
		} catch {
			this.loading = false
		}
	},
	methods: {
		add: function () {
			if (this.quiz.length >= 30) return alert('30問以上作ることはできません。')
			this.quiz.push({
				uniqueId: v4(),
				string: '',
				answerType: 'input',
				questionType: 'normal',
				correctAnswer: [],
				correctAnswerIncline: [],
				answers: [],
				inputTypeRegExp: '.+',
				config: {
					filter: 'ssr',
					showImage: true,
					clickToDetail: true,
				},
				attached: '',
				point: 10,
			})
		},
		changeFile: async function (i: number, forComment?: boolean) {
			const pwd = localStorage.getItem('pwd') || prompt('問題作成パスワードを入力してください。')
			if (!pwd) return false
			localStorage.setItem('pwd', pwd)
			this.loading = true
			const e = document.querySelector(forComment ? `#assetComment${i}` : `#asset${i}`) as any
			const [file] = e.files
			const { name } = file
			const uuid = v4()
			const assetUrl = `${getCDN()}${uuid}${name}`
			const b64 = (await readAsDataURL(file)) as string
			let b64Raw
			if (b64) b64Raw = b64.replace(/data:[^,]+,/, '')
			try {
				const p = await fetch(getEndpoint('upload', { file: `${uuid}${name}`, pwd }), {
					method: 'post',
					body: JSON.stringify({ b64: b64Raw }),
				})
				const r = await p.text()
				console.log(r)
				if(!forComment) this.quiz[i].attached = assetUrl
				if(forComment) this.quiz[i].commentAttached = assetUrl
				this.loading = false
				if (r !== 'success') alert('失敗しました。')
				if (r !== 'success') localStorage.removeItem('pwd')
			} catch (e) {
				this.loading = false
				localStorage.removeItem('pwd')
			}
		},
		delImage: function (i: number, forComment?: boolean) {
			if(!forComment) this.quiz[i].attached = ''
			if(forComment)  this.quiz[i].commentAttached = ''
		},
		doAddNewAnswer: function (i: number) {
			const as = this.quiz[i].answers
			if (as) {
				as.push(this.addNewAnswer[i])
			} else {
				this.quiz[i].answers = [this.addNewAnswer[i]]
			}
			this.addNewAnswer[i] = ''
		},
		doAddNewCollectAnswer: function (i: number) {
			const as = this.quiz[i].correctAnswer as string[]
			const asi = this.quiz[i].correctAnswerIncline as number[]
			if (as) {
				as.push(this.addNewCollectAnswer[i])
				asi.push(100)
			} else {
				this.quiz[i].correctAnswer = [this.addNewCollectAnswer[i]]
				this.quiz[i].correctAnswerIncline = [100]
			}
			this.addNewCollectAnswer[i] = ''
			this.query[i] = ''
			this.songs = []
			this.idols = []
			this.cards = []
		},
		toJaCardType: function (type: string | undefined) {
			if (type === 'all') return '全て'
			if (type === 'allSsr') return 'SSR(特訓前後)'
			if (type === 'ssr') return 'SSR(特訓前)'
			if (type === 'ssr+') return 'SSR+'
			if (type === 'sr') return 'SR(特訓前)'
			if (type === 'sr+') return 'SR+'
			if (type === 'r') return 'R(特訓前)'
			if (type === 'r+') return 'R+'
			if (type === 'n') return 'R(特訓前)'
			if (type === 'n+') return 'R+'
			return '一部'
		},
		songSearch: function (i: number) {
			const q = this.query[i]
			const songsR = localStorage.getItem('songs')
			if (!songsR) return false
			const songs = JSON.parse(songsR) as any[]
			const songsF = songs.filter(function (a) {
				return a.name.toLowerCase().includes(q.toLowerCase())
			})
			this.songs = songsF
		},
		resetCAnswer: function (i: number) {
			this.quiz[i].correctAnswer = []
			this.songs = []
			this.idols = []
			this.cards = []
			this.query[i] = ''
		},
		select: function (title: string, i: number) {
			this.addNewCollectAnswer[i] = title
			this.doAddNewCollectAnswer(i)
		},
		idolSearch: function (i: number) {
			const q = this.query[i]
			const idolsF = Idols.filter(function (a) {
				return a.name.includes(q) || a.kana.includes(q)
			})
			this.idols = idolsF
		},
		cardSearch: function (config: IConfig, i: number) {
			const q = this.query[i]
			const cardsR = localStorage.getItem('cards')
			if (!cardsR) return false
			const cards = JSON.parse(cardsR) as ICard[]
			const isAll = config.filter === 'all' || config.filter === 'allSsr'
			const isCompletelyPlus = config.filter.indexOf('+') > 0
			let cardsF = [] as AppCard[]
			let j = 0
			for (const c of cards) {
				if (!c.title?.includes(q) && !c.name_only?.includes(q)) continue
				const title = `${c.title ? `[${c.title}]` : ''}${c.name_only}`
				if (c.rarity_dep.rarity === 7) {
					if (config.filter !== 'all' && config.filter !== 'ssr' && config.filter !== 'ssr+' && config.filter !== 'allSsr') continue
				} else if (c.rarity_dep.rarity === 5) {
					if (config.filter !== 'all' && config.filter !== 'sr' && config.filter !== 'sr+') continue
				} else if (c.rarity_dep.rarity === 3) {
					if (config.filter !== 'all' && config.filter !== 'r' && config.filter !== 'r+') continue
				} else if (c.rarity_dep.rarity === 1) {
					if (config.filter !== 'all' && !config.filter.includes('n')) continue
				}
				if (isCompletelyPlus || isAll) {
					cardsF.push({
						id: c.evolution_id,
						title,
						plus: true,
					})
				}
				if (!isCompletelyPlus || isAll) {
					cardsF.push({
						id: c.id,
						title,
						plus: false,
					})
				}
				if (j > 50) break
				j++
			}
			this.cards = cardsF
		},
		deleteQ: function () {
			if (this.quiz.length <= 1) return alert('この機能は2問以上あるときにのみ使用可能です。')
			if (!confirm('最後の問題を削除します。よろしいですか？')) return false
			const target = this.quiz[this.quiz.length - 1].uniqueId
			const a = []
			for (const q of this.quiz) {
				if (q.uniqueId !== target) a.push(q)
			}
			this.quiz = a
		},
		complete: async function () {
			const pwd = localStorage.getItem('pwd') || prompt('問題作成パスワードを入力してください。')
			if (!pwd) return false
			localStorage.setItem('pwd', pwd)
			if (!this.quizTitle) return alert(`タイトルが指定されていません。`)
			if (!this.quizId.match(/^[a-zA-Z0-9-_]+$/)) return alert(`IDの形式が不正です。`)
			for (let [i, q] of this.quiz.entries()) {
				//バリデーション
				const useI = i + 1
				if (!q.correctAnswer.length) return alert(`第${useI}問: 答えが登録されていません。答えを入力した後にOKを押しましたか？`)
				if (!q.inputTypeRegExp && q.answerType === 'input') return alert(`第${useI}問: 「入力値を制限する正規表現」は空欄にできません。`)
				if (!q.string) return alert(`第${useI}問: 「問題文」は空欄にできません。`)
				if (q.answerType === 'select' && !q.answers) return alert(`第${useI}問: 選択肢が登録されていません。答えを入力した後にOKを押しましたか？`)
				if (!q.point || q.point < 1) return alert(`第${useI}問: 点数には1点以上を指定してください。`)
				for (const a of q.correctAnswer) {
					if (!a) return alert(`第${useI}問: 答えは空欄にはできません。一度リセットを押して再度登録してください。`)
					if (q.inputTypeRegExp && q.answerType === 'input') if (!a.match(new RegExp(q.inputTypeRegExp))) return alert(`第${useI}問: 答えが入力値の制限と一致しません`)
				}

				if (q.questionType !== 'normal' && !q.attached) return alert(`第${useI}問: 画像や音声を添付しない場合は問題タイプを「通常」にしてください。`)
				if (q.questionType === 'withYouTube' && q.attached) if (!q.attached.match(/https:\/\/youtu.be\/[a-zA-Z0-9]{11}/)) return alert(`第${useI}問:YouTubeアドレスが不正です。`)
				if (typeof q.point === 'string') q.point = parseInt(q.point, 10)
			}
			if (!confirm(`${this.quiz.length}問のクイズを作成します。よろしいですか？`)) return false
			this.loading = true
			//IDやタイトルも。idは小文字で。
			const param = {
				id: this.quizId,
				title: this.quizTitle,
				description: this.quizDesc,
				questions: this.quiz,
			}
			try {
				const p = await fetch(getEndpoint('post', { pwd }), {
					method: 'post',
					body: JSON.stringify(param),
				})
				const r = await p.text()
				this.loading = false
				if (r === 'success') location.href = `/q/${this.quizId}`
				else if (r === '被っています') alert('IDが被っています。')
				else alert('成功したか失敗したかわかりません。サーバーからのメッセージ: ' + r)
				if (r !== 'success') localStorage.removeItem('pwd')
			} catch (e) {
				localStorage.removeItem('pwd')
				console.error(e)
				this.loading = false
				return alert('失敗しました。')
			}
		},
	},
})
function readAsDataURL(blob: Blob) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader()
		reader.onload = () => {
			resolve(reader.result)
		}
		reader.onerror = () => {
			reject(reader.error)
		}
		reader.readAsDataURL(blob)
	})
}
</script>
<style scoped>
.make {
	text-align: initial;
}
button {
	padding: 0.2rem;
}
button.large {
	padding: 0.5rem;
}
.noPadding {
	margin: 0;
}
img.attach {
	min-width: 300px;
	max-width: 100%;
}
.card {
	display: flex;
	align-items: center;
	cursor: pointer;
}
.card img {
	width: 3rem;
	height: 3rem;
	margin-right: 1rem;
}
textarea {
	width: 300px;
	max-width: 100%;
	height: 50px;
}
#loading {
	position: fixed;
	width: 300px;
	height: 1rem;
	top: calc(50vh - 0.5rem);
	left: calc(50vw - 150px);
	text-align: center;
}
#loadingWrap {
	background-color: rgba(255, 255, 255, 0.5);
	position: fixed;
	width: 100vw;
	height: 100vh;
	z-index: 9999;
}
.youtube {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  overflow: hidden;
  margin-bottom: 50px;
}

.youtube iframe {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
