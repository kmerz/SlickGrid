(function($) {
    // register namespace
    $.extend(true, window, {
        "Slick": {
            "CheckboxSelectColumn":   CheckboxSelectColumn
        }
    });


    function CheckboxSelectColumn(options) {
        var _grid;
        var _self = this;
        var _selectedRowsLookup = {};
        var _defaults = {
            columnId: "_checkbox_selector",
            cssClass: null,
            toolTip: "Select/Deselect All",
            width: 30
        };

        var _options = $.extend(true,{},_defaults,options);

        function init(grid) {
            _grid = grid;
            _grid.onSelectedRowsChanged.subscribe(handleSelectedRowsChanged);
            _grid.onClick.subscribe(handleClick);
            _grid.onHeaderClick.subscribe(handleHeaderClick);
        }

        function destroy() {
            _grid.onSelectedRowsChanged.unsubscribe(handleSelectedRowsChanged);
            _grid.onClick.unsubscribe(handleClick);
            _grid.onHeaderClick.unsubscribe(handleHeaderClick);
        }

        function handleSelectedRowsChanged(e, args) {
            var selectedRows = _grid.getSelectedRows();
            var lookup = {}, row, i;
            for (i = 0; i < selectedRows.length; i++) {
                row = selectedRows[i];
                lookup[row] = true;
                if (lookup[row] !== _selectedRowsLookup[row]) {
                    _grid.invalidateRow(row);
                    delete _selectedRowsLookup[row];
                }
            }
            for (i in _selectedRowsLookup) {
                _grid.invalidateRow(i);
            }
            _selectedRowsLookup = lookup;
            _grid.render();

            if (selectedRows.length == _grid.getDataLength()) {
                _grid.updateColumnHeader(_options.columnId, "<input type='checkbox' checked='checked'>", _options.toolTip);
            }
            else {
                _grid.updateColumnHeader(_options.columnId, "<input type='checkbox'>", _options.toolTip);
            }
        }

        function handleClick(e, args) {
            // clicking on a row select checkbox
            if (_grid.getColumns()[args.cell].id === _options.columnId && $(e.target).is(":checkbox")) {
                // if editing, try to commit
                if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }

                if (_selectedRowsLookup[args.row]) {
                    _grid.setSelectedRows($.grep(_grid.getSelectedRows(),function(n) { return n != args.row }));
                }
                else {
                    _grid.setSelectedRows(_grid.getSelectedRows().concat(args.row));
                }
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }

        function handleHeaderClick(e, args) {
            // No cloumn was clicked, but instead the background of header
            if (args.column == undefined) {
                return;
            }
            
            if (args.column.id == _options.columnId && $(e.target).is(":checkbox")) {
                // if editing, try to commit
                if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }

                if ($(e.target).is(":checked")) {
                    var rows = [];
                    for (var i = 0; i < _grid.getDataLength(); i++) {
                        rows.push(i);
                    }
                    _grid.setSelectedRows(rows);
                }
                else {
                    _grid.setSelectedRows([]);
                }
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }

        function getColumnDefinition() {
            return {
                id: _options.columnId,
                name: "<input type='checkbox'>",
                toolTip: _options.toolTip,
                field: "sel",
                width: _options.width,
                resizable: false,
                sortable: false,
                cssClass: _options.cssClass,
                formatter: checkboxSelectionFormatter
            };
        }

        function checkboxSelectionFormatter(row, cell, value, columnDef, dataContext) {
            if (dataContext) {
                return _selectedRowsLookup[row]
                        ? "<input type='checkbox' checked='checked'>"
                        : "<input type='checkbox'>";
            }
            return null;
        }

        $.extend(this, {
            "init":                         init,
            "destroy":                      destroy,

            "getColumnDefinition":          getColumnDefinition
        });
    }
})(jQuery);
