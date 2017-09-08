define(function (require)	{
	var React 	 = require('react');
	var ReactDOM = require('reactdom');

	var typeSelector = function (data)	{
		var div  = document.createElement('div');
		var ContentPopover = React.createClass({
			render : function ()	{
				return (
					<div>
						<TypeListPopover types = { this.props.typelist } />
						<ButtonPopover />
					</div>
				)
			}
		});

		var TypeListPopover = React.createClass({
			getInitialState : function ()	{
				var obj = {}

				this.props.types.map(function (data, index)	{
					obj[data.name] = data.checked;
					data.list.map(function (d, i)	{
						obj[d.name] = d.a_checked;
					});
				});

				return obj
			},
			render : function ()	{
				var that  = this;
				var items = function (index)	{
					return that.props.types[index].list.map(function (data, index)	{
						return (
							<div className = 'checkbox type items' key = { data.name + '_index'}>
								<label>
									<input type 		= 'checkbox' 				name 		 = { data.name }
								 				 id 			= 'type-input-one'	checked  = { that.state[data.name] }
								 				 onChange = { that.changeOneStatus } 
								 				 value    = { data.name + (data.parent ? data.parent : '') } />
								 	{ data.name }
								</label>
							</div>
						)
					})
				}.bind(this);

				return (
					<div className = 'list-group' id = 'type-list'>
						<div className = 'list-group-item' id = 'type-items'>
							{
								this.props.types.map(function (data, index)	{
									return <div className = 'checkbox type titles' key = { data.name }>
													 <label>
													 		<h4>
													 			<input type 		= 'checkbox' 				name 		 = { data.name }
															 				 id 			= 'type-input-all'	checked  = { that.state[data.name] }
															 				 onChange = { that.changeAllStatus } 
															 				 value    = { data.name + (data.parent ? data.parent : '') } />
														 		{ data.name }
														 	</h4>
															<hr id = 'divider' />
														 	{ items(index) }
														 	<hr id = 'divider' />
													 </label>
												 </div>
								})
							}
						</div>
					</div>
				)
			},
			changeAllStatus : function (e)	{
				var that  		= this;
				var value     = that.props.types.map(function (d, i)	{
					if (d.name === e.target.name)	{
						that.state[d.name] = !that.state[d.name];

						d.checked = !d.checked;
						d.list.map(function (data, index)	{
							that.state[data.name] = that.state[d.name];
							data.a_checked 				= that.state[d.name];
						});
					}
				});

				this.setState(value);
			},
			changeOneStatus : function (e)	{
				var that  = this;
				var value = this.props.types.map(function (d, i)	{
					d.list.map(function (data, index)	{
						if (data.name === e.target.name)	{
							that.state[data.name] = !that.state[data.name];

							data.a_checked = !data.a_checked;
						}
					});
				});

				this.setState(value);
			}
		});

		var ButtonPopover = React.createClass({
			render : function ()	{
				return (
					<div className = 'col-md-12'>
						<button type = 'button' className = 'btn btn-default btn-sm'
										id 	 = 'type-set-ok'>
							<span className = 'glyphicon glyphicon-ok' aria-hidden = 'true'>
								 Save
							</span>
						</button>
						<button type = 'button' className = 'btn btn-primary btn-sm'
										id 	 = 'type-set-cancel'>
							<span className = 'glyphicon glyphicon-remove' aria-hidden = 'true'>
								 Cancel
							</span>
						</button>
					</div>
				);
			}
		});

		ReactDOM.render(
			<ContentPopover typelist = { data.type_list }/>,
			document.getElementById('popoverContent')
		);
	}

	// 후에 그룹 선택/해제에 사용될 코드이다.
	var groupSelector = function (data)	{
    var contDiv  			 = document.createElement('div');
		var ContentPopover = React.createClass({
			render : function ()	{
				return (
					<div>
						<ListPopover grouplist = { this.props.grouplist } />
						<ButtonPopover />
					</div>
				);
			}
		});

		var ListPopover   = React.createClass({
			render : function ()	{
				return (
					<div className = 'list-group' id 		= 'settingList'>
						<div className = 'list-group-item' id = 'settingListItems'>
							<h4 className = 'list-group-item-heading'>
								<span className = 'label label-default'> 
									Group Items
								</span>
							</h4>
							<hr id = 'divider' />
							{
								this.props.grouplist.map(function (d, idx)	{
									return <div className = 'checkbox' key = { d.name }>
													 <label>
														 <InputItemPopover groupdata = { d }/>
														 { d.name }
													 </label>
												 </div> 									
								})
							}
						</div>
					</div>
				);
			}
		});

		var InputItemPopover = React.createClass({
			getInitialState : function ()	{
				return {
					// checked property 의 상태 update 를 위해서 data 의 checked 값을
					// jsx 태그의 초기 상태값으로 저장해 주었다.
					isChecked : this.props.groupdata.checked,
				}
			},
			render : function ()	{
				var d = this.props.groupdata;

				return (
					<input type 		= 'checkbox' 		value    = { d.name } 
					 			 id 			= 'groupItems'	checked  = { this.state.isChecked }
					 			 onChange = { this.changeStatus } />
				);
			},
			changeStatus : function (e)	{
				this.setState({
		      isChecked : !this.state.isChecked 
		    }, function() {
		      console.log(this.state);
		    }.bind(this));
			}
		});

		var ButtonPopover = React.createClass({
			render : function ()	{
				return (
					<div className = 'col-md-12'>
						<button type = 'button' className = 'btn btn-default btn-sm'
										id 	 = 'settingOk'>
							<span className = 'glyphicon glyphicon-ok' aria-hidden = 'true'>
								 Save
							</span>
						</button>
						<button type = 'button' className = 'btn btn-primary btn-sm'
										id 	 = 'settingCancel'>
							<span className = 'glyphicon glyphicon-remove' aria-hidden = 'true'>
								 Cancel
							</span>
						</button>
					</div>
				);
			}
		});

		ReactDOM.render(
			<ContentPopover grouplist = { data.group_list }/>,
			document.getElementById('popoverContent')
		);
	}

	var Expressions = function ()	{}

	Expressions.prototype.makeOption = function (opts)	{
		var OptionButton 	= React.createClass({
			render : function ()	{
				return (
					<button className 		= 'btn btn-darkgrey dropdown-toggle'
									type 					= 'button' data-toggle = 'dropdown'
									aria-haspopup = 'true' aria-expanded = 'false'
									id 						= { opts.id + 'Btn' }>
						<span className 		= 'caret expressions-caret'></span>
					</button>
				);
			}
		});

		var OptionList   	= React.createClass({
			render : function ()	{
				var arr = this.props.data.constructor == Object 
								? Object.keys(this.props.data) : this.props.data;

				return (
					<ul className = 'dropdown-menu dropdown-menu-right' 
							id 				= 'scoreFunctionUl'>
						{
							arr.map(function (d)	{
								return <li key = { d } className = { opts.id  + '-item' }>
												 <a href='#' title = { d }> { d } </a>
											 </li>
							})
						}
					</ul>
				);
			}
		});

		var OptionWrapper = React.createClass({
			render : function ()	{
				return (
					<div className = 'input-group-btn'>
						<OptionButton />
						<OptionList data = { this.props.data }/>
					</div>
				)
			}
		});

		ReactDOM.render(
			<OptionWrapper data = { opts.data }/>,
			document.getElementById(opts.target)
		);
	}

	var ExpressionsOption = function (){}

	ExpressionsOption.prototype.makeOption = function ()	{
		
	}

	return {
		'Expressions'	  		: Expressions  		 ,
		'ExpressionsOption' : ExpressionsOption,
		'typeSelector'  		: typeSelector 		 ,
		'groupSelector' 		: groupSelector		 ,
	}
});