---
layout:		post
title:		"Node.js에서 mysql을 async/await으로 작성하기"
date:		2018-06-08 19:45:00 +0900
categories:	['javascript', 'nodejs', 'ecmascript']
---

<p>
	Node.js로 코드를 작성하다보면 분명히 한 번 이상은 겪게 되는 비동기 코드 문제. 일명 Callback Hell이라고 불리우는 코드 구조를 본다면 진짜 지옥의 구렁텅이로 빠져드는 것만 같다. 다행히도 여러가지의 비동기 코드를 작성하는 방법이 제시되고는 한다. 몇 가지 예를 들자면 async 라이브러리, ES2015의 기능 Promise, ES2017의 기능 async/await, RxJS 등이 있다. 필자는 주로 Promise를 사용했는데 얼마전 사용해본 ES2017의 async/await가 가장 편한 것 같다. 기존까지는 Mysql DB Connection에 있어서 Promise로 작성하던 것을 async/await로 싹 바꿨는데 async/await를 활용하는 방법에 대해 잠깐 소개하고자 한다. (자신의 Node.js 버젼이 async/await이 사용 가능한 버젼인지 찾아보고 참고하길 바란다. <a target="_blank" href='https://node.green/'>node 버젼 별 기능 확인</a>)
</p>
<h3>설치</h3>
<p>
	먼저 <b>mysql2</b>라는 모듈이 필요하다. Promise를 적용할 수 있는 mysql 라이브러리이다. npm이나 yarn으로 설치를 하면 된다.
</p>
{% highlight shell %}
npm i --save mysql2  or  yarn add mysql2
{% endhighlight %}
<h3>Step 1. DB Pool 생성</h3>
<p>
	설치를 마쳤다면 바로 예제로 넘어가자. 먼저 <b>"mysql2/promise"</b>를 require한다. mysql2만 호출하면 기존과 다를바가 없이 Promise 기능을 사용할 수가 없다.
</p>
{% highlight javascript %}
const mysql = require('mysql2/promise');
/* Step 1, create DB Pool */
const pool = mysql.createPool({
 	host: 'DB_HOST',
 	user: 'DB_USER',
 	password: 'DB_PW',
 	database: 'DBNAME'
});
{% endhighlight %}
<p>
	DB Pool 방식으로 소개하려고 한다. 일단 기본적으로 기존 <b>mysql</b>에서 방법과 유사하다. createPool 함수로 Pool을 생성한다.
</p>
<h3>Step 2. Pool에서 Connection 가져오기</h3>
<p>
	백문이 불여일견 주석 Step 2 이후로 추가된 코드를 먼저 살펴보자.
</p>
{% highlight javascript %}
const mysql = require('mysql2/promise');
/* Step 1, create DB Pool */
const pool = mysql.createPool({
 	host: 'DB_HOST',
 	user: 'DB_USER',
 	password: 'DB_PW',
 	database: 'DBNAME'
});
/* Step 2. get connection */
const dbTest = async () => {
	const connection = await pool.getConnection(async conn => conn);
};
{% endhighlight %}
<p>
	먼저 dbTest 함수에 async가 추가된 것이 보일 것이다. <b>async</b> 함수로 선언되어야 원하는 순서대로 흘러가는 함수를 만들 수 있다. 함수 안에서 <b>pool.getConnection</b> 함수는 connection을 가져오는 함수이다. <b>"mysql2/promise"</b> github에서 코드를 참고해보면 <b>getConnection</b> 함수에는 필수적으로 콜백 함수를 실행시켜 connection을 반환한다. 그래서 그 콜백 함수를 이용해야 한다. <b>getConnection</b> 함수 앞에 await만 선언해서 끝나는 것이 아니고, 그 안의 callback 함수도 async 처리를 해야하는 것이 관건이다. 이렇게 async 함수 내에서 또 async한 작업이 필요하면 꼭 안에 있는 함수에도 선언해야하는 것을 기억하고 넘어가자.
</p>
<h3>Step 3. 쿼리</h3>
{% highlight javascript %}
const mysql = require('mysql2/promise');
/* Step 1, create DB Pool */
const pool = mysql.createPool({
	host: 'DB_HOST',
	user: 'DB_USER',
	password: 'DB_PW',
	database: 'DBNAME'
});
/* Step 2. get connection */
const dbTest = async () => {
	try {
		const connection = await pool.getConnection(async conn => conn);
		try {
			/* Step 3. */
			const ID = 'HELLO';
			const PW = 'WORLD';
			const [rows] = await connection.query('INSERT INTO MEMBERS_INFO(ID, PW) VALUES(?, ?)', [ID, PW]);
			connection.release();
			return rows;
		} catch(err) {
			console.log('Query Error');
			connection.release();
			return false;
		}
	} catch(err) {
		console.log('DB Error');
		return false;
	}
};
{% endhighlight %}
<p>
	<b>connection.query</b> 함수로 쿼리를 실행시키고 결과를 반환 받는데 위와 같이 작성한다. (역시나 await를 써서 해당 결과가 반환 될 때 까지 기다린다.) 배열로 반환 받는 이유는 <b>mysql2/promise</b> 라이브러리에서 쿼리 결과를 반환 받을 때 저렇게 반환 받게 되어있기 때문에 저렇게 작성한다. [rows, fields] 로 선언 시 fields에 대한 정보도 같이 반환 받을 수 있다. error catch의 경우는 try, catch 로 감싸서 처리해준다면 더욱 좋은 코드가 될 것이다. 그리고 connection을 다 활용했을 경우 <b>connection.release</b> 함수를 호출하여 커넥션을 반환한다.
</p>
<h3>etc. Transaction</h3>
{% highlight javascript %}
const mysql = require('mysql2/promise');
/* Step 1, create DB Pool */
const pool = mysql.createPool({
	host: 'DB_HOST',
	user: 'DB_USER',
	password: 'DB_PW',
	database: 'DBNAME'
});
/* Step 2. get connection */
const dbTest = async () => {
	try {
		const connection = await pool.getConnection(async conn => conn);
		try {
			/* Step 3. */
			const ID = 'HELLO';
			const PW = 'WORLD';
			await connection.beginTransaction(); // START TRANSACTION
			const [rows] = await connection.query('INSERT INTO MEMBERS_INFO(ID, PW) VALUES(?, ?)', [ID, PW]);
			await connection.commit(); // COMMIT
			connection.release();
			return rows;
		} catch(err) {
			await connection.rollback(); // ROLLBACK
			connection.release();
			console.log('Query Error');
			return false;
		}
	} catch(err) {
		console.log('DB Error');
		return false;
	}
};
{% endhighlight %}
<p>
	트랜잭션을 사용할 경우 기존 mysql 라이브러리와 동일하다. <b>beginTransaction</b> 함수를 호출해주고, 성공시 <b>commit</b>을 실패 시 <b>rollback</b>을 사용하면 된다.
</p>
<h2>끝.</h2>
