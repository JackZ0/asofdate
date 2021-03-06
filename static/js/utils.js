/**
 * Created by hzwy23 on 2016/9/28.
 */

// tab 管理模块
var Hutils = {
        // 隐藏子菜单系统，切换具体页面内容
        hideWrapper:function(){
            $("#wrapper").removeClass("animated slideInUp slideOutDown");
            $("#wrapper").addClass("animated slideOutDown");
            $("#h-main-content").removeClass("animated slideInDown slideOutUp");
            $("#h-main-content").addClass("animated slideInDown");
        },
        // 隐藏内容显示部分，切换到子菜单系统
        showWrapper:function() {
            $("#h-main-content").removeClass("animated slideInDown slideOutUp");
            $("#h-main-content").addClass("animated slideOutUp");
            $("#wrapper").removeClass("animated slideInUp slideOutDown");
            $("#wrapper").addClass("animated slideInUp")
        },
        // 判断子菜单系统显示状态，如果是隐藏，则切换到显示，如果是显示，则隐藏。
        HchangeWrapper:function(){
            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                // firefox
                var event = Hutils.getEvent()
                event.stopPropagation()
            }
            if ($(".H-tabs-index").html()==""){
                $.Notify({
                    title:"温馨提示：",
                    message:"目前没有已经打开的页面",
                    type:"info",
                });
                return
            };

            // 判断子系统菜单也距离底部的位置，如果距离底部的位置是0，则隐藏子菜单系统，否则显示子菜单系统
            if ($("#wrapper").hasClass("slideInUp")){
                Hutils.hideWrapper()
            }else{
                Hutils.showWrapper()
            }
        },
        ShowCannotEditTips:function(obj){
            $(obj).tooltip({
                title:"亲,此处无法编辑哟"
            }).tooltip("show")
        },
        // 跳转到首页系统菜单。
        H_HomePage:function(){
            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                // firefox
                var event = Hutils.getEvent()
                event.stopPropagation()
            }
            window.location.href="/HomePage"
        },
        // 退出登录
        HLogOut:function(){
            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                // firefox
                var event = Hutils.getEvent()
                event.stopPropagation()
            }
            $.Hconfirm({
                callback:function(){
                    $.ajax({type:"Get",url:"/logout",cache:!1,async:!1,dataType:"text",
                        error:function(){window.location.href="/"},
                        success:function(a){
                            window.location.href="/"}
                    })
                },
                body:"点击确定退出系统"
            })
        },
        // 用户信息管理
        UserMgrInfo:function(){
            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                // firefox
                var event = Hutils.getEvent()
                event.stopPropagation()
            }

            $.Hmodal({
                body:$("#mas-passwd-prop").html(),
                footerBtnStatus:false,
                height:"420px",
                width:"720px",
                header:"用户信息",
                preprocess:function () {
                    $.getJSON("/v1/auth/user/query",function (data) {
                        $(data).each(function (index, element) {
                            $("#h-user-details-user-id").html(element.user_id)
                            $("#h-user-details-user-name").html(element.user_name)
                            $("#h-user-details-user-email").html(element.user_email)
                            $("#h-user-details-user-phone").html(element.user_phone)

                            $("#h-user-details-user-org-name").html(element.org_unit_desc)
                            $("#h-user-details-user-domain").html(element.domain_id)
                            $("#h-user-details-user-domain-name").html(element.domain_name)
                            $("#h-user-details-user-create").html(element.create_user)
                            $("#h-user-details-user-create-date").html(element.create_date)
                            $("#h-user-details-user-modify").html(element.modify_user)
                            $("#h-user-details-user-modify-date").html(element.modify_date)
                            // 机构编码处理
                            var upcombine = element.org_unit_id.split("_join_")
                            if (upcombine.length==2){
                                $("#h-user-details-user-org").html(upcombine[1])
                            }else{
                                $("#h-user-details-user-org").html(upcombine)
                            }
                        })
                    });
                }
            });
        },
        // 子系统中，打开具体页面按钮
        goEntrySubSystem:function(e){
            NProgress.start();
            var flag = false;

            // 资源的url地址
            var url = $(e).attr("data-url");

            // 资源的id
            var data_id = $(e).attr("data-id");

            // 资源的名称
            var name = $(e).find("div:last").html();

            // 遍历整个tab栏目，查找指定id的资源是否打开，
            // 如果该资源已经打开，则直接切换到该资源，无需从后台获取内容
            // 如果该资源没有打开，则将flag为false，从后台获取资源内容
            $(".H-tabs-index").find("span").each(function(index,element){
                // 如果资源存在，直接切换到这个资源的tab中。
                if (data_id == $(element).attr("data-id")){
                    Hutils.__changetab(element)
                    flag = true;
                    return false;
                }
            });

            // 资源未打开，从后台请求资源信息
            if (flag == false){
                $.HAjaxRequest({
                    type:"get",
                    url:url,
                    cache:false,
                    async:true,
                    dataType:"text",
                    error:function (msg) {
                        NProgress.done();
                        var m = JSON.parse(msg);
                        $.Notify({
                            title:"温馨提示:",
                            message:m.error_msg,
                            type:"danger",
                        });
                        return
                    },
                    success: function(data){

                        // 隐藏内容显示区域
                        $("#h-main-content").find("div.active")
                            .removeClass("active").addClass("none");

                        var newContent = document.createElement("div")
                        $(newContent).attr({
                            "data-type":"frame",
                            "data-id":data_id,
                        }).css({
                            "padding":"0px",
                            "margin":"0px",
                        }).addClass("active").html(data);

                        $("#h-main-content").append(newContent);

                        // 隐藏子菜单系统，显示具体的内容
                        Hutils.hideWrapper();

                        // 生成标签页
                        {
                            // 清楚所有的tab选中状态
                            $(".active-tab").removeClass("active-tab");

                            // 获取新tab模板内容
                            var optHtml = Hutils.__genTabUI(data_id,name)

                            // 在tab栏目列表中添加新的tab
                            $(".H-tabs-index").append(optHtml);
                        }

                        NProgress.done();
                    }
                });
            }else {
                NProgress.done();
            }
        },
        // 打开指定资源按钮
        openTab:function(param){

            NProgress.start();

            // 判断子元素会否已经被打开，默认设置为未打开
            var flag = false;

            // 资源url地址
            var url = param.url;

            // 资源id
            var data_id = param.id;

            // 资源名称
            var name = param.title;

            $(".H-tabs-index").find("span").each(function(index,element){
                if (data_id == $(element).attr("data-id")){
                    flag = true;
                    $.HAjaxRequest({
                        type:"get",
                        url:url,
                        cache:false,
                        async:true,
                        dataType:"text",
                        success: function(data){
                            Hutils.__changetab(element);
                            $(element).find("hzw").html(name);

                            $("#h-main-content").find("div.active").each(function(index,element){
                                if (data_id == $(element).attr("data-id")){
                                    $(element).html(data);
                                    return false;
                                }
                            })
                        }
                    });
                    return false;
                }
            });

            if (flag == false){
                $.HAjaxRequest({
                    type:"get",
                    url:url,
                    cache:false,
                    async:true,
                    dataType:"text",
                    error:function (msg) {
                        var m = JSON.parse(msg.responseText);
                        $.Notify({
                            title:"温馨提示:",
                            message:m.error_msg,
                            type:"danger",
                        });
                        NProgress.done();
                    },
                    success: function(data){

                        // 隐藏内容显示区域
                        $("#h-main-content").find("div.active")
                            .removeClass("active").addClass("none");

                        var newContent = document.createElement("div")
                        $(newContent).attr({
                            "data-type":"frame",
                            "data-id":data_id,
                        }).css({
                            "padding":"0px",
                            "margin":"0px",
                        }).addClass("active").html(data);

                        $("#h-main-content").append(newContent).hide().fadeIn();

                        // 生成标签页
                        {
                            // 清楚所有的tab选中状态
                            $(".active-tab").removeClass("active-tab");

                            // 获取新tab模板内容
                            var optHtml = Hutils.__genTabUI(data_id,name)

                            // 在tab栏目列表中添加新的tab
                            $(".H-tabs-index").append(optHtml);
                        }
                        NProgress.done();
                    }
                });
            } else {
                NProgress.done();
                return
            }
        },

        // 切换tab页面
        __changetab : function(e){

            // 获取新tab的id
            var id = $(e).attr("data-id");
            var flag = true;

            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                // firefox
                var event = Hutils.getEvent()
                event.stopPropagation()
            }

            $(".active-tab").each(function (index, element) {
                var old_id = $(element).attr("data-id")
                // 返现客户点点击的是当前tab也
                // 退出切换tab也操作,仍然显示当前页面
                if (id == old_id) {
                    flag = false;
                    return false
                }
            });

            // 隐藏子菜单页面
            Hutils.hideWrapper()

            // 如果切换到当前tab也,则直接退出处理.
            if (!flag) {
                return
            }

            // 清除所有tab的激活标签
            $(".active-tab").removeClass("active-tab");

            // 给新的tab加上激活标签
            $(e).addClass("active-tab")


            // 在已经打开的页面中，根据id，寻找到指定的页面，将这个页面显示出来
            $("#h-main-content").find("div.active")
                .removeClass("active")
                .addClass("none");

            $("#h-main-content").find("div[data-id='"+id+"']")
                .removeClass("none")
                .addClass("active")
                .hide()
                .fadeIn(300);
        },
        __genTabUI:function (data_id,name) {
            var mspan = document.createElement("span")
            $(mspan).css({
                "min-width":"120px",
                "border-left":"#6f5499 solid 1px"
            }).attr({
                "data-id":data_id,
                "onclick":"Hutils.__changetab(this)",
            }).addClass("H-left-tab active-tab");

            var hzw = document.createElement("hzw");
            $(hzw).html(name);
            $(hzw).css({
                "font-weight":"600",
                "color":"white",
            });

            var mi = document.createElement("i")
            $(mi).css("font-size","14px")
                .addClass("icon-remove-sign H-gray-close pull-right")
                .attr("onclick","Hutils.__closetab(this)")

            $(mspan).append(hzw);
            $(mspan).append(mi);
            return mspan
        },
        getEvent:function(){
            if(window.event)    {
                return window.event;
            }
            var func = Hutils.getEvent.caller;
            while( func != null ){
                var arg0 = func.arguments[0];
                if(arg0){
                    if((arg0.constructor==Event || arg0.constructor ==MouseEvent
                        || arg0.constructor==KeyboardEvent)
                        ||(typeof(arg0)=="object" && arg0.preventDefault
                        && arg0.stopPropagation)){
                        return arg0;
                    }
                }
                func = func.caller;
            }
            return null;
        },
        // 关闭tab标签，以及tab标签关联的内容,在__genTabUI中引用了__closetab
        __closetab:function(e){
            // 取消后续事件
            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                var event = Hutils.getEvent()
                event.stopPropagation()
            }

            // 获取被关闭tab的id
            var id = $(e).parent().attr("data-id");

            // 首先判断，这个tab是否被激活，如果是激活状态，则在关闭tab后，
            // 还需要切换到新的tab页面中，切换顺序是，先寻找左侧隐藏的tab，如果没有再寻找右侧
            // 如果两侧都没有，则直接返回子菜单系统。
            if ($(e).parent().hasClass("active-tab")){
                // 获取左侧tab
                var pobj = $(e).parent().prev("span");
                var pid = $(pobj).attr("data-id");

                // 获取右侧tab
                var nobj = $(e).parent().next("span");
                var nid = $(nobj).attr("data-id");

                // 关闭选中的tab,以及这个tab所关联的内容
                $(e).parent().remove();
                $("#h-main-content").find("div[data-id='"+id+"']").remove();

                // 如果pid与nid都为undefined，则直接切换到子菜单系统
                // 如果左侧tab存在，则切换到左侧tab，否则切换到右侧tab
                if (pid == undefined){
                    if (nid == undefined){
                        Hutils.showWrapper()
                        return
                    } else {
                        id = nid
                    }
                } else {
                    id = pid
                }

                // 清除左侧tab的隐藏状态，使其显示。
                $("#h-main-content").find("div[data-id='"+id+"']")
                    .removeClass("none")
                    .addClass("active")
                    .hide()
                    .fadeIn(500);

                // 遍历整个tab栏，找到匹敌的tab id，
                $(".H-left-tab").each(function(index,element){
                    if (id == $(element).attr("data-id")){
                        $(element).addClass("active-tab")
                    }
                });

            } else {
                // 当被删除的这个tab没有被激活时，直接将这个tab也从tab栏目中删除，并连同删除这个tab关联的内容即可。
                $(e).parent().remove();
                $("#h-main-content").find("div[data-id='"+id+"']").remove();
            }
        },
        go_entry :function (e){
            var id = $(e).attr("data-id");
            $.HAjaxRequest({
                url:'/v1/auth/index/entry',
                data:{Id:id},
                dataType:'text',
                success:function(d){
                    $("#bigdata-platform-subsystem").html(d)
                },
                error:function () {
                    $.Notify({
                        title:"温馨提示：",
                        message:"登录连接已经断开，请重新登录系统",
                        type:"info",
                    });
                    window.location.href="/"
                },
            });
        },
        initMenu:function(TypeId,Id,Group1,Group2,Group3){

            var __genUI = function (name) {
                var mdiv = document.createElement("div")
                $(mdiv).addClass("tile-group")
                var mspan = document.createElement("span")
                $(mspan).addClass("tile-group-title").css("font-size","12px").html(name)
                $(mdiv).append(mspan)

                return mdiv
            };

            var __genDiv = function (res_id,res_class,res_bg_color,res_img,res_name,res_url) {
                var mdiv = document.createElement("div")
                $(mdiv).attr({
                    "data-id":res_id,
                    "data-role":"tile",
                    "data-url":res_url,
                }).addClass(res_class).addClass("fg-white hzwy23div")
                    .css("background-color",res_bg_color);

                var cdiv = document.createElement("div")
                $(cdiv).addClass("tile-content iconic")

                var mspan = document.createElement("span")
                $(mspan).addClass("icon")

                var mimg = document.createElement("img")
                $(mimg).attr("src",res_img)

                var ccdiv = document.createElement("div");
                $(ccdiv).addClass("tile-label").html(res_name);

                $(mspan).append(mimg)
                $(cdiv).append(mspan)
                $(mdiv).append(cdiv)
                $(mdiv).append(ccdiv)
                return mdiv
            };

            $.HAjaxRequest({
                url:'/v1/auth/main/menu',
                data:{TypeId:TypeId,Id:Id},
                success: function(data){

                    var cdiv1 = document.createElement("div");
                    $(cdiv1).addClass("tile-container");

                    var cdiv2 = document.createElement("div");
                    $(cdiv2).addClass("tile-container");

                    var cdiv3 = document.createElement("div");
                    $(cdiv3).addClass("tile-container");

                    var divlist = new Array();

                    divlist.push(cdiv1);
                    divlist.push(cdiv2);
                    divlist.push(cdiv3);

                    $(data).each(function(index,element){
                        var gid = parseInt(element.Group_id)-1;
                        var mdiv = divlist[gid];
                        $(mdiv).append(__genDiv(element.Res_id,element.Res_class,element.Res_bg_color,element.Res_img,element.Res_name,element.Res_url));
                    });

                    if ($(cdiv1).html() != "") {
                        var mdiv1 = __genUI(Group1)
                        $(mdiv1).append(cdiv1)
                        $("#h-system-service").html(mdiv1)
                    }else{
                        $("#h-system-service").remove()
                    }

                    if ($(cdiv2).html() !=""){
                        var mdiv2 = __genUI(Group2)
                        $(mdiv2).append(cdiv2)
                        $("#h-mas-service").html(mdiv2)
                    }else{
                        $("#h-mas-service").remove()
                    }

                    if ($(cdiv3).html() !=""){
                        var mdiv3 = __genUI(Group3)
                        $(mdiv3).append(cdiv3);
                        $("#h-other-service").html(mdiv3)
                    }else{
                        $("#h-other-service").remove();
                    }

                    if (TypeId == 1){
                        $(".hzwy23div").click(function () {
                            Hutils.goEntrySubSystem(this)
                        })
                    } else if (TypeId == 0) {
                        $(".hzwy23div").click(function(){
                            Hutils.go_entry(this)
                        })
                    }

                    $(function() {
                        //取消水平滑动的插件
                        //$.StartScreen();
                        var tiles = $(".tile, .tile-small, .tile-sqaure, .tile-wide, .tile-large, .tile-big, .tile-super");
                        $.each(tiles, function() {
                            var tile = $(this);
                            setTimeout(function() {
                                tile.css({
                                    opacity: 1,
                                    "-webkit-transform": "scale(1)",
                                    "transform": "scale(1)",
                                    "-webkit-transition": ".3s",
                                    "transition": ".3s"
                                });
                            }, Math.floor(Math.random() * 500));
                        });
                        $(".tile-group").animate({
                            left: 0
                        });
                    });
                },
            });
        },
    };

// 树形插件
(function($){
    $.fn.Htree = function(param){
        // 1. 获取top节点
        // 2. 获取id，text，upId，将其他属性设置成data-属性
        // 3. 生成tree。
        // 4. 绑定单击按钮
        // 5. 伸缩按钮图标
        // function list:
        // 6. 删除节点
        // 7. 新增节点
        // 8. 更新节点

        // 保留节点索引
        var $this = this;

        /*
        * 插件默认参数列表。
        * */
        var __DEFAULT = {
            data: "",
            fontSize:"13px",
            showLiHeight:"30px",
            showFontSize:"14px",
            iconColor:"#030202",

            onChange:function (obj) {
                console.log("没有注册点击函数")
            },
        };

        $.extend(true,__DEFAULT,param);


        var getEvent = function(){

            if(window.event)    {
                return window.event;
            }
            var func = getEvent.caller;

            while( func != null ){
                var arg0 = func.arguments[0];
                if(arg0){
                    if((arg0.constructor==Event || arg0.constructor ==MouseEvent
                        || arg0.constructor==KeyboardEvent)
                        ||(typeof(arg0)=="object" && arg0.preventDefault
                        && arg0.stopPropagation)){
                        return arg0;
                    }
                }
                func = func.caller;
            }
            return null;
        };


        // 1.get top node, and sort array
        function sortTree(a){

            // load result sorted
            var list = [];

            // get select's options
            // append it to new select which simulate by ul li
            if (Object.prototype.toString.call(a) == '[object Array]'){

            } else {
                return [];
            }

            //set max dept val
            var MAXDEPT = 8;

            var INDEX = 1;

            function getRoots(arr){
                var Roots = [];
                for(var i = 0; i < arr.length;i++){
                    var rootFlag = true
                    for ( var j = 0; j < arr.length;j++){
                        if (arr[i].upId == arr[j].id){
                            rootFlag = false
                            break
                        }
                    }
                    if (rootFlag == true){
                        Roots.push(arr[i])
                    }
                }
                return Roots
            }

            function traversed(node,arr){
                if (++INDEX > MAXDEPT){
                    console.log("递归超过8层,为保护计算机,退出递归");
                    return
                }
                for (var i = 0; i < arr.length; i++){

                    if (node == arr[i].upId){
                        arr[i].dept = INDEX
                        list.push(arr[i])
                        traversed(arr[i].id,arr)
                    }
                }
                INDEX--;
            }

            function listElem(roots,arr){
                for (var i = 0; i < roots.length; i++){
                    roots[i].dept = INDEX
                    list.push(roots[i])
                    traversed(roots[i].id,arr)
                }
            }

            listElem(getRoots(a),a)

            return list
        }

        // 2. set data-*
        // 3. genUI
        function genTreeUI(a){

            var opt = "<ul>"
            for(var i = 0; i < a.length; i++){
                var pd = parseInt(a[i].dept)*20 - 10
                if (isNaN(pd)){
                    pd = 10
                }
                var li = '<li data-id="'+a[i].id+'" data-dept="'+a[i].dept+'" style="margin:0px; text-align: left;font-weight:500;padding-left:'+pd+'px; height:'+__DEFAULT.showLiHeight+'; line-height: '+__DEFAULT.showLiHeight+'; font-size: '+__DEFAULT.showFontSize+'; cursor: pointer;position: relative;">' +
                    '<hzw class="HTreeshowOrHideIconHzw" style="height: '+__DEFAULT.showLiHeight+'; line-height: '+__DEFAULT.showLiHeight+'; width: 20px;cursor: crosshair ;display: inline-block">' +
                    '<i style="border-color:'+__DEFAULT.iconColor+' transparent transparent transparent;border-style: solid;border-width: 6px 5px 0px 5px;height: 0;margin-left: 1px;margin-top: -5px;position: absolute;top: 50%;width: 0;"></i>' +
                    '</hzw>' +
                    '<span class="HTreeLi" style="height: '+__DEFAULT.showLiHeight+'; line-height: '+__DEFAULT.showLiHeight+'; position: absolute;">'+a[i].text+'</span></li>'
                opt+=li;
            }
            opt +='</ul>'
            return opt;
        }

        // 绑定伸缩按钮
        function showOrHide(e){

            var topBorderColor = __DEFAULT.iconColor+' transparent transparent transparent'
            var leftBorderColor = 'transparent transparent transparent '+__DEFAULT.iconColor
            var dept = $(e).attr("data-dept")
            var nextObj = $(e).next()
            var nextDept = $(nextObj).attr("data-dept")
            var nextDisplay = $(nextObj).css("display")
            if (nextDisplay == "none" && parseInt(nextDept)>parseInt(dept)){
                $(e).find("i").css({
                    "border-color":topBorderColor,
                    "border-width":"6px 5px 0px 5px"
                })

                $(e).nextAll().each(function(index,element){
                    if (parseInt(dept)+1==parseInt($(element).attr("data-dept"))){
                        $(element).find("i").css({
                            "border-color":leftBorderColor,
                            "border-width":"5px 0px 5px 6px",
                        });

                        $(element).fadeIn(400);
                    }else if (parseInt(dept)+1 < parseInt($(element).attr("data-dept"))){
                        $(element).find("i").css({
                            "border-color":leftBorderColor,
                            "border-width":"5px 0px 5px 6px",
                        })

                        $(element).fadeOut(200);
                    }else{
                        return false
                    }
                })
            }else if (nextDisplay == "none" && parseInt(nextDept)<=parseInt(dept)){
                return
            }else if (nextDisplay != "none" && parseInt(nextDept)>parseInt(dept)){

                $(e).find("i").css({
                    "border-color":leftBorderColor,
                    "border-width":"5px 0px 5px 6px",
                })

                $(e).nextAll().each(function(index,element){
                    if (parseInt(dept)<parseInt($(element).attr("data-dept"))){
                        $(element).find("i").css({
                            "border-color":leftBorderColor,
                            "border-width":"5px 0px 5px 6px",
                        })

                        $(element).fadeOut(200);
                    }else if (parseInt(dept)>=parseInt($(element).attr("data-dept"))){
                        return false
                    }
                })
            }else {
                return
            }
        }

        var li = sortTree(__DEFAULT.data)
        var opt = genTreeUI(li)

        $this.html(opt)

        /*
        * 如果这个节点没有下层信息，则将这个层级的伸缩按钮去掉。
        * */
        $this.find("ul li").each(function(index,element){
            var curDept = parseInt($(element).attr("data-dept"));
            var nextDept = parseInt($(element).next().attr("data-dept"));
            if (curDept>=nextDept || isNaN(nextDept)){
                $(element).find("hzw").remove()
            }
        });

        /*
        * 给ul中每一行li绑定点击事件
        * */
        $this.find("ul li").on("click",function(){
            $this.find(".HTreeLi").css("color","")
            $(this).find("span").css("color","red")
            $this.attr("data-selected",$(this).attr("data-id"))
            __DEFAULT.onChange(this)
        });

        /*
        * 给伸缩按钮绑定单击事件
        * */
        $this.find(".HTreeshowOrHideIconHzw").on("click",function () {
            // 取消后续事件
            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                var event = getEvent()
                event.stopPropagation()
            }
            showOrHide($(this).parent())
        });

    };

    $.fn.Hselect = function(param){
        var sel = this
        var obj = document.createElement("div")

        if ( $(sel).attr("hselect") == "true"){
            // 重复初始化Hselect
            var hselect = $(sel).next()
            var displaycss = $(hselect).css("display")
            $(obj).attr("style",$(sel).attr("style"));
            $(obj).css("display",displaycss)

            $(hselect).remove()
            $(sel).html("");
        } else {
            // 第一次初始化Hselect
            $(obj).attr("style",$(sel).attr("style"));
        }
        //init div css
        //get parent class to it
        //get parent css to it
        $(obj).addClass($(sel).attr("class"));
        $(obj).css({"padding":"0px","border":"none"});

        $(sel).attr("hselect","true");
        // default parameters
        var __DEFAULT = {
            data: "",
            height:"26px",
            width:"100%",
            border:"#ccc solid 1px",
            fontSize:"13px",
            borderRadius:"5px",
            bgColor:"white",
            placeholder:"<i style='color: #959595;font-size: 12px;'>--请选择--</i>",

            showLiHeight:"30px",
            showHeight:"230px",
            showBorder:"",
            showFontSize:"14px",
            iconColor:"#ff5763",

            // 值改变触发事件
            onChange:"",

            // select中默认值
            value:"",

            // 是否禁止选择
            disabled:"",
        };

        $.extend(true,__DEFAULT,param);


        // set showBorder to border style
        if (__DEFAULT.showBorder==""){
            __DEFAULT.showBorder = __DEFAULT.border
        }

        var getEvent = function(){

            if(window.event)    {
                return window.event;
            }
            var func = getEvent.caller;

            while( func != null ){
                var arg0 = func.arguments[0];
                if(arg0){
                    if((arg0.constructor==Event || arg0.constructor ==MouseEvent
                        || arg0.constructor==KeyboardEvent)
                        ||(typeof(arg0)=="object" && arg0.preventDefault
                        && arg0.stopPropagation)){
                        return arg0;
                    }
                }
                func = func.caller;
            }
            return null;
        };
        /*
         * This function sort array.
         * Accept One Array Variable.
         * */
        function sortTree(a){

            // load result sorted
            var list = [];

            // get select's options
            // append it to new select which simulate by ul li
            if (Object.prototype.toString.call(a) == '[object Array]'){
                $(sel).find("option").each(function(index,element){
                    var ijs = {}
                    ijs.id = $(element).val();
                    ijs.text = $(element).text()
                    a.push(ijs)
                })
            } else {
                $(sel).find("option").each(function(index,element){
                    var ijs = {}
                    ijs.id = $(element).val();
                    ijs.text = $(element).text()
                    list.push(ijs)
                })
                return list
            }

            //set max dept val
            var MAXDEPT = 8;

            var INDEX = 1;

            function getRoots(arr){
                var Roots = [];
                for(var i = 0; i < arr.length;i++){
                    var rootFlag = true
                    for ( var j = 0; j < arr.length;j++){
                        if (arr[i].upId == arr[j].id){
                            rootFlag = false
                            break
                        }
                    }
                    if (rootFlag == true){
                        Roots.push(arr[i])
                    }
                }
                return Roots
            }

            function traversed(node,arr){
                if (++INDEX > MAXDEPT){
                    console.log("递归超过8层,为保护计算机,退出递归");
                    return
                }
                for (var i = 0; i < arr.length; i++){

                    if (node == arr[i].upId){
                        arr[i].dept = INDEX
                        list.push(arr[i])
                        traversed(arr[i].id,arr)
                    }
                }
                INDEX--;
            }

            function listElem(roots,arr){
                for (var i = 0; i < roots.length; i++){
                    roots[i].dept = INDEX
                    list.push(roots[i])
                    traversed(roots[i].id,arr)
                }
            }

            listElem(getRoots(a),a)

            return list
        }

        function genTreeUI(a){
            var odivStyle='cursor:pointer;background-color: '+__DEFAULT.bgColor+';padding:0px;text-align: left !important;width: '+__DEFAULT.width+'; border:'+__DEFAULT.border+'; height: '+__DEFAULT.height+'; line-height: '+__DEFAULT.height+';padding-left:10px; display:inline-block; border-radius:'+__DEFAULT.borderRadius+''
            var odiv = '<div class="HshowSelectValue" style="'+odivStyle+'">' +
                '<span style="height: '+__DEFAULT.height+'; font-size: '+__DEFAULT.fontSize+'">'+__DEFAULT.placeholder+'</span>' +
                '<hzw style="position: relative;width: 20px; float: right;height: '+__DEFAULT.height+'; line-height: '+__DEFAULT.height+';">' +
                '<i style="border-color:#888 transparent transparent transparent;border-style: solid;border-width: 5px 4px 0px 4px;height: 0;left: 50%;margin-left: -4px;margin-top:-3px ;position: absolute;top: 50%;width: 0;"></i>' +
                '</hzw></div>'
            odiv+='<div class="HselectShowAreaHuangZhanWei" style="white-space:nowrap;background-color: #fefefe;border: '+__DEFAULT.showBorder+';display: none; border-radius: 3px ;position: fixed;z-index:9999">' +
                '<input style="border:#6699CC solid 1px; padding-left:5px;margin:5px 5px;height:'+__DEFAULT.showLiHeight+';"/>'
            var opt = odiv+'<ul style="z-index: 9999;padding: 0px;list-style: none;margin:0px;' +
                'max-height:'+__DEFAULT.showHeight+';' +
                'overflow: auto;' +
                '">'
            for(var i = 0; i < a.length; i++){
                var pd = parseInt(a[i].dept)*20 - 10
                if (isNaN(pd)){
                    pd = 10
                }
                var li = '<li data-id="'+a[i].id+'" data-dept="'+a[i].dept+'" style="margin:0px; text-align: left;font-weight:500;padding-left:'+pd+'px; height:'+__DEFAULT.showLiHeight+'; line-height: '+__DEFAULT.showLiHeight+'; font-size: '+__DEFAULT.showFontSize+'; cursor: pointer;position: relative;">' +
                    '<hzw class="HshowOrHideIconHzw" style="height: '+__DEFAULT.showLiHeight+'; line-height: '+__DEFAULT.showLiHeight+'; width: 20px;cursor: cell;display: inline-block">' +
                    '<i style="border-color:'+__DEFAULT.iconColor+' transparent transparent transparent;border-style: solid;border-width: 6px 5px 0px 5px;height: 0;margin-left: 1px;margin-top: -5px;position: absolute;top: 50%;width: 0;"></i>' +
                    '</hzw>' +
                    '<span style="height: '+__DEFAULT.showLiHeight+'; line-height: '+__DEFAULT.showLiHeight+'; position: absolute;">'+a[i].text+'</span></li>'
                opt+=li;
            }
            opt +='</ul></div>'
            return opt;
        }

        function showUp(e){
            var dept = $(e).attr("data-dept")
            $(e).prevAll().each(function(index,element){
                if (parseInt(dept)>parseInt($(element).attr("data-dept"))){
                    $(element).show();
                    dept = $(element).attr("data-dept")
                }
            })
        }

        function initSelect(selObj,arr){
            var optHtml = ""
            for (var i = 0; i < arr.length; i++){
                optHtml+='<option value="'+arr[i].id+'">'+arr[i].text+'</option>'
            }
            $(selObj).append(optHtml)
            $(selObj).hide()
        }

        function showOrHide(e){
            var topBorderColor = __DEFAULT.iconColor+' transparent transparent transparent'
            var leftBorderColor = 'transparent transparent transparent '+__DEFAULT.iconColor
            var dept = $(e).attr("data-dept")
            var nextObj = $(e).next()
            var nextDept = $(nextObj).attr("data-dept")
            var nextDisplay = $(nextObj).css("display")
            if (nextDisplay == "none" && parseInt(nextDept)>parseInt(dept)){
                $(e).find("i").css({
                    "border-color":topBorderColor,
                    "border-width":"6px 5px 0px 5px"
                })

                $(e).nextAll().each(function(index,element){
                    if (parseInt(dept)+1==parseInt($(element).attr("data-dept"))){
                        $(element).find("i").css({
                            "border-color":leftBorderColor,
                            "border-width":"5px 0px 5px 6px",
                        });

                        $(element).show();
                    }else if (parseInt(dept)+1 < parseInt($(element).attr("data-dept"))){
                        $(element).find("i").css({
                            "border-color":leftBorderColor,
                            "border-width":"5px 0px 5px 6px",
                        })

                        $(element).hide();
                    }else{
                        return false
                    }
                })
            }else if (nextDisplay == "none" && parseInt(nextDept)<=parseInt(dept)){
                return
            }else if (nextDisplay != "none" && parseInt(nextDept)>parseInt(dept)){

                $(e).find("i").css({
                    "border-color":leftBorderColor,
                    "border-width":"5px 0px 5px 6px",
                })

                $(e).nextAll().each(function(index,element){
                    if (parseInt(dept)<parseInt($(element).attr("data-dept"))){
                        $(element).find("i").css({
                            "border-color":leftBorderColor,
                            "border-width":"5px 0px 5px 6px",
                        })

                        $(element).hide();
                    }else if (parseInt(dept)>=parseInt($(element).attr("data-dept"))){
                        return false
                    }
                })
            }else {
                return
            }
        }

        function initDefaultValue() {
            $(sel).val(__DEFAULT.value);
            if (__DEFAULT.value != ""){
                var text = $(sel).find("option:selected").text()
                $(obj).find(".HshowSelectValue span").html(text)
            }
        }

        var ui = genTreeUI(sortTree(__DEFAULT.data))
        initSelect(sel,__DEFAULT.data)

        $(obj).html(ui)
        $(sel).after(obj)
        $(obj).find("input").focus();
        // 清除select的默认选中状态，确保select初始化后，没有任何值被选中
        // 如果在初始化Hselect时，指定了初始值，则使用初始值
        initDefaultValue()

        $(obj).find("ul li").each(function(index,element){
            var curDept = parseInt($(element).attr("data-dept"))
            var nextDept = parseInt($(element).next().attr("data-dept"))
            if (curDept>=nextDept || isNaN(nextDept)){
                $(element).find("hzw").remove()
            }
        });

        if (__DEFAULT.disabled=="disabled"){
            // 如果select禁止选择,
            // 不需要绑定触发事件
            return
        }

        // input 框中输入事件，当用户在Hselect的下拉框中搜索时，触发这个事件
        $(obj).find("input").on('input',function(){
            // 取消后续事件
            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                var event = getEvent()
                event.stopPropagation()
            }

            var inpText = $(this).val();
            if (inpText == ""){
                $(obj).find("ul li").show();
                return
            }
            $(obj).find("ul li").each(function(index,element){
                if ($(element).find("span").html().indexOf(inpText)>=0){
                    $(element).show()
                    showUp(element)
                }else{
                    $(element).hide()
                }
            })
        })

        // 当用户在搜索框中点击鼠标左键时，触发这个事件。
        $(obj).find("input").on('click',function(){
            // 取消后续事件
            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                var event = getEvent()
                event.stopPropagation()
            }
            $(this).focus();
        })

        $(obj).find(".HshowOrHideIconHzw").on("click",function(){
            // 取消后续事件
            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                var event = getEvent()
                event.stopPropagation()
            }
            showOrHide($(this).parent())
        })

        $(obj).find("li").on('mouseover',function(){
            // 取消后续事件
            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                var event = getEvent()
                event.stopPropagation()
            }

            var ul = $(this).closest("ul")

            $(ul).find("li").css({
                "background-color":"",
                "color":""
            })

            $(this).css({
                "background-color":"#6699CC",
                "color":"white"
            })
        })

        $(obj).find("li").on('click',function(){
            // 取消后续事件
            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                var event = getEvent()
                event.stopPropagation()
            }

            var text = $(this).find("span").html();
            var id = $(this).attr("data-id");
            $(sel).val(id);
            $(this).closest("div").prev().find("span").html(text);
            $(this).closest("div").hide();
            $("body").find(".Hzwy23FillBodyForSelectItems").animate({height:'0px'},500,function(){
                $(this).remove()
            });

            $(obj).find(".HshowSelectValue i").css({
                "border-color":"#888 transparent transparent transparent",
                "border-width":"5px 4px 0px 4px"
            });

            if (typeof __DEFAULT.onChange == "function"){
                __DEFAULT.onChange();
            };
        })

        $(obj).find("ul").on('mousewheel',function(){
            // 取消后续事件
            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                var event = getEvent()
                event.stopPropagation()
            }
        })

        $("div").scroll(function() {
            // 取消后续事件
            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                var event = getEvent()
                event.stopPropagation()
            }
            var showUiStatus = $(obj).find(".HselectShowAreaHuangZhanWei").css("display")
            if (showUiStatus != "none"){
                var ptop = $(obj).offset().top
                var pleft = $(obj).offset().left;
                var tp = ptop+$(obj).find(".HshowSelectValue").height()
                $(obj).find(".HselectShowAreaHuangZhanWei").offset({top:tp,left:pleft})
            }
        });

        $(document).scroll(function() {
            // 取消后续事件
            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                var event = getEvent()
                event.stopPropagation()
            }
            var showUiStatus = $(obj).find(".HselectShowAreaHuangZhanWei").css("display")
            if (showUiStatus != "none"){
                var ptop = $(obj).offset().top
                var pleft = $(obj).offset().left;
                var tp = ptop+$(obj).find(".HshowSelectValue").height()
                $(obj).find(".HselectShowAreaHuangZhanWei").offset({top:tp,left:pleft})
            }
        });

        $("body").scroll(function() {
            // 取消后续事件
            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                var event = getEvent()
                event.stopPropagation()
            }
            var showUiStatus = $(obj).find(".HselectShowAreaHuangZhanWei").css("display")
            if (showUiStatus != "none"){
                var ptop = $(obj).offset().top
                var pleft = $(obj).offset().left;
                var tp = ptop+$(obj).find(".HshowSelectValue").height()
                $(obj).find(".HselectShowAreaHuangZhanWei").offset({top:tp,left:pleft})
            }
        });

        $(obj).find(".HshowSelectValue").on('click',function(){
            var showUiStatus = $(obj).find(".HselectShowAreaHuangZhanWei").css("display")
            // 取消后续事件
            if (window.event != undefined){
                window.event.cancelBubble = true;
            } else {
                var event = getEvent()
                event.stopPropagation()
            }
            if (showUiStatus == "none"){
                $(".HselectShowAreaHuangZhanWei").hide()
                $(".HshowSelectValue i").css({
                    "border-color":"#888 transparent transparent transparent",
                    "border-width":"5px 4px 0px 4px",
                })
                var w = $(obj).width()
                $(obj).find(".HselectShowAreaHuangZhanWei").css("min-width",w)
                $(obj).find(".HselectShowAreaHuangZhanWei input").css("min-width",w-12)


                var nextObj = $(this).next()
                $(nextObj).find("input").val("")
                $(nextObj).show();
                $(nextObj).find("input").focus();
                $(nextObj).find("ul").scrollTop(0);
                $(nextObj).find("ul").scrollLeft(0);
                $(obj).find(".HshowSelectValue i").css({
                    "border-color":"transparent transparent #888 transparent",
                    "border-width":"0px 4px 5px 4px"
                })

                var ptop = $(obj).offset().top
                var pleft = $(obj).offset().left;
                var tp = ptop+$(this).height()
                var ulHeight = $(nextObj).height()
                if (tp+ulHeight > document.body.scrollHeight){
                    var addHeight = tp+ulHeight+30 - document.body.scrollHeight
                    var appdiv = document.createElement("div")
                    $(appdiv).css("height",addHeight).addClass("Hzwy23FillBodyForSelectItems")
                    $("body").append(appdiv)
                    var st = $("body").scrollTop();
                    $("body").animate({scrollTop:st+addHeight},500)
                }
                $(obj).find(".HselectShowAreaHuangZhanWei").offset({
                    top:tp,
                    left:pleft
                })

            }else{
                $(obj).find("li").closest("div").hide();
                $(obj).find(".HshowSelectValue i").css({
                    "border-color":"#888 transparent transparent transparent",
                    "border-width":"5px 4px 0px 4px"
                })

                $("body").find(".Hzwy23FillBodyForSelectItems").animate({height:'0px'},500,function(){
                    $(this).remove()
                })
            }
        })

        $(document).on('click',function(){
            $(obj).find("li").closest("div").hide();
            $(obj).find(".HshowSelectValue i").css({
                "border-color":"#888 transparent transparent transparent",
                "border-width":"5px 4px 0px 4px"
            })
            $("body").find(".Hzwy23FillBodyForSelectItems").animate({height:'0px'},500,function(){
                $(this).remove()
            })
        });


        //when select was change
        //change show values
        $(sel).on('change',function(){
            var text = $(this).find("option:selected").text()
            $(obj).find(".HshowSelectValue span").html(text)
            if (typeof __DEFAULT.onChange == "function"){
                __DEFAULT.onChange();
            }
        });
    };
}(jQuery));

/*
 * 弹出框效果
 * */
(function($){

    $.extend({
        Hmodal:function(param){
            var __DEFAULT = {
                callback : "",
                preprocess: "",
                width:"600px",
                height:"230px ",

                header:"弹框信息",
                headerHeight:"40px",
                headerColor :"white",
                headerFontSize:"14px",
                headerFontColor:"",

                body:"",

                footer:"",

                footerBtnStatus:true,

                submitDesc:"提交",

                cancelDesc:"取消",
            }
            $.extend(true,__DEFAULT,param)

            //初始化弹框主体
            function init(){
                var mframe='<div class="modal-dialog">'+
                    '<div class="modal-content" style="border: '+__DEFAULT.headerColor+' solid 2px; width: '+__DEFAULT.width+'; height: '+__DEFAULT.height+';">'+
                    '<div class="modal-header h-modal-header" style="background-color: '+__DEFAULT.headerColor+'; height: '+__DEFAULT.headerHeight+'; line-height: '+__DEFAULT.headerHeight+'; padding: 0px;">'+
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="height: '+__DEFAULT.headerHeight+'; line-height: '+__DEFAULT.headerHeight+'; width: 30px; padding-top: 2px;">×</button>'+
                    '<h4 class="modal-title" style="margin-left: 15px;height: '+__DEFAULT.headerFontSize+';color: '+__DEFAULT.headerFontColor+'; line-height: '+__DEFAULT.headerHeight+';font-weight: 600; font-size: '+__DEFAULT.headerFontSize+'">'+__DEFAULT.header+'</h4>'+
                    '</div>'+
                    '<div class="modal-body" style="width: '+__DEFAULT.width+'; overflow-y: auto">'+__DEFAULT.body+'</div>'+
                    '<div class="modal-footer btn-group-sm">'+
                    '<button type="button" class="btn btn-danger cancel" data-dismiss="modal"><i class="icon-remove"></i>&nbsp;'+__DEFAULT.cancelDesc+'</button>'+
                    '<button type="button" class="btn btn-primary submit"><i class="icon-ok"></i>&nbsp;'+__DEFAULT.submitDesc+'</button>'+
                    '</div>' +
                    '</div>' +
                    '</div>';
                return mframe;
            }
            //显示弹出框
            function showModal(mframe){
                var hmod=document.createElement("div");
                $(hmod).addClass("modal fade").attr({
                    "tabindex":"-1",
                    "role":"dialog",
                    "aria-labelledby":"myModalLabel",
                    "aria-hidden":"true",
                })
                hmod.innerHTML=mframe;
                document.body.appendChild(hmod);
                $(hmod).modal({backdrop:false});
                $(hmod).modal("show");
                return hmod
            }

            //根据类获取对象实例
            function getObj(mod,className,typeObj){
                if (typeof typeObj == "undefined"){
                    typeObj = "div"
                }
                var obj = {}
                $(mod).find(typeObj).each(function(index,element){
                    if ($(element).hasClass(className)){
                        obj = element
                    }
                })
                return obj
            }

            //调节body高度和宽度
            function modifyBodyHeightAndWidth(mod){
                var headerObj = getObj(mod,"modal-header")
                var contentObj = getObj(mod,"modal-content")
                var bodyObj = getObj(hmode,"modal-body")
                var headHeight = $(headerObj).height()
                var contentHeight = $(contentObj).height()

                $(bodyObj).css("height",contentHeight-headHeight-65)
                $(bodyObj).css("width","-=4")
            }

            //modify location
            function modifyLocation(mod){
                var ww = $(window).width()
                var wh = $(window).height();
                var mw = $(getObj(mod,"modal-content")).width()
                var mh = $(getObj(mod,"modal-content")).height()
                //var modifyY = (wh - 2*mh)/2
                var modifyX = (ww - mw)/2
                $(getObj(mod,"modal-content")).offset({
                    left:modifyX
                })
            }

            //
            var mframe =  init()
            var hmode = showModal(mframe)
            modifyBodyHeightAndWidth(hmode)
            modifyLocation(hmode)
            //close modal when click close button in right header
            $(getObj(hmode,"modal-header")).find("button").on("click",function(){
                $(hmode).remove();
            })

            // init footer
            //
            if (__DEFAULT.footerBtnStatus){
                var footer = $(getObj(hmode,"modal-body")).find(".h-modal-footer")
                if ($(footer).find("button").html()==""){
                    console.log("can not found button in modal body content")
                    $(getObj(getObj(hmode,"modal-footer"),"submit","button")).on("click",function(){
                        console.log("no button found, default submit")
                        $(hmode).remove()
                    })
                    $(getObj(getObj(hmode,"modal-footer"),"cancel","button")).on("click",function(){
                        console.log("no button found, default cancel")
                        $(hmode).remove()
                    })
                }else{
                    $(getObj(hmode,"modal-footer")).html($(footer).html())
                    $(footer).remove()
                    if (__DEFAULT.callback == "") {
                        $(getObj(getObj(hmode,"modal-footer"),"submit","button")).on("click",function(){
                            console.log("no callback found, default submit")
                            $(hmode).remove()
                        })
                        $(getObj(getObj(hmode,"modal-footer"),"cancel","button")).on("click",function(){
                            console.log("no callback found, default cancel")
                            $(hmode).remove()
                        })
                    } else if (typeof __DEFAULT.callback == "function"){
                        $(getObj(getObj(hmode,"modal-footer"),"cancel","button")).on("click",function(){
                            console.log("defined callback, cancel")
                            $(hmode).remove()
                        })
                        $(getObj(getObj(hmode,"modal-footer"),"submit","button")).on("click",function(){
                            console.log("defined callback, submit")
                            __DEFAULT.callback(hmode)
                        })
                    }
                }
            }else{
                $(getObj(hmode,"modal-footer")).remove();
                var h = $(getObj(hmode,"modal-body")).height();
                $(getObj(hmode,"modal-body")).height(h+57);
            }


            // preprocess function
            if (typeof  __DEFAULT.preprocess == "function"){
                __DEFAULT.preprocess(hmode)
            }


            // 拖动绑定
            var d = "getSelection" in window?function(){
                window.getSelection().removeAllRanges()
            }:function(){
                document.selection.empty()
            };

            var f=0,c=0,e=0,b=0,a=0;
            $(getObj(hmode,"modal-header")).bind("mousemove",function(h){
                if(a==1){
                    f=h.pageX-e;
                    c=h.pageY-b;
                    if(c<=0){
                        c=0
                    }
                    $(this).parent().offset({left:f,top:c})
                }
            }).bind("mousedown",function(h){
                d();
                e=h.pageX-$(this).parent().offset().left;
                b=h.pageY-$(this).parent().offset().top;
                a=1;
                $(getObj(hmode,"modal-header")).css({"cursor":"move"})}
            ).bind("mouseup",function(h){
                $(getObj(hmode,"modal-header")).css({"cursor":"default"});
                a=0;
                e=0;
                b=0
            }).bind("mouseleave",function(h){
                a=0;
                $(getObj(hmode,"modal-header")).css({"cursor":"default"})
            })
        },
        Hconfirm:function(param){
            var __DEFAULT = {
                callback : "",
                preprocess: "",
                width:"420px",
                height:"240px ",

                header:"",
                headerHeight:"30px",
                headerColor :"white",
                headerFontSize:"14px",
                headerFontColor:"#0c0c0c",

                body:"",
                footer:"",
                iconClass:"icon-3x icon-question-sign",
                cancelBtn:true,
                submitBtn:true,
            }
            $.extend(true,__DEFAULT,param)

            //初始化弹框主体
            function init(){
                var mframe='<div class="modal-dialog">'+
                    '<div class="modal-content" style="border: '+__DEFAULT.headerColor+' solid 2px; width: '+__DEFAULT.width+'; height: '+__DEFAULT.height+';">'+
                    '<div class="modal-header h-modal-header" style="border: none !important;background-color: '+__DEFAULT.headerColor+'; height: '+__DEFAULT.headerHeight+'; line-height: '+__DEFAULT.headerHeight+';">'+
                    '<h4 class="modal-title" style="margin-left: 15px;height: '+__DEFAULT.headerFontSize+';color: '+__DEFAULT.headerFontColor+'; line-height: '+__DEFAULT.headerHeight+';font-weight: 600; font-size: '+__DEFAULT.headerFontSize+'; margin-right: 30px;">'+__DEFAULT.header+'</h4>'+
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="width: 30px;">×</button>'+
                    '</div>'+
                    '<div class="modal-body" style="width: '+__DEFAULT.width+'; overflow-y: auto;text-align: center"><i style="color: red;" class="'+__DEFAULT.iconClass+'"></i><br/><span style="font-size: 16px;display: block; font-weight: 600; margin-top: 15px;">'+__DEFAULT.body+'</span></div>'+
                    '<div class="modal-footer btn-group-sm" style="text-align: center; border: none;">'+
                    '<button type="button" class="btn btn-danger cancel" style="width: 120px;" data-dismiss="modal"><i class="icon-remove"></i>&nbsp;&nbsp;&nbsp;&nbsp;取消</button>'+
                    '<button type="button" class="btn btn-primary submit" style="width: 120px;margin-left: 50px;"><i class="icon-ok"></i>&nbsp;&nbsp;&nbsp;&nbsp;确定</button>'+
                    '</div>' +
                    '</div>' +
                    '</div>';
                return mframe;
            }

            //显示弹出框
            function showModal(mframe){
                var hmod=document.createElement("div");
                $(hmod).addClass("modal animated rubberBand").attr({
                    "tabindex":"-1",
                    "role":"dialog",
                    "aria-labelledby":"myModalLabel",
                    "aria-hidden":"true",
                })
                hmod.innerHTML=mframe;
                document.body.appendChild(hmod);
                $(hmod).modal({backdrop:false});
                $(hmod).modal("show");
                return hmod
            }

            //根据类获取对象实例
            function getObj(mod,className,typeObj){
                if (typeof typeObj == "undefined"){
                    typeObj = "div"
                }
                var obj = {}
                $(mod).find(typeObj).each(function(index,element){
                    if ($(element).hasClass(className)){
                        obj = element
                    }
                })
                return obj
            }

            //调节body高度和宽度
            function modifyBodyHeightAndWidth(mod){
                var headerObj = getObj(mod,"modal-header")
                var contentObj = getObj(mod,"modal-content")
                var bodyObj = getObj(hmode,"modal-body")
                var headHeight = $(headerObj).height()
                var contentHeight = $(contentObj).height()

                $(bodyObj).css("height",contentHeight-headHeight-65)
                $(bodyObj).css("width","-=4")
            }

            //modify location
            function modifyLocation(mod){
                var ww = $(window).width()
                var wh = document.documentElement.clientHeight;
                var mw = $(getObj(mod,"modal-content")).width()
                var mh = $(getObj(mod,"modal-content")).height()
                var modifyY = (wh - 1.5*mh)/2
                var modifyX = (ww - mw)/2
                if (modifyY < 0){
                    modifyY = 0
                }
                $(getObj(mod,"modal-content")).offset({
                    left:modifyX,
                    top:modifyY
                })
            }

            function initfooter(mode){
                if (!__DEFAULT.cancelBtn){
                    $(getObj(mode,"cancel","button")).remove();
                }
                if (!__DEFAULT.submitBtn){
                    $(getObj(mode,"submit","button")).remove();
                }
            }

            //
            var mframe =  init()
            var hmode = showModal(mframe)
            modifyBodyHeightAndWidth(hmode)
            modifyLocation(hmode);

            //close modal when click close button in right header
            $(getObj(hmode,"modal-header")).find("button").on("click",function(){
                $(hmode).remove();
            })

            // init footer
            var footer = $(getObj(hmode,"modal-body")).find(".h-modal-footer")
            if ($(footer).find("button").html()==""){
                console.log("can not found button in modal body content")
                $(getObj(getObj(hmode,"modal-footer"),"submit","button")).on("click",function(){
                    console.log("no button found, default submit")
                    $(hmode).remove()
                })
                $(getObj(getObj(hmode,"modal-footer"),"cancel","button")).on("click",function(){
                    console.log("no button found, default cancel")
                    $(hmode).remove()
                })
            }else{
                $(getObj(hmode,"modal-footer")).html($(footer).html())
                $(footer).remove()
                if (__DEFAULT.callback == ""){
                    $(getObj(getObj(hmode,"modal-footer"),"submit","button")).on("click",function(){
                        console.log("no callback found, default submit")
                        $(hmode).remove()
                    })
                    $(getObj(getObj(hmode,"modal-footer"),"cancel","button")).on("click",function(){
                        console.log("no callback found, default cancel")
                        $(hmode).remove()
                    })
                }else if (typeof __DEFAULT.callback == "function"){
                    $(getObj(getObj(hmode,"modal-footer"),"cancel","button")).on("click",function(){
                        console.log("defined callback, cancel")
                        $(hmode).remove()
                    })
                    $(getObj(getObj(hmode,"modal-footer"),"submit","button")).on("click",function(){
                        console.log("defined callback, submit")
                        __DEFAULT.callback()
                        $(hmode).remove()
                    })
                }
            }
            initfooter(hmode)
            // preprocess function
            if (typeof  __DEFAULT.preprocess == "function"){
                __DEFAULT.preprocess()
            }
            // 拖动绑定
            var d = "getSelection" in window?function(){
                window.getSelection().removeAllRanges()
            }:function(){
                document.selection.empty()
            };

            var f=0,c=0,e=0,b=0,a=0;
            $(getObj(hmode,"modal-header")).bind("mousemove",function(h){
                if(a==1){
                    f=h.pageX-e;
                    c=h.pageY-b;
                    if(c<=0){
                        c=0
                    }
                    $(this).parent().offset({left:f,top:c})
                }
            }).bind("mousedown",function(h){
                d();
                e=h.pageX-$(this).parent().offset().left;
                b=h.pageY-$(this).parent().offset().top;
                a=1;
                $(getObj(hmode,"modal-header")).css({"cursor":"move"})}
            ).bind("mouseup",function(h){
                $(getObj(hmode,"modal-header")).css({"cursor":"default"});
                a=0;
                e=0;
                b=0
            }).bind("mouseleave",function(h){
                a=0;
                $(getObj(hmode,"modal-header")).css({"cursor":"default"})
            })
        },
        /*
         * 这个函数，用户显示提示框。
         * */
        Notify:function(param){
            var DEFAULT = {
                icon:"icon-ok",
                caption:"",
                title:"执行成功",
                message:"执行成功",
                content:"",
                type:"success",
                position:null,
                placement: {
                    from: "top",
                    align: "center"
                },
            };

            $.extend(true,DEFAULT,param);
            switch (DEFAULT.type){
                case "success":DEFAULT.icon = "icon-ok";break;
                case "danger":DEFAULT.icon = "icon-remove" ; break;
                case "info" : DEFAULT.icon = "icon-bullhorn";break;
                case "primary": DEFAULT.icon = "icon-bell" ; break;
                case "warning": DEFAULT.icon = "icon-warning-sign"; break;
                default :
                    DEFAULT.icon = "icon-bullhorn"
            }

            if (DEFAULT.caption !=""){
                DEFAULT.title = DEFAULT.caption
            }

            if (DEFAULT.content !=""){
                DEFAULT.message = DEFAULT.content
            }

            $.notify({
                // options
                icon: DEFAULT.icon,
                title: DEFAULT.title,
                message:DEFAULT.message,
                url: '',
                target: '_blank'
            },{
                // settings
                element: 'body',
                position: DEFAULT.position,
                type: DEFAULT.type,
                allow_dismiss: true,
                newest_on_top: true,
                showProgressbar: false,
                placement:DEFAULT.placement,
                offset: 20,
                spacing: 10,
                z_index: 2147483647,
                delay: 3000,
                timer: 1000,
                url_target: '_blank',
                mouse_over: null,
                animate: {
                    enter: 'animated fadeInDown',
                    exit: 'animated fadeOutUp'
                },
                onShow: null,
                onShown: null,
                onClose: null,
                onClosed: null,
                icon_type: 'class',
            });
        },
        HAjaxRequest:function(a){
            var b = {
                type:"get",
                url:"",
                data:"",
                cache:false,
                async:false,
                dataType:"json",
                error:function(m) {
                    var msg = JSON.parse(m.responseText);
                    jQuery.Notify({
                        title: "温馨提示：",
                        message: msg.error_msg,
                        type: "danger",
                    });
                    console.log("return message is :",msg);
                    console.log("return code is :",msg.error_code);
                    console.log("return details error info:",msg.error_details);
                    console.log("return version: ",msg.version);
                },
                success:function(b){
                }
            };
            $.extend(!0,b,a);
            "delete"==b.type.toLowerCase()?(
                    b.data._method="DELETE",
                        $.ajax({
                            type:"post",
                            url:b.url,
                            cache:b.cache,
                            async:b.async,
                            data:b.data,
                            dataType:b.dataType,
                            error:b.error,
                            success:function(a){
                                b.success(a)}
                        })
                ):$.ajax({
                    type:b.type,
                    url:b.url,
                    cache:b.cache,
                    async:b.async,
                    data:b.data,
                    dataType:b.dataType,
                    error:b.error,
                    success: function(da) {
                        b.success(da)
                    },
                })
        },
    })
}(jQuery));