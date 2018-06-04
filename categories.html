---
layout: default
permalink: /category
---
{% assign esc_title="{{ p.title }}" %}
{% assign esc_date="{{ p.date }}" %}
{% assign esc_ctgname="{{ hash }}" %}

<div id="post-list">
  <h2 class="title is-2">"{{ esc_ctgname }}" 카테고리에 있는 글</h2>
  <ul>
    <li v-for="p in posts" v-if="p.categories.indexOf(hash) != -1">
      <a v-bind:href="p.url">{{ esc_title }}</a> <small>{{ esc_date }}</small>
    </li>
  </ul>
</div>

<script>
var hash = decodeURI(window.location.hash.substr(1));

var postList = new Vue({
  el: '#post-list',
  data: {
    posts: []
  }
});

axios.get('/posts.json')
  .then(function (response) {
    postList.posts = response.data.posts;
  })
  .catch(function (error) {
    console.log(error);
  });
</script>