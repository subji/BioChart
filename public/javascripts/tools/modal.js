function modal ()	{
	'use strict';

	var model = {};
	// TODO.. 
	function okButton ()	{

	};
	// Make close button.
	function closeButton ()	{
		var btn = document.createElement('button');
		
		btn.id = 'modal_close';
		// Bootstrap style button.
		btn.className = 'btn btn-default';
		btn.innerHTML = 'Close';

		btn.setAttribute('type', 'button');
		// This attribute is close the modal.
		btn.setAttribute('data-dismiss', 'modal');

		return btn;
	};

	function makeModal (id)	{
		model.modal = document.createElement('div');
		model.modal.setAttribute('tabindex', '-1');
		model.modal.setAttribute('role', 'dialog');
		model.modal.setAttribute('aria-labelledby', id);
		model.dialog = document.createElement('div');
		model.dialog.setAttribute('role', 'document');
		model.content = document.createElement('div');
		model.header = document.createElement('div');
		model.footer = document.createElement('div');
		model.title = document.createElement('div');
		model.body = document.createElement('div');

		model.modal.id = id;
		model.body.className = 'modal-body';
		model.modal.className = 'modal fade';
		model.title.className = 'modal-title';
		model.dialog.className = 'modal-dialog';
		model.footer.className = 'modal-footer';
		model.header.className = 'modal-header';
		model.content.className = 'modal-content';

		model.body.style.height = '0px';
		model.modal.style.display = 'none';

		model.header.appendChild(model.title);
		model.content.appendChild(model.header);
		model.content.appendChild(model.body);
		model.footer.appendChild(closeButton());
		model.content.appendChild(model.footer);
		model.dialog.appendChild(model.content);
		model.modal.appendChild(model.dialog);
	};

	return function (opts)	{
		makeModal(opts.id || 'modal');
		
		model.element = opts.element;
		model.element.appendChild(model.modal);
	};
};