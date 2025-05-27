import { createMemoryHistory, createRouter } from "vue-router";

import Startpage from "@/components/Startpage.vue";

const routes = [
    { path: '/', component: Startpage }
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router