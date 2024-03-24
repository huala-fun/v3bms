/**
 * @description 自动import导入所有 vuex 模块
 */
import { createStore } from 'vuex';
import { importAll } from '@/utils/modules'

// 使用 importAll 函数动态导入模块
const modules = await importAll(import.meta.glob('./modules/*.js',{ eager: true }))

console.log(modules);
export default createStore({
	modules
});
