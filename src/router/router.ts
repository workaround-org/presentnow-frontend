import {createRouter, createWebHistory} from "vue-router";

import Startpage from "@/components/Startpage.vue";
import CreateWishList from "@/components/CreateWishList.vue";
import AuthCallback from "@/components/AuthCallback.vue";
import ViewWishList from "@/components/ViewWishList.vue";

const routes = [
    {path: '/', component: Startpage},
    {path: '/create/:wishListName', component: CreateWishList, props: true},
    {path: '/wishlist/:id', component: ViewWishList, props: true},
    {path: '/callback', component: AuthCallback}
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router