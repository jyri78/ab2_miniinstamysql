var sql = require('./sql');
var api_url = '/api/';


function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function returnError(error) {
    console.log('ERROR: ' + error);
    res.status(500).send('ERROR: '+ error);
}

function runQuery(query, res, func = '', values = []) {
    sql.querySql(query, values, function(data) {
        if (data !== undefined && data.length > 1) {  // Ei arvesta PROCEDURE poolt lisatava infoga
            let onlyOne = data.length==2 && data[0].length==1;

            console.log(`[${func}] Tagastati ridu: ${(onlyOne ? '1' : data[0].length)}`);
            res.send( onlyOne ? data[0][0] : data[0] );
        } else res.status(404).send([]);
    }, returnError);
}

function runQueryEx(query, res, func = '', values = [], keys = [1, 2]) {
    sql.querySql(query, values, function(data) {
        if (data !== undefined && data.length > 1) {
            let cnt = data.length - 1;
            let result = data[0][0];

            if(data.length > 2) {  // PROCEDURE lisab ekstra info
                let value1 = data[1];

                if (value1 !== undefined && value1.length > 0) {
                    cnt += value1.length - 1;
                    result[keys[0]] = value1;
                } else result[keys[0]] = [];
            }
            if (data.length > 3) {
                let value2 = data[2];

                if (value2 !== undefined && value2.length > 0) {
                    cnt += value2.length - 1;
                    result[keys[1]] = value2;
                } else result[keys[1]] = [];
            }
            console.log(`[${func}] Tagastati ridu: ${cnt}`);
            res.send(result);
        } else res.status(404).send([]);
    }, returnError);
}


exports.index = function(req, res) {
    res.send('<h1>Tere tulemast!</h1>');
};

exports.users = function(req, res) {
    if (typeof req.params.id !== 'undefined') {
        let query = 'CALL ab2_MiniInsta__GetUserBy';

        if (isNumber(req.params.id)) query += 'Id(?);';
        else query += 'Username(?);';

        runQuery(query, res, 'userBySelection', [req.params.id]);
    } else
        runQuery('CALL ab2_MiniInsta__GetUsers();', res, 'users');
};

exports.getFrontPage = function(req, res) {
    runQuery('CALL ab2_MiniInsta__GetFrontPage(?);', res, 'frontPage', [req.params.id]);
}

exports.getProfilePage = function(req, res) {
    var query = 'CALL ab2_MiniInsta__GetProfilePageBy';

    if (isNumber(req.params.id)) query += 'Id(?);';
    else query += 'Username(?);';

    runQueryEx(query, res, 'profilePage', [req.params.id], ['Posts', 'Extra']);
}

exports.getPostPage = function(req, res) {
    runQueryEx('CALL ab2_MiniInsta__GetPostPage(?);', res, 'postPage', [req.params.id], ['PostMedia', 'Comments']);
}
exports.getStatistics = function(req, res) {
    runQuery('CALL ab2_MiniInsta__GetStatistics();', res, 'statistics');
}
exports.getTop10PostingUsers = function(req, res) {
    runQuery('CALL ab2_MiniInsta__GetTop10PostingUsers();', res, 'top10PostingUsers');
}
exports.getUserRegistrations = function(req, res) {
    runQuery('CALL ab2_MiniInsta__GetUserRegistrations();', res, 'userRegistrations');
}
exports.getGenderDivision = function(req, res) {
    runQuery('CALL ab2_MiniInsta__GetGenderDivision();', res, 'genderDivision');
}

exports.apiIndex = function(req, res) {
    let result = {'ID': [], 'Username': [], 'Posts': []};
    let model = null;

    sql.querySql('CALL ab2_MiniInsta__GetApiIndexData();', [], function(data) {
        if (data !== undefined) {
            console.log('Tagastati ridu: ' + data[0].length +'/'+ data[1].length);
            for (let i=0; i<data[0].length; i++) {
                result.ID.push(data[0][i].ID);
                result.Username.push(data[0][i].Username);
            }
            for (let i=0; i<data[1].length; i++) result.Posts.push(data[1][i].ID);
            result.ID.sort(function(a, b) { return a - b; });
            result.Username.sort();
            result.Posts.sort(function(a, b) { return a - b; });

            model = {
                title: 'API funktsioonid',
                data: [
                    { name: 'UserID', values: result.ID, url: api_url },
                    { name: 'Username', values: result.Username, url: api_url },
                    { name: 'PostID', values: result.Posts, url: api_url },
                ],
                api: [
                    { name: 'Users / User by {selection}', id: 'users', url: api_url +'users', target: '_blank' },
                    // { name: 'User by ID', url: api_url +'users', extra: 'ID', data: result.ID },
                    // { name: 'User by Username', url: '/api/users', extra: 'Username', data: result.Username },
                    { name: 'Front page by ID', id: 'frontpage', url: 'javascript:void(0)', target: '' },
                    { name: 'Profile page by {selection}', id: 'profilepage', url: 'javascript:void(0)', target: '' },
                    { name: 'Post page by ID', id: 'postpage', url: 'javascript:void(0)', target: '' },
                    { name: '', id: '--', url: 'javascript:void(0)', target: '' },
                    { name: 'Statistics', id: 'stats', url: api_url +'stats', target: '_blank' },
                    { name: 'Top10 posting users', id: 'top10postingusers', url: api_url +'stats/top10postingusers', target: '_blank' },
                    { name: 'User registrations', id: 'userregistrations', url: api_url +'stats/userregistrations', target: '_blank' },
                    { name: 'Gender division', id: 'genderdivision', url: api_url +'stats/genderdivision', target: '_blank' },
                ]
            };

            res.render('api-index', model);
        }
    }, returnError);
};

exports.default = function(req, res) {
    res.status(404).send('<h1 style="color:red">Vigane ressurss</h1>');
};
