/**

repo : https://supanatvee@bitbucket.org/supanatve/line-pay.git
description : DON'T write to this file . This file contain a source code that using in
interface with Rabbit LINE Pay 
author : spnv

**/

// import module
var define = require('./define.js');
var request = require('request');

// private

// public
// constructor
function LINE_PAY_SPNV(id, secret, name) {
    this.channelId = id;
    this.channelSecret = secret;
    this.postUrlPrefix = define.SANDBOX_URL_PREFIX;
    console.log(" LINE_PAY_SPNV Console : " + name + " start working ");
    /* Example =>
	var payments = new linePay('1507753004', 'b1cecc6ca1939afb5bef3a00a9c4b185', 'payments');
    */
}

LINE_PAY_SPNV.prototype.setEnvironment = function(_mode) {
    switch (_mode) {
        case define.ON_DEVELOPMENT:
            this.postUrlPrefix = define.SANDBOX_URL_PREFIX;
            break;
        case define.ON_PRODUCTION:
            this.postUrlPrefix = define.OPERATION_URL_PREFIX;
            break;
        default:
            break;
    }
    /* Example =>
	payments.setEnvironment('ON_DEVELOPMENT');
    */
};

LINE_PAY_SPNV.prototype.payPostReq = function(_api, _body, callback) {
    var fullUrl = this.postUrlPrefix + _api

    request.post({
        headers: {
            'content-type': 'application/json;charset=UTF-8',
            'X-LINE-ChannelId': this.channelId,
            'X-LINE-ChannelSecret': this.channelSecret
        },
        url: fullUrl,
        body: _body
    }, function(error, response, data) {
        var _jsonData = JSON.parse(data);
        console.log(_jsonData.returnMessage);
        callback(_jsonData);
    });
};

LINE_PAY_SPNV.prototype.payGetReq = function(_api, _body, callback) {
    var fullUrl = this.postUrlPrefix + _api

    request.get({
        headers: {
            'content-type': 'application/json;charset=UTF-8',
            'X-LINE-ChannelId': this.channelId,
            'X-LINE-ChannelSecret': this.channelSecret
        },
        url: fullUrl,
        body: _body
    }, function(error, response, data) {
        var _jsonData = JSON.parse(data);
        console.log(_jsonData.returnMessage);
        callback(_jsonData);
    });
};

LINE_PAY_SPNV.prototype.createOrder = function() {
    return {
        productName: 'null',
        productImageUrl: 'null',
        amount: 0,
        currency: "THB",
        orderId: 'null',
        confirmUrl: 'null',
        capture: "true"
    };

    /* Example =>
	var order01 = payments.createOrder();
    order01.productName = "test product";
    order01.productImageUrl = "http://megaicons.net/static/img/icons_title/8/178/title/sections-of-website-product-icon.png";
    order01.amount = 100;
    order01.orderId = datetime.toISOString();
    order01.confirmUrl = "https://rabbit-payment.herokuapp.com/return?amount=" + order01.amount;
    */
};

LINE_PAY_SPNV.prototype.reservePayment = function(_order, callback) {

    var _jsonBody = JSON.stringify(_order);

    this.payPostReq('request', _jsonBody, function(body) {

        var _resData = {
            code: body.returnCode,
            transactionId: 'null',
            orderId: 'null',
            web: 'null',
            app: 'null'
        };

        switch (body.returnCode) {
            case "0000":
                // succes
                _resData.transactionId = body.info.transactionId;
                _resData.orderId = _order.orderId;
                _resData.web = body.info.paymentUrl.web;
                _resData.app = body.info.paymentUrl.app;
                break;
            default:
                // else (fail)
                _resData.transactionId = 'err';
                _resData.orderId = 'err';
                _resData.web = 'err';
                _resData.app = 'err';
                break;
        }

        callback(_resData);
    });

    /* Example =>
	payments.reservePayment(order01, function(body) {
        console.log(body);
        res.end();
    });
    */
};

LINE_PAY_SPNV.prototype.paymentConfirm = function(_transactionId, _amt, callback) {

    var _jsonBody = JSON.stringify({
        "amount": _amt,
        "currency": "THB"
    });

    this.payPostReq(_transactionId + "/confirm", _jsonBody, function(data) {

        var _resData = {
            transactionId: 'null',
            orderId: 'null'
        };

        switch (data.returnCode) {
            case "0000":
                // succes
                _resData.transactionId = data.info.transactionId;
                _resData.orderId = data.info.orderId;
                break;
            default:
                // else (fail)
                _resData.transactionId = 'err';
                _resData.orderId = 'err';
                break;
        }

        callback(_resData);
    });

    /* Exmaple =>
	payments.paymentConfirm(req.query.transactionId, req.query.amount, function(data) {
        console.log(data);
        res.end();
    });
    */
};

module.exports = LINE_PAY_SPNV;
