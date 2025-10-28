import {createRouter, createWebHistory} from "vue-router";

import Startpage from "@/components/Startpage.vue";
import CreateWishList from "@/components/CreateWishList.vue";
import AuthCallback from "@/components/AuthCallback.vue";
import ViewWishList from "@/components/ViewWishList.vue";

const routes = [
    {path: '/', component: Startpage, meta: {title: 'presentnow'}},
    {path: '/create/:wishListName', component: CreateWishList, props: true, meta: {title: 'Create Wish List - presentnow'}},
    {path: '/wishlist/:id', component: ViewWishList, props: true, meta: {title: 'View Wish List - presentnow'}},
    {path: '/callback', component: AuthCallback, meta: {title: 'Authenticating - presentnow'}}
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, _from, next) => {
    document.title = (to.meta.title as string) || 'presentnow'
    next()
})

export default router