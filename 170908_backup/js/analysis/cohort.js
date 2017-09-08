var COUNT = 'COUNT';
var FILTERED_COUNT = 'FILTERED_COUNT';

var COHORT_SOURCE = 'COHORT_SOURCE';
var FILTER_VALUE_OPTION = 'FILTER_VALUE_OPTION';
var FILTER_RANGE_OPTION = 'FILTER_RANGE_OPTION';

var cohort = {
  init: function(source, cnt) {
    this.clear();
    this.save(source, cnt, cnt);
  },

  save: function(source, total, cnt) {
    this.setCohortSource(source);
    this.setCount(total);
    this.setFilteredCount(cnt);
  },

  clear: function() {
    localStorage.clear();
  },

  setCount: function(cnt) {
    localStorage[COUNT] = cnt;
  },

  getCount: function() {
    return localStorage[COUNT] || 0;
  },

  setFilteredCount: function(cnt) {
    localStorage[FILTERED_COUNT] = cnt;
  },

  getFilteredCount: function() {
    return localStorage[FILTERED_COUNT] || 0;
  },

  setCohortSource: function(source) {
    localStorage[COHORT_SOURCE] = source;
  },

  getCohortSource: function() {
    return localStorage[COHORT_SOURCE] || 'GDAC';
  },

  getMenuCountText: function() {
    // return '(' + this.getFilteredCount() + '/' + this.getCount() + ')';
    return this.getFilteredCount() + ' / ' + this.getCount();
  },

  setMenuCountText: function(obj) {
    obj.text(this.getCohortSource() + ' : ' + this.getMenuCountText());
  },

  getFilterOption: function() {
    return this.getFilterValueOption().join(',') + ':' + this.getFilterRangeOption().join(',');
  },

  setFilterValueOption: function(obj) {
    localStorage[FILTER_VALUE_OPTION] = JSON.stringify(obj);
  },

  getFilterValueOption: function() {
    return JSON.parse(localStorage[FILTER_VALUE_OPTION] || '[]');
  },

  setFilterRangeOption: function(obj) {
    localStorage[FILTER_RANGE_OPTION] = JSON.stringify(obj);
  },

  getFilterRangeOption: function() {
    return JSON.parse(localStorage[FILTER_RANGE_OPTION] || '[]');
  },
};
