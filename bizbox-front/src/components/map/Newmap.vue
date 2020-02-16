<template>
  <div class="mapContainer">
    <v-card>
      <v-toolbar class="searchBox">
        <v-text-field
          Elevation="14"
          hide-details
          v-on:keyup.enter="serch"
          v-model.trim="name"
          single-line
          clearable
          label="Search..."
        ></v-text-field>
        <v-btn v-on:click="serch" icon>
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </v-toolbar>
    </v-card>
    <condition v-on:myevent="myevent"></condition>
    <div class="ssss" v-show="isonececlick">
      <div class="info" id="graph-info">
        <canvas class="chart" id="horizontalbarChart"></canvas>
      </div>
    </div>
    <div class="map" id="map"></div>
    <v-btn class="addbt" v-on:click="add" icon>
      현재 위치에 내 점포 추가하기
      <v-icon>mdi-magnify</v-icon>
    </v-btn>
    <Detail v-if="showModal" @close="showModal = false; this.$store.state.opencontents = 3">
      <!-- 마커 클릭시 모달 표시되는 부분입니다 -->
    </Detail>
    <div class="addstore" v-if="showAdd">
      <div>
        점포 상호명:
        <br />
        <input type="text" name="store_name" v-model="storeName" />
      </div>
      <div>
        업종 대분류:
        <br />
        <input type="text" name="category_large" v-model="Clarge" />
      </div>
      <div>
        업종 중분류:
        <br />
        <input type="text" name="category_middle" v-model="Cmiddle" />
      </div>
      <div>
        업종 소분류:
        <br />
        <input type="text" name="category_small" v-model="Csmall" />
      </div>
      <div style="background-color:tomato;">
        <button @click="storeAdd,add"  value="추가하기">add</button>
      </div>
    </div>
  </div>
</template>

<script>
import Detail from '@/components/modal/modal_view/modal_view.vue'
import '../modal/Modal.css'
import Dong from '../../assets/json/newcolor.json'
import color from '../../assets/json/color.json'
import condition from '@/components/bizmap/kakaomap/SearchCondition.vue'
import axios from '../../js/http-commons'
import { eventBus } from '../../js/bus'
import { mapGetters } from 'vuex'
import axi from 'axios'
let  mapApi = require('../../js/map')

export default {
  data: () => {
    return {
      storeName: '',
      Clarge: '',
      Cmiddle: '',
      Csmall: '',
      showAdd: false,
      info: null,
      member_marker: null,
      showModal: false,
      points: [],
      polygon: null,
      html: null,
      map: null,
      name: '역삼동',
      clusterer: null,
      marker: null,
      infowindow: null,
      message: null,
      ifchanege: null,
      addListener: null,
      mode: null, // 여기 반경 하고 싶으면 asdf 로
      ChangeBusinessTable: null, // 오버레이 테이블
      rClickPosition: null,
      radiusOverlay: null,
      circle: null,
      polyline: null,
      radiusObj: null,
      drawingFlag: false, // 원이 그려지고 있는 상태를
      centerPosition: false, // 원의 중심좌표
      drawingCircle: false, // 그려지고 있는 원을 표시할 원 객체
      drawingLine: false, // 그려지고 있는 원의 반지름을 표시할 선 객체
      drawingOverlay: false, // 그려지고 있는 원의 반경을 표시할 커스텀오버레이
      customOverlay: false,
      wasDrawing: false,
      circles: [],
      countResult: '',
      searchX: '',
      searchY: '',
      range: '',
      coords: '',
      ME: '',
      isonececlick: false,
      CountInfo: {
        소매: '',
        학문교육: '',
        숙박: '',
        생활서비스: '',
        음식: '',
        부동산: '',
        의료: '',
        관광여가오락: ''
      }
    }
  },
  mounted() {
    this.$store.state.chartElemet = document.getElementById('horizontalbarChart')
    mapApi.getelemt(document.getElementById('horizontalbarChart'))
    mapApi.getelemt2(document.getElementById('graph-info'))
    this.$store.state.graphinfo = document.getElementById('graph-info')
    let data = Dong // 좌표 저장할 배열
    let coordinates = [] // 행정 구 이름
    let name = '멀티캠퍼스'
    let color = ''
    let Message = ''
    this.message = Message
    var container = document.getElementById('map')
    // --코더 생성------------------------------------------------------------------------------------
    mapApi.MakeGeo()//geocoder 생성
    //this.map = new kakao.maps.Map(container, options) // 맵 생성
    mapApi.MakeMap(container)//맵 생성
    // 오버레이 생성--------------------------------------------------------
    //this.customOverlay = new kakao.maps.CustomOverlay({})
    mapApi.MakeCustomOL()
    mapApi.Makeinfo()
    // this.info = new kakao.maps.CustomOverlay({})
    // --마커 생성--------------------------------------------------------------------
    mapApi.MakeMarker()
    if (this.$store.state.auth.token) {
      mapApi.MakeMyStore()
    }

    kakao.maps.event.addListener(mapApi.Marker, 'click', function () {
      // 마커(자세히 보기) 클릭 시 모달창 이벤트 호출
      vm.changeModal()
    })
    // -------------------------------------------------------------------------------------
    // 반경 그리는 이벤트 시작-------------------------------------------------------------------
   
    // axios
    //   .get('/population/getPopulationByTime/' + this.name)
    //   .then(res => {
    //     console.log(res)
    //   })
    //   .finally(() => {})
    // for (var i = 0, len = data.length; i < len; i++) {
    //   var nname = data[i].properties.ADM_DR_NM
    //   console.log(nname)
    //   for (var j = 0, Len = color.colorlist.length; j < Len; j++) {
    //     if (nname === color.colorlist[j].name) {
    //       data[i].properties.color = color.colorlist[j].color
    //       console.log(color.colorlist[j].color)
    //     }
    //   }
    // }
    // var jsonData = JSON.stringify(data)
    // var a = document.createElement("a")
    // var file = new Blob([jsonData], { type: 'text/plain' })
    // a.href = URL.createObjectURL(file)
    // a.download = 'cc.txt'
    // a.click()
    console.log(data)
    mapApi.drawpoly()
    // for (var i = 0, len = data.length; i < len; i++) {
    //   // 동의 경계면 좌표를 받아서 다각형 생성 함수에 전달
    //   this.coordinates = data[i].geometry.coordinates
    //   name = data[i].properties.ADM_DR_NM
    //   if (data[i].properties.color === '정체') {
    //     color = '#fca103'
    //   }
    //   if (data[i].properties.color === '상권확장') {
    //     color = '#039dfc'
    //   }
    //   if (data[i].properties.color === '상권축소') {
    //     color = '#fc1803'
    //   }
    //   if (data[i].properties.color === '다이나믹') {
    //     color = '#03fc24'
    //   }
    //   displayArea(
    //     vm.pp,
    //     this.map,
    //     this.coordinates[0][0],
    //     name,
    //     this.coordinates[0][0].length,
    //     this.customOverlay,
    //     color
    //   )
    // }

    function displayArea(
      polygon,
      Mmap,
      coordinates,
      name,
      length,
      customOverlay,
      color
    ) {
      let mode = vm.$store.state.mode
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
      polygon = new kakao.maps.Polygon({
        // 생성된 path를 이용하여 폴리곤(다각형) 생성
        map: Mmap, // 다각형을 표시할 지도 객체
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
        customOverlay.setMap(Mmap)
      })
      kakao.maps.event.addListener(polygon, 'mousemove', mouseEvent => {
        // 각 폴리곤에 마우스 오버 이벤트 등록
        let position = mouseEvent.latLng
        customOverlay.setPosition(position)
      })
      kakao.maps.event.addListener(polygon, 'mouseout', () => {
        //  각 폴리곤에 마우스 아웃 이벤트 등록
        polygon.setOptions({
          fillColor: color
        })
        customOverlay.setMap(null)
      })
      
      kakao.maps.event.addListener(polygon, 'click', mouseEvent => {
        //if (vm.$store.state.mode === 0) {
        if (vm.$store.state.mode !== 1) {
          //  각 폴리곤에 마우스 클릭 이벤트 등록
          vm.eventbus(name)
          vm.saveMouseEvent(mouseEvent, 0)
          let Name = name
          let coords = ''
          vm.setSerchkey(name) // 클릭된 영영ㄱ의 동이름을 기억하는 메서드
          let Marker = vm.marker
          coords = new kakao.maps.LatLng(
            vm.ME.latLng.getLat(),
            vm.ME.latLng.getLng()
          ) // 결과값으로 받은 위치를 마커의 위치로 적용
          Marker.setPosition(coords)
          // InfoWindow.close()
          var imageSrc =
            'https://post-phinf.pstatic.net/MjAxODEwMjlfMjIy/MDAxNTQwNzg4MzE3MjY5.LLHhYLh1j1_nHjfolzukFd3SgwPeusVXJFmUJ3voADcg.ir556-ycrlzdjx1QZ14LA73RHXamNw3Z6-abjpyrEvsg.GIF/%EC%9E%90%EC%84%B8%ED%9E%88%EB%B3%B4%EA%B8%B0.gif?type=w500_q75' // https://image.flaticon.com/icons/svg/1322/1322263.svg
          // 돋보기 모양 https://cdn.icon-icons.com/icons2/1744/PNG/512/3643762-find-glass-magnifying-search-zoom_113420.png
          var imageSize = new kakao.maps.Size(55, 55) // 마커이미지의 크기입니다
          var imageOption = { offset: new kakao.maps.Point(27, 69) } // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
          var markerImage = new kakao.maps.MarkerImage(
            imageSrc,
            imageSize,
            imageOption
          )
          var content =
            '<div style="text-align: center; color:white;margin-top:10px; padding:2px; border:0px; background-color: #fff;border-radius: 3px; background: coral;">' +
            Name +
            '</div>'
          vm.marker.setImage(markerImage)
          vm.marker.setPosition(coords)
          vm.info.setContent(content)
          vm.info.setPosition(coords)
          vm.info.setMap(Map)
          Map.setCenter(coords)
          if (vm.$store.state.mode === 2) {
            vm.makeOverlay2(mouseEvent, name)
          }
          if (vm.$store.state.mode === 3) {
            vm.makeOverlay3(mouseEvent, name)
          }
          if (vm.$store.state.mode === 4) {
            vm.makeOverlay4(mouseEvent, name)
          }
          if (vm.$store.state.mode === 5) {
            vm.makeOverlay5(mouseEvent, name)
          }
          if (vm.$store.state.mode === 6) {
            vm.makeOverlay6(mouseEvent, name)
          }
          if (vm.$store.state.mode === 7) {
            vm.makeOverlay7(mouseEvent, name)
          }
          if (vm.$store.state.mode === 8) {
            vm.makeOverlay8(mouseEvent, name)
          }
        }
      })
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn'])
  },
  components: {
    condition,
    Detail
  },
  methods: {
    storeAdd () {
      axios.post(
        '/user/addStore',
        {
          email: sessionStorage.getItem('login_user_email'),
          store_name: this.storeName,
          category_large: this.Clarge,
          category_middle: this.Cmiddle,
          category_small: this.Csmall,
          lat: this.$store.state.Coords.lat,
          lot: this.$store.state.Coords.lng
        },
        {
          headers: {
            jwt: this.$store.state.auth.token
          }
        }
      ).then(res => {
        console.log(res)
      })
    },
    getmystore() {
      let list = this.$store.state.auth.mylist
      let posi = []
      for (let index = 0; index < list.length; index++) {
        let position = new kakao.maps.LatLng(list[index].lat, list[index].lot)
        posi.push(position)
      }
      return posi
    },
    eventbus(name) {
      eventBus.$emit('clickmap', name)
    },
    myevent() {
      this.saveMouseEvent(this.ME, 1)
      let name = this.$store.state.modalsearch
      if (this.$store.state.mode === 2) {
        this.makeOverlay2(this.ME, name)
      }
      if (this.$store.state.mode === 3) {
        this.makeOverlay3(this.ME, name)
      }
      if (this.$store.state.mode === 4) {
        this.makeOverlay4(this.ME, name)
      }
      if (this.$store.state.mode === 5) {
        this.makeOverlay5(this.ME, name)
      }
      if (this.$store.state.mode === 6) {
        this.makeOverlay6(this.ME, name)
      }
      if (this.$store.state.mode === 7) {
        this.makeOverlay7(this.ME, name)
      }
      if (this.$store.state.mode === 8) {
        this.makeOverlay8(this.ME, name)
      }
    },
    saveMouseEvent(mouseEvent, flag) {
      // 마우스 커서의 위치를 저장하는 메서드
      if (this.isonececlick === false && flag === 1) {
        // 최초 페이지 로드후 클릭이 일어났지는지 유무를 확인하는 변수
        this.isonececlick = true
      }
      this.ME = mouseEvent
      this.$store.state.Coords.lat = this.ME.latLng.getLat() // 모달에 전달할 xy 좌표
      this.$store.state.Coords.lng = this.ME.latLng.getLng() //
      console.log(null)
      console.log(this.$store.state.Coords.lat)
      console.log(this.$store.state.Coords.lng)
    },
    setSerchkey(name) {
      // 마우스 커서위치의 동이름을 저장하는 메서드
      this.$store.state.modalsearch = name
    },
    add() {
      this.showAdd = !this.showAdd
    },
    changeModal() {
      this.showModal = !this.showModal
    },
    ClickMove() {
      if (this.$store.state.mode === 0) {
        //  각 폴리곤에 마우스 아웃 이벤트 등록
        // vm.points = vm.centroid(points)
        let Name = name
        let Marker = this.marker
        let InfoWindow = this.infowindow
        mapApi.Geo.addressSearch(Name, function(result, status) {
          // 정상적으로 검색이 완료되면
          if (status === kakao.maps.services.Status.OK) {
            console.log(Name)
            var coords = new kakao.maps.LatLng(result[0].y, result[0].x) // 결과값으로 받은 위치를 마커의 위치로 적용
            Marker.setPosition(coords)
            InfoWindow.close()
            InfoWindow.setContent(Name)
            InfoWindow.open(Map, Marker)
            Map.setCenter(coords)
          }
        })
      }
    },
    centroid(points) {
      var i, j, len, p1, p2, f, area, x, y
      area = x = y = 0
      for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
        p1 = points[i]
        p2 = points[j]

        f = p1.y * p2.x - p2.y * p1.x
        x += (p1.x + p2.x) * f
        y += (p1.y + p2.y) * f
        area += f * 3
      }

      return new kakao.maps.LatLng(x / area, y / area)
    },
    panTo() {
      // 지도 중심을 부드럽게 이동시킵니다
      var moveLatLon = new kakao.maps.LatLng(33.45058, 126.574942) // 이동할 위도 경도 위치를 생성합니다
      this.map.panTo(moveLatLon)
    },
    // -- 동이름으로 검색-----------------------------------------------------------------------------
    serch(name) {
      let Ifchange = this.ifchanege
      let Name = this.name
      let Map = this.map
      let Marker = this.marker
      let InfoWindow = this.infowindow
      map.Geo.addressSearch(this.name, function(result, status) {
        // 정상적으로 검색이 완료되면
        if (status === kakao.maps.services.Status.OK) {
          var coords = new kakao.maps.LatLng(result[0].y, result[0].x) // 결과값으로 받은 위치를 마커의 위치로 적용
          Marker.setPosition(coords)
          InfoWindow.close() // 전에 있던 인포위도우 클로즈
          InfoWindow.setContent(Name) //  인포위도우 내용 세팅
          InfoWindow.open(Map, Marker) // 마커위에 인포위도우 열림
          Map.setCenter(coords) // 새로 세팅된 센터 값으로 맵 세팅
        }
      })
    },
    async makeOverlay2(mouseEvent, Name) {
      this.name = Name
      if (this.name == null) return
      // === 요소 삭제했다가 추가 ==
      var header = document.getElementById('horizontalbarChart') // 제거하고자 하는 엘리먼트
      header.parentNode.removeChild(header)
      var node = document.createElement('canvas')
      var para = document.getElementById('graph-info').appendChild(node)
      para.id = 'horizontalbarChart'
      para.style = 'height: 190px; width: 350px;'
      // =======================
      await axios
        .get('/population/getPopulationByTime/' + this.name)
        .then(res => {
          this.result = res.data.pbt
          this.road = this.result.f
          this.point = res.data.point
        })
        .finally(() => {
          var ctx = document
            .getElementById('horizontalbarChart')
            .getContext('2d')
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
                    this.result.j,
                    this.result.k,
                    this.result.l,
                    this.result.m,
                    this.result.n,
                    this.result.o
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
    },
    // ------------------------------------------------
    // 표 만들기 상권 변화 지수
    // ------------------------------------------------
    async makeOverlay3(mouseEvent, Name) {
      this.name = Name
      // === 요소 삭제했다가 추가 ==
      var header = document.getElementById('horizontalbarChart') // 제거하고자 하는 엘리먼트
      header.parentNode.removeChild(header)
      var node = document.createElement('canvas')
      var para = document.getElementById('graph-info').appendChild(node)
      para.id = 'horizontalbarChart'
      para.style = 'height: 190px; width: 350px;'
      // =======================
      axios
        .get('/change/getHistory/' + this.name)
        .then(res => {
          this.result = res.data.cblist
          this.road = this.result[0].d
          this.point = res.data.point
        })
        .finally(() => {
          var ctx = document
            .getElementById('horizontalbarChart')
            .getContext('2d')
          var horizontalbarChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['2014', '2015', '2016', '2017', '2018', '2019'],
              datasets: [
                {
                  label: '운영 영업 개월 평균',
                  backgroundColor: '#74ddf7',
                  data: [
                    this.result[0].g,
                    this.result[1].g,
                    this.result[2].g,
                    this.result[3].g,
                    this.result[4].g,
                    this.result[5].g
                  ]
                },
                {
                  label: '폐업 영업 개월 평균',
                  backgroundColor: '#ff6390',
                  data: [
                    this.result[0].h,
                    this.result[1].h,
                    this.result[2].h,
                    this.result[3].h,
                    this.result[4].h,
                    this.result[5].h
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
                      beginAtZero: true
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
    },
    // -----------------------------------------------
    // 연령별 매출 정보
    // ------------------------------------------------
    async makeOverlay4(mouseEvent, Name) {
      this.name = Name
      // === 요소 삭제했다가 추가 ==
      var header = document.getElementById('horizontalbarChart') // 제거하고자 하는 엘리먼트
      header.parentNode.removeChild(header)
      var node = document.createElement('canvas')
      var para = document.getElementById('graph-info').appendChild(node)
      para.id = 'horizontalbarChart'
      para.style = 'height: 190px; width: 350px;'
      // =======================

      let sumOf10 = 0
      let sumOf20 = 0
      let sumOf30 = 0
      let sumOf40 = 0
      let sumOf50 = 0
      let sumOf60 = 0

      axios
        .get('/sales/' + this.name)
        .then(res => {
          this.result = res.data
          this.road = res.data[0].d
          this.point = res.data.point

          for (let index = 0; index < this.result.length; index++) {
            sumOf10 += Number(this.result[index].z)
            sumOf20 += Number(this.result[index].aa)
            sumOf30 += Number(this.result[index].ab)
            sumOf40 += Number(this.result[index].ac)
            sumOf50 += Number(this.result[index].ad)
            sumOf60 += Number(this.result[index].ae)
          }

          sumOf10 /= 100000000
          sumOf20 /= 100000000
          sumOf30 /= 100000000
          sumOf40 /= 100000000
          sumOf50 /= 100000000
          sumOf60 /= 100000000
        })
        .finally(() => {
          var ctx = document
            .getElementById('horizontalbarChart')
            .getContext('2d')
          var horizontalbarChart = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
              labels: ['10대', '20대', '30대', '40대', '50대', '60대 이상'],
              datasets: [
                {
                  label: '전체',
                  backgroundColor: '#365673',
                  data: [
                    sumOf10.toFixed(2),
                    sumOf20.toFixed(2),
                    sumOf30.toFixed(2),
                    sumOf40.toFixed(2),
                    sumOf50.toFixed(2),
                    sumOf60.toFixed(2)
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
                      beginAtZero: true
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
    },
    // ------------------------------------------------
    // 표 만들기 연령별 유동인구
    // ------------------------------------------------
    async makeOverlay5(mouseEvent, Name) {
      this.name = Name
      // === 요소 삭제했다가 추가 ==
      var header = document.getElementById('horizontalbarChart') // 제거하고자 하는 엘리먼트
      header.parentNode.removeChild(header)
      var node = document.createElement('canvas')
      var para = document.getElementById('graph-info').appendChild(node)
      para.id = 'horizontalbarChart'
      para.style = 'height: 190px; width: 350px;'
      // =======================
      axios
        .get('/population/getPopulationByLocation/' + this.name)
        .then(res => {
          this.result = res.data.pbl
          this.road = this.result.f
          this.point = res.data.point
        })
        .finally(() => {
          var ctx = document
            .getElementById('horizontalbarChart')
            .getContext('2d')
          var horizontalbarChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['10대', '20대', '30대', '40대', '50대', '60대 이상'],
              datasets: [
                {
                  label: '전체',
                  backgroundColor: '#365673',
                  data: [
                    this.result.j,
                    this.result.k,
                    this.result.l,
                    this.result.m,
                    this.result.n,
                    this.result.o
                  ]
                },
                {
                  label: '남자',
                  backgroundColor: '#74ddf7',
                  data: [
                    this.result.p,
                    this.result.q,
                    this.result.r,
                    this.result.s,
                    this.result.t,
                    this.result.u
                  ]
                },
                {
                  label: '여자',
                  backgroundColor: '#ff6390',
                  data: [
                    this.result.v,
                    this.result.w,
                    this.result.x,
                    this.result.y,
                    this.result.z,
                    this.result.aa
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
                      beginAtZero: true
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
    },
    // ------------------------------------------------
    // 표 만들기 요일별 유동인구
    // ------------------------------------------------
    async makeOverlay6(mouseEvent, Name) {
      this.name = Name
      // === 요소 삭제했다가 추가 ==
      var header = document.getElementById('horizontalbarChart') // 제거하고자 하는 엘리먼트
      header.parentNode.removeChild(header)
      var node = document.createElement('canvas')
      var para = document.getElementById('graph-info').appendChild(node)
      para.id = 'horizontalbarChart'
      para.style = 'height: 190px; width: 350px;'
      // =======================
      axios
        .get('/population/getPopulationByTime/' + this.name)
        .then(res => {
          this.result = res.data.pbt
          this.road = this.result.f
          this.point = res.data.point
        })
        .finally(() => {
          var ctx = document
            .getElementById('horizontalbarChart')
            .getContext('2d')
          var horizontalbarChart = new Chart(ctx, {
            type: 'radar',
            data: {
              labels: [
                '월요일',
                '화요일',
                '수요일',
                '목요일',
                '금요일',
                '토요일',
                '일요일'
              ],
              datasets: [
                {
                  label: '정보',
                  fill: false,
                  borderColor: 'orange',
                  data: [
                    this.result.p,
                    this.result.q,
                    this.result.r,
                    this.result.s,
                    this.result.t,
                    this.result.u,
                    this.result.v
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
    },
    // ------------------------------------------------
    // 표 만들기 시간별 매출정보
    // ------------------------------------------------
    async makeOverlay7(mouseEvent, Name) {
      this.name = Name
      // === 요소 삭제했다가 추가 ==
      var header = document.getElementById('horizontalbarChart') // 제거하고자 하는 엘리먼트
      header.parentNode.removeChild(header)
      var node = document.createElement('canvas')
      var para = document.getElementById('graph-info').appendChild(node)
      para.id = 'horizontalbarChart'
      para.style = 'height: 190px; width: 350px;'
      // =======================
      let sum1 = 0
      let sum2 = 0
      let sum3 = 0
      let sum4 = 0
      let sum5 = 0
      let sum6 = 0
      axios
        .get('/sales/' + this.name)
        .then(res => {
          this.result = res.data
          this.road = res.data[0].d
          this.point = res.data.point

          for (let index = 0; index < this.result.length; index++) {
            sum1 += Number(this.result[index].r)
            sum2 += Number(this.result[index].s)
            sum3 += Number(this.result[index].t)
            sum4 += Number(this.result[index].u)
            sum5 += Number(this.result[index].v)
            sum6 += Number(this.result[index].w)
          }

          sum1 /= 100000000
          sum2 /= 100000000
          sum3 /= 100000000
          sum4 /= 100000000
          sum5 /= 100000000
          sum6 /= 100000000
        })
        .finally(() => {
          var ctx = document
            .getElementById('horizontalbarChart')
            .getContext('2d')
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
                  borderColor: 'orange',
                  data: [
                    sum1.toFixed(2),
                    sum2.toFixed(2),
                    sum3.toFixed(2),
                    sum4.toFixed(2),
                    sum5.toFixed(2),
                    sum6.toFixed(2)
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
                      beginAtZero: true
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
    },
    // ------------------------------------------------
    // 표 만들기 요일별 매출 정보
    // ------------------------------------------------
    async makeOverlay8(mouseEvent, Name) {
      this.name = Name
      // === 요소 삭제했다가 추가 ==
      var header = document.getElementById('horizontalbarChart') // 제거하고자 하는 엘리먼트
      header.parentNode.removeChild(header)
      var node = document.createElement('canvas')
      var para = document.getElementById('graph-info').appendChild(node)
      para.id = 'horizontalbarChart'
      para.style = 'height: 190px; width: 350px;'
      // =======================

      let sum1 = 0
      let sum2 = 0
      let sum3 = 0
      let sum4 = 0
      let sum5 = 0
      let sum6 = 0
      let sum7 = 0

      axios
        .get('/sales/' + this.name)
        .then(res => {
          this.result = res.data
          this.road = res.data[0].d
          this.point = res.data.point
          for (let index = 0; index < this.result.length; index++) {
            sum1 += Number(this.result[index].k)
            sum2 += Number(this.result[index].l)
            sum3 += Number(this.result[index].m)
            sum4 += Number(this.result[index].n)
            sum5 += Number(this.result[index].o)
            sum6 += Number(this.result[index].p)
            sum7 += Number(this.result[index].q)
          }

          sum1 /= 100000000
          sum2 /= 100000000
          sum3 /= 100000000
          sum4 /= 100000000
          sum5 /= 100000000
          sum6 /= 100000000
          sum7 /= 100000000
        })
        .finally(() => {
          var ctx = document
            .getElementById('horizontalbarChart')
            .getContext('2d')
          var horizontalbarChart = new Chart(ctx, {
            type: 'polarArea',
            data: {
              labels: [
                '월요일',
                '화요일',
                '수요일',
                '목요일',
                '금요일',
                '토요일',
                '일요일'
              ],
              datasets: [
                {
                  fill: true,
                  data: [
                    sum1.toFixed(2),
                    sum2.toFixed(2),
                    sum3.toFixed(2),
                    sum4.toFixed(2),
                    sum5.toFixed(2),
                    sum6.toFixed(2),
                    sum7.toFixed(2)
                  ],
                  backgroundColor: [
                    '#eb4034',
                    '#ffe373',
                    '#89ff45',
                    '#73ffde',
                    '#5ca0ff',
                    '#d152ff',
                    '#ff63d0'
                  ]
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true
            }
          })
        })
    },
  }
}
</script>
<style scoped lang='scss'>
.map {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  min-width: 50%;
  min-height: 50%;
  z-index: 0;
}
.mapContainer {
  position: absolute;
  top: -25%;
  left: -50%;
  width: 200%;
  height: 125%;
}
.ssearchbox {
  position: fixed;
  z-index: 1;
  top: 100px;
  left: 100px;
}
.a {
  height: 50px;
  width: 380px;
  background: white;
  border: 1px solid coral;
}
input {
  font-size: 18px;
  width: 360px;
  float: left;
  border: 0px;
  outline: none;
}
button {
  color: white;
  width: 70px;
  height: 100%;
  background: coral;
  float: right;
  border: 0px;
  outline: none;
}
.searchBox {
  display: inline-block;
  z-index: 2;
  position: fixed;
  width: 360px;
  height: 180px;
  top: 100px;
  left: 50px;
  border-radius: 3px;
}
.bt {
  display: inline-block;
  z-index: 2;
  position: fixed;
  width: 380px;
  height: 20px;
  top: 396px;
  left: 360px;
  border-radius: 3px;
}
.area {
  width: 30px;
  height: 30px;
  position: absolute;
  background-color: #fff;
  border: 1px solid #888;
  border-radius: 3px;
  font-size: 12px;
  top: -5px;
  left: 50%;
  padding: 2px;
}
:-ms-input-placeholder {
  color: tomato;
}
.ssss {
  width: 460px;
  height: 260px;
  z-index: 2;
  position: fixed;
  top: 400px;
  left: 50px;
  border-radius: 3px;
}
.addbt {
  display: inline-block;
  z-index: 2;
  position: fixed;
  width: 360px;
  height: 40px;
  top: 350px;
  left: 50px;
  border-radius: 3px;
}
.addstore {
  display: inline-block;
  z-index: 2;
  position: fixed;
  width: 360px;
  height: 400px;
  top: 100px;
  left: 450px;
  border-radius: 3px;
  background-color: #fff;
}
.addinput {
  color: tomato;
}
// element.style {
//   background: white;
// }
#graph-info {
  width: 360px !important;
  height: 190px !important;
  background: white !important;
  border-radius: 3px;
}
</style>
