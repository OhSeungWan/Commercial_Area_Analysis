import store from '../store/index'
import axios from  '../js/http-commons'
import data from '../assets/json/newcolor.json'
import { eventBus } from '../js/bus'
let options = {
    center: new kakao.maps.LatLng(37.505691, 127.0298106),
    level: 6
  }

export let MAP = null
export let Geo = null
export let Marker = null
export let MyStore = null
let poly=[]
let Element =  null
let Element2 =  null
let info= null
let ME= ''
let isonececlick = false
let coordinates = [] //행정구
let ChangeBusinessTable= null
let drawingFlag= false
let centerPosition= false// 원의 중심좌표
let drawingCircle= false // 그려지고 있는 원을 표시할 원 객체
let drawingLine= false // 그려지고 있는 원의 반지름을 표시할 선 객체
let drawingOverlay= false // 그려지고 있는 원의 반경을 표시할 커스텀오버레이
let rClickPosition = null
let polyline = null
let circle = null
let radiusOverlay = null
let html =  null
let radiusObj =  null
let customOverlay= false
let color= null
let wasDrawing= false
let circles= []
let CountInfo = new Object()
//let polygon = null
CountInfo.소매= ''
CountInfo.학문교육= ''
CountInfo.숙박= ''
CountInfo.생활서비스= ''
CountInfo.음식= ''
CountInfo.부동산= ''
CountInfo.의료= ''
CountInfo.관광여가오락= ''

JSON.stringify(CountInfo)
  
let range = ''
let searchX= ''
let searchY= ''
function MakeMap(container) {
    MAP =  new  kakao.maps.Map(container, options)
    return MAP
}
export { MakeMap }

function MakeCustomOL() {
    customOverlay =  new kakao.maps.CustomOverlay({})
    return customOverlay
}
export { MakeCustomOL }

function Makeinfo() {
    info =  new kakao.maps.CustomOverlay({})
    return info
}
export { Makeinfo }

function MakeGeo() {
    Geo = new kakao.maps.services.Geocoder()
    return Geo
}
export { MakeGeo }

function MakeMarker() {
    Marker =new kakao.maps.Marker({
        map: MAP
      })
      kakao.maps.event.addListener(MAP, 'click', function(mouseEvent) {
       CircleMouseClick(mouseEvent)
        // vm.Controlllevel(vm.points)
      }) // 지도에 클릭 이벤트를 등록
      kakao.maps.event.addListener(MAP, 'mousemove', function(mouseEvent) {
        CircleMoveClick(mouseEvent)
      }) // 지도에 무브 이벤트를 등록
      kakao.maps.event.addListener(MAP, 'rightclick', function(mouseEvent) {
        RightMouseClick(mouseEvent)
      })
}
export { MakeMarker }

function MakeMyStore() {
    MyStore =new kakao.maps.Marker({
        map: MAP
      })
      
      var imageSrc =
        'https://lh3.googleusercontent.com/proxy/vkU8Txag3K3WxbyFvUjmGWNOjQVRjLJd1am1UBSg4XP1eQhasgiq087-PrX1SbEyoKHnIwtbqqT3GMypK9ectUZ9OseVUV8Sno-RN2obw-dJbYwreUa1nQPvTdnbt7efsMgt07DwFaCPhgEeHYMpknh4w9vu0gCrl3yUwAsLO2jOrzzJiihVp9UsSTWX4Ik1PjUqQwAIv0Zjp70AXTRuqzF5VgHSxN54N34BtfQik5FSTcUrvx-1lLdhSv5C3a7sG5ZVpR3-CX97NEAGKapfAbqk5PB0O7qw1U5nQDDGsmXQxeFEfwvV9Hc9rysv4vJdZq8x1YlSMCLHMg8n5fHgaOhJKQ' // https://image.flaticon.com/icons/svg/1322/1322263.svg
      var imageSize = new kakao.maps.Size(30, 40) // 마커이미지의 크기입니다
      var imageOption = { offset: new kakao.maps.Point(27, 69) } // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
      var markerImage = new kakao.maps.MarkerImage(
        imageSrc,
        imageSize,
        imageOption
      )
      axi
        .post(
          'http://70.12.246.137:8080/user/info',
          {
            email: 'asdfasdfa',
            pw: 'asdfasdfasdf'
          },
          {
            headers: {
              jwt: store.state.auth.token
            }
          }
        )
        .then(res => {
          res.data.data.forEach(element => {
            store.state.auth.mylist.push(element)
          })
        })
        .then(() => {
          let posi = this.getmystore()
          for (let index = 0; index < posi.length; index++) {
              MyStore = new kakao.maps.Marker({
              map: MAP,
              position: posi[index], // 최초 표시되는 마커의 위치
              image: markerImage
            }).setMap(MAP)
          }
        })
}
export { MakeMyStore }

function getmystore() {
    let list = store.state.auth.mylist
    let posi = []
    for (let index = 0; index < list.length; index++) {
      let position = new kakao.maps.LatLng(list[index].lat, list[index].lot)
      posi.push(position)
    }
    return posi
  }export { getmystore }


  
  function CircleMouseClick(mouseEvent) {
    // 지도에 클릭 이벤트를 등록
    removeCircles()
    if (store.state.mode === 1 && MAP.getLevel()<4) {
      if (ChangeBusinessTable !== null) {
        ChangeBusinessTable.setMap(null)
      }
      if (!drawingFlag) {
        // 클릭 이벤트가 발생했을 때 원을 그리고 있는 상태가 아니면 중심좌표를 클릭한 지점으로 설정
        drawingFlag = true
        alert(drawingFlag)
        centerPosition = mouseEvent.latLng // 원이 그려질 중심좌표를 클릭한 위치로 설정합니다

        searchX = centerPosition.Ga
        searchY = centerPosition.Ha

        if (!drawingLine) {
          // 그려지고 있는 원의 반경을 표시할 선 객체를 생성합니다
          drawingLine = new kakao.maps.Polyline({
            strokeWeight: 3, // 선의 두께
            strokeColor: '#00a0e9', // 선의 색깔
            strokeOpacity: 0, // 선의 불투명도
            strokeStyle: 'solid' // 선의 스타일
          })
          alert(drawingLine)
        }
        if (!drawingCircle) {
          // 그려지고 있는 원을 표시할 원 객체를 생성합니다
          drawingCircle = new kakao.maps.Circle({
            strokeWeight: 1,
            strokeColor: '#00a0e9',
            strokeOpacity: 0,
            strokeStyle: 'solid',
            fillColor: '#00a0e9',
            fillOpacity: 0.2
          })
        }
        if (!drawingOverlay) {
          // 그려지고 있는 원의 반경 정보를 표시할 커스텀오버레이를 생성합니다
         drawingOverlay = new kakao.maps.CustomOverlay({
            xAnchor: 0,
            yAnchor: 0,
            zIndex: 1
          })
        }
      }
    }
    else if(store.state.mode === 1  && MAP.getLevel() > 3){alert("원 검색을 하기위해서는 맵을 좀더 확대해 주세요")}
  }

  function CircleMoveClick(mouseEvent){
    
    if (drawingFlag) {
        
        // 마우스무브 이벤트가 발생했을 때 원을 그리고있는 상태이면
        var mousePosition = mouseEvent.latLng // 마우스 커서의 현재 위치를 얻어옵니다
        var linePath = [centerPosition, mousePosition] // 그려지고 있는 선을 표시할 좌표 배열입니다. 클릭한 중심좌표와 마우스커서의 위치로 설정합니다
        
        drawingLine.setPath(linePath) // 그려지고 있는 선을 표시할 선 객체에 좌표 배열을 설정합니다
        // alert(drawingLine.getLength())
        var length = drawingLine.getLength() // 원의 반지름을 선 객체를 이용해서 얻어옵니다
        if (length > 0) {
          var circleOptions = {
            // 그려지고 있는 원의 중심좌표와 반지름입니다
            center: centerPosition,
            radius: length
          }
          drawingCircle.setOptions(circleOptions) // 그려지고 있는 원의 옵션을 설정합니다
          var radius = Math.round(drawingCircle.getRadius()) // 반경 정보를 표시할 커스텀오버레이의 내용입니다
          let content =
            '<div class="overlay" style="background-color:white">반경 <span class="number">' +
            radius +
            '</span>m</div>'
          drawingOverlay.setPosition(mousePosition) // 반경 정보를 표시할 커스텀 오버레이의 좌표를 마우스커서 위치로 설정합니다
          drawingOverlay.setContent(content) // 반경 정보를 표시할 커스텀 오버레이의 표시할 내용을 설정합니다
          drawingCircle.setMap(MAP) // 그려지고 있는 원을 지도에 표시합니다
          drawingLine.setMap(MAP) // 그려지고 있는 선을 지도에 표시합니다
          drawingOverlay.setMap(MAP) // 그려지고 있는 원의 반경정보 커스텀 오버레이를 지도에 표시합니다
        } else {
          drawingCircle.setMap(null)
          drawingLine.setMap(null)
          drawingOverlay.setMap(null)
        }
      }
  }

  function removeCircles(){
    for (var i = 0; i < circles.length; i++) {
        circles[i].circle.setMap(null)
        circles[i].polyline.setMap(null)
        circles[i].overlay.setMap(null)
      }
      circles = []
  }

  async function RightMouseClick(mouseEvent){
    if (drawingFlag) {
        rClickPosition = mouseEvent.latLng // 마우스로 오른쪽 클릭한 위치입니다
        polyline = new kakao.maps.Polyline({
          // 원의 반경을 표시할 선 객체를 생성합니다
          path: [centerPosition, rClickPosition], // 선을 구성하는 좌표 배열입니다. 원의 중심좌표와 클릭한 위치로 설정합니다
          strokeWeight: 1, // 선의 두께 입니다
          strokeColor: '#00a0e9', // 선의 색깔입니다
          strokeOpacity: 0, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
          strokeStyle: 'solid' // 선의 스타일입니다
        })
        circle = new kakao.maps.Circle({
          // 원 객체를 생성합니다
          center: centerPosition, // 원의 중심좌표입니다
          radius: polyline.getLength(), // 원의 반지름입니다 m 단위 이며 선 객체를 이용해서 얻어옵니다
          strokeWeight: 0, // 선의 두께입니다
          strokeColor: '#00a0e9', // 선의 색깔입니다
          strokeOpacity: 0, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
          strokeStyle: 'solid', // 선의 스타일입니다
          fillColor: '#00a0e9', // 채우기 색깔입니다
          fillOpacity: 0.2 // 채우기 불투명도입니다
        })
        var radius = Math.round(circle.getRadius()) // 원의 반경 정보를 얻어옵니다
        range = radius
        await getDataCircle()

        centerPosition = null // 중심 좌표를 초기화 합니다
        drawingCircle.setMap(null) // 그려지고 있는 원, 선, 커스텀오버레이를 지도에서 제거합니다
        drawingLine.setMap(null)
        drawingOverlay.setMap(null)
      }
  }

  async function getDataCircle(){
    axios
    .get(
      '/storecountByxy/' +
        searchX +
        '/' +
        searchY +
        '/' +
        range
    )
    .then(res => {
      var jsonlarge = res.data.large
      CountInfo.소매 = jsonlarge.소매
      CountInfo.학문교육 = jsonlarge.학문교육
      CountInfo.숙박 = jsonlarge.숙박
      CountInfo.생활서비스 = jsonlarge.생활서비스
      CountInfo.음식 = jsonlarge.음식
      CountInfo.부동산 = jsonlarge.부동산
      CountInfo.의료 = jsonlarge.의료
      CountInfo.관광여가오락 = jsonlarge.관광여가오락
    })
    .catch(err => alert(err, '검색어를 확인해주세요'))
    .finally(() => {
        alert("dasdfq")
      getBoxHTML()
        .then(res => {
          html = res
          radiusOverlay = getOverlay(
            html,
            rClickPosition
          )
          radiusOverlay.setMap(MAP) // 반경 정보 커스텀 오버레이를 지도에 표시합니다
          circle.setMap(MAP) // 원을 지도에 표시합니다
          polyline.setMap(MAP) // 선을 지도에 표시합니다
        })
        .finally(() => {
          drawingFlag = false // 그리기 상태를 그리고 있지 않는 상태로 바꿉니다
          radiusObj = {
            // 배열에 담을 객체입니다. 원, 선, 커스텀오버레이 객체를 가지고 있습니다
            polyline: polyline,
            circle: circle,
            overlay: radiusOverlay
          }
          circles.push(radiusObj) // 이 배열을 이용해서 "모두 지우기" 버튼을 클릭했을 때 지도에 그려진 원, 선, 커스텀오버레이들을 지웁니다
        })
    })
  }

  async function getBoxHTML(){
    let a = CountInfo.소매
    if (a === undefined) {
      a = 0
    }
    let 학문교육 = CountInfo.학문교육
    if (학문교육 === undefined) {
      학문교육 = 0
    }
    let 숙박 = CountInfo.숙박
    if (숙박 === undefined) {
      숙박 = 0
    }
    let 생활서비스 = CountInfo.생활서비스
    if (생활서비스 === undefined) {
      생활서비스 = 0
    }
    let 음식 = CountInfo.음식
    if (음식 === undefined) {
      음식 = 0
    }
    let 부동산 = CountInfo.부동산
    if (부동산 === undefined) {
      부동산 = 0
    }
    let 의료 = CountInfo.의료
    if (의료 === undefined) {
      의료 = 0
    }
    let 관광여가오락 = CountInfo.관광여가오락
    if (관광여가오락 === undefined) {
      관광여가오락 = 0
    }
    var content =
      '<div class="overlaybox"' +
      '    style="position:relative;background:#023359;' +
      '      width:470px; height:250px;border-radius:10px;">' +
      '<div class="v-sheet theme--light elevation-14" style="position:relative;top:50%;transform:translateY(-50%);width:450px;height:230px;margin:auto;display:block;text-align:center;" id="mapSheet">'
    content +=
      '    <div style="padding-top:10px;display:flex;justify-content:space-around;">'
    content += '    <div style="width:80px;height:93px;">'
    content +=
      '        <img style="margin:auto;width:80px;height:80px;display:block;" src="/img/store.5c0694f4.png">' +
      '<span style="width:100%;">' +
      a
    content += '</span></div>'
    content += '    <div style="width:80px;height:93px;">'
    content +=
      '        <img style="margin:auto;width:80px;height:80px;display:block;" src="/img/school.10da6a9d.png">' +
      '<span style="width:100%;">' +
      학문교육
    content += '</span></div>'
    content += '    <div style="width:80px;height:93px;">'
    content +=
      '        <img style="margin:auto;width:80px;height:80px;display:block;" src="/img/hotel.531ff90a.png">' +
      '<span style="width:100%;">' +
      숙박
    content += '</span></div>'
    content += '    <div style="width:80px;height:93px;">'
    content +=
      '        <img style="margin:auto;width:80px;height:80px;display:block;" src="/img/service.b9012c84.png">' +
      '<span style="width:100%;">' +
      생활서비스
    content += '</span></div>'
    content += '</div>'
    content +=
      '    <div style="display:flex;justify-content:space-around;padding-top:10px;">'
    content += '    <div style="width:80px;height:93px;">'
    content +=
      '        <img style="margin:auto;width:80px;height:80px;display:block;" src="/img/food.40e9a510.png">' +
      '<span style="width:100%;">' +
      음식
    content += '</span></div>'
    content += '    <div style="width:80px;height:93px;">'
    content +=
      '        <img style="margin:auto;width:80px;height:80px;display:block;" src="/img/estate.19bdddbd.png">' +
      '<span style="width:100%;">' +
      부동산
    content += '</span></div>'
    content += '    <div style="width:80px;height:93px;">'
    content +=
      '        <img style="margin:auto;width:80px;height:80px;display:block;" src="/img/hospital.85ccdf18.png">' +
      '<span style="width:100%;">' +
      의료
    content += '</span></div>'
    content += '    <div style="width:80px;height:93px;">'
    content +=
      '        <img style="margin:auto;width:80px;height:80px;display:block;" src="/img/game.b8da8874.png">' +
      '<span style="width:100%;">' +
      관광여가오락
    content += '</span></div>'
    content += '</div>'
    content += '</div>'
    content += '</div>'

    return content
  } 

  function getOverlay(){
    let radiusOverlay = new kakao.maps.CustomOverlay({
        content: html, // 표시할 내용입니다
        position: rClickPosition, // 표시할 위치입니다. 클릭한 위치로 설정합니다
        xAnchor: 0.5,
        yAnchor: 1,
        zIndex: 1
      })
      return radiusOverlay
  }

  function getData3() {
    axios
      .get('/change/getHistory' + '/' + this.name)
      .then(res => {
        var jsonlarge = res.data.large
        this.CountInfo.소매 = jsonlarge.소매
        this.CountInfo.학문교육 = jsonlarge.학문교육
        this.CountInfo.숙박 = jsonlarge.숙박
        this.CountInfo.생활서비스 = jsonlarge.생활서비스
        this.CountInfo.음식 = jsonlarge.음식
        this.CountInfo.부동산 = jsonlarge.부동산
        this.CountInfo.의료 = jsonlarge.의료
        this.CountInfo.관광여가오락 = jsonlarge.관광여가오락
      })
      .catch(err => alert(err, '검색어를 확인해주세요'))
  }

  function drawpoly() {
    for (var i = 0, len = data.length; i < len; i++) {
        // 동의 경계면 좌표를 받아서 다각형 생성 함수에 전달
        coordinates = data[i].geometry.coordinates
        let name = data[i].properties.ADM_DR_NM
        console.log(coordinates[0][0].length)
        if (data[i].properties.color === '정체') {
          color = '#fca103'
        }
        if (data[i].properties.color === '상권확장') {
          color = '#039dfc'
        }
        if (data[i].properties.color === '상권축소') {
          color = '#fc1803'
        }
        if (data[i].properties.color === '다이나믹') {
          color = '#03fc24'
        }console.log(coordinates)
        displayArea(
          MAP,
          coordinates[0][0],
          name,
          coordinates[0][0].length,
          customOverlay,
          color
        )
      }
  }export { drawpoly }

  function displayArea(MAP,coordinates, name, length, customOverlay,color){
    let path = []
    let points = []
    for (let i = 0; i < length; i++) {
        // 좌표의 개수만큼 반복문을 돌며 경계 바운더리 생성(path생성)
        var point = new Object()
        point.x = coordinates[i][1]
        point.y = coordinates[i][0]
        points.push(point)
        path.push(new kakao.maps.LatLng(coordinates[i][1], coordinates[i][0]))
      }
      
      let polygon = new kakao.maps.Polygon({
        // 생성된 path를 이용하여 폴리곤(다각형) 생성
        map: MAP, // 다각형을 표시할 지도 객체
        path: path,
        strokeWeight: 2, // 선두깨
        strokeColor: '#004c80', // 선색
        strokeOpacity: 0.4, // 선 투명도
        fillColor: color,
        fillOpacity: 0.13
      })
      kakao.maps.event.addListener(polygon, 'mouseover', mouseEvent => {
        // 각 폴리곤에 마우스 오버 이벤트 등록
        let Name = name
        let position = mouseEvent.latLng
        polygon.setOptions({
          fillColor: '#0a008f'
        })
        customOverlay.setContent(
          '<div class="area" style="font-size: 16px; border-radius: 3px; background: #fff; top: -5px; border: 1px solid #888; position: absolute; left:30px; padding:2px;">' +
            name +
            '</div>'
        )
        customOverlay.setPosition(position)
        customOverlay.setMap(MAP)
      })

      kakao.maps.event.addListener(polygon, 'mousemove', mouseEvent => {
        // 각 폴리곤에 마우스 오버 이벤트 등록
        let position = mouseEvent.latLng
        // customOverlay.setPosition(position)
      })
      kakao.maps.event.addListener(polygon, 'mouseout', () => {
        //  각 폴리곤에 마우스 아웃 이벤트 등록
        polygon.setOptions({
          fillColor: color
        })
        customOverlay.setMap(null)
      })
     
}

function eventbus(name) {
    eventBus.$emit('clickmap', name)
  }

function saveMouseEvent(mouseEvent, flag,isonececlick) {
    // 마우스 커서의 위치를 저장하는 메서드
    if (isonececlick === false && flag === 1) {
      // 최초 페이지 로드후 클릭이 일어났지는지 유무를 확인하는 변수
      isonececlick = true
    }
    ME = mouseEvent
    store.state.Coords.lat = ME.latLng.getLat() // 모달에 전달할 xy 좌표
    store.state.Coords.lng = ME.latLng.getLng() //
      console.log(null)
      console.log(store.state.Coords.lat)
      console.log(store.state.Coords.lng)
}

function setSerchkey(name){
    // 마우스 커서위치의 동이름을 저장하는 메서드
    store.state.modalsearch = name
}

function makeOverlay2(mouseEvent,Name){
    if (Name == null) return
    // === 요소 삭제했다가 추가 ==
    Element.parentNode.removeChild(Element)
    console.log(store.state.chartElement)
    var node = document.createElement('canvas')
    var para = Element2.appendChild(node)
    para.id = 'horizontalbarChart'
    para.style = 'height: 190px; width: 350px;'
    // =======================
    let result =null
     axios
      .get('/population/getPopulationByTime/' + Name)
      .then(res => {
         result = res.data.pbt
        let road = result.f
        let point = res.data.point
      })
      .finally(() => {
        var ctx =Element.getContext('2d')
        var horizontalbarChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: [
              '24~06시',
              '06~11시',
              '11~14시',
              '14~17시',
              '17~21시',
              '21~24시'
            ],
            datasets: [
              {
                label: '정보',
                fill: false,
                borderColor: 'navy',
                data: [
                    result.j,
                    result.k,
                    result.l,
                    result.m,
                    result.n,
                    result.o
                ]
              }
            ]
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: false
                  },
                  gridLines: {
                    display: true
                  }
                }
              ],
              xAxes: [
                {
                  gridLines: {
                    display: true
                  }
                }
              ]
            }
          }
        })
      })
}
function makeOverlay3(){}
function makeOverlay4(){}
function makeOverlay5(){}
function makeOverlay6(){}
function makeOverlay7(){}
function makeOverlay8(){}

function getelemt(element) {
    Element = element
    alert(Element)
}export {getelemt}

function getelemt2(element){
    Element2 = element
}export {getelemt2}