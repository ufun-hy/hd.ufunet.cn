/*
* @Author: 赞木
* @Date:   2022-02-21 16:03:18
* @Last Modified by:   赞木
* @Last Modified time: 2022-02-21 19:45:19
*/
define('initgdmap',['jquery'],function($){
  var initgdmap = {
  	init:function(){
  			var map = new AMap.Map('gdmap',{
	        	resizeEnable: true,
			    expandZoomRange:true,
			    zoom:20,
			    zooms:[3,20],
			    //center: [116.397428, 39.90923]
	        });
	        map.addControl(new AMap.Scale());
		    map.addControl(new AMap.ToolBar());
			map.on('click', function (e) {
			    $('.latlng').val(e.lnglat.lat+'#'+e.lnglat.lng);
			    if (!geocoder) {
			        geocoder = new AMap.Geocoder({
			            city: "全国" //仅浙江范围
			        });
			    }
			    geocoder.getAddress(e.lnglat, function(status, result) {
			        if (status === 'complete' && result.info === 'OK') {
			            $('.address').val(result.regeocode.formattedAddress);
			        }
			    })
			    marker.setPosition(e.lnglat);
			    map.setFitView(marker);
			});
			var geocoder, marker;
			if (!marker) {
			    if($('.latlng').val()!=''){
			    	var latlngArr = $('.latlng').val().split('#');
			        marker = new AMap.Marker({
			            position: new AMap.LngLat(latlngArr[1],latlngArr[0]),
			        });
			        map.add(marker);
			        map.setFitView(marker);
			        geoCode();
			    }else{
			        marker = new AMap.Marker();
			        map.add(marker);
			        geoCode('init');
			    }
			}
			function geoCode(init) {
			    if (!geocoder) {
			        geocoder = new AMap.Geocoder({
			            city: "全国"
			        });
			    }
			    if(init){
			        geocoder.getAddress(map.getCenter(), function(status, result) {
			            if (status === 'complete' && result.info === 'OK') {
			                var address = result.regeocode.addressComponent.city;
			                $('.address').val(address);
			                geocoder.getLocation(address, function (status, result) {
			                    if (status === 'complete' && result.geocodes.length) {
			                        var lnglat = result.geocodes[0].location;
			                        $('.latlng').val(lnglat.lat+'#'+lnglat.lng);
			                        marker.setPosition(lnglat);
			                        map.setFitView(marker);
			                    }
			                });
			            }
			        })
			    } else {
			        var address = $('.address').val();
			        geocoder.getLocation(address, function (status, result) {
			            if (status === 'complete' && result.geocodes.length) {
			                var lnglat = result.geocodes[0].location;
			                $('.latlng').val(lnglat.lat+'#'+lnglat.lng);
			                marker.setPosition(lnglat);
			                map.setFitView(marker);
			            }
			        });
			    }
			};
			$(".searchaddress").on('click',function () {
			     geoCode();
			});
  	},
  };　　　
  return initgdmap;
});