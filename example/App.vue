<template>
	<div class="header">
		<a @click="router.push('/')">首页</a>
		<a @click="router.push('/example')">例子</a>
	</div>
	<div class="main">
		<router-view></router-view>
	</div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style lang="scss" scoped>
$headerHeight: 30px;

.header {
	overflow: hidden;
	height: $headerHeight;

	a {
		overflow: hidden;
		margin: 0 10px;
		cursor: pointer;
		&:hover {
			text-decoration: underline;
		}
	}
}

.main {
	overflow: hidden;
	height: calc(100% - #{$headerHeight});
}
</style>
