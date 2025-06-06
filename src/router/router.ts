import {createWebHashHistory, createRouter, createWebHistory} from "vue-router";

import Startpage from "@/components/Startpage.vue";
import CreateWishList from "@/components/CreateWishList.vue";

const routes = [
    { path: '/', component: Startpage },
    { path: '/create/:wishListName', component: CreateWishList, props: true }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router