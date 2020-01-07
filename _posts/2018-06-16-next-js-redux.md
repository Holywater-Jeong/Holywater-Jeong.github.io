---
layout:		post
title:		"Next.js에서 Redux 적용해보기"
date:		2018-06-16 09:45:00 +0900
categories:	['javascript', 'react', 'nodejs']
---

<h3>들어가기 전에 이 글에서 사용하는 기술</h3>
<ul>
	<li>Node.js(v8) & Express MVC Framework(v4)</li>
	<li>React(v16) & Next.js(v6)</li>
	<li>Redux</li>
</ul>
<p>
위와 같은 기술을 사용할 예정입니다. 다른 언어, 다른 서버 MVC Framework에서 Next.js를 사용하는 방법을 제시하지는 못합니다.
(추후에 Python Django와 React의 조합을 계획 중에 있습니다.)<br>
양해 부탁드립니다 :)
</p>
<h3>들어가며</h3>
<p>
	요즘 Next.js로 프로젝트를 진행하면서 Redux를 어떻게 적용해야 하는지 고민하고 계속 수정하며 방법을 찾아봤다.
	기존에 Next.js를 사용하지 않는 React SSR(Server Side Rendering)을 개발해봤지만 Next.js는 나름대로의 규격을 따라줘야하는 프레임워크다.
	그렇기에 이런 규격 내에서 어떻게 개발을 하면 좋을지 Next.js의 GitHub의 이슈 페이지와 Example, 국내외 블로그 등 수 많은 글들을 참고했다.
	그러면서 어떻게 개발을 해야할지 나름대로의 방식을 터득한 것 같아서 뿌듯한 상태에서 포스팅을 해보고자 한다.
	이런 과정 중에 <b>Next.js의 default 페이지</b> 격인 <b>_document.js, _error.js, _app.js</b> 중 <b>_app.js</b>를 어찌 활용하면 좋을지 조금이나마 팁을 얻을 수 있다.
	<b>다만 이 것이 정답은 아니다. 수 많은 방법 중 하나의 방법으로 참고하는 용도로 본다면 좋다.</b>
</p>
<h3>간단한 세팅.</h3>
<p>
	필자의 이전 포스트인 <a href="/2018/06/11/react-ssr-next-js">"React의 SSR Framework인 Next.js로 간단하게 프로젝트 생성하기(Node.js Express)"</a> 글을 참고한 사람이라면 거기서 시작해도 상관 없다.
	먼저 필자는 패키지매니저를 <b>yarn</b>으로 사용하기에 yarn을 주로 언급할 예정이다.
</p>
{% highlight shell %}
yarn add react-redux redux redux-thunk
{% endhighlight %}
<p>
	위와 같이 <b>react-redux, redux, redux-thunk</b>를 설치한다.
	<b>react-redux</b>는 React에서 Redux를 사용할 수 있도록 기능을 제공해준다.
	<b>redux</b>는 더 설명할 것 없이 Redux 기능 그 자체이다.
	<b>redux-thunk</b>는 Redux에서 비동기 통신을 위해 사용하는 라이브러리이다.
	Next.js 프로젝트를 처음부터 구성해야하는 사람이라면 <b>next, react, react-dom</b>도 패키지매니저로 설치해주어야 한다.
	하지만, Next.js와 Redux를 동시에 검색한 분들이라면 기본적으로 Next.js를 설치하고 프로젝트를 간단하게나마 구성한 사람으로 생각이 들기에 기본적인 구성은 마쳤다는 가정을 하고 포스팅을 하겠다.
	간단한 프로젝트 생성에 관해서는 위에서도 언급한 필자의 <a href="/2018/06/11/react-ssr-next-js">직전 포스트</a>를 참고한다면 좋을 것이다.
</p>
<h3>예제 시작. 간단한 Redux 스토어부터 만들기</h3>
<p>
	아주 간단한 Redux 예제를 만들며 시작한다.
	이번 글에서는 Redux의 구조를 자세히 다루거나 설명하지는 않을 예정이다.
</p>
{% highlight javascript %}
/* ./stores.js */
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import index from './reducers/index';
const finalCreateStore = applyMiddleware(thunk)(createStore);
export default finalCreateStore(index);
{% endhighlight %}
{% highlight javascript %}
/* reducer, ./reducers/index.js */
import { combineReducers } from 'redux';
import members from './members';
/* 여러 Reducer를 묶는다. 현재 예제는 하나이지만 추후에 여러 개 Reducer를 생성 예정이라면 아래와 같이 사용하면 된다. */
export default combineReducers({
  members
});
......
/* reducer, ./reducers/members.js */
function members(state = { id: '' }, action) {
  switch (action.type) {
    case 'checkSignInStatus': {
      return {
        ...state,
        id: action.id,
      };
    }
    default:
      return state;
  }
}
export default members;
{% endhighlight %}
{% highlight javascript %}
/* action, ./actions/members.js */
const checkSignInStatus = reqDataObj => ({
  type: 'checkSignInStatus',
  id: reqDataObj.id
});
module.exports = {
  checkSignInStatus
};
{% endhighlight %}
<p>
	위의 코드의 의미를 간단하게 설명하자면 로그인 데이터 정보를 세션으로부터 받아와서 관리하기 위한 로직이라고 보면 되겠다.
	Express Session 데이터를 가져오는 로직은 이번 포스팅에서 다루지 않을 것이다.
	아무튼 이렇게 하나의 매우 간단한 Redux 스토어를 만들었다.
	이것을 그러면 어떻게 적용시켜야 할까?
</p>
<h3>_app.js를 활용하라</h3>
<p>
	일반적으로 SSR을 구현 시, Redux를 적용시킬 때 클라이언트에서는 흔히 <b>app.js</b>라고 이름들을 짓는 <b>Webpack 번들링 엔트리 파일</b>에 적용시키는 것이 일반적이다.
	서버 단에서는 <b>Rendering</b>하는 부분에서 적용시킨다.
	그런데 Next.js 프로젝트를 시작하고 app.js와 같은 파일을 찾아볼 수 없어 당황스러울 수 있다.
	하지만 이런 기능을 구현할 수 있는 방법이 없는 게 아니라 <b>default 파일로 숨겨져 있을 뿐</b>이다.
	그 중 하나인 <b>_app.js를 활용하면 이 부분을 쉽게 해결</b>할 수 있다.
	먼저 <b>./pages 디렉토리</b>에 <b>_app.js를 생성</b>하고 아래와 같이 코드를 작성하자.
</p>
{% highlight javascript %}
import App, { Container } from 'next/app';
import React from 'react';
import { Provider } from 'react-redux';
import store from '../store';
export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <Container>
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </Container>
    );
  }
}
{% endhighlight %}
<p>
	이게 끝이다.
	default 구조를 기반으로 해서 추가해준 구문은 코드의 <b>3, 4 line과 Container 태그 안의 Provider 태그</b> 밖에 없다.
	필요에 따라 mapStateToProps 함수를 만들어서 해당 컴포넌트에서 직접 호출하며 활용하면 될 것이다.
	<b>_app.js</b>는 이렇게 사용자가 커스터마이징을 통해 전역적인 관리가 가능하다.
	기본 먼저 default 값을 호출하고 사용자가 정의한 부분 중 바뀐 부분을 변경 적용하는 것으로 알고 있다.
	<b>_document.js</b>도 글로벌한 페이지 관리에 있어서 활용을 할 수 있다.
	<b>head 태그</b>나 <b>전역적인 스타일 관리</b>에 있어서 사용하는 것이 좋은 것으로 보인다.
	하지만 <a target="_blank" href="https://zeit.co/blog/next6#app-component">공식 문서</a>를 참고했을 때 <b>data fetching과 runtime Lifycycle은 _app.js 안에서만</b> 처리가 가능하다고 하니 참고하도록 하자.
	<a target="_blank" href="https://github.com/zeit/next.js#custom-app">깃 허브</a> 또한 custom _app.js, custom _document.js에 대한 언급이 있다.
	간단히 설명하자면 <b>_document.js는 server 렌더링에서 작동</b>하고, <b>_app.js는 페이지 변경 간의 레이아웃 유지, 네비게이팅 상태에 있어서 유지</b>할 수 있다고 언급되어 있다.
	이런 특징들을 잘 숙지하여 필요한 기능에 있어서 글로벌한 처리가 필요한 부분을 _document.js와. _app.js로 잘 활용해보도록 하자.
</p>
{% highlight javascript %}
/* ./pages/index.js */
import React, { Component } from "react";
import { connect } from "react-redux";
import Nav from "../components/Nav";
class Index extends Component {
  render() {
    const { members } = this.props;
    return (
      <React.Fragment>
        <Nav />
        <h1>This is Home</h1>
        <h2>Hello {members.id !== "" ? members.id : "Guest"}!</h2>
      </React.Fragment>
    );
  }
}
function mapStateToProps(state) {
  return {
    members: state.members
  };
}
export default connect(mapStateToProps)(Index);
{% endhighlight %}
<p>
	위와 같이 ./pages 디렉토리의 페이지 파일에서 connect를 해준다면 끝.
	아래와 같은 화면을 볼 수 있다.
	여기서 member.id의 값을 dispatch로 값을 입력해주는 함수가 있다면 Guest가 아닌 원하는 id의 값을 볼 수가 있을 것이다.
	(아래 화면과 관련된 코드의 자세한 내용은 <a href="/2018/06/11/react-ssr-next-js">전 글</a>에서 확인 가능합니다.)
	<img src='/assets/img{{ page.id }}/home.png'/>
</p>
<h2>끝.</h2>
