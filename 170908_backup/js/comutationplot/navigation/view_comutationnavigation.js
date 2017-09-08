var COMUTS_NAVI = "comutationplot/navigation/";

define(COMUTS_NAVI + "view_comutationnavigation", ["utils", "size", COMUTS_NAVI + "event_comutationnavigation"], function(_utils, _size, _event)	{
	var make_div = function()	{
		var side = document.querySelector("#comutationplot_scale");
		var prev_div = $("#comutationplot_scale_div");

		if(prev_div)	{
			prev_div.remove();
		}
		
		var div = document.createElement("div");
		div.setAttribute("class", "input-group-spinner");
		div.setAttribute("id", "comutationplot_scale_div");
		div.style.width = "100px";
		var input = document.createElement("input");
		input.setAttribute("type", "text");
		input.setAttribute("class", "form-control");
		input.setAttribute("id", "comutationplot_scale_input");
		input.setAttribute("value", "100%");
		input.setAttribute("disabled", true);
		var vertical_div = document.createElement("div");
		vertical_div.setAttribute("class", "input-group-btn-vertical");
		vertical_div.setAttribute("id", "comutationplot_vertical_div");
		var btn_up = document.createElement("button");
		btn_up.setAttribute("class", "btn btn-default");
		btn_up.setAttribute("id", "comutationplot_draw_up");
		btn_up.setAttribute("type", "button");
		var btn_down = document.createElement("button");
		btn_down.setAttribute("class", "btn btn-default");
		btn_down.setAttribute("id", "comutationplot_draw_down");
		btn_down.setAttribute("type", "button");
		var i_up = document.createElement("i");
		i_up.setAttribute("class", "fa fa-caret-up");
		i_up.setAttribute("id", "comutationplot_up_i");
		var i_down = document.createElement("i");
		i_down.setAttribute("class", "fa fa-caret-down");
		i_down.setAttribute("id", "comutationplot_down_i");
		var div_init = document.createElement("div");
		div_init.setAttribute("class", "input-group-btn");
		var btn_init = document.createElement("button");
		btn_init.setAttribute("class", "btn btn-defalut");
		btn_init.setAttribute("id", "comutationplot_initial_button");
		var span_init = document.createElement("span");
		span_init.setAttribute("class", "glyphicon glyphicon-record");
		span_init.setAttribute("aria-hidden", "true");

		btn_up.appendChild(i_up);
		btn_down.appendChild(i_down);
		btn_init.appendChild(span_init);

		vertical_div.appendChild(btn_up);
		vertical_div.appendChild(btn_down);
		div_init.appendChild(btn_init);

		div.appendChild(input);
		div.appendChild(vertical_div);
		div.appendChild(div_init)

		side.appendChild(div);
	}

	var view = function(_data)	{
		var data = _data || {};
		var size = data.size;
		var e = _event(data) || null;
		
		make_div();

		$("#comutationplot_draw_up")
		.on("click", e.click)
		.tooltip({
			title : "확대",
			placement : "top"
		});

		$("#comutationplot_draw_down")
		.on("click", e.click)
		.tooltip({
			title : "축소",
			placement : "bottom"
		});

		$("#comutationplot_initial_button")
		.on("click", e.init)
		.tooltip({
			container : "body",
			title : "처음으로",
			placement : "right"
		})
	}
	return {
		view : view
	}
});