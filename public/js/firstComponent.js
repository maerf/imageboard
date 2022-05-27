/** @format */
import commentComponent from "./commentComponent.js";

const firstComponent = {
    watch: {
        // Note: only simple paths. Expressions are not supported.
        imageId(id) {
            this.loadImage();
        },
    },
    components: {
        "comment-component": commentComponent,
    },
    data() {
        return {
            image: {},
        };
    },
    props: ["imageId"],
    mounted() {
        this.loadImage();
        console.log("firstComponent just mounted - imageid:", this.imageId);
    },

    methods: {
        loadImage() {
            console.log("loadImage called, this.imageId is:", this.imageId);
            fetch(`/image/${this.imageId}`)
                .then(response => response.json())
                .then(row => {
                    this.image = row;
                    if (!row || !row.id) {
                        history.replaceState({}, "", "/");
                        this.close();
                    }
                    console.log("Result row: ", row);
                })
                .catch(error => {
                    console.log("error in modal->mounted fetch: ", error);
                    history.replaceState({}, "", "/");
                    this.close();
                });
        },
        close() {
            console.log("modal: clicked close");
            this.$emit("close");
        },
        log() {
            console.log("image: ", this.image);
        },
        firstChar(str) {
            console.log("firstChar: ", str);
            return str ? str[0] : "";
        },
    },
    template: `<div id="modal" @keyup.arrow-keys="log">
    <div @click="close" id="xButton">X</div>
                    <h1 style="align-self:center">{{image.title}}</h1>
                    <img class="modalImage" :src="image.url"/>
                    <h4 v-if="image.description" style="align-self: center">Description: {{image.description}}</h4>
                    
               <div v-if="image.idNext" class="nextimage" @click='$emit("changeover", image.idNext)' >Before</div>
                        {{image[url]}}
                        <div v-if="image.idBefore" class="nextimage" @click='$emit("changeover", image.idBefore)'>Next</div>
                   <!-- <h4 >By <em>{{firstChar(image.username)}}</em> on {{new Date(image["created_at"]).toLocaleString()}}</h4> //-->
             <h4 style="align-self: flex-end">By <em>{{image.username}}</em> on {{new Date(image["created_at"]).toLocaleString()}}</h4> 
                    <comment-component :image-id="imageId" />
                    <!-- <br> //-->
                           <!-- <button @click="close">close me</button> //-->
                           <!-- <button @click="log">Log</button> //-->
                </div>`,
};

export default firstComponent;
