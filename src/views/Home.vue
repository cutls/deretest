<template>
	<div class="home" v-if="initiate">
		<h2>{{ title }}</h2>
		<p>{{ description }}</p>
		<div v-if="started">
			<Quiz :quiz="quiz" :finishFunc="finishFunc" v-if="!finished" />
			<Result :quiz="quiz" :rawAnswer="answer" :title="title" v-else />

			<button @click="refresh()">終了</button>
		</div>
		<div v-else>
			<p v-if="loading">クイズに必要なデータを読み込んでいます。</p>
			<button @click="start" :disabled="loading">スタート</button>
			<h3>注意事項</h3>
			<div class="centarize">
				<ol>
					<li>問題は全部で{{ quiz.length }}題です。</li>
					<li>試験時間は定めていません。</li>
					<li>
						「端末の使用を許可」と書いてある問題は、情報端末を用いることができます。<b>開くことができるのは「デレステ」アプリだけです。</b>
						Google検索やブラウザやその他アプリを使用することはできません。「端末の使用を許可」と表示されていない問題は端末を用いてはいけません。
					</li>
					<li>コンソールやスクリプトなどで答えを見る行為は不正行為とみなします。</li>
					<li>
						キャラクター、カードデータは多くの関連アプリケーションで使用されているstarlight.kirara.ca"Starlight
						Database"の情報を、楽曲データはfujiwarahaji.me"デレマス・ミリマス・シャニマス楽曲DB ふじわらはじめ"の情報をもとにしているため、データの内容等は保証できません。
					</li>
				</ol>
			</div>
		</div>
	</div>
	<div v-else>
		<p v-if="notfound">問題は見つかりませんでした。</p>
		<p v-else>問題データを読み込んでいます。</p>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Quiz from '../components/Quiz.vue'
import Result from '../components/Result.vue'
import { IQuestion, IFujiwarahajime, IKirara, ENV } from '../../interfaces/question'
import { getEndpoint } from '../util'

export default Vue.extend({
	name: 'Home',
	components: { Quiz, Result },
	data() {
		return {
			notfound: false,
			initiate: false,
			title: '',
			description: '',
			started: false,
			loading: true,
			finished: false,
			quiz: {},
			answer: {},
		}
	},
	mounted: async function () {
		try {
			this.loading = true
			const r = location.pathname.match(/\/q\/(.+)$/)
			if (!r) throw 'Error'
			const q = r[r.length - 1]
			const envRaw = await fetch('/env.json')
			const env = (await envRaw.json()) as ENV
			localStorage.setItem('env', JSON.stringify(env))
			console.log(getEndpoint('get', { id: q }))
			const data = await fetch(getEndpoint('get', { id: q }))
			const json = (await data.json()) as IQuestion
			this.title = json.title
			this.description = json.description
			this.quiz = json.questions
			document.title = json.title
			this.loading = false
			this.notfound = false
			this.initiate = true
		} catch {
			this.notfound = true
		}
	},
	methods: {
		start: async function () {
			try {
				this.loading = true
				const songsRaw = await fetch('https://api.fujiwarahaji.me/v1/list?type=music&music_type=cg')
				const songs = (await songsRaw.json()) as IFujiwarahajime[]
				localStorage.setItem('songs', JSON.stringify(songs))
				const cardRaw = await fetch('https://starlight.kirara.ca/api/v1/list/card_t?keys=title,name_only,rarity_dep,id,evolution_id')
				const cards = (await cardRaw.json()) as IKirara
				localStorage.setItem('cards', JSON.stringify(cards.result))
				this.loading = false
				this.started = true
			} catch {
				alert('データの読み込みに失敗しました。')
				this.notfound = true
				this.initiate = false
			}
		},
		finishFunc: function (answers: any) {
			this.answer = answers
			this.finished = true
		},
		refresh: function (answers: any) {
			if (!confirm('今まで解答した全ての答えを破棄してテストを終了します')) return false
			location.reload()
		},
	},
})
</script>
