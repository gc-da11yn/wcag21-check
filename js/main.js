// A $( document ).ready() block.
$(document).ready(function () {
    $.getJSON("js/json/nav.json", function (data) {
        Nav.init({
            "data": data,
            $el: $(".main-nav").eq(0)
        });
        Nav.build($("#main_menu"));
        Nav.firstPage();

    });
//    $("main").attr("aria-live", "assertive"); this is broken.

});

var initialNavigation = true;

/* **********************************************
 * * NAV
 * *********************************************/
const Nav = {
    init: function (options) {
        this.pages = [];
        this.pageList = []

        //create the pages
        this.createPages(options.data);
        this.$el = options.$el
        this.currentPage = null;

    },

    createPages: function (data) {
        let newPage;
        let index = 0;
        for (let key in data) {
            newPage = new Page(data[key], this, index);
            this.pages[key] = newPage;
            this.pageList[this.pageList.length] = newPage;
            index++;
        }

    },
    build: function ($location) {
        for (let i = 0; i < this.pageList.length; i++) {
            this.pageList[i].addToDom($location);
        }

        //create dropdown
        this.initDropdown();
        this.initBacknext();

    },
    initDropdown: function () {
        let that = this;
        let $link = this.$el.children("h2").children("button");
        let $list = this.$el.children("ul");
        this.$el.children("ul").find("div").attr("tabindex", "-1");
        //label for dropdown
        $link.attr("aria-label", "Menu. Press Enter to open, then Down to navigate");
        $link.attr("aria-haspopup", "true");
        $link.attr("aria-controls", "main_menu");
        $link.attr("aria-expanded", "false");
        //dropdown aria
        $list.attr("aria-hidden", "true");
        this.hideMenu();
        //set the click event
        this.setEvents();

    },
    initBacknext: function () {
        let that = this;
        $(".backnext").find("a.prev").click(function () {
            initialNavigation = false;
            that.prev();
            return false;
        });
        $(".backnext").find("a.next").click(function () {
            initialNavigation = false;
            that.next();
            return false;
        });
        $(".backnext").find("a").attr("aria-controls", "dynamic_content");

    },
    setPageof: function () {
        let pageIndex = this.currentPage.index + 1;
        let pageNb = this.pageList.length;
        let deOrOf = $("html").attr("lang") === "fr" ? " de " : " of ";
        let pageOfTxt = pageIndex + deOrOf + pageNb;
        $(".pageof").html(pageOfTxt);
    },
    // --------------------------loading ---------------------------
    firstPage: function () {
        this.loadPage(this.pageList[0]);
    },
    loadPage: function (pageObj) {
        let that = this;
        this.currentPage = pageObj;
        let $main = $("#dynamic_content");

        $main.fadeOut(function () {
            let filename = "./content/" + pageObj.page + "_" + $("html").attr("lang") + ".html"
            $.get(filename, function (data) {
                    $main.html(data)
                    that.isLoaded();
                    document.title = pageObj.title;
                })
                .fail(function () {
                    that.loadFailed(pageObj);
                    document.title = pageObj.title;
                })
                .always(function () {
                    $main.fadeIn();
                    that.manageFocus();
                });
        });

        this.setPageof();
        this.disableBackNext();
    },
    manageFocus: function() {
        if(!initialNavigation) {
            let mainheading = $("#dynamic_content").find("#pageTitle");
            mainheading.focus();
        }
    },
    next: function () {
        let lastIndex = this.pageList.length - 1;
        
        let $main = $("#dynamic_content");
        if (this.currentPage.index !== lastIndex) {
            this.loadPage(this.pageList[this.currentPage.index + 1]);
            // let mainheading = $main.find("#pageTitle");
            // mainheading.focus();
        }

    },
    prev: function () {
        let $main = $("#dynamic_content");
        if (this.currentPage.index !== 0) {
            this.loadPage(this.pageList[this.currentPage.index - 1]);
            // let mainheading = $main.find("#pageTitle");
            // mainheading.focus();
            // $main.focus();
        }
    },
    disableBackNext: function () {
        let lastIndex = this.pageList.length - 1;
        let $prev = $(".prev");
        let $next = $(".next");
        let $both = $(".prev, .next");

        $both.removeClass("disabled");
        $both.attr("aria-disabled", false);
        $both.removeAttr("tabindex");

        if (this.currentPage.index === 0) {
            //disable prev
            $prev.addClass("disabled");
            $prev.attr("aria-disabled", true);
            $prev.attr("tabindex", "-1");
        }
        if (this.currentPage.index === lastIndex) {
            //disable next
            $next.addClass("disabled");
            $next.attr("aria-disabled", true);
            $next.attr("tabindex", "-1");
        }
    },

    // -------------------------AFTER LOAD
    isLoaded: function () {
        //when the page is loaded
        $(document).trigger("navigation:pageLoad", [this]);
    },
    loadFailed: function (page) {
        //load 404
        $("#dynamic_content").html("<h1 id='pageTitle'>Page Load Failed: " + page.title + "</h1>");
    },

    // --------------------------MENU MANAGEMENT ---------------------------
    setEvents: function () {
        let that = this;
        let $link = this.$el.children("h2").children("a");
        let $button = this.$el.children("h2").children("button");
        //OUTSIDE CLICK
        $(window).click(function (e) {
            //Hide the menus if visible
            if ($(e.target).attr("id") !== "mainmenu_link") {
                that.clickOutside();
            }

        });
        //click on link
        $button.click(function (e) {
            that.showMenu();
            that.pressDown();
        });
        //keyboard events
        $button.keydown(function (e) {
            if (e.key === "ArrowDown") {
                //DOWN
                e.preventDefault();
                that.showMenu();
                that.pressDown();
                return false;
            } else if (e.key === "ArrowUp") {
                //UP
                e.preventDefault();
                that.showMenu();
                that.pressUp();
            } else if (e.key === "Tab") {
                //tabbing
                that.hideMenu();
            }
        });

        document.onkeydown = function (e) {
            if (e.key === "Escape") {
                that.hideMenu();
            }
        };
    },

    // --------------------------MENU STATES ---------------------------

    clickOutside: function () {
        this.hideMenu();
    },
    showMenu: function () {
        this.$el.children("h2").children("a").attr("aria-expanded", "true");
        this.$el.children("ul").show(); //.attr("aria-visible", "true");
    },
    hideMenu: function () {
        this.$el.children("h2").children("a").attr("aria-expanded", "false");
        this.$el.children("ul").hide(); //.show().attr("aria-visible", "false");
    },
    pressDown: function () {
        this.pageList[0].setFocus();
    },
    pressUp: function () {
        this.pageList[2].setFocus();
    },
    toggleMenu: function () {
        this.$el.children("ul").toggle();
    }
}



/* *********************************************************************
 * * PAGE
 * **********************************************************************/

function Page(data, parent, index) {
    this.parent = parent;
    this.page = data.page;
    this.title = ($("html").attr("lang") === "fr") ? data.title_fr : data.title;
    this.navTitle = ($("html").attr("lang") === "fr") ? data.nav_fr : data.nav;
    this.index = index;

    this.addToDom = function ($location) {
        let that = this;
        $location.append("<div role='menuitem' tabindex='-1' data-page=\"" + this.page + "\">" + this.navTitle + "</div>");
      //  $location.append("<div role='menuitem' data-page=\"" + this.page + "\">" + this.title + "</div>");
        this.$el = $location.children("div").last();
        this.$el.attr("aria-controls", "dynamic_content");
        this.$el.click(function () {
            that.clickLink();
        });
        this.$el.keydown(function (e) {
            if (e.key === "ArrowDown") {
                that.focusNextPage();
                return false;
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                that.focusPrevPage();
            } else if (e.key === "Tab") {
                that.parent.hideMenu();
            } else if (e.key === "Enter") {
                that.clickLink();
                that.parent.hideMenu();
            }
        });
    };

    this.clickLink = function () {
        initialNavigation = false;
        this.parent.loadPage(this);
    }

    this.setFocus = function () {
        this.$el.focus();
    }

    this.loadPage = function () {
        this.parent.loadPage(this);
    }

    this.focusNextPage = function () {
        //find this' parents total indexes
        let totalIndexes = this.parent.pageList.length;
        if ((this.index + 1) === totalIndexes) {
            //you're last
            this.parent.pageList[0].setFocus();

        } else {
            this.parent.pageList[this.index + 1].setFocus();
        }

    }
    this.focusPrevPage = function () {
        //find this' parents total indexes
        let totalIndexes = this.parent.pageList.length;
        if ((this.index) === 0) {
            //you're first
            this.parent.pageList[totalIndexes - 1].setFocus();

        } else {
            this.parent.pageList[this.index - 1].setFocus();
        }
    }
}