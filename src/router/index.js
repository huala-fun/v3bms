import { createRouter, createWebHistory } from 'vue-router';
import { ElNotification } from 'element-plus';
import config from "@/config"
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import tool from '@/utils/tool';
import systemRouter from './systemRouter';
import userRoutes from '@/config/route';
import { beforeEach, afterEach } from './scrollBehavior';

import views from '@/views'


console.log(views);

//系统路由
const routes = systemRouter

//系统特殊路由
const routes_404 = {
	path: "/:pathMatch(.*)*",
	hidden: true,
	component: () => import('../layout/other/404.vue'),
}


let routes_404_r = () => { }

// 路由实例
const router = createRouter({
	history: createWebHistory(),
	routes: routes
})

//设置标题
document.title = config.APP_NAME

//判断是否已加载过动态/静态路由
var isGetRouter = false;

router.beforeEach(async (to, from, next) => {
	NProgress.start()
	//动态标题
	document.title = to.meta.title ? `${to.meta.title} - ${config.APP_NAME}` : `${config.APP_NAME}`
	const token = tool.cookie.get("TOKEN");
	if (to.path === "/login") {
		//删除路由(替换当前 layout 路由)
		router.addRoute(routes[0])
		//删除路由(404)
		routes_404_r()
		isGetRouter = false;
		next();
		return false;
	}

	if (routes.findIndex(r => r.path === to.path) >= 0) {
		next();
		return false;
	}


	if (!token) {
		next({
			path: '/login'
		});
		return false;
	}

	//整页路由处理
	if (to.meta.fullpage) {
		to.matched = [to.matched[to.matched.length - 1]]
	}

	//加载动态/静态路由
	if (!isGetRouter) {
		let apiMenu = tool.data.get("MENU") || []
		let userInfo = tool.data.get("USER_INFO")
		let userMenu = treeFilter(userRoutes, node => {
			return node.meta.role ? node.meta.role.filter(item => userInfo.role.indexOf(item) > -1).length > 0 : true
		})
		let menu = [...userMenu, ...apiMenu]
		var menuRouter = menuToRouteTree(menu)
		menuRouter = flatAsyncRoutes(menuRouter)
		menuRouter.forEach(item => {
			router.addRoute("sysLayout", item)
		})
		routes_404_r = router.addRoute(routes_404)
		if (to.matched.length == 0) {
			router.push(to.fullPath);
		}
		isGetRouter = true;
	}
	beforeEach(to, from)
	next();
});

router.afterEach((to, from) => {
	afterEach(to, from)
	NProgress.done()
});

router.onError((error) => {
	NProgress.done();
	ElNotification.error({
		title: '路由错误',
		message: error.message
	});
});

//入侵追加自定义方法、对象
router.sc_getMenu = () => {
	var apiMenu = tool.data.get("MENU") || []
	let userInfo = tool.data.get("USER_INFO")
	let userMenu = treeFilter(userRoutes, node => {
		return node.meta.role ? node.meta.role.filter(item => userInfo.role.indexOf(item) > -1).length > 0 : true
	})
	var menu = [...userMenu, ...apiMenu]
	return menu
}

/**
 * 菜单转化成路由树
 * 
 * @returns 
 */
const menuToRouteTree = (menus) => {
	const routeTree = [];
	menus.forEach(({ meta = {}, path, name, redirect, children, component }) => {
		//处理外部链接特殊路由
		if (meta.type == 'iframe') {
			meta.url = path;
			path = `/i/${name}`;
		}
		const rTree = children ? menuToRouteTree(children) : null;
		const emptyComponent = () => import(`@/layout/other/empty.vue`)
		const asyncComponent = component ? views[component] : emptyComponent;
		routeTree.push({
			path,
			name,
			meta,
			redirect,
			children: rTree,
			component: asyncComponent
		})
	})
	return routeTree
}

/**
 * 路由树转化成扁平路由
 * @param {*} routes 
 * @param {*} breadcrumb 
 * @returns 
 */
const flatAsyncRoutes = (routeTree, breadcrumb = []) => {
	let res = []
	routeTree.forEach(route => {
		const tmp = { ...route }
		if (tmp.children) {
			let childrenBreadcrumb = [...breadcrumb]
			childrenBreadcrumb.push(route)
			let tmpRoute = { ...route }
			tmpRoute.meta.breadcrumb = childrenBreadcrumb
			delete tmpRoute.children
			res.push(tmpRoute)
			let childrenRoutes = flatAsyncRoutes(tmp.children, childrenBreadcrumb)
			childrenRoutes.map(item => {
				res.push(item)
			})
		} else {
			let tmpBreadcrumb = [...breadcrumb]
			tmpBreadcrumb.push(tmp)
			tmp.meta.breadcrumb = tmpBreadcrumb
			res.push(tmp)
		}
	})
	return res
}

//过滤树
const treeFilter = (tree, func) => {
	return tree.map(node => ({ ...node })).filter(node => {
		node.children = node.children && treeFilter(node.children, func)
		return func(node) || (node.children && node.children.length)
	})
}

export default router
