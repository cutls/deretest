<template>
	<div>
		<h1>deretest</h1>
		<p>デレマスクイズをするためだけに作成された謎のWebアプリケーション</p>
		<p>
			IDを入力してください<br />
			<input type="text" v-model="go" />
			<button @click="done">Go</button>
		</p>
		<p>
			<a href="https://github.com/cutls/deretest" target="_blank">GitHub</a>, Cutls P and all contributors
		</p>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
	name: 'Home',
	data() {
		return {
			go: '',
		}
	},
	methods: {
		done: function () {
			location.href = `/q/${this.go}`
		},
	},
})
</script>
