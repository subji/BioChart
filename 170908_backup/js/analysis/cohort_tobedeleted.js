var COHORT = 'COHORT';
var COHORT_TCGA_SAMPLE_IDS = 'COHORT_TCGA_SAMPLE_IDS';
var FILTERED_COHORT = 'FILTERED_COHORT';
var FILTERED_COHORT_TCGA_SAMPLE_IDS = 'FILTERED_COHORT_TCGA_SAMPLE_IDS';

var cohort = {
  init: function(arr) {
    this.clear();
    this.setCohort(arr);
    this.test(arr);
    console.log(this.getCountOfCohort());
  },
  clear: function() {
    sessionStorage.removeItem(COHORT);
    sessionStorage.removeItem(COHORT_TCGA_SAMPLE_IDS);
    sessionStorage.removeItem(FILTERED_COHORT);
    sessionStorage.removeItem(FILTERED_COHORT_TCGA_SAMPLE_IDS);
  },

  setCohort: function(arr) {
    sessionStorage[COHORT] = JSON.stringify(arr);
    sessionStorage[COHORT_TCGA_SAMPLE_IDS] = JSON.stringify(arr.map(function(item) {
      return item.tcga_sample_id;
    }));
  },
  filter: function(arr) {
    var query = {
      'gender': ['female'],
      'vital_status': ['alive']
    };
    var list = arr.filter(function(item) {
      // if(query['gender'].indexOf(item['gender']) > -1) return item;
      var results = [];
      for (name in query) {
        if (query[name].indexOf(item[name]) > -1) results.push(true);
        else results.push(false);
      };
      if (results.indexOf(false) === -1) return item;
    });
    console.log('female count:', list.length);
  },

  setFilteredCohort: function(arr) {
    sessionStorage[FILTERED_COHORT] = JSON.stringify(arr);
    sessionStorage[FILTERED_COHORT_TCGA_SAMPLE_IDS] = JSON.stringify(arr.map(function(item) {
      return item.tcga_sample_id;
    }));
  },

  getCohort: function() {
    return JSON.parse(sessionStorage[COHORT_TCGA_SAMPLE_IDS]);
  },
  getCountOfCohort: function() {
    return JSON.parse(sessionStorage[COHORT_TCGA_SAMPLE_IDS]).length;
  },

  getCohortTcgaSampleIds: function() {
    return JSON.parse(sessionStorage[COHORT_TCGA_SAMPLE_IDS]);
  },

  getCohortTcgaSampleIdsToString: function() {
    return this.getCohortTcgaSampleIds().toString();
  },
  /*
  	getCount: function() {
  		return sessionStorage[COUNT] || 0;
  	},


  	getFilteredCount: function() {
  		return sessionStorage[FILTERED_COUNT] || 0;
  	},

  	getMenuCountText: function(){
  		// return '(' + this.getFilteredCount() + '/' + this.getCount() + ')';
  		return  this.getFilteredCount() + ' / ' + this.getCount();
  	},
  	setMenuCountText: function(obj){
  		obj.text(' ' + this.getMenuCountText());
  	},
  	setFilterOption: function(obj) {
  		sessionStorage[FILTER_OPTION] = JSON.stringify(obj);
  	},

  	getFilterOption: function() {
  		return JSON.parse(sessionStorage[FILTER_OPTION] ||'[]');
  	},
  	*/
};
