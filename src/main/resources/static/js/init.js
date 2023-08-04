/*********************************************************
 * 엔진 파일을 로드합니다.
 * 파일은 asm.js파일, html.mem파일, js 파일 순으로 로드합니다.
 *********************************************************/
;(function(){
   // 1. XDWorldEM.asm.js 파일 로드
   var file = "./js/XDWorldEM.asm.js";
	
   var xhr = new XMLHttpRequest();
   xhr.open('GET', file, true);
   xhr.onload = function() {
	
      var script = document.createElement('script');
      script.innerHTML = xhr.responseText;
      document.body.appendChild(script);
		
      // 2. XDWorldEM.html.mem 파일 로드
      setTimeout(function() {
         (function() {
            var memoryInitializer = "./js/XDWorldEM.html.mem";
            var xhr = Module['memoryInitializerRequest'] = new XMLHttpRequest();
            xhr.open('GET', memoryInitializer, true);
               xhr.responseType = 'arraybuffer';
               xhr.onload =  function(){
						
                  // 3. XDWorldEM.js 파일 로드
                  var url = "./js/XDWorldEM.js";
                  var xhr = new XMLHttpRequest();
                  xhr.open('GET',url , true);
                  xhr.onload = function(){
                     var script = document.createElement('script');
                     script.innerHTML = xhr.responseText;
                     document.body.appendChild(script);
                  };
                  xhr.send(null);
               }
               xhr.send(null);
            })();
         }, 1);
      };
      xhr.send(null);
   }
)();


/*********************************************************
 *	엔진파일 로드 후 Module 객체가 생성되며,
 *  Module 객체를 통해 API 클래스에 접근 할 수 있습니다.
 *	 - Module.postRun : 엔진파일 로드 후 실행할 함수를 연결합니다.
 *	 - Module.canvas : 지도를 표시할 canvas 엘리먼트를 연결합니다.
 *********************************************************/

var Module = {
   TOTAL_MEMORY: 256*1024*1024,
   postRun: [init],//canvas 만들어진 후 init 실행됨.
   canvas: (function() {
		
		// Canvas 엘리먼트 생성
		var canvas = document.createElement('canvas');
		
		// Canvas id, Width, height 설정
		canvas.id = "canvas";
		canvas.width="calc(100%)";
		canvas.height="100%";
		
		// Canvas 스타일 설정
		canvas.style.position = "fixed";
		canvas.style.top = "0px";
		canvas.style.left = "0px";

		// canvas 이벤트 설정
		canvas.addEventListener("contextmenu", function(e){
			e.preventDefault();
		});
		
		
		// 생성한 Canvas 엘리먼트를 body에 추가합니다.
		document.body.appendChild(canvas);
		
		return canvas;
		
	})()
};

// 엔진 로드 후 실행할 초기화 함수(Module.postRun)
function init() {
   // 엔진 초기화 API 호출(필수)
   Module.initialize({
      container: document.getElementById("map"),
      terrain : {
				dem : {
					url : "https://xdworld.vworld.kr",
					name : "dem",
					servername : "XDServer3d",
					encoding : true
				},
				image : {
					url : "https://xdworld.vworld.kr",
					name : "tile_mo_HD",
					servername : "XDServer3d"
				},
			},
      defaultKey : "ezbBD(h2eFCmDQFQd9QpdzDS#zJRdJDm4!Epe(a2EzcbEzb2"
   });
   // 카메라 위치 설정
	Module.getViewCamera().setLocation(new Module.JSVector3D(126.976798, 37.575922, 500.0));
	//카메라 화각 설정
	Module.getViewCamera().setFov(90);
	// API 클래스 생성
	initSamplePage();
	
	//마우스클릭이벤트
	Module.canvas.onmouseup = function(){
		console.log("MouseState:"+Module.XDGetMouseState());
		// Point Input 상태일 경우 클릭 위치에서 Point 객체 생성
		if (Module.XDGetMouseState() == 21){ 
			createPointObject();
		}
	
	
		
	};
	
}


/*********************** 아래부터 API 테스트 영역 입니다 ********************************************/

var GLOBAL = {
	
	LayerList : null,
	Layer : null,
	Map : null,
	
	SelectObject_li : null
};

function initSamplePage() {
	
	// 레이어 리스트 및 새 레이어 생성
	GLOBAL.LayerList = new Module.JSLayerList(true);
	GLOBAL.Layer = GLOBAL.LayerList.createLayer("PoiLayer", 6); //(name,type)
	
	// 레이어 속성(편집 여부, 최대 가시범위) 설정
	GLOBAL.Layer.setEditable(true);
	GLOBAL.Layer.setMaxDistance(22000000.0);	
	
	// Input Point 관리를 위한 Map 객체 로드
	GLOBAL.Map = new Module.getMap();
	
	

	
	// 카메라 이동 설정
//	Module.getViewCamera().moveLonLatAlt(127.0273188, 37.4977981, 1000, true);
}
 
 
/***** Point 객체 추가 함수 */
function createPointObject() {
//	console.log("TX_Text value:"+document.getElementById('TX_Text').value);

	// Point 오브젝트 생성
	var objectCount = GLOBAL.Layer.getObjectCount();
	var object = Module.createPoint('pointObject'+objectCount); //object id임.
	// 오브젝트 위치 지정
	var positionList = GLOBAL.Map.getInputPointList();
	if (positionList.count == 0) {
		return;
	}
	object.setPosition(positionList.pop());
	
	// Point 텍스트 스타일 설정
	object.setText(document.getElementById('TX_Text').value);
//	object.setFontStyle( $id("TX_FontName").value,
//						 parseInt($id("TX_Size").value), 
//						 parseInt($id("TX_Weight").value), fillColor, lineColor);
	//리스트에 보일 텍스트 설정
	object.setDescription(document.getElementById('TX_Text').value);
	// 생성한 오브젝트를 레이어에 추가
	GLOBAL.Layer.addObject(object, 0); //(object, level)
	
	GLOBAL.Map.clearInputPoint();
	Module.XDRenderData(); //이건 뭐지???
	initObjectList();
	
	//마우스상태 지도 이동 상태로 변경
	Module.XDSetMouseState(2);
	
	//input 텍스트 지우기
	document.getElementById('TX_Text').value = "";
	
	
		
}

/* Point 객체 리스트 갱신 함수 */
function initObjectList() {

	var layer = GLOBAL.Layer;
	if (layer == null){
		return;
	}
	var objectNum = GLOBAL.Layer.getObjectCount(),	// 현재 추가된 객체 수
		eList = document.getElementById("UL_ObjectList") // 오브젝트 리스트 관리 엘리먼트
		;
	
	// 오브젝트 리스트 초기화
	while (eList.hasChildNodes()) {
		eList.removeChild(eList.firstChild);
	}
	
	// 리스트에 오브젝트 항목 추가
	for (var i=0; i<objectNum; i+=1){
		
		var object = layer.indexAtObject(i);
		if (object == null){
			continue;
		}
		//리스트 추가
		var newList = document.createElement("li");
//		newList.innerHTML = object.getId();
		var newSpan = document.createElement("span");
		newList.appendChild(newSpan);
		
		newSpan.innerHTML = object.getDescription();
		newSpan.index = object.getId(); //pointObject0 이렇게 만들어놓음.
		newSpan.id = object.getId();
		//삭제버튼 추가
		var newBtn = document.createElement("button");
		newBtn.innerHTML = "삭제";
		newBtn.id = object.getId();
		newList.appendChild(newBtn);
		
		//삭제버튼 클릭 시
		newBtn.onclick = function(){
			console.log("this.id:" + this.id);
			
			
			layer.removeAtKey(this.id); //레이어 위 객체 삭제
			this.parentNode.remove(); //리스트에서 삭제
			document.getElementById("poi-properties").style.display="none";

			Module.XDRenderData(); //지도화면 갱신
		}
//		newBtn.onclick = removeOnePoi(this.id);
		
		//리스트 클릭 시
		newSpan.onclick = function(e){
			
			// 리스트 클릭 시 색상으로 표시
			if (GLOBAL.SelectObject_li != null){
				GLOBAL.SelectObject_li.style.backgroundColor = "";
			}
			this.style.backgroundColor = "#FFFF00";
			GLOBAL.SelectObject_li = this;
			
			// 객체 상세정보 출력
			initObjectProperties(this.index);
			document.getElementById("poi-properties").style.display = "block";
			
			
			// 객체 삭제 설정
			
		}
		
		eList.appendChild(newList);
	}
	

	GLOBAL.SelectObject_li = null;
	document.getElementById("TX_ObjectCount").value = objectNum;
}



/* Point 객체 상세정보 출력 */
function initObjectProperties(_objectKey){
	var object = GLOBAL.Layer.keyAtObject(_objectKey);
	if (object == null) {
		return;
	}
	
	document.getElementById("TX_ObjectKey").value = object.getId();						// 오브젝트 키
	document.getElementById("TX_ObjectName").value = object.getName();					// 오브젝트 이름
	
	// 보기, 숨김 설정
	var bVisible = object.getVisible();		
	console.log("bVisible:"+bVisible, "Module.JS_VISIBLE_ON:"+Module.JS_VISIBLE_ON);
	if (bVisible == true) {
		document.getElementById("TX_ObjectVisible").value = true;
	} else if (bVisible == false){
		document.getElementById("TX_ObjectVisible").value = false;
	}								
//	if (bVisible == Module.JS_VISIBLE_ON) {
//		document.getElementById("TX_ObjectVisible").value = true;
//	} else if (bVisible == Module.JS_VISIBLE_OFF){
//		document.getElementById("TX_ObjectVisible").value = false;
//	}
	
	document.getElementById("TX_ObjectDescription").value = object.getDescription();	// 설명 텍스트
	document.getElementById("TX_ObjectType").value = object.getType();					// 오브젝트 타입(JSPoint)
	
	// 오브젝트 경위도 위치 및 고도
	var vPosition = object.getPosition();
	document.getElementById("TX_ObjectCenterX").value = vPosition.Longitude.toFixed(10);	// 경도(Degree)
	document.getElementById("TX_ObjectCenterY").value = vPosition.Latitude.toFixed(10);	// 위도(Degree)
	document.getElementById("TX_ObjectCenterZ").value = vPosition.Altitude.toFixed(10);	// 고도(m)

	// 오브젝트 가시 범위
	document.getElementById("TX_RangeValueActivate").value = object.getVisibleRangeActivate();	// 가시범위 값 활성화 여부
	document.getElementById("TX_RangeValueMin").value = object.getVisibleRangeMin();			// 최소 가시범위
	document.getElementById("TX_RangeValueMax").value = object.getVisibleRangeMax();			// 최대 가시범위
	
	// 텍스트 스타일
	document.getElementById("TX_ObjectFontName").value = object.getFontName();		// 글꼴 이름
	document.getElementById("TX_ObjectFontSize").value = object.getFontSize();		// 텍스트 크기
	document.getElementById("TX_ObjectFontWeight").value = object.getFontWeight();	// 텍스트 Weight
	
	// 텍스트 색상
	var fontColor = object.getFontColor();
	document.getElementById("TX_ObjectFontColorA").value = fontColor.a;		
	document.getElementById("TX_ObjectFontColorR").value = fontColor.r;
	document.getElementById("TX_ObjectFontColorG").value = fontColor.g;
	document.getElementById("TX_ObjectFontColorB").value = fontColor.b;
	
	// 텍스트 외곽 색상
	var fontOutColor = object.getFontOutColor();
	document.getElementById("TX_ObjectFontLineColorA").value = fontOutColor.a;
	document.getElementById("TX_ObjectFontLineColorR").value = fontOutColor.r;
	document.getElementById("TX_ObjectFontLineColorG").value = fontOutColor.g;
	document.getElementById("TX_ObjectFontLineColorB").value = fontOutColor.b;
}

/* Point 객체 속성 변경 */
function setObjectProperties(_setType){
	if (GLOBAL.SelectObject_li == null){
		return;
	}
	var objectName = GLOBAL.SelectObject_li.index,
		object = GLOBAL.Layer.keyAtObject(objectName),
		param1 = null,
		param2 = null
		;
	
	
	
	switch(_setType){
		
		// 오브젝트 이름 설정
		case 'name':
			param1 = document.getElementById("TX_ObjectName").value;
			object.setName(param1);
			break;
			
		// 오브젝트 보기, 숨김 설정
		case 'visible':
			param1 = object.getVisible();
			if (param1 == true) {
				param1 = false;
			} else if (param1 == false){
				param1 = true;
			} else {
				break;
			}
			object.setVisible(param1);
			break;
		
		// 설명 텍스트 설정
		case 'description':
			param1 = document.getElementById("TX_ObjectDescription").value;
			object.setDescription(param1);
			break;
			
		// 가시범위 설정
		case 'visibleRange': 
			param1 = parseFloat(document.getElementById("TX_RangeValueMin").value);
			param2 = parseFloat(document.getElementById("TX_RangeValueMax").value);
			object.setVisibleRange(true, param1, param2);
			break;
		
		// 글꼴 이름 설정
		case 'fontName':
			param1 = document.getElementById("TX_ObjectFontName").value;
			object.setFontName(param1);
			break;
	}
	
	document.getElementById("poi-properties").style.display = "none";
	Module.XDRenderData(); //지도화면 초기화
	initObjectList(); //리스트 초기화 하면 변경 한번만 됨
	initObjectProperties(objectName); //상세정보 초기화
}

//====================================================================================

/***** PolyLine 객체 생성 */
function createPolyLine()
{
	//찍은 점 없으면 알림창
//	var nCount = API.JSMap.getInputPointCount();
//	if (nCount <= 0){
//		alert("Input Point Count : 0");
//		return;
//	}
	
	// Polyline 오브젝트를 추가할 새 레이어 생성
	var layerList = new Module.JSLayerList(true);
	var layer = layerList.createLayer("PolyLineLayer", 9); //(name,type) //layertype 9: 건물
	layer.setMaxDistance(60000000.0); //레이어 최대 가시범위 거리를 설정.
	
	// 오브젝트 생성
	var objectCount = layer.getObjectCount();
	var object = Module.createLineString('lineObject'+objectCount);
	
	
	var colorA = parseInt(document.getElementById("lineColorA").value),				// 라인 색상(Alpha)
		colorR = parseInt(document.getElementById("lineColorR").value),				// 라인 색상(Red)
		colorG = parseInt(document.getElementById("lineColorG").value),				// 라인 색상(Green)
		colorB = parseInt(document.getElementById("lineColorB").value),				// 라인 색상(Blue)
		lineWidth = parseFloat(document.getElementById("inputLineWidth").value)		// 라인 두께
		;
//	var objectKey = document.getElementById("InputObjectKey").value,	// 오브젝트 키
//		layerName = document.getElementById("InputLayerName").value		// 레이어 이름
//		;

	
	// 오브젝트 스타일 설정
	var lineColor = new Module.JSColor(colorA, colorR, colorG, colorB);		// 라인 색상 
	var lineStyle = new Module.JSPolyLineStyle();							// 스타일 객체 생성
	lineStyle.setColor(lineColor);											// 색상 설정
	lineStyle.setWidth(lineWidth);											// 두께 설정
	
	object.setStyle(lineStyle);			// 스타일 객체로 Polyline 스타일 지정
	
	
	
	// 입력 점 리스트 반환
//	var vPointList = API.JSMap.getInputPointList();
	var vPointList = Module.getMap().getInputPointList();
	object.setCoordinates(vPointList);
	
	// 오브젝트 추가
	layer.addObject(object, 0);
	
	// 입력점 초기화
//	API.JSMap.clearInputPoint();
	Module.getMap().clearInputPoint();
	
	// RTT 업데이트
//	API.JSMap.updateRTT();
	Module.getMap().updateRTT(); //이건 뭐지????
}


/*****폴리곤 생성 */
function createPolygon() {
			
	// 마우스 입력 점 반환
	var map = Module.getMap();
	var inputPoint = map.getInputPoints();
//	console.log("inputPoint.count:"+inputPoint.count());

	// 점 수가 3점 이상인 경우 진행
	var inputPointCount = inputPoint.count();
	if (inputPoint < 3) {
		return;
	}

	// 폴리곤 객체를 저장할 레이어 생성 (이미 생성한 경우 레이어 반환)
	var layerList = new Module.JSLayerList(true);
	var layer = GLOBAL.LayerList.nameAtLayer("POLYGON_LAYER");
	if (layer == null) {
			
		// 레이어가 없는 경우 새로 생성
		layer = layerList.createLayer("POLYGON_LAYER", Module.ELT_POLYHEDRON); //(name,type) 저타입은 어디서 온거지????
	}

	// 폴리곤 객체 생성
	var currentLayerObjectCount = layer.getObjectCount();
	var polygon = Module.createPolygon("POLYGON_"+currentLayerObjectCount); //(key)

	// 입력한 지점(inputPoint, part)으로 폴리곤 형태 정의
	var part = new Module.Collection();
	part.add(inputPointCount);

	var vertex = new Module.JSVec3Array();
	for (var i=0; i<inputPointCount; i++) {

		// 입력한 점 위치에서 고도 5m 를 상승시킨 후 버텍스 추가
		var point = inputPoint.get(i);
		vertex.push(new Module.JSVector3D(point.Longitude, point.Latitude, point.Altitude+5.0));
	}

	polygon.setPartCoordinates(vertex, part);

	// 레이어에 객체 추가
	layer.addObject(polygon, 0);

	// 입력 점 초기화
	map.clearInputPoint();
	
	//마우스 모드 객체선택 모드로 변경
	Module.XDSetMouseState(6);	
	
	//객체 선택 이벤트
//	selectObject(polygon.getId());
}


/* polygon 객체 선택 이벤트 */
function selectObject(_objectKey) {
	console.log("selectObject들어옴!"+_objectKey)
	
	Module.canvas.addEventListener("Fire_EventSelectedObject", function(e){
		console.log(e);
		polygonProperties(_objectKey);
		});
//	var object = GLOBAL.Layer.keyAtObject(_objectKey);
//	GLOBAL.Map.setSelectObject(object);
//	initObjectProperties(_objectKey)
	Module.XDRenderData();
}

/**폴리곤 팝업 */
function polygonProperties(_objectKey){
	console.log("polygonProperties들어옴!"+_objectKey)

	document.getElementById("polygon-properties").style.display = "block";
	
	var layer = GLOBAL.LayerList.nameAtLayer("POLYGON_LAYER");
	var object = layer.keyAtObject(_objectKey);
	if (object == null) {
		return;
	}
	console.log("object id:"+ object.getId());
	document.getElementById("PG_ObjectKey").value = object.getId();		
	document.getElementById("PG_ObjectName").value = object.getName();
	
}

//------------------------삭제-----------------------------------------------------------
function removeAllPoi(){
	var layer = GLOBAL.LayerList.nameAtLayer("PoiLayer");
	//레이어 위 객체 모두 삭제
	layer.removeAll();
	
	
	var	eList = document.getElementById("UL_ObjectList"); // 오브젝트 리스트 관리 엘리먼트
	// 오브젝트 리스트 초기화
	while (eList.hasChildNodes()) {
		eList.removeChild(eList.firstChild);
	}
};

function removeAllPolyLine(){
	var layer = GLOBAL.LayerList.nameAtLayer("PolyLineLayer");
	//레이어 위 객체 모두 삭제
	layer.removeAll();
};

function removeAllPolygon(){
	var layer = GLOBAL.LayerList.nameAtLayer("POLYGON_LAYER");
	//레이어 위 객체 모두 삭제
	layer.removeAll();
};


//function removeOnePoi(id){
//	console.log("this.id:" + id);
//	
//	var layer = GLOBAL.LayerList.nameAtLayer("PoiLayer");
//	layer.removeAtKey(id); //레이어 위 객체 삭제
//	document.getElementById(id).parentNode.remove(); //리스트에서 삭제
//	document.getElementById("poi-properties").style.display="none";
//
//	Module.XDRenderData(); //지도화면 갱신
//};



//---------팝업 변경----------------------------------------------------------------------------
function createPoiPopup(){
	document.getElementById("poi-wrap").style.display = "block";
	document.getElementById("line-wrap").style.display = "none";
	document.getElementById("poly-wrap").style.display = "none";

	document.getElementById("polygon-properties").style.display = "none";

	//마우스상태 '지도이동'상태로 변경
	Module.XDSetMouseState(1);
};

function createLinePopup(){
	document.getElementById("line-wrap").style.display = "block";
	document.getElementById("poi-wrap").style.display = "none";
	document.getElementById("poly-wrap").style.display = "none";
	
	document.getElementById("poi-properties").style.display="none";
	document.getElementById("polygon-properties").style.display = "none";
	
	//마우스 상태 '점입력'으로 변경
	Module.XDSetMouseState(20);

};

function createPolyPopup() {
	
	document.getElementById("poi-wrap").style.display = "none";
	document.getElementById("line-wrap").style.display = "none";
	document.getElementById("poly-wrap").style.display = "block";
	
	document.getElementById("poi-properties").style.display="none";

	
	//마우스 상태 '점입력'으로 변경
	Module.XDSetMouseState(20);
};


//화면 축소/확대해도 지도크기 동일하게
window.onresize = function() {

	if (typeof Module == "object") {
		Module.Resize(window.innerWidth, window.innerHeight);
		Module.XDRenderData();
	}
};

//이것도 있음
//window.onresize = function() {
//		Module.Resize(window.innerWidth, window.innerHeight);
//		Module.XDRenderData();
//	};

