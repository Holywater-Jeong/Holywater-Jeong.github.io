---
layout:		post
title:		"React의 SSR Framework인 Next.js로 간단하게 프로젝트 생성하기(Node.js Express)"
date:		2018-06-12 00:45:00 +0000
categories:	['javascript', 'react']
---
<p>
	앞서 <a href="/blog/react-ssr">React의 SSR(Server Side Rendering)</a>에 대해서 포스팅한 적이 있다.
	React에서 SSR은 <b>"react-dom"</b>의 server 기능을 이용해서 작성하는데 <b>Next.js</b>를 이용하면 방식이 사뭇 다르게 느껴질 수 있다.
	하지만 결국 <b>Next.js도 "react-dom"</b>을 기반으로 하여 작동한다.
	그래서 이번 포스팅에서는 Next.js를 간단히 알아보고 이를 이용하여 SSR을 구현하는 방법을 알아보고자 한다.
	<b>(이 글은 일단 무작정 따라해보며 감을 잡고 싶은 사람에게 좋을 수 있다.)</b>
</p>
<h3>What is Next.js?</h3>
<p>
	Next.js는 React 전용 SSR 프레임워크이다.
	그와 비슷한 예를 찾자면 Vue.js의 SSR을 구현하는 프레임워크 Nuxt.js가 있다.
	필자는 기존에 개인적인 프로젝트를 진행할 때 React의 "react-dom"으로 서버 사이드 렌더링 기능을 직접 구현했으나,
	솔직히 작성하는데 있어서 마냥 편하진 않은 것이 사실이다.
	Redux 코드까지 추가되면서 페이지가 많아질수록 복잡성이 증가하는 것 같다는 느낌적인 느낌이랄까.
	그런 의미에서 "react ssr tool"을 구글에 검색해서 발견 하게된 Next.js는 확실히 구성하고 관리하기 편리하다.
	HMR(Hot Module Replacement) 기능까지 따로 구현하거나 설정할 필요 없이 development 환경에서 실행만하면 된다.
	나머지 기능에 있어서는 간단한 예제를 만들면서 알아보자.
</p>
<h3>간단한 세팅.</h3>
{% highlight shell %}
yarn global add create-next-app
{% endhighlight %}
<p>
	먼저 패키지 매니저는 yarn으로 사용하겠다.
	create-react-app 처럼 Next.js를 간단하게 구성할 수 있는 라이브러리를 사용하면 기본 디렉터리 구현에 있어서 편하게 된다.
	이 툴을 사용하면 example 파일을 가져오는데도 편리하게 가져올 수 있다.
	그래서 제목에 쓴 것 같이 Node.js Express 웹서버를 기반으로 SSR을 구현하기 위해 예제를 가져오겠다.
</p>
{% highlight shell %}
yarn create next-app --example with-next-routes next-app
{% endhighlight %}
<p>
	이렇게하면 <a href="https://github.com/zeit/next.js/tree/canary/examples/with-next-routes">with-next-routes</a>의 예제를 next-app 이라는 디렉토리에 가져온다.
	이 상태에서 바로 yarn dev를 실행시킨다면 localhost 3000포트에서 간단한 Next.js 기반의 Node.js Express Server Application이 구동된다.
	특별히 이 예제는 라우팅을 Next.js의 기본 방법보다도 더 쉽게 작성할 수 있는 <b>next-routes</b>라는 라이브러리를 사용하는 예제이다.
	지금부터는 잠깐의 조정과 함께 디렉토리를 살펴보겠다.
</p>
<h3>예제 시작</h3>
<p>
	먼저 몇 가지 작업을 하려고 한다.
</p>
<ul>
	<li>root 디렉토리에 components 디렉토리 생성</li>
	<li>routes.js 하단의 예시처럼 바꾸기</li>
{% highlight javascript %}
const routes = require('next-routes')();
/*
name: Router에서 링크로 바로 직접 호출하지 않고 name을 호출하여 라우팅
pattern: url 패턴을 의미한다.
page: pages 디렉토리의 어떤 파일을 바라볼 것인지(.js, .jsx 등의 확장자는 생략)
*/
routes
.add({ name: 'index', pattern: '/', page: 'index' })
.add({ name: 'about', pattern: '/about', page: 'about' });
module.exports = routes;
{% endhighlight %}
	<li>pages/ 디렉토리 내 index.js와 about.js 제외하고 삭제 및 inex.js와 about.js 아래와 같이 수정</li>
{% highlight javascript %}
/* index.js */
export default () => (
<h1>This is Home</h1>
)
...
/* about.js */
export default () => (
<h1>About Me</h1>
)
{% endhighlight %}
</ul>
<p>
	이 상태에서 yarn dev를 실행시킨다면 localhost:3000에서 아래와 같은 페이지를 확인할 수 있을 것이다.
	<img src='/assets/img{{ page.id }}/index.png'/>
	그러나 여기서 끝난다면 about 페이지를 확인할 수 없다. 내비게이션을 만들어보자.
</p>
<p>
	앞서 만든 components 디렉토리에 공통적으로 사용할 파일을 생성하면 된다. 먼저 Nav.js를 생성하자.
</p>
{% highlight javascript %}
import { Link, Router } from '../routes';
import { Component } from 'react';
export default class Nav extends Component {
  render() {
    return (
      <ul>
        <Link route="index"><a>Home</a></Link>
        <Link route="about"><a>About</a></Link>
      </ul>
    );
  }
};
{% endhighlight %}
<p>
	그리고는 앞서 만든 index.js와 about.js에 import해서 사용한다.
</p>
{% highlight javascript %}
/* index.js, about.js도 같은 방식으로 import하자 */
import Nav from '../components/Nav';
export default () => (
  <>
    <Nav/>
    <h1>This is Home</h1>
  </>
)
{% endhighlight %}
<p>
	이러면 홈 화면에서 아래와 같이 나올 것이다.
	<img src="/assets/img/{{ page.id }}/nav-index.png"/>
	그리고 about 링크를 눌러 페이지를 확인하면
	<img src="/assets/img/{{ page.id }}/nav-about.png"/>
	이렇게 나온다. 이런 식으로 응용을 하자면 next에서 제공하는 next/head 기능을 이용하여 공통적인 head 태그 파일을 저장할 수 있겠다.
	next/head는 <a href="https://github.com/zeit/next.js/#populating-head">링크</a>를 참고하자
</p>
<h3>파라미터 처리는?</h3>
<p>
	역시 라우팅 관련해서 파라미터 관련된 내용을 안 짚고 넘어갈 수는 없다. 역시나 next-routes 기능에서 손쉽게 처리 가능하다
	일단 routes.js에서 route.add로 아래와 같이 추가하자.
</p>
{% highlight javascript %}
routes
  .add({ name: 'index', pattern: '/', page: 'index' })
  .add({ name: 'about', pattern: '/about', page: 'about' })
  .add({ name: 'user', pattern: '/user/:id', page: 'user' }) /* 추가된 라인*/
{% endhighlight %}
<p>
	그리고 pages 디렉토리에 user.js를 추가하고 코드는 아래와 같이 작성하자.
</p>
{% highlight javascript %}
import { Component } from 'react';
import Nav from '../components/Nav';
export default class extends Component {
  render() {
    const { url } = this.props;
    return (
      <>
        <Nav/>
        <h1>User: { url.query.id }</h1>
      </>
    )
  }
}
{% endhighlight %}
<p>
	마지막으로 Nav.js를 손보자.
</p>
{% highlight html %}
/* 생략 ... */
<ul>
	<li><Link route="index"><a>Home</a></Link></li>
	<li><Link route="about"><a>About</a></Link></li>
	<li><Link route="user" params={% raw %}{{id: 'hi'}}{% endraw %}><a>User Hi</a></Link></li>
	<li><Link route="user" params={% raw %}{{id: 'hello'}}{% endraw %}><a>User Hello</a></Link></li>
</ul>
/* 생략 ... */
{% endhighlight %}
<p>
	url을 호출 시 deprecated 기능이라고 언급되어 있다.
	추후 업데이트 시 주의하자.
</p>
<h3>그 밖에 알아두면 좋은 것들</h3>
<p>
	next로 빌드하게 되면 .next 디렉토리가 생성되는데 그 안에 보면 글로벌한 페이지 관리를 하는 <b>_document.js</b>,
	에러 페이지를 구현할 수 있는 <b>_error.js</b> 등이 있다.
	아무래도 이런 내용은 <a href="https://nextjs.org/docs/#setup">Next.js 공식문서</a>를 한 번 읽어보는 게 좋을 것이다.
</p>
<h2>끝.</h2>
