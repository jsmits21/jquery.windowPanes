//What this script will do is create fullscreen panes using vars determined and CSS. It has an initial setup on page load, and then a resize function that runs when the browser is resized


(function( $ ) {
	$.fn.windowPanes = function(options) { 
	
		//Set vars
		var win_w = $(window).width();
		var win_h = $(window).height();
		var pane_num = 0;
		var cur_pane = 1;
	 
		var settings = $.extend( {
			'transition_speed': 500,
			'easing':'',
			'layout': 'vertical',
			'min_height': 0,
			'min_width': 0,
			'swipe': true,
			'onComplete': function(){},
			'onStart': function(){},
			'firstPane':'',			
			'ajax_loading':true,
			'lastPane':'',
		}, options);
		
		//If lastPane left blank, create default function
		if(settings.lastPane == ''){
			if(settings.layout == 'vertical'){
				settings.lastPane=function(){
					cur_pane = 1
					$('.pane_wrap').animate({
						top:'0',			
					},settings.transition_speed, settings.easing)
				}
			}else if(settings.layout == 'horizontal'){
				settings.lastPane=function(){
					cur_pane = 1
					$('.pane_wrap').animate({
						left:'0',			
					},settings.transition_speed, settings.easing)
				}
			}
		}
				
		//Call onStart
		if(typeof settings.onStart === 'function'){
			settings.onStart.call(this);
		}	
		
		//If ajax is true, create ajax element and show it
		if(settings.ajax_loading == true){
			$('body').append("<div class='pane_loader'></div>");
		}
		
		//Create additional HTML and apply initial CSS for main page elements
		var frame_html = $('.window_frame').html();
		$('.window_frame').html("<div class='pane_wrap'>"+frame_html+"</div>")
		$('.pane_wrap').children(':first').addClass('first_pane')
		$('.pane_wrap').children(':last').addClass('last_pane');
		
		if(settings.layout == 'vertical'){
			$('.pane_wrap').addClass('vertical_nav');
		}else if(settings.layout == 'horizontal'){
			$('.pane_wrap').addClass('horizontal_nav');
		}
		
		$('html, body, .window_frame').css({
			margin:0,
			padding:0,
			height: '100%',
			'min-height':'100%'
		});
		
		$('.pane_window').css({
			overflow:'scroll',
			'min-height':settings.min_height,
			'min-width':settings.min_width
		});
		
		$('.pane_wrap').css({
			position:'relative',
			width:'100%',
			top:'0'
		})
		
		//Setup the panes
		$('.pane').each(function(){
			pane_num++;			
			
			//Set base css styles every pane needs
			if(settings.layout == 'vertical'){
				$(this).css({
					width:'100%',
					height:(win_h < settings.min_height) ? min_height+'px' : win_h+'px',
					position:'relative'
				});
			}else if(settings.layout == 'horizontal'){
				$(this).css({
					width:'100%',
					height:(win_h < settings.min_height) ? min_height+'px' : win_h+'px',
					position:'absolute',
					top:'0',
					left:((pane_num-1)*win_w)+'px'
				});
			}
		});
		
		//Finished setup, display wrapper and call onFinish
		if(settings.ajax_loading == true){
			$('.pane_loader').hide();
		}		
		
		$('.window_frame').show();
		
		if(typeof settings.onComplete === 'function'){
			settings.onComplete.call(this);
		}
						
		//Functions handle next/prev behavior
		function next_pane(onDone){
			if(settings.layout == 'vertical'){
				if(cur_pane != pane_num){
					cur_pane++
					var offset = (win_h < settings.min_height) ? settings.min_height : win_h;
					//Scroll the pane wrapper to the next slide
					$('.pane_wrap').animate({
						top:'-'+(cur_pane - 1)*offset+'px',			
					},settings.transition_speed, settings.easing, function(){
						$('body').animate({
							scrollTop:0
						},200)
						if(typeof onDone === 'function' && onDone()){
							onDone();
						}
					})
				}else{
					if(typeof settings.lastPane === 'function' && settings.lastPane()){
						settings.lastPane();
					}
				}
			}else if(settings.layout == 'horizontal'){
				if(cur_pane != pane_num){
					cur_pane++
					var offset = (win_w < settings.min_width) ? settings.min_width : win_w;
					//Scroll the pane wrapper to the next slide
					$('.pane_wrap').animate({
						left:'-'+(cur_pane - 1)*offset+'px',			
					},settings.transition_speed, settings.easing, function(){
						if(typeof onDone === 'function' && onDone()){
							onDone();
						}
					})
				}else{
					if(typeof settings.lastPane === 'function' && settings.lastPane()){
						settings.lastPane();
					}
				}
			}
		}
		
		function prev_pane(onDone){
			if(settings.layout == 'vertical'){
				if(cur_pane != 1){
					cur_pane--
					var offset = (win_h < settings.min_height) ? settings.min_height : win_h;
					//Scroll the pane wrapper to the prev slide
					$('.pane_wrap').animate({
						top:'-'+(cur_pane - 1)*offset+'px'
					},settings.transition_speed, settings.easing, function(){
						$('body').animate({
							scrollTop:0
						},200)
						if(typeof onDone === 'function' && onDone()){
							onDone();
						}
					})	
				}else{
					//First pane don't run	
				}
			}else if(settings.layout == 'horizontal'){
				if(cur_pane != 1){
					cur_pane--
					var offset = (win_w < settings.min_width) ? settings.min_width : win_w;
					//Scroll the pane wrapper to the prev slide
					$('.pane_wrap').animate({
						left:'-'+(cur_pane - 1)*offset+'px',			
					},settings.transition_speed, settings.easing, function(){
						if(typeof onDone === 'function' && onDone()){
							onDone();
						}
					})	
				}else{
					//First pane don't run	
				}
			}
		}
		
		$('.next_pane').bind('click', function(){
			next_pane();
		})
		
		//This function will handle a prev pane btn press
		$('.prev_pane').bind('click', function(){
			prev_pane();
		})
		
		//Handle swipes for vertical or horizontal layout
		if(settings.layout == 'vertical' && settings.swipe == true){
			$(document).bind('swipedown',function(){
				prev_pane();	
			})	
			
			$(document).bind('swipeup',function(){
				next_pane();	
			})
		}else if(settings.layout == 'horizontal' && settings.swipe == true){
			$(document).bind('swipeleft',function(){
				prev_pane();	
			})	
			
			$(document).bind('swiperight',function(){
				next_pane();	
			})
		}		
		
		//This function simply updates our win height/width vars on a resize
		$(window).resize(function(){
			win_w = $(window).width();
			win_h = $(window).height();
			
			var offset = (win_h < settings.min_height) ? settings.min_height : win_h;
			
			$('.pane_wrap').css({top:'-'+(cur_pane - 1)*offset+'px'})
			
			$('.pane').each(function(){
				$(this).css({
					height:(win_h < settings.min_height) ? settings.min_height+'px' : win_h+'px',
				})
			});
		})
		
		
		
	};	
})( jQuery );

