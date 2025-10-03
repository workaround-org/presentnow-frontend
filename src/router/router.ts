import {createRouter, createWebHistory} from "vue-router";

import Startpage from "@/components/Startpage.vue";
import CreateWishList from "@/components/CreateWishList.vue";
import AuthCallback from "@/components/AuthCallback.vue";

const routes = [
    {path: '/', component: Startpage},
    {path: '/create/:wishListName', component: CreateWishList, props: true},
    {path: '/callback', component: AuthCallback}
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router