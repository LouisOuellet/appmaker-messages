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
							headers:dataset.output.headers,
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
						console.log(layout.timeline.lenght);
						console.log(layout.timeline.find('.time-label').first().find('div.btn-group').find('button[data-trigger="messages"]').length);
						if(layout.timeline.lenght > 0 && layout.timeline.find('.time-label').first().find('div.btn-group').find('button[data-trigger="messages"]').length <= 0){
							layout.timeline.find('.time-label').first().find('div.btn-group').append('<button class="btn btn-secondary" data-trigger="messages">'+API.Contents.Language['Messages']+'</button>');
						}
						var html = '';
						html += '<div data-plugin="messages" data-id="'+dataset.id+'" data-date="'+dateItem.getTime()+'">';
							html += '<i class="fas fa-'+defaults.icon+' bg-'+defaults.color+'"></i>';
							html += '<div class="timeline-item">';
								html += '<span class="time bg-'+defaults.color+'"><i class="fas fa-clock mr-2"></i><time class="timeago" datetime="'+dataset.created.replace(/ /g, "T")+'">'+dataset.created+'</time></span>';
								html += '<h3 class="timeline-header bg-'+defaults.color+'"><a class="mr-2">'+dataset.from+'</a><br>'+dataset.subject_stripped+'</h3>';
								if(API.Helper.isSet(dataset,['contacts']) || API.Helper.isSet(dataset,['files'])){
									html += '<h3 class="timeline-header p-0">';
										html += '<div class="btn-group btn-block">';
											if(API.Helper.isSet(dataset,['contacts'])){
												html += '<button type="button" class="btn btn-flat btn-xs btn-primary" data-toggle="collapse" href="#message-contacts-'+dataset.id+'">';
													html += '<i class="fas fa-address-card mr-1"></i>View Contacts';
												html += '</button>';
											}
											if(API.Helper.isSet(dataset,['files'])){
												html += '<button type="button" class="btn btn-flat btn-xs btn-warning" data-toggle="collapse" href="#message-files-'+dataset.id+'">';
													html += '<i class="fas fa-file mr-1"></i>View Files';
												html += '</button>';
											}
										html += '</div>';
									html += '</h3>';
									html += '<h3 class="timeline-header p-0 collapse" id="message-contacts-'+dataset.id+'">';
										if(API.Helper.isSet(dataset,['contacts'])){
											for(var [index, contact] of Object.entries(dataset.contacts)){
												html += '<button type="button" class="btn btn-xs btn-primary m-1" data-contact="'+contact.email+'"><i class="fas fa-address-card mr-1"></i>'+contact.email+'</button>';
											}
										}
									html += '</h3>';
									html += '<h3 class="timeline-header p-0 collapse" id="message-files-'+dataset.id+'">';
										if(API.Helper.isSet(dataset,['files'])){
											for(var [index, file] of Object.entries(dataset.files)){
												html += '<div class="btn-group m-1" data-id="'+file.id+'">';
													html += '<button type="button" class="btn btn-xs btn-primary" data-action="details">';
														html += '<i class="fas fa-file mr-1"></i>'+file.name;
													html += '</button>';
													html += '<button type="button" class="btn btn-xs btn-warning" data-action="download">';
														html += '<i class="fas fa-file-download mr-1"></i>'+API.Helper.getFileSize(file.size,true,2);
													html += '</button>';
												html += '</div>';
											}
										}
									html += '</h3>';
								}
								html += '<div class="timeline-body">'+dataset.body_unquoted+'</div>';
							html += '</div>';
						html += '</div>';
						layout.timeline.find('div.time-label[data-dateus="'+dateUS+'"]').after(html);
						var element = layout.timeline.find('[data-plugin][data-id="'+dataset.id+'"]');
						var html = '';
						html += '<div class="timeline-footer bg-dark">';
							html += '<a class="btn my-2"></a>';
							html += '<button type="button" class="btn btn-primary btn-sm float-right"><i class="fas fa-reply mr-1"></i>Reply</button>';
						html += '</div>';
						element.find('.timeline-item').append(html);
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
