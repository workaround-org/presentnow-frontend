import {createWebHashHistory, createRouter, createWebHistory} from "vue-router";

import Startpage from "@/components/Startpage.vue";
import CreateWishList from "@/components/CreateWishList.vue";

const routes = [
    { path: '/', component: Startpage },
    { path: '/create', component: CreateWishList }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router