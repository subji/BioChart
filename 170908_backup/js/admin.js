$('#table').bootstrapTable({
    url: '/models/users',
    method: 'get',
    idField: 'id',
    search: true,
    showRefresh: true,
    showColumns: true,
    columns: [{
        field: 'username',
        title: 'ID',
    }, {
        field: 'fullname',
        title: 'Name',
        sortable: 'true',
    }, {
        field: 'group',
        title: 'Group',
        sortable: 'true',
        editable: {
            url: '/models/users/',
            type: 'select',
            title: 'Select User Group',
            ajaxOptions: {
                type: 'put',
                dataType: 'json',
                cache: false,
            },
            success: function(res) {},
            error: function(res) {
                return res.responseText;
            },
            source: [{
                value: 'user',
                text: 'user'
            }, {
                value: 'admin',
                text: 'admin'
            }],
        },
    }, {
        field: 'mobile',
        title: 'Mobile',
    }, {
        field: 'birth',
        title: 'Day of birth',
    }, {
        field: 'country',
        title: 'Country',
    }, {
        field: 'gender',
        title: 'Gender',
        align: 'center',
        formatter: 'genderFormatter',
    }, {
        field: 'institute_short',
        title: 'Institute',
    }, {
        field: 'enable',
        title: 'Active?',
        sortable: 'true',
        //formatter: 'statusFormatter',
        editable: {
            url: '/models/users/',
            type: 'select',
            title: 'Can use?',
            ajaxOptions: {
                type: 'put',
                dataType: 'json',
                cache: false,
            },
            success: function(res) {},
            error: function(res) {
                return res.responseText;
            },
            source: [{
                value: 1,
                text: 'Yes'
            }, {
                value: 0,
                text: 'No'
            }],
        },
    }]
});

function rowStyle(row, index) {
    return (row.enable) ? {
        classes: ''
    } : {
        classes: 'active'
    };
}

function noFormatter(value, row, index) {
    return index + 1;
}

function genderFormatter(value, row) {
    var icon = (row.gender === 'M') ? 'fa-mars' : 'fa-venus';
    return '<i class="fa ' + icon + '"></i> ';
}

function statusFormatter(value, row) {
    return (row.enable === 0) ? 'Disable' : 'Enable';
}
