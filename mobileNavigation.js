// mobile menu init
function initMobileNav() {
	jQuery('body').mobileNav({
		menuActiveClass: 'drop-nav-active',
		menuOpener: '.opener',
		onHide: function() {
			var nav = jQuery('.nav .list-holder');
			var dropAPI = nav.data('MobileNavigation');

			if (dropAPI) {
				dropAPI.hideAllDropdowns(true);
			}
		}
	});
	
	jQuery('body').mobileNav({
		menuActiveClass: 'active-filter',
		menuOpener: '.open-filter'
	});
}

// Mobile Navigation init
function initMobileNavigation() {
	var mobileNav = jQuery('.nav .list-holder');
	var filterNav = jQuery('.filters-holder');

	ResponsiveHelper.addRange({
		'..1023': {
			on: function() {
				mobileNav.mobileNavigation({
					slider: '.nav-list',
					listItems: 'li',
					opener: '>.drop-link',
					dropdown: '.sub-drop',
					btnBack: '<a href="#" class="close"></a>',
					btnBackPrefix: '',
					activeClass: 'active-item',
					hasDropClass: 'has-drop',
					animSpeed: 500
				});
			}
		},
		'1024..': {
			on: function() {
				mobileNav.each(function() {
					var nav = jQuery(this);
					if (nav.data('MobileNavigation')) {
						nav.data('MobileNavigation').destroy();
					}
				});
			}
		}
	});
	
	var header = jQuery('#header');
	var activeClass = 'opened-drop';

	jQuery('.home-page .nav-list > li.has-drop-down').on('mouseenter touchstart', function() {
		header.addClass(activeClass);
	}).on('mouseleave', function() {
		header.removeClass(activeClass);
	});
}

/*
 * jQuery Mobile Menu plugin
 */
;(function($) {
    function MobileNavigation(options) {
        this.options = $.extend({
            slider: '#nav > ul',
            listItems: 'li',
            opener: '> a',
            dropdown: '.drop',
            btnBack: '<a href="#" class="btn-back"></a>',
            btnBackPrefix: '< ',
            activeClass: 'active-item',
            activeDropClass: 'drop-active',
            subActiveDropClass: 'sub-drop-active',
            hasDropClass: 'has-drop',
            animSpeed: 500
        }, options);
        this.init();
    }
    MobileNavigation.prototype = {
        init: function() {
            if (this.options.holder) {
                this.findElements();
                this.attachEvents();
                this.makeCallback('onInit', this);
            }
        },
        findElements: function() {
            this.win = $(window);
            this.holder = $(this.options.holder);
            this.dropdown = this.holder.closest('.drop');
            this.slider = this.holder.find(this.options.slider);
            this.listItems = this.slider.find(this.options.listItems).has(this.options.dropdown).addClass(this.options.hasDropClass);
            this.allSubDrops = this.holder.find('.sub-drop');
            this.itemLinks = $();
            this.allButtons = $();
            this.levelCounter = 0;
        },
        attachEvents: function() {
           // add handler
           var self = this;

           this.listItems.each(function() {
               var item = $(this);
               var opener = item.find(self.options.opener);
               var drop = item.find('>' + self.options.dropdown);
               var btnBack = $(self.options.btnBack);
               var backText = self.options.btnBackPrefix + opener.text();

               btnBack.text(backText).prependTo(drop);
               self.itemLinks = self.itemLinks.add(opener);
               self.allButtons = self.allButtons.add(btnBack);

               opener.data({
                   item: item,
                   btnBack: btnBack
               });
           });

           this.itemLinks.each(function() {
               var currOpener = $(this);
               var btnBack = currOpener.data('btnBack');
               

               if (btnBack.length) {
                   btnBack.on('click', function(e) {
                       e.preventDefault();
                       self.hideDrop(currOpener.data('item'));
                       
                       var $topParentItem = currOpener.parents('.active-item').last();
                       var itemCount = $topParentItem.data('count');
                       if (itemCount === 1) {
                           self.hideDrop($topParentItem);
                       }
                   });
               }
               
               
           });

           this.clickHandler = function(e) {
               e.preventDefault();
               var $currentItem = $(e.currentTarget).data('item');
               var itemCount = $currentItem.data('count');
               var $secondSubmenu;
               self.showDrop($currentItem);
               
               if (itemCount === 1) {
                   $secondSubmenu = $currentItem.find('.tab-link .drop-link').data('item')
                   self.showDrop($secondSubmenu);
               }
               
           };

           this.itemLinks.on('click', this.clickHandler);

           this.onPageResize = function() {
               self.resizeHandler();
           };
           this.resizeHandler();
           this.win.on('resize orientationchange load', this.onPageResize);
       },
       slideNav: function(options) {
           var self = this;

           this.slider.stop().animate({
               marginLeft: -this.levelCounter * this.navWidth
           }, (options && options.noAnim) ? 0 : this.options.animSpeed, function() {
               if (options && options.complete) {
                   options.complete();
               }
           });

           if (options && options.drop) {
               setTimeout(function() {
                   self.holder.animate({
                       height: options.drop.outerHeight()
                   }, self.options.animSpeed);
               }, 10);
           }
       },
       showDrop: function(item) {
           var self = this;

           this.levelCounter++;
           
           this.slideNav({
               drop: item.find(self.options.dropdown)
           });
           
           item.siblings().removeClass(this.options.activeClass);
           item.addClass(this.options.activeClass);
           this.allSubDrops.removeClass(this.options.subActiveDropClass);
           item.find(this.options.dropdown).addClass(this.options.subActiveDropClass);
           
           if (this.dropdown.length) {
               this.dropdown.addClass(this.options.activeDropClass);
           }
       },
       hideDrop: function(item) {
           var self = this;

           this.levelCounter--;
           
           this.slideNav({
               drop: this.levelCounter === 0 ? this.slider : item.closest(self.options.dropdown),
               complete: function() {
                   item.removeClass(self.options.activeClass);
                   self.allSubDrops.removeClass(self.options.subActiveDropClass);
                   
                   if (self.dropdown.length) {
                       self.dropdown.removeClass(self.options.activeDropClass);
                   }
               }
           });
           
       },
       hideAllDropdowns: function() {
           var self = this;

           this.levelCounter = 0;
           
           this.slideNav({
               noAnim: true,
               complete: function() {
                   self.listItems.removeClass(self.options.activeClass);
                   self.holder.removeAttr('style');
                   self.allSubDrops.removeClass(self.options.subActiveDropClass);
                   
                   if (self.dropdown.length) {
                       self.dropdown.removeClass(self.options.activeDropClass);
                   }
               }
           });
       },
       resizeHandler: function() {
           this.navWidth = this.holder.outerWidth(true);
           
           this.slideNav({
               noAnim: true
           });
       },
       destroy: function() {
           var self = this;

           this.win.off('resize orientationchange load', this.onPageResize);
           this.itemLinks.off('click', this.clickHandler);
           
           setTimeout(function() {
               self.slider.stop().removeAttr('style');
           }, 10);
           
           this.listItems.removeClass(this.options.activeClass);
           this.allButtons.remove();
           this.holder.removeAttr('style').removeData('MobileNavigation');
       },
       makeCallback: function(name) {
           if (typeof this.options[name] === 'function') {
               var args = Array.prototype.slice.call(arguments);
               args.shift();
               this.options[name].apply(this, args);
           }
       }
   };

   // jQuery plugin interface
   $.fn.mobileNavigation = function(opt) {
       return this.each(function() {
           jQuery(this).data('MobileNavigation', new MobileNavigation($.extend(opt, {
               holder: this
           })));
       });
   };
}(jQuery));

/*
* Simple Mobile Navigation
*/
;(function($) {
	function MobileNav(options) {
		this.options = $.extend({
			container: null,
			hideOnClickOutside: false,
			menuActiveClass: 'nav-active',
			menuOpener: '.nav-opener',
			menuDrop: '.nav-drop',
			toggleEvent: 'click',
			outsideClickEvent: 'click touchstart pointerdown MSPointerDown',
			onShow: function() {
				//
			},
			onHide: function() {
				//
			}
		}, options);
		this.initStructure();
		this.attachEvents();
	}
	MobileNav.prototype = {
		initStructure: function() {
			this.page = $('html');
			this.container = $(this.options.container);
			this.opener = this.container.find(this.options.menuOpener);
			this.drop = this.container.find(this.options.menuDrop);
		},
		attachEvents: function() {
			var self = this;

			if(activateResizeHandler) {
				activateResizeHandler();
				activateResizeHandler = null;
			}

			this.outsideClickHandler = function(e) {
				if(self.isOpened()) {
					var target = $(e.target);
					if(!target.closest(self.opener).length && !target.closest(self.drop).length) {
						self.hide();
					}
				}
			};

			this.openerClickHandler = function(e) {
				e.preventDefault();
				self.toggle();
			};

			this.opener.on(this.options.toggleEvent, this.openerClickHandler);
		},
		isOpened: function() {
			return this.container.hasClass(this.options.menuActiveClass);
		},
		show: function() {
			this.container.addClass(this.options.menuActiveClass);
			if(this.options.hideOnClickOutside) {
				this.page.on(this.options.outsideClickEvent, this.outsideClickHandler);
			}
			this.options.onShow(this);
		},
		hide: function() {
			this.container.removeClass(this.options.menuActiveClass);
			if(this.options.hideOnClickOutside) {
				this.page.off(this.options.outsideClickEvent, this.outsideClickHandler);
			}
			this.options.onHide(this);
		},
		toggle: function() {
			if(this.isOpened()) {
				this.hide();
			} else {
				this.show();
			}
		},
		destroy: function() {
			this.container.removeClass(this.options.menuActiveClass);
			this.opener.off(this.options.toggleEvent, this.clickHandler);
			this.page.off(this.options.outsideClickEvent, this.outsideClickHandler);
		}
	};

	var activateResizeHandler = function() {
		var win = $(window),
		doc = $('html'),
		resizeClass = 'resize-active',
		flag, timer;
		var removeClassHandler = function() {
			flag = false;
			doc.removeClass(resizeClass);
		};
		var resizeHandler = function() {
			if(!flag) {
				flag = true;
				doc.addClass(resizeClass);
			}
			clearTimeout(timer);
			timer = setTimeout(removeClassHandler, 500);
		};
		win.on('resize orientationchange', resizeHandler);
	};

	$.fn.mobileNav = function(options) {
		return this.each(function() {
			var params = $.extend({}, options, {container: this}),
			instance = new MobileNav(params);
			$.data(this, 'MobileNav', instance);
		});
	};
}(jQuery));



// page init
jQuery(function() {
	initMobileNav();
	initMobileNavigation();
});
