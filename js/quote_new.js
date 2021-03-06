/**
 * Created by admin on 2016/4/17.
 */

//页面初始化
$(document).ready(function () {
    freshMyPage();

    //初始化产品选择列表
    //(function (){
    //    $.ajax({
    //        url: "../../php/get_product.php",
    //        type: "POST",
    //        dataType: "json",
    //        success: function(data){
    //            autoproduct('.productID', data[0]);
    //            data.forEach(function (ele) {
    //                this.append("<option value='" + ele + "'>" + ele + "</option>");
    //            }, $(".productID"));
    //
    //        }
    //    });
    //})();


});

$('#validity').daterangepicker();
$("#customerName").bigAutocomplete({
    url: "../../php/auto_customer.php",
    callback: function(data){
        var customerId = data.id;
        $("#customerID").text(customerId);
        $.ajax({
            url: "../../php/auto_contact.php",
            type: "POST",
            data: {'customerId': customerId},
            dataType: "json",
            success: function(data){
                data.forEach(function(ele){
                    this.append("<option value='" + ele.id + "'>" + ele.name + "</option>");
                }, $("#customerContact"));
            }
        })
    }
});

var currency = "RMB";
//选择货币类型
$("#currencyRMB").click(function () {
    $(".rmb-usd").text("¥");
    currency = "RMB";
});

$("#currencyUSD").click(function () {
    $(".rmb-usd").text("$");
    currency = "USD";
});

//自动填充产品信息
//function autoproduct(ele, key){
//    var key = key || $(ele).val();
//    var disc = $(ele).parent().parent().find(".productDisc");
//    var orig_price = $(ele).parent().parent().find(".productOriginalPrice");
//    $.ajax({
//        url: "../../php/get_product.php",
//        type: "POST",
//        data: {'key': key},
//        dataType: "json",
//        success: function(data){
//            disc.val(data.disc);
//            orig_price.val(new Number(data.price).toFixed(2));
//        }
//    });
//}


//格式化单价形式
function formatOriginalPrice(element) {
    var a  = new Number($(element).val());
    if (!isNaN(a)){
        $(element).val((Math.round(a * 100) / 100).toFixed(2));
    }

}


//自动计算
function autoCalculate(element) {
    var a = $(element).parent().parent();
    var originalPrice = new Number(a.find(".productOriginalPrice").val());
    var discount = new Number(a.find(".productDiscount").val());
    var taxRate = function(val){
        var rate = {
            '0': function () {
                return 1;
            },
            '1': function () {
                return 1.06;
            },
            '2': function () {
                return 1.17;
            }
        };
        if (typeof(rate[val]) === "function"){
            return rate[val]();
        }
        else
        {
            return NaN;
            console.log("taxRate Input Error");
        }
    }(a.find(".productTaxRate").val());
    var amount = new Number(a.find(".productAmount").val());
    var price = originalPrice * (discount / 100) * taxRate;
    a.find(".productPrice").text(price.toFixed(2));
    a.find(".productTotalPrice").text((price * amount).toFixed(2));
    var sum = new Number(0);
    $(".productTotalPrice").each(function () {
        sum += new Number($(this).text());
    });
    if(!isNaN(sum))
    {
        $("#sumOfTotalPrice").text(sum.toFixed(2));
    }
    else
    {
        $("#sumOfTotalPrice").text("等待修改...");
    }
}

//添加备注
function addPS(ele){
    $(ele).next().modal('show');
}

//添加一行产品
var productItemColumn = 1;  //产品列表的行数
$("#btnAddProductItem").click(function () {
    $("#trProductItem_0").clone().attr('id', 'trProductItem_' + productItemColumn).find(".No").text((productItemColumn + 1) + ".").end()
        .find(".productID").val("").end()
        .find(".productName").val("").end()
        .find(".productOriginalPrice").val("").end()
        .find(".productDiscount").val(100).end()
        .find(".productPrice").text("0.00").end()
        .find(".productAmount").val(0).end()
        .find(".productTotalPrice").text("0.00").end()
        .find("[data-toggle='popover']").popover({
            html : true,
            title: "备注",
            content: ""
        }).end()
        .appendTo("#tbodyProductItem");

    productItemColumn += 1;
});

//保存
$("#btnSave").click(function () {
    //验证填写是否符合规范
    if($("#customerID").text() === ""){
        alertMsg("请填写目标客户", "warning");
    }
    else if($("#validity").val() === ""){
        alertMsg("请填写有效期区间", "warning");
    }
    else{
        var customer = {
            id: $("#customerID").text(),
            contact: $("#customerContact").val()
        };

        var validity = $("#validity").val().split(" - ");
        var product = [];
        for(var i = 0; i < productItemColumn; i += 1)
        {
            if ($("#trProductItem_" + i).find(".productID").val() != null)
            {
                product[i] = {
                    id: $("#trProductItem_" + i).find(".productID").val(),
                    name: $("#trProductItem_" + i).find(".productName").val(),
                    origPrice: $("#trProductItem_" + i).find(".productOriginalPrice").val(),
                    discount: $("#trProductItem_" + i).find(".productDiscount").val(),
                    taxRate: $("#trProductItem_" + i).find(".productTaxRate").val(),
                    amount: $("#trProductItem_" + i).find(".productAmount").val(),
                    ps: $("#trProductItem_" + i).find(".productPS").val()
                }
            }
        }

        //console.log(customer);
        //console.log(validity);
        //console.log(product);

        $.ajax({
            url: "../../php/quote_save.php",
            data: {customer: JSON.stringify(customer),
                validity: validity,
                currency: currency,
                product: JSON.stringify(product)
            },
            type : "POST",
            cache : false,
            success: function (data) {
                if (data == 0)
                {
                    alertMsg("报价单保存成功！", "success");
                }
                else
                {
                    alertMsg("报价单保存失败", "danger");
                }
            }
        });
    }
});


