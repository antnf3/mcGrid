# mcGrid

Html5, javascript, css3를 이용한 webGrid이다

* 사용방법 

************************** html **************************

// css 설정
<link rel="stylesheet" type="text/css" href="mcGrid.css">

// mcGrid div설정(반드시 class명은 mcGrid-box로 한다.)
<div class="mcGrid-box" id="mcGrid1">

************************** javascript **************************
// mcGrid 헤더 필드 선언(colSiz의 합은 무조건 8이어야한다.)
var mcHeader = [
	  {id: "SUBJECT", title: "제목", colSize: 5, align: "left"}
	, {id: "TIME"	, title: "시간", colSize: 3, align: "center"}
];

// mcGrid 기본값 설정
var mcDefault = {
	  headerResize: true	// 헤더필드와 필드사이 클릭하여 사이즈 변경하기
	, headerSort: true		// 헤더클릭하여 정렬하기
	, rowNum: true			// 제일앞에 번호
	, paging: true			// 페이징처리
	, maxPageCnt: 5			// 페이징처리할때 페이징수
	, maxListCnt: 50		// 페이징처리할때 한페이지 최대 row 갯수
	, lineHeight: "25px"	// row 높이
};

// mcGrid 객체 생성
var mcGrid = new McGrid("mcGrid1");
mcGrid.setDefault(mcDefault);
mcGrid.setHeader(mcHeader);
mcGrid.addEvent('rowClick', mcGrid1_RowClick);	// row 클릭이벤트 지정
mcGrid.addEvent('pageClick', mcGrid1_PageClick);	// 페이징 클릭이벤트 지정


function mcGrid1_RowClick(rowObj, rowIdx) {
	console.log('mcGrid1_rowClick');
	console.log(rowObj, rowIdx);
}

function mcGrid1_PageClick(pageNum, start, end) {
	console.log('mcGrid1_PageClick');
	console.log(pageNum);
	
	fnSearch(start, end)
}


// 데이터는 type-1번형식 또는 type-2번형식 모두가능하다.
// 테스트 데이터 type-1
var arrList = [];
for(var i=0; i< 500; i++){
	arrList[i] = {SUBJECT: "AA", TIME:"12:30"}; 
}
// 테스트 데이터 type-2
//for(var i=0; i< 500; i++){
//	arrList[i] = ["AA", "12:30"]; 
//}


function fnSearch(start, end) {
	var cArrList = arrList.filter(function(list, i) {
		return i >= start -1 && i <= end -1;
	});
	mcGrid.setList(cArrList, arrList.length);
}
fnSearch(1, 50);