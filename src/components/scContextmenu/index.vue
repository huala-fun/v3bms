<template>
	<transition name="el-zoom-in-top">
		<div v-if="visible" ref="contextmenu" class="sc-contextmenu" :style="{left:left+'px',top:top+'px'}" @contextmenu.prevent="fun">
			<ul class="sc-contextmenu__menu">
				<slot></slot>
			</ul>
		</div>
	</transition>
</template>

<script>
	export default {
		provide() {
			return {
				menuClick: this.menuClick
			}
		},
		data() {
			return {
				visible: false,
				top: 0,
				left: 0
			}
		},
		watch: {
			visible(value) {
				if (value) {
					document.body.addEventListener('click', this.cm, true)
				}else{
					document.body.removeEventListener('click', this.cm, true)
				}
			}
		},
		mounted() {

		},
		methods: {
			cm(e){
				let sp = this.$refs.contextmenu
				if(sp&&!sp.contains(e.target)){
					this.closeMenu()
				}
			},
			menuClick(command){
				this.closeMenu()
				this.$emit('command', command)
			},
			openMenu(e) {
				e.preventDefault()
				this.visible = true
				this.left = e.clientX + 1
				this.top = e.clientY + 1

				this.$nextTick(() => {
					var ex = e.clientX + 1
					var ey = e.clientY + 1
					var innerWidth = window.innerWidth
					var innerHeight = window.innerHeight
					var menuHeight = this.$refs.contextmenu.offsetHeight
					var menuWidth = this.$refs.contextmenu.offsetWidth
					//位置修正公示
					//left = (当前点击X + 菜单宽度 > 可视区域宽度 ? 可视区域宽度 - 菜单宽度 : 当前点击X)
					//top = (当前点击Y + 菜单高度 > 可视区域高度 ? 当前点击Y - 菜单高度 : 当前点击Y)
					this.left = ex + menuWidth > innerWidth ? innerWidth - menuWidth : ex
					this.top = ey + menuHeight > innerHeight ? ey - menuHeight : ey
				})
				this.$emit('visibleChange', true)
			},
			closeMenu() {
				this.visible = false;
				this.$emit('visibleChange', false)
			},
			fun(){
				return false;
			}
		}
	}
</script>

<style>
	.sc-contextmenu {position: fixed;z-index: 3000;font-size: 12px;}
	.sc-contextmenu__menu {display: inline-block;min-width: 120px;border: 1px solid #e4e7ed;background: #fff;box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);z-index: 3000;list-style-type: none;padding: 10px 0;}
	.sc-contextmenu__menu > hr {margin:5px 0;border: none;height: 1px;font-size: 0px;background-color: #ebeef5;}
	.sc-contextmenu__menu > li {margin:0;cursor: pointer;line-height: 30px;padding: 0 17px 0 10px;color: #606266;display: flex;justify-content: space-between;white-space: nowrap;text-decoration: none;position: relative;}
	.sc-contextmenu__menu > li:hover {background-color: #ecf5ff;color: #66b1ff;}
	.sc-contextmenu__menu > li.disabled {cursor: not-allowed;color: #bbb;background: transparent;}
	.sc-contextmenu__icon {display: inline-block;width: 14px;font-size: 14px;margin-right: 10px;}
	.sc-contextmenu__suffix {margin-left: 40px;color: #999;}
	.sc-contextmenu__menu li ul {position: absolute;top:0px;left:100%;display: none;margin: -11px 0;}
</style>
