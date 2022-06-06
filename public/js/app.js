/** @format */

import * as Vue from "./vue.js";
import modalComponent from "./modalComponent.js";

console.log(modalComponent);

Vue.createApp({
    components: {
        "first-component": modalComponent,
    },
    data() {
        return {
            filterFieldContent: "",
            activeFilterString: "",
            images: [],
            username: "",
            title: "",
            description: "",
            file: null,

            foods: [
                {
                    id: 1,
                    emoji: "🍄",
                },
                {
                    id: 2,
                    emoji: "🥦",
                },
                {
                    id: 3,
                    emoji: "🧆",
                },
            ],
            selectedFood: null,
            selectedImageId: null,
            moreAvailable: true,
        };
    },

    mounted() {
        window.addEventListener("popstate", () => {
            console.log("the user just used the forward or backward button!");
            console.log("url updated to:", location.pathname.slice(1));
            this.selectedImageId = location.pathname.slice(1) ? location.pathname.slice(1) : null;
        });

        console.log("app mounted");
        this.loadImages();
    },
    methods: {
        loadImages: function () {
            const url = new URL("/images", document.location);
            this.addUrlQueries(url);

            console.log("url in loadImages: ", url);
            fetch(url)
                .then(response => response.json())
                .then(rows => {
                    this.images = rows;
                    console.log("loadImages rows: ", rows);
                    console.log("loading images lowest id IN LIST:", this.lowestListId());
                    this.moreAvailable = !rows.length || this.lowestListId() == rows[0].lowestId ? false : true;

                    console.log("Rows: ", rows);
                })
                .catch(console.log);

            this.selectedImageId = location.pathname.slice(1) ? location.pathname.slice(1) : null;
        },
        doFilter: function (query) {
            console.log("pressed enter ", query);
            this.activeFilterString = query;
            this.loadImages();
        },
        addUrlQueries: function (url) {
            url.searchParams.append("filter", this.activeFilterString);
        },
        setImageId: function (id) {
            history.pushState({}, "", `/${id}`);
            console.log("Set image in parent: ", id);
            this.selectedImageId = id;
        },
        lowestListId: function () {
            return this.images.length > 0 ? this.images.slice(-1)[0].id : null;
        },

        closeModal() {
            console.log("main: closeModal was called, setting null");
            history.pushState({}, "", "/");

            this.selectedImageId = null;
        },
        getMore() {
            console.log("last id: ", this.lowestListId());
            let lastId = this.lowestListId();

            const url = new URL(`/images/${lastId}`, document.location);
            this.addUrlQueries(url);
            console.log("get more url ", url);

            fetch(url)
                .then(response => response.json())
                .then(rows => {
                    console.log("New rows: ", rows);
                    this.images.push(...rows);
                    lastId = this.lowestListId();
                    console.log("last id in view after integr:", lastId);
                    if (lastId == rows[0].lowestId) this.moreAvailable = false;
                })
                .catch(console.log);
            this.selectedImageId = null;
        },

        clickHandler: function () {
            const fd = new FormData();
            fd.append("username", this.username);
            fd.append("title", this.title);
            fd.append("description", this.description);
            fd.append("file", this.file);

            fetch("/upload", {
                method: "POST",
                body: fd,
            })
                .then(res => res.json())
                .then(response => {
                    console.log("response: ", response);
                    this.images.unshift(response[0]);
                })
                .catch(err => {
                    console.log("error submitting form fields: ", err);
                });
        },
        fileSelectHandler: function (e) {
            this.file = e.target.files[0];
        },
    },
}).mount("#main");
