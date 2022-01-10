API.Plugins.messages = {
	init:function(){
		API.GUI.Sidebar.Nav.add('messages', 'main_navigation');
	},
	load:{
		index:function(){
			API.Builder.card($('#pagecontent'),{ title: 'messages', icon: 'messages'}, function(card){
				API.request('messages','read',{
					data:{options:{ link_to:'messagesIndex',plugin:'messages',view:'index' }},
				},function(result) {
					var dataset = JSON.parse(result);
					if(dataset.success != undefined){
						for(const [key, value] of Object.entries(dataset.output.dom)){ API.Helper.set(API.Contents,['data','dom','messages',value.id],value); }
						for(const [key, value] of Object.entries(dataset.output.raw)){ API.Helper.set(API.Contents,['data','raw','messages',value.id],value); }
						API.Builder.table(card.children('.card-body'), dataset.output.dom, {
							headers:['id','uid','account','folder','from','subject_stripped','meta'],
							id:'messagesIndex',
							modal:true,
							key:'id',
							set:{
								status:1,
								priority:1,
								user:API.Contents.Auth.raw.User.id,
								email:API.Contents.Auth.raw.User.email,
								client:API.Contents.Auth.raw.User.client,
								phone:API.Contents.Auth.raw.User.phone,
							},
							clickable:{ enable:true, view:'details'},
							controls:{ toolbar:true},
							import:{ key:'id', },
						},function(response){});
					}
				});
			});
		},
	},
	Timeline:{
		icon:"envelope-open-text",
		object:function(dataset,layout,options = {},callback = null){
			if(options instanceof Function){ callback = options; options = {}; }
			var defaults = {icon: API.Plugins.messages.Timeline.icon,color: "info"};
			if(API.Helper.isSet(options,['icon'])){ defaults.icon = options.icon; }
			if(API.Helper.isSet(options,['color'])){ defaults.color = options.color; }
			if(typeof dataset.id !== 'undefined'){
				var url = new URL(window.location.href);
				var id = url.searchParams.get("id"), html = '';
				var dateItem = new Date(dataset.created);
				var dateUS = dateItem.toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'}).replace(/ /g, '-').replace(/,/g, '');
				API.Builder.Timeline.add.date(layout.timeline,dataset.created);
				var checkExist = setInterval(function() {
					if(layout.timeline.find('div.time-label[data-dateus="'+dateUS+'"]').length > 0){
						clearInterval(checkExist);
						API.Builder.Timeline.add.filter(layout,'messages','Messages');
						var html = '';
						html += '<div data-plugin="messages" data-id="'+dataset.id+'" data-date="'+dateItem.getTime()+'">';
							html += '<i class="fas fa-'+defaults.icon+' bg-'+defaults.color+'"></i>';
							html += '<div class="timeline-item">';
								html += '<span class="time bg-'+defaults.color+'"><i class="fas fa-clock mr-2"></i><time class="timeago" datetime="'+dataset.created.replace(/ /g, "T")+'">'+dataset.created+'</time></span>';
								html += '<h3 class="timeline-header bg-'+defaults.color+'"><a class="mr-2">'+dataset.from+'</a><br>'+dataset.subject_stripped+'</h3>';
								if(API.Helper.isSet(dataset,['contacts']) || API.Helper.isSet(dataset,['files'])){
									html += '<h3 class="timeline-header p-0">';
										html += '<div class="btn-group btn-block">';
											if(API.Helper.isSet(dataset,['contacts']) && API.Helper.isSet(API,['Plugins','contacts'])){
												html += '<button type="button" class="btn btn-flat btn-xs btn-primary" data-toggle="collapse" href="#message-contacts-'+dataset.id+'">';
													html += '<i class="fas fa-address-card mr-1"></i>View Contacts';
												html += '</button>';
											}
											if(API.Helper.isSet(dataset,['files']) && API.Helper.isSet(API,['Plugins','files'])){
												html += '<button type="button" class="btn btn-flat btn-xs btn-warning" data-toggle="collapse" href="#message-files-'+dataset.id+'">';
													html += '<i class="fas fa-file mr-1"></i>View Files';
												html += '</button>';
											}
										html += '</div>';
									html += '</h3>';
									html += '<h3 class="timeline-header p-0 collapse" id="message-contacts-'+dataset.id+'">';
										if(API.Helper.isSet(dataset,['contacts']) && API.Helper.isSet(API,['Plugins','contacts'])){
											for(var [index, contact] of Object.entries(dataset.contacts)){
												html += '<button type="button" class="btn btn-xs btn-primary m-1" data-contact="'+contact.email+'"><i class="fas fa-address-card mr-1"></i>'+contact.email+'</button>';
											}
										}
									html += '</h3>';
									html += '<h3 class="timeline-header p-0 collapse" id="message-files-'+dataset.id+'">';
										if(API.Helper.isSet(dataset,['files']) && API.Helper.isSet(API,['Plugins','files'])){
											for(var [index, file] of Object.entries(dataset.files)){
												html += API.Plugins.files.Layouts.details.GUI.button(file,{download:API.Auth.validate('custom', url.searchParams.get("p")+'_files', 1),download:API.Auth.validate('custom', url.searchParams.get("p")+'_files', 4)});
											}
										}
									html += '</h3>';
								}
								html += '<div class="timeline-body">'+dataset.body_unquoted+'</div>';
								html += '<div class="timeline-footer bg-dark">';
									html += '<a class="btn my-2"></a>';
									html += '<button type="button" class="btn btn-primary btn-sm float-right"><i class="fas fa-reply mr-1"></i>Reply</button>';
								html += '</div>';
							html += '</div>';
						html += '</div>';
						layout.timeline.find('div.time-label[data-dateus="'+dateUS+'"]').after(html);
						if(API.Helper.isSet(API,['Plugins','files'])){
							layout.timeline.find('div[data-plugin="messages"][data-id="'+dataset.id+'"] h3[id="message-files-'+dataset.id+'"] button').off().click(function(){
								var action = $(this).attr('data-action');
								switch(action){
									case"view": API.Plugins.files.view($(this).attr('data-id'));break;
									case"download": API.Plugins.files.download($(this).attr('data-id'));break;
									case"delete": API.Plugins.files.delete($(this).attr('data-id'),$(this).attr('data-name'),layout);break;
								}
							});
						}
						if(API.Helper.isSet(API,['Plugins','contacts'])){
							layout.timeline.find('div[data-plugin="messages"][data-id="'+dataset.id+'"] h3[id="message-contacts-'+dataset.id+'"] button').off().click(function(){
								if(API.Helper.isSet(layout,['content','contacts'])){
									contact = $(this).attr('data-contact').toLowerCase();
									layout.content.contacts.find('input').val(contact);
									layout.tabs.contacts.find('a').tab('show');
									layout.content.contacts.find('[data-csv]').hide();
									layout.content.contacts.find('[data-csv*="'+contact+'"]').each(function(){ $(this).show(); });
								}
							});
						}
						var element = layout.timeline.find('[data-plugin="messages"][data-id="'+dataset.id+'"]');
						element.find('time').timeago();
						element.find('.timeline-footer').find('button').click(function(){
							var content = "\n\n"+'<br><br><blockquote>'+element.find('.timeline-body').html()+'</blockquote>';
							$('[data-plugin="'+url.searchParams.get("p")+'"][data-form="comments"]').first().summernote('code', '');
							$('[data-plugin="'+url.searchParams.get("p")+'"][data-form="comments"]').first().summernote('code', content);
							$('ul.nav li.nav-item a[href*="comments"]').tab('show');
						});
						var items = layout.timeline.children('div').detach().get();
						items.sort(function(a, b){
							return new Date($(b).data("date")) - new Date($(a).data("date"));
						});
						layout.timeline.append(items);
						element.find('i').first().addClass('pointer');
						element.find('i').first().off().click(function(){
							API.CRUD.read.show({ key:'id',keys:dataset, href:"?p=messages&v=details&id="+dataset.id, modal:true });
						});
						if(API.Auth.validate('plugin', 'messages', 4)){
							$('<a class="time text-light pointer"><i class="fas fa-trash-alt"></i></a>').insertAfter(element.find('span.time'));
							element.find('a.pointer').off().click(function(){
								API.CRUD.delete.show({ keys:dataset,key:'id', modal:true, plugin:'messages' },function(note){
									element.remove();
								});
							});
						}
						if(callback != null){ callback(element); }
					}
				}, 100);
			}
		},
	},
}

API.Plugins.messages.init();
