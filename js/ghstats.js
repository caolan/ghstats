/*!
 * GitHub Stats
 * Copyright (c) 2010 Caolan McMahon
 * MIT Licensed
 */

(function (exports) {


    /**
     * Makes a request to the github JSONP API.
     *
     * @param {String} url
     * @param {Function} callback
     * @api public
     */

    exports.request = function (url, callback) {
        $.ajax({
            url: 'http://github.com/api/v2/json' + url,
            dataType: 'jsonp',
            success: function (data, textStatus, XMLHttpRequest) {
                callback(null, data);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                callback(errorThrown || new Error(textStatus));
            }
        });
    };


    /**
     * Gets the relevant data for a user from the github API.
     *
     * @param {String} user
     * @param {Function} callback
     */

    exports.getData = function (user, callback) {
        async.parallel([
            async.apply(exports.request, '/user/show/' + user),
            async.apply(exports.request, '/repos/show/' + user),
        ],
        function (err, results) {
            if (err) return callback(err);
            var user = results[0].user;
            user.repositories = results[1].repositories;
            callback(null, user);
        })
    };


    /**
     * Gets the data for a user and processes useful stats before returning
     * it via the callback.
     *
     * @param {String} user
     * @param {Function} callback
     * @api public
     */

    exports.get = async.memoize(function (user, callback) {
        exports.getData(user, function (err, data) {
            if (err) return callback(err);

            data.total_watchers = _.reduce(data.repositories, function (a,r) {
                return a + r.watchers;
            }, 0);

            callback(null, data);
        });
    });


})((typeof exports === 'undefined') ? this['ghstats'] = {}: exports);
