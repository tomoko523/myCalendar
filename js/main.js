$(function() {

  var selectday = null;
  var selectobj = null;
  var PLUSBTN = '<div class="flex"><i class="fa fa-calendar-plus-o fa-2x"></i></div>';
  var DEFAULTBG = 'sakura';
  var NOIMGEPATH = './images/noimage.jpg';
  var FOOTER = '<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix" id="dialog_FOOTER">' +
    '<div class="">' +
    '<button id="btn_imgDelete" class="custom_btn"><i class="fa fa-trash"></i>DELETE</button></div>' +
    '</div>';

  //get calender data from sessionstrage
  var str = sessionStorage.getItem("events");

  if (str != null) {
    var codropsEvents = JSON.parse(str);
  } else {
    var codropsEvents = {
      '05-23-2016': "<span>someone's birthbay</span>"
    };
  }

  //get nowbackgroundData from sessionstrage
  var nowbgimg = sessionStorage.getItem("nowbgimg");

  //get uploadbackgroundData from sessionstrage
  for (var i = 0; i < $('#bgimg > option').length; i++) {
    var upimg = sessionStorage.getItem("upimg_" + i);
    if (upimg != null) {
      $('#bgimg > option[value=upimg_' + i + ']').attr('data-img-src', upimg);
    }
  }

  if (nowbgimg != null) {
    $("#bgimg").val(nowbgimg);
  } else {
    $("#bgimg").val(DEFAULTBG);
  }

  changeBackGround();

  //Create image-picker
  $("#bgimg").imagepicker({
    clicked: fireInputEvent,
    changed: settingdeleteBtn
  });

  $("#add_event").prop("disabled", true);
  $(".detail").hide();
  $('#selectdayevent p').remove();

  //setting modal
  $('#bgmodal').dialog({
    autoOpen: false,
    modal: true,
    resizable: false,
    draggable: false,
    show: "clip",
    hide: "fade",
    width: 960,
    create: function() {
      $(".ui-dialog").append(FOOTER);
      settingdeleteBtn();
    }
  });

  var cal = $('#calendar').calendario({
      onDayClick: function($el, $contentEl, dateProperties) {

        selectobj = $el;

        $('.currentday').text(dateProperties.monthname + ' ' + dateProperties.day + ', ' + dateProperties.year);
        selectday = ("0" + dateProperties.month).slice(-2) + '-' + ("0" + dateProperties.day).slice(-2) + '-' + dateProperties.year;

        var events = $($el.context).children('.fc-calendar-events').children();
        $('#ev_show_list span').remove();
        $('#ev_edit_list div').remove();
        $("#add_event").prop("disabled", true);

        $('#ev_edit_list').append(PLUSBTN);

        jQuery.each(events, function() {
          var spanValue = $(this).children('span:first-child').text();
          // var aValue = $(this).children('a:first-child').text();
          if (spanValue != "") {
            // $('#ev_show_list').append('<span>' + spanValue + '</span>');
            // $('#ev_show_list').append('<p>' + aValue + '</p>');
            var editlist = '<div class="flex"><i class="fa fa-calendar-minus-o fa-2x"></i>' +
              '<input class="editlist" type="text" value="' + spanValue + '" placeholder="Lets Input Event!"></div>'
            $('#ev_edit_list').append(editlist);
            $("#add_event").prop("disabled", false);
          }
        });

        $('.select_day').removeClass('select_day');
        $el.addClass('select_day');
      },
      caldata: codropsEvents
    }),
    $month = $('#custom-month').html(cal.getMonthName()),
    $year = $('#custom-year').html(cal.getYear());

  $('.fc-today').trigger('click');

  $('#custom-next').on('click', function() {
    cal.gotoNextMonth(updateMonthYear);
  });
  $('#custom-prev').on('click', function() {
    cal.gotoPreviousMonth(updateMonthYear);
  });
  $('#custom-current').on('click', function() {
    cal.gotoNow(updateMonthYear);
  });

  function updateMonthYear() {
    $month.html(cal.getMonthName());
    $year.html(cal.getYear());
  }

  $("#event li").on('click', tabsChange);
  $("#add_event").on('click', addEventforSession);
  $("#btn_dialog_open").on('click', openDialog);
  $(document).on('click', '.fa-calendar-minus-o', deleteEventforSession);
  $(document).on('click', '.fa-calendar-plus-o', addEventForm);
  $('#input_getFile').on('change', file_get);
  $(document).on('click', '#btn_imgDelete', bgimg_delete);
  $("#btn_allevents_delete").on('click', deleteAllEvents);

  function changeBackGround() {
    var src = $('#bgimg option:selected').attr('data-img-src');
    if (NOIMGEPATH != src) {
      $(document.body).css({
        backgroundImage: 'url(' + src + ')'
      });
      sessionStorage.setItem("nowbgimg", $('#bgimg').val());
    } else {
      return;
    }
  };

  function fireInputEvent() {
    if (NOIMGEPATH == $('#bgimg option:selected').attr('data-img-src')) {
      $('#input_getFile').trigger('click');
    } else {
      changeBackGround();
    }
  };

  function settingdeleteBtn() {
    if ($("#bgimg").val().match(/upimg/) && NOIMGEPATH != $('#bgimg option:selected').attr('data-img-src')) {
      $('#btn_imgDelete').prop("disabled", false);
    } else {
      $('#btn_imgDelete').prop("disabled", true);
    }
  }

  function openDialog() {
    $('#bgmodal').dialog("open");
  };

  function tabsChange() {
    if ($(this).hasClass('showing')) {
      $(this).css("background-color", "black").css("opacity", 0.6).removeClass("showing");
      // $(".detail").hide();
      $($("a", this).attr("href")).slideUp(1000);
    } else {
      // $("li").css("background-color", "black").css("opacity", 0.6).removeClass("showing");
      $(this).css("background-color", "yellow").css("opacity", 0.6).addClass("showing");
      // $(".detail").hide();
      $($("a", this).attr("href")).slideDown(1000);
    }
  };

  function addEventforSession() {
    var arr = new Array();
    var msg = 'Finish To Edit?'
    smoke.confirm(msg, function(e) {
      if (e) {
        //OK
        jQuery.each($('.editlist'), function() {
          if ($(this).val() != "") {
            arr.push('<span>' + $(this).val() + '</span>');
          }
        });

        codropsEvents[selectday] = arr;

        var json_text = JSON.stringify(codropsEvents);
        sessionStorage.setItem("events", json_text);
        cal.setData(codropsEvents);

      } else {
        //NO
      }
    }, {
      ok: "OK",
      cancel: "NO",
      classname: "custom-class",
      reverseButtons: true
    });
  };

  function deleteEventforSession() {
    var self = $(this);
    var arr = new Array();
    var msg = 'Delete This Event？<br/>' + self.next().val();

    smoke.confirm(msg, function(e) {
      if (e) {
        //OK
        self.parent('div').remove();

        jQuery.each($('.editlist'), function() {
          if ($(this).val() != "") {
            arr.push('<span>' + $(this).val() + '</span>');
          }
        });

        if (Object.keys(arr).length == 0) {
          $("#add_event").prop("disabled", true);
        }
        codropsEvents[selectday] = arr;

        var json_text = JSON.stringify(codropsEvents);
        sessionStorage.setItem("events", json_text);
        cal.setData(codropsEvents);
      } else {
        //NO

      }
    }, {
      ok: "OK",
      cancel: "NO",
      classname: "custom-class",
      reverseButtons: true
    });
  }

  function addEventForm() {
    $(this).removeClass('fa-calendar-plus-o').addClass('fa-calendar-minus-o');
    $(this).parent('div').append('<input class="editlist" type="text" value="" placeholder="Lets Input Event!">');
    $('#ev_edit_list').prepend(PLUSBTN);
    $("#add_event").prop("disabled", false);
  }

  function deleteAllEvents() {
    var msg = "Dalete All Events?";
    smoke.confirm(msg, function(e) {
      if (e) {
        //OK
        sessionStorage.removeItem("events");
        location.reload();
      } else {
        //NO
      }
    }, {
      ok: "OK",
      cancel: "NO",
      classname: "custom-class",
      reverseButtons: true
    });

  }

  function file_get(imgfile) {
    if (!imgfile.target.files.length) return;
    var file = imgfile.target.files[0];
    var fr = new FileReader();
    fr.onload = function(evt) {
      var res = evt.target.result;
      //selected img
      var target = $('#bgimg').val();
      var no = target.replace('upimg_', '');
      no = +no + 4;

      if ('5000000' < JSON.stringify(sessionStorage).length + res.length) {
        smoke.signal("Sorry…Not Enough Storage.", function(e) {
          sessionStorage.removeItem(target);
        }, {
          duration: 5000,
          classname: "custom-class"
        });
      } else {
        sessionStorage.setItem(target, res);
        $('#bgimg option:selected').attr("data-img-src", res);
        $('.image_picker_image').eq(no).attr("src", res);

        $(document.body).css({
          backgroundImage: 'url(' + res + ')'
        });

        sessionStorage.setItem("nowbgimg", target);

        settingdeleteBtn();

      };

    }
    fr.readAsDataURL(file);
  };

  function bgimg_delete() {
    //TODO(´・ω・`)
    // Delete後のimgの表示が一定でない…

    var msg = 'Delete This Image?';

    smoke.confirm(msg, function(e) {
      if (e) {
        //OK
        //selected img
        var target = $('#bgimg').val();
        var no = target.replace('upimg_', '');
        no = +no + 4;
        sessionStorage.removeItem(target);
        sessionStorage.setItem("nowbgimg", DEFAULTBG);

        //get nowbackgroundData from sessionstrage
        var nowbgimg = sessionStorage.getItem("nowbgimg");

        $("#bgimg").data('picker').destroy();

        //get uploadbackgroundData from sessionstrage
        for (var i = 0; i < $('#bgimg > option').length - 4; i++) {
          var upimg = sessionStorage.getItem("upimg_" + i);
          if (upimg != null) {
            $('#bgimg > option[value=upimg_' + i + ']').attr('data-img-src', upimg);
          } else {
            $('#bgimg > option[value=upimg_' + i + ']').attr('data-img-src', NOIMGEPATH);
          }
        }

        $("#bgimg").val(nowbgimg);

        $("#bgimg").imagepicker({
          clicked: fireInputEvent,
          changed: settingdeleteBtn
        });

        $('.image_picker_image').eq(no).attr("src", NOIMGEPATH);
        changeBackGround();

      } else {
        //NO
      }
    }, {
      ok: "OK",
      cancel: "NO",
      classname: "custom-class",
      reverseButtons: true
    });
  }
});
