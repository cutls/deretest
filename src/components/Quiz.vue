<template>
	<div>
		<div class="centarize" v-if="!finalized">
			<p>第{{ thisIs }}問</p>
			<p>{{ question.string }}</p>
			<div v-if="question.questionType === 'withImage'" class="textAlignCenter attach">
				<img :src="question.attached" />
			</div>
			<div v-if="question.questionType === 'withAudio'" class="textAlignCenter attach">
				再生ボタンを押して再生
				<audio :src="question.attached" controls />
			</div>
			<div v-if="question.answerType === 'select'">
				選択肢:
				<select v-model="answer">
					<option v-for="q of question.answers" :key="q" :value="q">
						{{ q }}
					</option>
				</select>
			</div>
			<div v-if="question.answerType === 'input'">
				解答を入力:
				<input :pattern="question.inputTypeRegExp" v-model="answer" />
			</div>
			<div v-if="question.answerType === 'card'">
				{{ toJaCardType(question.config.filter) }}のカードの名前(肩書き含む)の一部を入力して検索:
				<input type="text" v-model="query" />
				<button @click="cardSearch(question.config)">検索</button>
				<div class="cards">
					<div class="card" v-for="c of cards" :key="c.id" @click="select(c.title)" :class="c.title === answer ? 'selected' : ''">
						<img :src="`https://hidamarirhodonite.kirara.ca/icon_card/${c.id}.png`" v-show="question.config.showImage" />
						<div>{{ c.title }}{{ c.plus ? `+` : '' }}</div>
					</div>
				</div>
				<input type="hidden" v-model="answer" />
			</div>
			<div v-if="question.answerType === 'idol'">
				アイドル名の一部を入力して検索:
				<input type="text" v-model="query" />
				<button @click="idolSearch()">検索</button>
				<div class="cards">
					<div class="card" v-for="c of idols" :key="c.name" @click="select(c.name)" :class="c.name === answer ? 'selected' : ''">
						<div>{{ c.name }}</div>
					</div>
				</div>
				<input type="hidden" v-model="answer" />
			</div>
			<div v-if="question.answerType === 'song'">
				楽曲の一部を入力して検索:
				<input type="text" v-model="query" />
				<button @click="songSearch()">検索</button>
				<div class="cards">
					<div class="card" v-for="c of songs" :key="c.id" @click="select(c.name)" :class="c.name === answer ? 'selected' : ''">
						<div>{{ c.name }}</div>
					</div>
				</div>
				<input type="hidden" v-model="answer" />
			</div>
			<div class="spacer" />
			<button @click="saveAndQuestion(false)" :disabled="thisIs === 1">前の問題</button>
			<button @click="saveAndQuestion(true)" v-if="thisIs !== quiz.length">次の問題</button>
			<button @click="saveAndQuestion(true, true)" v-else>採点する</button>
		</div>
		<div class="centarize" v-else>
			<h4>以下の通り解答します</h4>
			<ol>
				<li v-for="c in correct" :key="c">
					{{ c }}
				</li>
			</ol>

			<button @click="end">採点する</button>
			<button @click="finalized = false">戻る</button>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { IQuiz, IConfig, ICard, AppCard } from '../../interfaces/question'
import Idols from '../assets/data'
export default Vue.extend({
	name: 'Quiz',
	components: {},
	props: ['quiz', 'finishFunc'],
	data() {
		return {
			question: {} as IQuiz,
			cards: [] as AppCard[],
			songs: [] as any,
			idols: [] as any,
			thisIs: 1,
			answer: '',
			query: '',
			correct: {} as any,
			finalized: false,
		}
	},
	mounted: function () {
		this.getQuestion(true, true)
	},
	methods: {
		getQuestion: function (isNext: boolean, initial: boolean) {
			let thisIs = this.thisIs
			if (isNext) thisIs = thisIs + 1
			if (!isNext) thisIs = thisIs - 1
			if (initial) thisIs = 1
			const thisIsInternal = thisIs - 1
			this.thisIs = thisIs
			this.question = this.quiz[thisIsInternal] as IQuiz
			if (this.correct[this.question.uniqueId]) {
				this.answer = this.correct[this.question.uniqueId]
				this.query = this.correct[this.question.uniqueId]
			}
		},
		end: function () {
			this.finishFunc(this.correct)
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
		saveAndQuestion: function (isNext: boolean, final?: boolean) {
			if (!this.correct[this.question.uniqueId]) {
				this.correct[this.question.uniqueId] = this.answer
			} else {
				if (this.answer !== this.correct[this.question.uniqueId]) this.correct[this.question.uniqueId] = this.answer
			}
			this.answer = ''
			this.query = ''
			this.cards = []
			this.songs = []
			this.idols = []
			if (final) this.finalized = true
			else this.getQuestion(isNext, false)
		},
		select: function (title: string) {
			this.answer = title
		},
		songSearch: function () {
			const q = this.query
			const songsR = localStorage.getItem('songs')
			if (!songsR) return false
			const songs = JSON.parse(songsR) as any[]
			const songsF = songs.filter(function (a) {
				return a.name.toLowerCase().includes(q.toLowerCase())
			})
			this.songs = songsF
		},
		idolSearch: function () {
			const q = this.query
			const idolsF = Idols.filter(function (a) {
				return a.name.includes(q) || a.kana.includes(q)
			})
			this.idols = idolsF
		},
		cardSearch: function (config: IConfig) {
			const q = this.query
			const cardsR = localStorage.getItem('cards')
			if (!cardsR) return false
			const cards = JSON.parse(cardsR) as ICard[]
			const isAll = config.filter === 'all' || config.filter === 'allSsr'
			const isCompletelyPlus = config.filter.indexOf('+') > 0
			let cardsF = [] as AppCard[]
			let i = 0
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
				if (i > 50) break
				i++
			}
			this.cards = cardsF
		},
	},
})
</script>

<style lang="scss" scoped>
.attach img {
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
.spacer {
	height: 20px;
}
.selected {
	background-color: #f5f5f5;
}
</style>
