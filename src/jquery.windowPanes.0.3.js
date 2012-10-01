//What this script will do is create fullscreen panes using vars determined and CSS. It has an initial setup on page load, and then a resize function that runs when the browser is resized


(function( $ ) {
	$.fn.windowPanes = function(options) { 
		 
		var settings = $.extend( {
			'transition_speed': 500,
			'easing':'',
			'layout': 'vertical',
			'min_height': 480,
			'min_width': 320,
			'swipe': true,
			'onComplete': function(){},
			'onStart': function(){},
			'firstPane':'default',			
			'lastPane':'default',
			'ajaxLoading':true,
			'slideSuppression':true,
			'navSize':32
		}, options);
		
		//Set vars
		var win_w = $(window).width();
		var win_h = $(window).height();
		var pane_num = 0;
		var cur_pane = 1;
		var anim_running = '';
		
		//If pause_anim flag is true, activate anim_running flag by setting to false
		if(settings.slideSuppression == true){
			anim_running = false;
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
			height: (win_h < settings.min_height) ? settings.min_height+'px' : win_h+'px',
			width: (win_w < settings.min_width) ? settings.min_width+'px' : win_w+'px',
			position:'relative'
		});	
				
		$('.pane_wrap').css({
			position:'relative',
			width:'100%',
			top:'0',
			height:'100%'
		})
		
		$('.pane').each(function(){
			pane_num++;
		})
		
		//Setup the panes
		function position_panes(){
			var num_panes = 0;
			$('.pane').each(function(){
				num_panes++;	
				
				//Set base css styles every pane needs
				if(settings.layout == 'vertical'){
					$(this).css({
						overflow:'hidden',
						width:(win_w < settings.min_width) ? settings.min_width+'px' : win_w+'px',
						height:(win_h < settings.min_height) ? settings.min_height+'px' : win_h+'px',
						position:'relative'
					});
				}else if(settings.layout == 'horizontal'){
					$(this).css({
						overflow:'hidden',
						width:(win_w < settings.min_width) ? settings.min_width+'px' : win_w+'px',
						height:(win_h < settings.min_height) ? settings.min_height+'px' : win_h+'px',
						position:'absolute',
						top:'0',
						left:((num_panes-1)*win_w)+'px'
					});
				}
			});
		}
				
		if(settings.layout == 'horizontal'){
			var w = (win_w < settings.min_width) ? settings.min_width+'px' : win_w;
			$('.pane_wrap').css({
				width:pane_num*w+'px'
			})
		}else{
			var h = (win_h < settings.min_height) ? settings.min_height+'px' : win_h;
			$('.pane_wrap').css({
				height:pane_num*h+'px'
			})
		}
		
		//Finished setup, display wrapper and call onFinish
		if(settings.ajax_loading == true){
			$('.pane_loader').fadeOut(750);
		}
		
		position_panes();
		
		//Generate navigation
		function generate_nav(){					
			$('.window_frame').append("<div class='window_nav'><div class='cur_nav'></div></div>");
			for(i=0; i<pane_num; i++){
				var num = i+1
				$('.window_nav').append("<div class='nav_item' id='nav_"+num+"'></div>")	
			}
			
			size_nav();		
		}	
		
		function size_nav(){
			//Generate based on container width and number of panes
			var nav_w = ($('.window_frame').width()) - 2;
			var nav_h = ($('.window_frame').height()) - 2;
			var item_w = (nav_w / pane_num) - 2;
			var item_h = (nav_h / pane_num) - 2;	
			var nav_push = 0;
			
			//Apply CSS based on orientation
			if(settings.layout == 'vertical'){
				$('.window_nav').css({
					width:settings.navSize,
					height:nav_h,
					position:'absolute',
					top:2,
					right:'2px',
				})
				$('.cur_nav').css({
					height:item_h,
					width:'inherit',
					position:'absolute',
					top:0,
					right:0,
					'z-index':'100'
				})
				$('.nav_item').css({
					height:item_h,
					width:'inherit',
					position:'relative'
				}).each(function(){
					$(this).css({top:nav_push})
					nav_push = nav_push + 2
				})				
			}else if(settings.layout == 'horizontal'){
				$('.window_nav').css({
					height:settings.navSize,
					width:nav_w,
					position:'absolute',
					bottom:2,
					left:'2px',
					clear:'both',
				})
				$('.cur_nav').css({
					height:'inherit',
					width:item_w,
					position:'absolute',
					top:0,
					left:0,
					'z-index':'100'
				})
				$('.nav_item').css({
					height:'inherit',
					width:item_w,
					float:'left',
					position:'relative'
				}).each(function(){
					$(this).css({left:nav_push})
					nav_push = nav_push + 2
				})				
			}
		}
		
		function move_nav(){
			if(settings.layout == 'vertical'){
				//Get nav_item position associated with cur_pane
				var position = $('#nav_'+cur_pane).position()
				$('.cur_nav').animate({
					top:position.top+'px'
				},settings.transition_speed, settings.easing)
			}else if(settings.layout == 'horizontal'){
				//Get nav_item position associated with cur_pane
				var position = $('#nav_'+cur_pane).position()
				$('.cur_nav').animate({
					left:position.left+'px'
				},settings.transition_speed, settings.easing)
			}
		}
		
		generate_nav();
		
		$('.window_frame').show();
		
		if(typeof settings.onComplete === 'function'){
			settings.onComplete.call(this);
		}
						
		//Functions handle next/prev behavior
		function next_pane(onDone){
			if(anim_running == false || anim_running == ''){
				if(settings.layout == 'vertical'){
					if(cur_pane != pane_num){
						cur_pane++
						var offset = (win_h < settings.min_height) ? settings.min_height : win_h;
						anim_running = true;
						//Scroll the pane wrapper to the next slide
						move_nav();
						$('.pane_wrap').animate({
							top:'-'+(cur_pane - 1)*offset+'px',			
						},settings.transition_speed, settings.easing, function(){
							$('body').animate({
								scrollTop:0
							},200)
							if(typeof onDone === 'function' && onDone()){
								onDone();
							}
							anim_running = false;
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
						anim_running = true;
						//Scroll the pane wrapper to the next slide
						move_nav();
						$('.pane_wrap').animate({
							left:'-'+(cur_pane - 1)*offset+'px',			
						},settings.transition_speed, settings.easing, function(){
							if(typeof onDone === 'function' && onDone()){
								onDone();
							}
							anim_running = false;
						})
					}else{
						if(typeof settings.lastPane === 'function' && settings.lastPane()){
							settings.lastPane();
						}
					}
				}
			}
		}
		
		function prev_pane(onDone){
			if(anim_running == false || anim_running == ''){
				if(settings.layout == 'vertical'){
					if(cur_pane != 1){
						cur_pane--
						var offset = (win_h < settings.min_height) ? settings.min_height : win_h;
						anim_running = true;
						//Scroll the pane wrapper to the prev slide
						move_nav();
						$('.pane_wrap').animate({
							top:'-'+(cur_pane - 1)*offset+'px'
						},settings.transition_speed, settings.easing, function(){
							$('body').animate({
								scrollTop:0
							},200)
							if(typeof onDone === 'function' && onDone()){
								onDone();
							}
							anim_running = false;
						})	
					}else{
						if(typeof settings.firstPane === 'function' && settings.firstPane()){
							settings.firstPane();
						}
					}
				}else if(settings.layout == 'horizontal'){
					if(cur_pane != 1){
						cur_pane--
						var offset = (win_w < settings.min_width) ? settings.min_width : win_w;
						anim_running = true;
						//Scroll the pane wrapper to the prev slide
						move_nav();
						$('.pane_wrap').animate({
							left:'-'+(cur_pane - 1)*offset+'px',			
						},settings.transition_speed, settings.easing, function(){
							if(typeof onDone === 'function' && onDone()){
								onDone();
							}
							anim_running = false;
						})	
					}else{
						if(typeof settings.firstPane === 'function' && settings.firstPane()){
							settings.firstPane();
						}
					}
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
				next_pane();	
			})	
			
			$(document).bind('swiperight',function(){
				prev_pane();	
			})
		}
		
		//This sets up our default functions for first and last pane transitions
		if(settings.lastPane == 'default'){
			if(settings.layout == 'vertical'){
				settings.lastPane=function(){
					if(anim_running == false || anim_running == ''){
						anim_running = true;
						var offset = (win_h < settings.min_height) ? settings.min_height : win_h;
						var nudge = ((cur_pane - 1)*offset)+(win_h*.4)+'px';
						move_nav();
						$('.pane_wrap').animate({
							top:'-'+nudge,			
						},350, function(){
							$(this).animate({
								top:'-'+(cur_pane - 1)*offset+'px'
							},350,function(){
								anim_running = false;
							})
						})
					}
				}
			}else if(settings.layout == 'horizontal'){
				settings.lastPane=function(){
					if(anim_running == false || anim_running == ''){
						anim_running = true;
						var offset = (win_w < settings.min_width) ? settings.min_width : win_w;
						var nudge = ((cur_pane - 1)*offset)+(win_w*.4)+'px';
						move_nav();
						$('.pane_wrap').animate({
							left:'-'+nudge,			
						},350, function(){
							$(this).animate({
								left:'-'+(cur_pane - 1)*offset+'px'
							},350,function(){
								anim_running = false;
							})
						})
					}
				}
			}
		}else if(settings.lastPane == 'first'){
			if(settings.layout == 'vertical'){
				settings.lastPane=function(){
					if(anim_running == false || anim_running == ''){
						anim_running = true;
						cur_pane = 1
						move_nav();
						$('.pane_wrap').animate({
							top:'0',			
						},settings.transition_speed, settings.easing,function(){
							anim_running = false;
						})
					}
				}
			}else if(settings.layout == 'horizontal'){
				settings.lastPane=function(){
					if(anim_running == false || anim_running == ''){
						anim_running = true;
						cur_pane = 1
						move_nav();
						$('.pane_wrap').animate({
							left:'0',			
						},settings.transition_speed, settings.easing,function(){
							anim_running = false;
						})
					}
				}
			}
		}else if(settings.lastPane == 'none'){
			settings.lastPane=''
		}
		
		if(settings.firstPane == 'default'){
			if(settings.layout == 'vertical'){
				settings.firstPane=function(){
					if(anim_running == false || anim_running == ''){
						anim_running = true;
						var nudge = (win_h*.4)+'px';
						move_nav();
						$('.pane_wrap').animate({
							top:nudge,			
						},350, function(){
							$(this).animate({
								top:0
							},350,function(){
								anim_running = false;
							})
						})
					}
				}
			}else if(settings.layout == 'horizontal'){
				settings.firstPane=function(){
					if(anim_running == false || anim_running == ''){
						anim_running = true;
						var nudge = (win_w*.4)+'px';
						move_nav();
						$('.pane_wrap').animate({
							left:nudge,			
						},350, function(){
							$(this).animate({
								left:0
							},350,function(){
								anim_running = false;
							})
						})
					}
				}
			}
		}else if(settings.firstPane == 'last'){
			if(settings.layout == 'vertical'){
				settings.firstPane=function(){
					if(anim_running == false || anim_running == ''){
						anim_running = true;
						cur_pane = pane_num;
						var offset = (win_h < settings.min_height) ? settings.min_height : win_h;
						move_nav();
						$('.pane_wrap').animate({
							top:'-'+(cur_pane - 1)*offset+'px',			
						},settings.transition_speed, settings.easing,function(){
							anim_running = false;
						})
					}
				}
			}else if(settings.layout == 'horizontal'){
				settings.firstPane=function(){
					if(anim_running == false || anim_running == ''){
						anim_running = true;
						cur_pane = pane_num
						var offset = (win_w < settings.min_width) ? settings.min_width : win_w;
						move_nav();
						$('.pane_wrap').animate({
							left:'-'+(cur_pane - 1)*offset+'px',			
						},settings.transition_speed, settings.easing,function(){
							anim_running = false;
						})
					}
				}
			}
		}else if(settings.firstPane == 'none'){
			settings.firstPane=''
		}
		
		//This function simply updates our win height/width vars on a resize
		$(window).resize(function(){
			win_w = $(window).width();
			win_h = $(window).height();
			
			$('html, body, .window_frame').css({
				height: (win_h < settings.min_height) ? settings.min_height+'px' : win_h+'px',
				width: (win_w < settings.min_width) ? settings.min_width+'px' : win_w+'px',
			});
			
			position_panes()
			
			//Also need to update our pane_wraps position offset
			if(settings.layout == 'vertical'){
				var offset = (win_h < settings.min_height) ? settings.min_height : win_h;
				var h = (win_h < settings.min_height) ? settings.min_height+'px' : win_h;
				$('.pane_wrap').css({
					top:'-'+(cur_pane - 1)*offset+'px',
					height:pane_num*h+'px'
				})
			}else if(settings.layout == 'horizontal'){
				var offset = (win_w < settings.min_width) ? settings.min_width : win_w;
				var w = (win_w < settings.min_width) ? settings.min_width+'px' : win_w;
				$('.pane_wrap').css({
					left:'-'+(cur_pane - 1)*offset+'px',
					width:pane_num*w+'px'
				})
			}
			
			size_nav();			
		})		
	};	
})( jQuery );

