/*
mcGrid.js
*/
var McGrid = (function() {

    function McGrid(id) {
        this.target = id;
		this.Events = {};
    }
    /* header resize variables */
    McGrid.prototype.startPos       = 0;
    McGrid.prototype.isMove         = false;
    McGrid.prototype.previousDiv    = '';
    McGrid.prototype.nextDiv        = '';
    McGrid.prototype.preWidth       = 0;
    McGrid.prototype.nextWidth      = 0;
    McGrid.prototype.boxWidth       = 0;
    McGrid.prototype.selectedDiv    = '';
    McGrid.prototype.arrHeadrow     = [];
    McGrid.prototype.mouseDownFlag  = false;

    McGrid.prototype.arrHeader 		= null;
	McGrid.prototype.arrList		= null;		// header sort시 사용
	McGrid.prototype.arrOriginList 	= null;		// sort 원복용
	McGrid.prototype.nTotCnt		= 0;		// header sort시 사용
	McGrid.prototype.isObj			= false;	// list가 Object 인지 Array 인지 구분
    McGrid.prototype.isPaging 		= false;	// 페이징 처리여부
    McGrid.prototype.nMaxListCnt 	= 0;		// 한화면에 보여줄 row 갯수
    McGrid.prototype.nMaxPagingCnt 	= 0;		// 페이징처리시 보여줄 숫자페이지 갯수
    McGrid.prototype.nCurrentPage 	= 1;		// 선택한 페이지번호
    McGrid.prototype.nStartListNum 	= 1;		// 조회된 페이지 row 시작번호
    McGrid.prototype.isRowNum       = false;    // 리스트 row num display 여부
    McGrid.prototype.nLineHeight    = "20px";   // 라인 높이
    McGrid.prototype.isHeaderResize = false;    // 필드 사이즈 변경
    McGrid.prototype.isHeaderSort   = false;    // 헤더 클릭 sort
    
    McGrid.prototype.setDefault = function(obj) {
        this.isPaging       = obj.paging || false;  // 페이징처리여부
        this.nMaxPagingCnt  = obj.maxPageCnt || 0;
        this.nMaxListCnt    = obj.maxListCnt || 0;
        this.isRowNum       = obj.rowNum || false;
        this.nLineHeight    = obj.lineHeight || '20px';
        this.isHeaderResize = obj.headerResize || false;
        this.isHeaderSort   = obj.headerSort || false;
    };

    McGrid.prototype.addEvent = function(event, fnCallBack) {
        this.Events[event] = fnCallBack;
    };
// 여기서부터 할것~~~~!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    McGrid.prototype.setHeader = function(arrHeader) {
        //header
        this.arrHeader = arrHeader;
        var boxHeaderDiv = document.createElement('div');
        boxHeaderDiv.className = 'mcGrid-box-header';
		var rowHeaderDiv = document.createElement('div');
        rowHeaderDiv.className = 'mcGrid-row-header' + (!this.isRowNum ? " mc-width-100" : "");
        rowHeaderDiv.style.height = this.nLineHeight;
        rowHeaderDiv.style.lineHeight = this.nLineHeight;
        // row num
        var rowNumDiv = document.createElement('div');
        rowNumDiv.className = "mcGrid-row-num mc-center" + (!this.isRowNum ? " mc-display-none" : "");
        rowNumDiv.innerHTML = "No.";
        rowNumDiv.style.height = this.nLineHeight;
        rowNumDiv.style.lineHeight = this.nLineHeight;
        boxHeaderDiv.appendChild(rowNumDiv);
        //
        for(var i = 0; i < this.arrHeader.length; i++) {
            var hidden = this.arrHeader[i].hidden || false;
            var colDiv = document.createElement('div');
            colDiv.className = "col-size-" + this.arrHeader[i].colSize + " mc-center" + (hidden ? " mc-display-none" : "");
            colDiv.innerHTML = this.arrHeader[i].title;

            if(i != (this.arrHeader.length -1)){
                var hr = document.createElement('hr');  // changing header size tag
                hr.className = "mcGrid-hr" + (hidden ? " mc-display-none":"");
                colDiv.appendChild(hr);
            }
            rowHeaderDiv.appendChild(colDiv);
        }
		boxHeaderDiv.appendChild(rowHeaderDiv);
        document.getElementById(this.target).appendChild(boxHeaderDiv); // header
        
        // header line 사이즈 변경 이벤트
        if(this.isHeaderResize){
            this.headerLineResize();
        }
        // header click 이벤트
        if(this.isHeaderSort){
            this.headerClickEvent();
        }
    };
    McGrid.prototype.setList = function(arrList, nTotCnt, isSort) {
        // body
		if(!(isSort || false)){
            //this.arrOriginList = JSON.parse(JSON.stringify(arrList));	// deep copy
            this.arrOriginList = Array.prototype.slice.call(arrList);	// deep copy
		}
		this.arrList = Array.prototype.slice.call(arrList);	// deep copy
		if(arrList.length > 0){
			this.isObj = arrList[0].constructor === Object;	// object 인지 array 인지 구분
		}
		this.nTotCnt = nTotCnt;
        this.pagingReset().listReset();
        var boxListdiv = document.createElement('div');
        boxListdiv.className = 'mcGrid-box-list';
		
        for(var j=0; j < arrList.length; j++) {
			
            var rowDiv = document.createElement('div');
            rowDiv.className = 'mcGrid-row';
			
			var rowDataDiv = document.createElement('div');
            rowDataDiv.className = 'mcGrid-row-data' + (!this.isRowNum ? " mc-width-100" : "");
            
            // row num
            var rowNumDiv = document.createElement('div');
            rowNumDiv.className = "mcGrid-row-num mc-center" + (!this.isRowNum ? " mc-display-none" : "");
            rowNumDiv.innerHTML = this.nStartListNum + j;
            rowNumDiv.style.height = this.nLineHeight;
            rowNumDiv.style.lineHeight = this.nLineHeight;
            rowDiv.appendChild(rowNumDiv);
			
            for(var k = 0; k < this.arrHeader.length; k++) {
                var hidden = this.arrHeader[k].hidden || false;
                var colDiv = document.createElement('div');
                colDiv.className = "col-size-" + this.arrHeader[k].colSize
                                + ((this.arrHeader[k].align || "") != "" ? " mc-"+this.arrHeader[k].align : "")
                                + (hidden ? " mc-display-none" : "");
                if(this.isObj){
                    colDiv.innerHTML = arrList[j][this.arrHeader[k].id];
                    colDiv.title = arrList[j][this.arrHeader[k].id]
                }else{
                    colDiv.innerHTML = arrList[j][k];
                    colDiv.title = arrList[j][k];
                }
                colDiv.style.height = this.nLineHeight;
                colDiv.style.lineHeight = this.nLineHeight;
                colDiv.style.width = this.arrHeadrow.length > 0 ? (this.arrHeadrow[k]/100) + "%" : "";

                rowDataDiv.appendChild(colDiv);
            }
            rowDiv.appendChild(rowDataDiv);
            boxListdiv.appendChild(rowDiv);
        }
        document.getElementById(this.target).appendChild(boxListdiv);	// body
		
        // 클릭이벤트 추가
        if(this.Events['rowClick']){
			
            this.clickEvent(this.Events['rowClick']);
        }
        // 페이징처리 추가
        if(this.isPaging){
            var cPage = Math.ceil(this.nCurrentPage / this.nMaxPagingCnt);	// 현재 페이징 페이지번호
            var startPage = cPage * this.nMaxPagingCnt - (this.nMaxPagingCnt -1);	// 페이징 시작번호
            this.fnPaging(nTotCnt, startPage , cPage);
        }
    };

    McGrid.prototype.clickEvent = function(fnCallBack) {
		
		var _self = this;
		var rowList = document.querySelectorAll('#' + this.target + '.mcGrid-box > .mcGrid-box-list > div');
        for(var row = 0; row < rowList.length; row++) {
            (function(k) {
                rowList[k].addEventListener('click', function(event) {

                    for(var i = 0; i < rowList.length; i++) {
                        rowList[i].classList.remove('selected');
                    }
                    event.currentTarget.classList.add('selected');

                    var rowVal = event.currentTarget.children;
                    var arrRow = {};
                    //arrRow[_self.arrHeader[0].id] = rowVal[0].innerHTML;	// row num
                    var childRowVal = rowVal[1].children;
                    for(var j = 0; j < childRowVal.length; j++) {
                        arrRow[_self.arrHeader[j].id] = childRowVal[j].innerHTML;	// data value
                    }
                    fnCallBack(arrRow, k);
                });
            })(row)
        }
    };

	McGrid.prototype.headerClickEvent = function() {
		var _self = this;
		var headerRow = document.querySelectorAll('#' + this.target + '.mcGrid-box > .mcGrid-box-header > div');
		var childHeaderRow = headerRow[1].children;
		/*
		headerRow[0].addEventListener('click', function(event) {	// num 헤더 클릭 이벤트
			var cCapture = event.currentTarget.innerHTML;
			for(var i=0; i< childHeaderRow.length; i++){
				var caption = childHeaderRow[i].innerHTML;
				childHeaderRow[i].innerHTML = caption.split(' ')[0];
			}
			event.currentTarget.innerHTML = _self.headerCaption(cCapture);
		});
		*/
		for(var i=0; i<childHeaderRow.length; i++){
			(function(j) {
                childHeaderRow[j].addEventListener('click', function(event) {	// 일반 헤더 클릭 이벤트
                    
                    if(_self.mouseDownFlag){
                        _self.mouseDownFlag = false;
                        return;
                    }
					// 다른헤더의 sort모두 지우기
					// headerRow[0].innerHTML = headerRow[0].innerHTMLsplit(' '[0]);	// num
					for(var k=0; k< childHeaderRow.length; k++){
                        if(childHeaderRow[k] !== event.currentTarget){
                            childHeaderRow[k].innerHTML = childHeaderRow[k].innerHTML.replace('↑','').replace('↓','');
                        }
                    }
					
                    var caption = event.currentTarget;
                    var hrTag = caption.children[0];
                    if(hrTag != undefined) {
                        caption.removeChild(hrTag);
                    }

                    event.currentTarget.innerHTML = _self.headerCaptionSort(caption, j);
                    if(hrTag != undefined) {
                        event.currentTarget.appendChild(hrTag);
                        // 헤더클릭시 이벤트 재설정
                        _self.headerLineResize();
                    }
				});
			})(i)
		}
    };
    
	McGrid.prototype.headerCaptionSort = function(sCaption, headColIdx) {
        var _self = this;
        console.log(this.arrHeader[headColIdx].id);
        var strId = this.arrHeader[headColIdx].id;
        console.log(this.isObj);
		var rtnVal = '';
		var strCap = sCaption.innerHTML;
		if(strCap.indexOf('↑') == -1 && strCap.indexOf('↓') == -1 ){
			rtnVal = strCap + '↑';
            this.arrList.sort(function(x,y) {	// 오름차순
                var rst;
                if(_self.isObj){
                    rst = x[strId] < y[strId] ? -1 : x[strId] > y[strId] ? 1 : 0;
                }else{
                    rst = x < y ? -1 : x > y ? 1 : 0;
                }
				return rst;
			});
			this.setList(this.arrList, this.nTotCnt, true);
		}else{
			if(strCap.indexOf('↑') != -1){
				rtnVal = strCap.replace('↑','') + '↓';
                this.arrList.sort(function(x, y) {	// 내림차순
                    var rst;
                    if(_self.isObj) {
                        rst = x[strId] > y[strId] ? -1 : x[strId] < y[strId] ?  1: 0;
                    }else{
                        rst = x > y ? -1 : x< y ? 1 : 0;
                    }
					return rst;
				});
				this.setList(this.arrList, this.nTotCnt, true);
			}else if(strCap.indexOf('↓') != -1){
				rtnVal = strCap.replace('↓','');
				this.setList(this.arrOriginList, this.nTotCnt, true);
			}
		}
		return rtnVal;
	};
    McGrid.prototype.fnPaging = function(number, startPage, currentPage) {
        // 페이징처리
        this.pagingReset();
        var pDiv = document.createElement('div');
        pDiv.className = 'pagination';
        var pagingCnt = Math.ceil(number / this.nMaxListCnt);    // 총페이지수
		// 화면에 보여줄 총페이지수
        var maxPagingCnt = pagingCnt - (this.nMaxPagingCnt * currentPage) >=0 ? this.nMaxPagingCnt : pagingCnt % this.nMaxPagingCnt;
        var firstA = document.createElement('a');
        firstA.innerHTML = '&laquo';    // 앞으로
        pDiv.appendChild(firstA);

        for(var l=0; l < maxPagingCnt; l++) {
            var a = document.createElement('a');
            a.innerHTML = (l + startPage);
            if(this.nCurrentPage == (l + startPage)) {
                a.style.background = 'gray';
            }
            pDiv.appendChild(a);
        }
        var lastA = document.createElement('a');
        lastA.innerHTML = '&raquo'; // 뒤로
        pDiv.appendChild(lastA);
        document.getElementById(this.target).appendChild(pDiv);	// paging
		// 페이징 클릭이벤트
        this.pagingClickEvent(number, pagingCnt);
    };

    McGrid.prototype.pagingClickEvent = function(number, pagingCnt) {
        // 클릭event 등록
        var _self = this;
        var aList = document.querySelectorAll('#'+this.target +'.mcGrid-box > .pagination a');
        var currentPageCnt = Math.ceil(Number(aList[aList.length-2].innerHTML) / this.nMaxPagingCnt);// 현재페이지
        var totPage = Math.ceil(pagingCnt / this.nMaxPagingCnt); // 총페이지수
		
        for(var i=0; i<aList.length; i++) {
            document.querySelectorAll('#'+this.target +'.mcGrid-box > .pagination a')[i].addEventListener('click', function(event) {
                if(event.target.innerHTML == '«'){ // 앞으로
                    if(currentPageCnt > 1){
                        _self.nCurrentPage = ((currentPageCnt -1) * _self.nMaxPagingCnt - (_self.nMaxPagingCnt -1));
                        _self.nStartListNum = (_self.nCurrentPage * _self.nMaxListCnt) - (_self.nMaxListCnt -1);
                        var endNum = _self.nCurrentPage * _self.nMaxListCnt;
                        _self.Events['pageClick'](_self.nCurrentPage, _self.nStartListNum, endNum);
                    }
                }else if(event.target.innerHTML == '»'){   // 뒤로
                    if(currentPageCnt < totPage) {
                        _self.nCurrentPage = currentPageCnt * _self.nMaxPagingCnt +1;
                        _self.nStartListNum = (_self.nCurrentPage * _self.nMaxListCnt) - (_self.nMaxListCnt -1);
                        var endNum = _self.nCurrentPage * _self.nMaxListCnt;
                        _self.Events['pageClick'](_self.nCurrentPage, _self.nStartListNum, endNum);
                    }
                }else{
                    if(_self.Events['pageClick']){
                        _self.nCurrentPage = event.target.innerHTML; // 현재 선택한 페이지
                        _self.nStartListNum = (_self.nCurrentPage * _self.nMaxListCnt) - (_self.nMaxListCnt -1);
                        var endNum = _self.nCurrentPage * _self.nMaxListCnt;
                        _self.Events['pageClick'](_self.nCurrentPage, _self.nStartListNum, endNum);
                    }
                }
            });
        }
    };
    McGrid.prototype.listReset = function() {
        if(document.getElementById(this.target)){
            var childList = document.getElementById(this.target).children;
            if(childList[1]) {  // 리스트 제거
                document.getElementById(this.target).removeChild(childList[1]);
            }
        }
    };
    McGrid.prototype.pagingReset = function() {
        if(document.getElementById(this.target)){
            var childList = document.getElementById(this.target).children;
            if(childList[2]){   // 페이징 제거
                document.getElementById(this.target).removeChild(childList[2]);
            }
        }
        return this;
    };

    McGrid.prototype.headerLineResize = function() {
        var _self = this;
        var hr = document.querySelectorAll('#' + this.target + '.mcGrid-box > .mcGrid-box-header > .mcGrid-row-header .mcGrid-hr');
        for(var i=0; i<hr.length; i++) {
            hr[i].addEventListener('mousedown'  , function(e) {_self.fnHeaderLineMouseDown(e, _self);});
            hr[i].addEventListener('mouseup'    , function(e) {_self.fnheaderLineMouseUp(e, _self);});
            hr[i].addEventListener('mousemove'  , function(e) {_self.fnHeaderLineMouseMove(e, _self);});
        }
        var rowCol = document.querySelectorAll('#' + this.target + '.mcGrid-box > .mcGrid-box-header > .mcGrid-row-header > div');

        for(var j=0; j<rowCol.length; j++){
            rowCol[j].addEventListener('mousemove', function(e){_self.fnHeaderLineMouseMove(e ,_self);});
        }
        document.addEventListener('mouseup' , function(e) {_self.fnheaderLineMouseUp(e, _self);});
    };

    McGrid.prototype.fnHeaderLineMouseDown = function(e, _self) {
        e.stopImmediatePropagation();
        _self.mouseDownFlag = true;
        console.log('_self.isMove', _self.isMove);
        if(!document.all){
            _self.startPos = e.screenX;
        }else{
            _self.startPos = e.clientX;
        }
        _self.isMove = true;

        var headerDiv       = document.querySelectorAll('#' + _self.target + '.mcGrid-box > .mcGrid-box-header > .mcGrid-row-header > div');
        _self.boxWidth      = document.querySelector('#' + _self.target + '.mcGrid-box > .mcGrid-box-header > .mcGrid-row-header').offsetWidth;
        _self.previousDiv   = e.currentTarget.parentElement;
        _self.nextDiv       = _self.previousDiv.nextElementSibling;
        _self.preWidth      = _self.previousDiv.offsetWidth;
        _self.nextWidth     = _self.nextDiv.offsetWidth;

        _self.arrHeadrow = [];
        for(var i=0; i<headerDiv.length; i++) {
            if(headerDiv[i] === _self.previousDiv){
                _self.selectedDiv = i;
                // break;
            }
            _self.arrHeadrow[i] = Math.floor(headerDiv[i].offsetWidth / _self.boxWidth * 10000);
        }
        var all = _self.arrHeadrow.reduce(function(x, y) {
            return x+y;
        });
        _self.arrHeadrow[_self.selectedDiv] = _self.arrHeadrow[_self.selectedDiv] + (10000 -all);

        for(var j=0; j<headerDiv.length; j++) {
            headerDiv[j].style.width = _self.arrHeadrow[j] / 100 + "%";
        }
    };

    McGrid.prototype.fnheaderLineMouseUp = function(e, _self) {
        e.stopImmediatePropagation();
        if(!_self.mouseDownFlag){return;}
        console.log('fnheaderLineMouseUp');
        _self.isMove = false;
    };

    McGrid.prototype.fnHeaderLineMouseMove = function(e, _self) {
        e.stopImmediatePropagation();

        var _preWidth;
        var _nextWidth;
        if(_self.isMove){
            var endPos = 0;
            if(!document.all){
                endPos = e.screenX;
            }else{
                endPos = e.clientX;
            }

            var diffPos = _self.startPos - endPos;
            _preWidth = _self.preWidth - diffPos;
            _nextWidth = _self.nextWidth + diffPos;
            if(_preWidth >= 1 && _nextWidth >= 1){
                var selLen = _self.arrHeadrow[_self.selectedDiv] + _self.arrHeadrow[_self.selectedDiv + 1];
                var Prewidth = Math.floor((_preWidth / _self.boxWidth) * 10000);
                var lastWidth = Math.floor((_nextWidth / _self.boxWidth) * 10000);
                Prewidth = (Prewidth + (selLen -(Prewidth + lastWidth))) / 100;
                lastWidth = lastWidth / 100;

                _self.arrHeadrow[_self.selectedDiv] = Prewidth * 100;
                _self.arrHeadrow[_self.selectedDiv + 1] = lastWidth * 100;

                _self.previousDiv.style.width = Prewidth + "%";
                _self.nextDiv.style.width = lastWidth + "%";

                var rowDiv = document.querySelectorAll('#' + _self.target + '.mcGrid-box > .mcGrid-box-list > .mcGrid-row > .mcGrid-row-data');
                for(var i=0; i<rowDiv.length; i++) {
                    for(var k=0; k<_self.arrHeadrow.length; k++) {
                        rowDiv[i].children[k].style.width = _self.arrHeadrow[k] / 100 + "%";
                    }
                }
            }
        }
    };
    return McGrid;
})();