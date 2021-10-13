<template>
	<div id="app" class="textAlignCenter">
		<router-view />
	</div>
</template>

<style lang="scss">
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #2c3e50;
}
.centarize {
	width: 700px;
	max-width: 100%;
	margin-left: calc(50vw - 350px);
	text-align: left;
}
@media only screen and (max-width: 700px) {
	.centarize {
		margin-left: auto;
	}
}
.textAlignCenter {
	text-align: center;
}
button {
	padding: 0.5rem;
}
input[type='text'],
select {
	height: 1.5rem;
	min-width: 5rem;
}
</style>
