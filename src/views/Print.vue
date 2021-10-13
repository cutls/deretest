<template>
	<div class="home" v-if="found">
		<h2>{{ title }}</h2>
		<p>{{ description }}</p>
		<Result :quiz="quiz" :rawAnswer="null" :title="title" />
	</div>
	<p v-else>質問は見つかりませんでした</p>
</template>

<script lang="ts">
import Vue from 'vue'
import Result from '../components/Result.vue'
import { IQuestion, ENV } from '../../interfaces/question'
import { getEndpoint } from '../util'
export default Vue.extend({
	name: 'Print',
	components: { Result },
	data() {
		return {
			found: false,
			title: '',
			description: '',
			loading: true,
			quiz: {},
		}
	},
	mounted: async function () {
		try {
			this.loading = true
			const r = location.pathname.match(/\/p\/(.+)$/)
			if (r) {
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
				this.found = true
			} else {
				throw 'Error'
			}
		} catch {
			this.found = false
		}
	},
})
</script>
