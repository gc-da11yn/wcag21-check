$(document).ready(function () {

    $(document).on("navigation:pageLoad", function (event, nav) {
        timeout(nav.currentPage);
        switchNext(nav.currentPage);
        initShowHideButtons();
    });

});

function initShowHideButtons() {
    $(".quite-small").on("click", function() {
        if($("#legBranch:visible").length) {
            $(".quite-small").attr("aria-expanded", "false");
            $(".quite-small").attr("aria-pressed", "false");
            $("#legBranch").hide();
        } else {
            $(".quite-small").attr("aria-expanded", "true");
            $(".quite-small").attr("aria-pressed", "true");
            $("#legBranch").show();
        }
    });
    $(".focus-rite").on("click", function() {
        if($("#execBranch:visible").length) {
            $(".focus-rite").attr("aria-expanded", "false");
            $(".focus-rite").attr("aria-pressed", "false");
            $("#execBranch").hide();
        } else {
            $(".focus-rite").attr("aria-expanded", "true");
            $(".focus-rite").attr("aria-pressed", "true");
            $("#execBranch").show();
        }
    });
}

function timeout(page) {
    if (page.index === 2) {
        setTimeout(function () {
            $(".10-secs").remove();
        }, 5000);
    }
}

function switchNext(page) {
    if (page.index === 1) {
        $("footer .next").after($("footer .prev"));
        $("footer .next").after($("footer .pageof"));

    } else {
        $("footer .prev").after($("footer .next"));
        $("footer .prev").after($("footer .pageof"));
    }

}