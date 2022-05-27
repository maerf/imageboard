/** @format */

const commentComponent = {
    data() {
        return {
            comments: [],
            newCommentText: "",
            newCommentUsername: "",
        };
    },
    props: ["imageId"],
    mounted() {
        console.log("commentComponent just mounted");
        fetch(`/comments/${this.imageId}`)
            .then(response => response.json())
            .then(rows => {
                this.comments = rows;
                console.log("Comments rows: ", rows);
            })
            .catch(console.log);
    },

    methods: {
        close() {
            console.log("modal: clicked close");
            this.$emit("close");
        },
        log() {
            console.log("comments: ", this.comments);
        },
        postComment() {
            {
                fetch(`/comment/`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        imageId: this.imageId,
                        text: this.newCommentText,
                        username: this.newCommentUsername,
                    }),
                })
                    .then(response => response.json())
                    .then(rows => {
                        this.comments.push(rows[0]);
                        console.log("Post response rows: ", rows);
                        this.newCommentText = "";
                    })
                    .catch(console.log);
            }
        },
    },
    template: `<div id="comments">
    <p class="commentContainer" v-for="comment in comments">
        <div class="commentOnBlock">  {{comment.username}} on {{new Date(comment["created_at"]).toLocaleString()}}  </div>
        {{comment.text}}  </p> <!-- {{comment.id}} //-->
    <div class="commentInputsContainer">  
        <input style="flex-grow:1;" v-model="newCommentText" type="text" name="title" placeholder="Your Comment" required />
        <input style="min-width: 100px;" width="50" v-model="newCommentUsername" type="text" name="title" placeholder="Username" required />
        <button @click="postComment">post comment</button>
    </div>
                </div>`,
};

export default commentComponent;
