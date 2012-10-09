//What this script will do is create fullscreen panes using vars determined and CSS. It has an initial setup on page load, and then a resize function that runs when the browser is resized


(function( $ ) {
	$.fn.windowPanes = function(options) { 
		 
		var settings = $.extend( {
			'transitionSpeed': 1250,
			'easing':'',
			'layout': 'vertical',
			'min_height': 0,
			'min_width': 0,
			'swipe': true,
			'onComplete': function(){},
			'onStart': function(){},
			'firstPane':'default',			
			'lastPane':'default',
			'ajaxLoading':true,
			'slideSuppression':true,
			'navSize':32,
			'hideContent':true,
			'previewDelay':500,
			'navFade':3500,
		}, options);
		
		//Set vars
		var win_w = $('.window_frame').width()
		var win_h = $('.window_frame').height()
		var pane_num = 0
		var cur_pane = 1
		var anim_running = ''
		var nav_click = 0;
		var clicked_nav = ''
		var nav_fadeTimer = ''
		
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
		
		if(settings.layout == 'vertical'){
			$('.pane_wrap').addClass('vertical_nav');
		}else if(settings.layout == 'horizontal'){
			$('.pane_wrap').addClass('horizontal_nav');
		}
		
		$('html, body, .window_frame').css({
			position:'relative'
		});	
		
		$('html, body').css({
			margin:0,
			padding:0,
			height: '100%',
			width: '100%',
		})
				
		$('.pane_wrap').css({
			position:'relative',
			width:'100%',
			top:'0',
			height:'100%'
		})
		
		$('.pane').each(function(){
			pane_num++;
			$(this).addClass('pane_'+pane_num);
		})
		
		$('.pane_wrap').children(':first').addClass('first_pane')
		$('.pane_wrap').children(':last').addClass('last_pane');
		
		//Setup the panes
		function position_panes(){
			var num_panes = 0;
			$('.pane').each(function(){
				num_panes++;	
				$(this).attr("data-pane", num_panes)
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
		
		//Hide all but first two panes
		
		//Finished setup, display wrapper and call onFinish
		if(settings.ajax_loading == true){
			$('.pane_loader').fadeOut(750);
		}
		
		position_panes();
		
		//Generate navigation
		function generate_nav(){					
			$('.window_frame').append("<div class='window_nav'><div class='cur_nav'></div><div class='nav_preview' style=''></div></div>");
			for(i=0; i<pane_num; i++){
				var num = i+1
				var t = escape($("#pane_"+num).data('title'))
				$('.window_nav').append("<div class='nav_item' id='nav_"+num+"' data-pane='"+num+"' data-title='"+t+"'></div>");	
			}
			
			//Set nav_preview default styles
			var n_w = $('.nav_preview').width()
			var n_h = $('.nav_preview').height()
			
			$('.nav_preview').css({
				position:'absolute',
				opacity:'0'
			})
			
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
				$('.nav_preview').css({
					
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
				},settings.transitionSpeed, settings.easing)
			}else if(settings.layout == 'horizontal'){
				//Get nav_item position associated with cur_pane
				var position = $('#nav_'+cur_pane).position()
				$('.cur_nav').animate({
					left:position.left+'px'
				},settings.transitionSpeed, settings.easing)
			}
		}
		
		generate_nav();
		
		//Hide all but first two panes content. Panes will be shown or hid depending on the user navigating to and from pane. This will offer faster animation scrolling as only two panes worth of content will be animating.
		$('.pane').each(function(){
			if($(this).attr('data-pane')>1 && settings.hideContent == true){
				$(this).children().hide();	
			}
		})
		
		$('.window_frame').show();
				
		if(typeof settings.onComplete === 'function'){
			settings.onComplete.call(this);
		}
		
		//Function handles nav item click
		//TODO now that we hide panes to save on animation resources, lets attempt making this transition a fade effect where the pane fades out, adjusts to new positions, fades back in. We could accomplish this with a clone as well.
		$('.nav_item').click(function(){
			if(nav_click == 0){
				nav_click = 1;
				clicked_nav = $(this).attr('id');
				var position = $(this).position().top + ($(this).height() / 6);
				var title = unescape($(this).data('title'))
				$('.nav_preview').html(title).css({
					top:position+'px'
				}).animate({opacity:1},250, function(){
					var $obj = $(this)
					nav_fadeTimer = setTimeout(function(obj){
						nav_click = 0;
						$obj.animate({opacity:0}, 250)
					},settings.navFade)
				})
			}else if (nav_click == 1){
				if($(this).attr('id') == clicked_nav){
					nav_click = 0;
					$('.nav_preview').animate({opacity:0},250)
					var temp_pane = cur_pane;		
					cur_pane = $(this).attr('data-pane');
					if(anim_running == false || anim_running == ''){
						if(settings.layout == 'vertical'){
							anim_running = true;
							if(settings.hideContent == true){$('.pane_'+cur_pane).children().show()}
							var offset = (win_h < settings.min_height) ? settings.min_height : win_h;
							move_nav();
							$('.pane_wrap').animate({
								top:'-'+(cur_pane - 1)*offset+'px',			
							},settings.transitionSpeed, settings.easing, function(){
								$('body').animate({
									scrollTop:0
								},200)
								if(settings.hideContent == true){$('.pane_'+temp_pane).children().hide()}
								anim_running = false;
							})
						}else{
							anim_running = true;
							if(settings.hideContent == true){$('.pane_'+cur_pane).children().show()}
							var offset = (win_w < settings.min_width) ? settings.min_width : win_w;
							move_nav();
							$('.pane_wrap').animate({
								left:'-'+(cur_pane - 1)*offset+'px',			
							},settings.transitionSpeed, settings.easing, function(){
								if(settings.hideContent == true){$('.pane_'+temp_pane).children().hide()}
								anim_running = false;
							})
						}
					}
				}else{					
					clearTimeout(nav_fadeTimer);
					nav_click = 1;
					clicked_nav = $(this).attr('id');
					var position = $(this).position().top + ($(this).height() / 6);
					var title = unescape($(this).data('title'))
					$('.nav_preview').animate({opacity:0}, 250, function(){
						$(this).html(title).css({
							top:position+'px'
						}).animate({opacity:1},250, function(){
							var $obj = $(this)
							nav_fadeTimer = setTimeout(function(obj){
								nav_click = 0;
								$obj.animate({opacity:0}, 250)
							},settings.navFade)
						})
					})
				}
			}
		});		
						
		//Functions handle next/prev behavior
		function next_pane(onDone){
			if(anim_running == false || anim_running == ''){
				if(settings.layout == 'vertical'){
					if(cur_pane != pane_num){
						cur_pane++
						if(settings.hideContent == true){$('.pane_'+cur_pane).children().show()}
						var offset = (win_h < settings.min_height) ? settings.min_height : win_h;
						anim_running = true;
						//Scroll the pane wrapper to the next slide
						move_nav();
						$('.pane_wrap').animate({
							top:'-'+(cur_pane - 1)*offset+'px',			
						},settings.transitionSpeed, settings.easing, function(){
							$('body').animate({
								scrollTop:0
							},200)
							if(typeof onDone === 'function' && onDone()){
								onDone();
							}
							if(settings.hideContent == true){$('.pane_'+(cur_pane-1)).children().hide()}
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
						if(settings.hideContent == true){$('.pane_'+cur_pane).children().show()}
						var offset = (win_w < settings.min_width) ? settings.min_width : win_w;
						anim_running = true;
						//Scroll the pane wrapper to the next slide
						move_nav();
						$('.pane_wrap').animate({
							left:'-'+(cur_pane - 1)*offset+'px',			
						},settings.transitionSpeed, settings.easing, function(){
							if(typeof onDone === 'function' && onDone()){
								onDone();
							}
							if(settings.hideContent == true){$('.pane_'+(cur_pane-1)).children().hide()}
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
						if(settings.hideContent == true){$('.pane_'+cur_pane).children().show()}
						var offset = (win_h < settings.min_height) ? settings.min_height : win_h;
						anim_running = true;
						//Scroll the pane wrapper to the prev slide
						move_nav();
						$('.pane_wrap').animate({
							top:'-'+(cur_pane - 1)*offset+'px'
						},settings.transitionSpeed, settings.easing, function(){
							$('body').animate({
								scrollTop:0
							},200)
							if(typeof onDone === 'function' && onDone()){
								onDone();
							}
							if(settings.hideContent == true){$('.pane_'+(cur_pane+1)).children().hide()}
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
						if(settings.hideContent == true){$('.pane_'+cur_pane).children().show()}
						var offset = (win_w < settings.min_width) ? settings.min_width : win_w;
						anim_running = true;
						//Scroll the pane wrapper to the prev slide
						move_nav();
						$('.pane_wrap').animate({
							left:'-'+(cur_pane - 1)*offset+'px',			
						},settings.transitionSpeed, settings.easing, function(){
							if(typeof onDone === 'function' && onDone()){
								onDone();
							}
							if(settings.hideContent == true){$('.pane_'+(cur_pane+1)).children().hide()}
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
			$('.window_frame').bind('swipedown',function(){
				prev_pane();	
			})	
			
			$('.window_frame').bind('swipeup',function(){
				next_pane();	
			})
		}else if(settings.layout == 'horizontal' && settings.swipe == true){
			$('.window_frame').bind('swipeleft',function(){
				next_pane();	
			})	
			
			$('.window_frame').bind('swiperight',function(){
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
						var nudge = ((cur_pane - 1)*offset)+(win_h*.3)+'px';
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
						var nudge = ((cur_pane - 1)*offset)+(win_w*.3)+'px';
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
						},settings.transitionSpeed, settings.easing,function(){
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
						},settings.transitionSpeed, settings.easing,function(){
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
						var nudge = (win_h*.3)+'px';
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
						var nudge = (win_w*.3)+'px';
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
						},settings.transitionSpeed, settings.easing,function(){
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
						},settings.transitionSpeed, settings.easing,function(){
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
			win_w = $('.window_frame').width();
			win_h = $('.window_frame').height();
			
			$('.pane').each(function(){
				if(settings.layout == 'vertical'){
					$(this).css({
						width:(win_w < settings.min_width) ? settings.min_width+'px' : win_w+'px',
						height:(win_h < settings.min_height) ? settings.min_height+'px' : win_h+'px',
					});
				}else if(settings.layout == 'horizontal'){
					$(this).css({
						width:(win_w < settings.min_width) ? settings.min_width+'px' : win_w+'px',
						height:(win_h < settings.min_height) ? settings.min_height+'px' : win_h+'px',
					});
				}
			});
			
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
			//Readjust navs current slide position
			var position = $('#nav_'+cur_pane).position()
			$('.cur_nav').css({top:position.top+'px'})
		})
	};		
})( jQuery );

