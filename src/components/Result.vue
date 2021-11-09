<template>
	<div class="centarize">
		<div v-if="!image && notBot" id="image">ただいま画像を生成中です。30秒程度かかりますが、これが終わるまでしばらくお待ちください。<br /></div>
		<img :src="image" v-if="notBot && image" id="resultImage" />
		<div class="textAlignCenter">
			あなたの点数は、
			<h1>{{ score }}</h1>
			点です。({{ perfect }}点満点)
		</div>
		<div v-for="[i] of quiz.entries()" :key="i">
			<p>第{{ i + 1 }}問: {{ quiz[i].string }}</p>
			<div v-if="quiz[i].questionType === 'withImage'" class="textAlignCenter attach">
				<img :src="quiz[i].attached" class="attach" />
			</div>
			<div v-if="quiz[i].questionType === 'withAudio'" class="textAlignCenter attach">
				再生ボタンを押して再生
				<audio :src="quiz[i].attached" controls />
			</div>
			<p>あなたの答え: {{ answer[quiz[i].uniqueId] }}</p>
			<p>正答: {{ tsCheck(quiz[i].correctAnswer, quiz[i].correctAnswerIncline) }}</p>
			<p>{{ isCorrect(quiz[i].correctAnswer, quiz[i].uniqueId) ? '正解です' : '不正解です' }}</p>
			<p>解説</p>
			<p>{{quiz[i].comment}}</p>
			<img :src="quiz[i].commentAttached" v-if="quiz[i].commentAttached" class="attach" />
			<hr />
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { IQuiz } from '../../interfaces/question'
export default Vue.extend({
	name: 'Result',
	components: {},
	props: ['quiz', 'rawAnswer', 'title'],
	data() {
		return {
			answer: {} as any,
			score: 0,
			perfect: 0,
			share: '',
			count: 1,
			imageTank: [''] as any,
			notBot: false,
			image: '',
		}
	},
	mounted: async function () {
		if (!this.rawAnswer) {
			const encoded = getSearchObj(location.search).hash
			const decoded = decodeURIComponent(atob(decodeURIComponent(encoded)))
			this.answer = JSON.parse(decoded)
		} else {
			this.answer = this.rawAnswer
			this.notBot = true
			this.answer = this.rawAnswer
			const encoded = encodeURIComponent(btoa(encodeURIComponent(JSON.stringify(this.rawAnswer))))
			const r = location.pathname.match(/\/q\/(.+)$/)
			if (r) {
				const id = r[r.length - 1]
				fetch(`https://2uwcmuu0id.execute-api.ap-northeast-1.amazonaws.com/default/kukai-ss?id=${id}&hash=${encoded}`)
					.then((response) => response.text())
					.then((data) => {
						this.image = data
						alert('画像が準備できましたから、これを保存してシェアしてください。')
						scrollTo(0, 0)
					})
				alert('ただいま画像を生成中です。30秒程度かかりますが、これが終わるまでOKを押してしばらくお待ちください。')
			}
		}
		for (const qr of this.quiz) {
			const q = qr as IQuiz
			this.perfect = this.perfect + q.point
			this.score = this.score + ( q.point * this.isCorrect(q.correctAnswer, q.correctAnswerIncline, q.uniqueId))
		}
	},
	methods: {
		isCorrect: function (correctAnswer: string | string[], caInc: number[] | undefined, uniqueId: string) {
			if (typeof correctAnswer === 'string') {
				if (correctAnswer === this.answer[uniqueId]) return 1
				return 0
			} else {
				let i = 0
				for (const a of correctAnswer) {
					if (a === this.answer[uniqueId]) {
						if (!caInc) return 1
						if (caInc[i]) return caInc[i] / 100
					}
					i++
				}
				return 0
			}
		},
		tsCheck: function (answer: string | string[], point?: number[]) {
			if (typeof answer === 'string') {
				return answer
			} else if(point) {
				let b = ''
				let i = 0
				for(const a of answer) {
					b = b ? `${b}, ${a}(${point}%)` : `${a}(${point}%)`
					i++
				}
				return b
			} else {
				return answer.join(',')

			}
		},
		load: function (src: string) {
			return new Promise((resolve, reject) => {
				const img = new Image()
				img.onload = () => resolve(img)
				img.onerror = (e) => reject(e)
				img.src = src
			})
		},
	},
})
function getSearchObj(searchStr: string): { [key: string]: string } {
	if (!searchStr) return {}
	return searchStr
		.substr(1)
		.split('&')
		.reduce((acc, cur) => {
			acc[cur.split('=')[0]] = cur.split('=')[1]
			return acc
		}, {} as { [key: string]: string })
}
</script>

<style lang="scss" scoped>
.attach img {
	min-width: 300px;
	max-width: 100%;
}
canvas {
	min-width: 300px;
	max-width: 100%;
}
#resultImage {
	min-width: 300px;
	max-width: 100%;
}
img.attach {
	min-width: 300px;
	max-width: 100%;
}
</style>
