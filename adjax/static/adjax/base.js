var adjax = function (data, views) {
    var pipeline = [];

    /*
     * Cookies
     */
    var cookies = (function () {
        /*
         * Get cookie value by name
         */
        var get = function (name) {
            var value = '; ' + document.cookie;
            var parts = value.split('; ' + name + '=');
            if (parts.length == 2) {
                return parts.pop().split(';').shift();
            }
        }

        // TODO: Implement cookies set and all

        return {
            'get': get,
            'set': null,
            'all': null,
        };
    })();

    /*
     * JSON
     */
    var json = (function () {
        // TODO: Implement JSON parsing and decoding alternatives

        return {
            'encode': JSON.stringify,
            'decode': JSON.parse,
        };
    })();

    /*
     * Utilities
     */
    var utils = (function () {
        /*
         * Equivalent to python's zip(...)
         */
        var zip = function (arrays) {
            return Array.apply(
                null, Array(arrays[0].length)
            ).map(function (_, i) {
                return arrays.map(function (array) {
                    return array[i]
                });
            });
        };

        /*
         * Equivalent to python's dict(...)
         */
        var obj = function (array) {
            var data = {};
            array.forEach(function (item) {
                data[item[0]] = item[1];
            });
            return data;
        };

        return {
            'zip': zip,
            'obj': obj,
        };
    })();

    /*
     * Call AJAX view
     */
    var call = function (app) {
        return function (name) {
            var view = views[app][name];

            return function () {
                /*
                 * Get request data and callback
                 */
                var callback;
                var values = Array.prototype.slice.call(arguments, 0);
                if (typeof arguments[arguments.length - 1] === 'function') {
                    callback = values.pop();
                }
                var data = utils.obj(utils.zip([view['args'], values]));

                /*
                 * Make request
                 */
                var xhr = new XMLHttpRequest();
                xhr.open('POST', view['url']);
                if (callback) {
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            var data;
                            try {
                                data = json.decode(xhr.responseText);
                            } catch (e) {
                                data = null;
                            }
                            callback(data);
                        }
                    };
                }
                pipeline.forEach(function (item) {
                    item(xhr);
                });
                xhr.send(json.encode(data));
            };
        };
    };

    return {
        'data': data,
        'views': views,
        'pipeline': pipeline,
        'cookies': cookies,
        'json': json,
        'utils': utils,
        'call': call,
    };
};