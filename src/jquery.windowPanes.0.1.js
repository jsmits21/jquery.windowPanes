//What this script will do is create fullscreen panes using vars determined and CSS. It has an initial setup on page load, and then a resize function that runs when the browser is resized


(function( $ ) {
	$.fn.windowPanes = function(options) {  
		var settings = $.extend( {
			'transition_speed': 500,
			'easing':0,
			'layout': 'vertical',
			'min_height': 0,
			'min_width': 0,
			'swipe': true,
			'onComplete': function(){},
			'onStart': function(){},
			'ajax_loading':true
		}, options);
		
		//Call onStart
		if(typeof settings.onStart === 'function'){
			settings.onStart.call(this);
		}
		
		//Set vars
		var win_w = $(window).width();
		var win_h = $(window).height();
		var pane_num = 0;
		var cur_pane = 1;
		var easing = '';
		
		//Force through required initial CSS for main page elements
		$('html, body, .pane_window').css({
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
			
			//Give the panes unique ids
			$(this).attr('id','pane_'+pane_num);
			
			//Set base css styles every pane needs
			$(this).css({
				width:'100%',
				height:(win_h < settings.min_height) ? min_height+'px' : win_h+'px',
				position:'relative'
			});	
		});
		
		//Finished setup, display wrapper and call onFinish
		$('.pane_window').show();
		if(typeof settings.onComplete === 'function'){
			settings.onComplete.call(this);
		}
		
		//Functions handle next/prev behavior
		function next_pane(onDone){
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
				//TODO Back to top animation
				
			}
		}
		
		function prev_pane(onDone){
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
		}
		
		$('.next_pane').bind('click', function(){
			next_pane();
		})
		
		//This function will handle a prev pane btn press
		$('.prev_pane').bind('click', function(){
			prev_pane();
		})
		
		//Handle swipes for vertical layout
		if(settings.layout == 'vertical' && settings.swipe == true){
			//If swipe enabled, handle swipes
			$(document).bind('swipedown',function(){
				prev_pane();	
			})	
			
			$(document).bind('swipeup',function(){
				next_pane();	
			})
		}
		
		//Handle swipes for horizontal layout
		if(settings.layout == 'horizontal' && settings.swipe == true){
			//If swipe enabled, handle swipes
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
			console.log(win_h)
			offset_amt = parseInt(win_h * drag_tolerance);
			
			var offset = (win_h < min_height) ? min_height : win_h;
			
			$('.pane_wrap').css({top:'-'+(cur_pane - 1)*offset+'px'})
			
			$('.pane').each(function(){
				$(this).css({
					height:(win_h < min_height) ? min_height+'px' : win_h+'px',
				})
			});
		})
		
		
		
	};	
})( jQuery );

