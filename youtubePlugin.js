// JavaScript Document

        (function ($) {
    
        $.fn.tumblesYoutubePlugin = function (objSettings) {
            
            var settings = {fileTemplateElement: $(this),
                            fileTemplatesLocations: './templates/',
                            youtubeSearchString: objSettings.searchStr,
                            numberPerPage: objSettings.numberPerPage,
                            arrCache: [],
                            youtubeUserName: objSettings.userStr,
                            searchType: objSettings.searchType,
                            displayPagination: objSettings.displayPagination,
                            videoEntryTemplate: objSettings.videoEntryTemplate,
                            videoPlaybackTemplate: objSettings.videoPlaybackTemplate,
                            videoPagiTemplate: objSettings.videoPagiTemplate,
                            paginateNumberOfPagesInMenu: objSettings.pagiLength
                            
                            
            };
            
            var queryResults = {totalItemCount: 0}
            
         
            function loadYoutubeVideoTemplate()
            {
              $.get(settings.fileTemplatesLocations + settings.videoPlaybackTemplate,{},function(data)
               {
                     settings.playTemplate = $('<div />').append(data);
                     
                     
                     if($('body').find('*[data-youtube-modal=true]').length < 1)
                     {
                     $('body').append(settings.playTemplate.html());
                     $('body').find('*[data-youtube-modal=true]').hide();
                     
                     }
                     settings.templateModal = settings.playTemplate.html(); 
               } , 'HTML');
                
                
                $.get(settings.fileTemplatesLocations + settings.videoEntryTemplate,{},function(data)
               {
                     settings.youtubeVideoTemplate = data;
                     console.log(settings.youtubeSearchString);
                     loadYoutubeVideos(0) 
               } , 'HTML');
            }
            var refreshList = function(strSearchString, pageNumber, searchType)
            {
                settings.youtubeSearchString = strSearchString;
                settings.youtubeUserName = strSearchString;
                settings.searchType = searchType; 
                loadYoutubeVideos(pageNumber);
            }
            
            
            function loadYoutubeVideos(pageNumber)
            {
               switch(settings.searchType)
               {
               case 'user':
                var url = 'http://gdata.youtube.com/feeds/api/videos?author='+settings.youtubeUserName+"&max-results="+settings.numberPerPage+"&v=2&alt=jsonc&orderby=published";
                 break;
               case 'search':
                 url = "http://gdata.youtube.com/feeds/api/videos?q="+settings.youtubeSearchString+"&max-results="+settings.numberPerPage+"&v=2&alt=jsonc&orderby=published";
                 break;

               }
               if(pageNumber > 0)
               {
               
               var url = url + "&start-index="+(1+(pageNumber * settings.numberPerPage))+"";
              
               }

              console.log(url);
              var title;
              var description;
              var thumbnail;
              $(settings.fileTemplateElement).html('');
              $.getJSON(url,
                  function(response){
                  
                      console.log(typeof(response.data));
                      
                     if(typeof(response.data.items) != 'undefined')
                     { 
                      
                      queryResults.totalItemCount = response.data.totalItems;
                      console.log('Here');
                      console.log(response.data.items[0]);
                      settings.availableData = response.data.items[0];
                      for(var i = 0; i < response.data.items.length; i++)
                      {
                      response.data.items[i].thumbnail.hqDefault = '<img src = "'+response.data.items[i].thumbnail.hqDefault+'" />';
                      response.data.items[i].thumbnail.sqDefault = '<img src = "'+response.data.items[i].thumbnail.sqDefault+'" />';
                      title = response.data.items[i].title;
                      description = response.data.items[i].description;
                      thumbnail = response.data.items[i].thumbnail.hqDefault;
                      var htmlTemplate = $('<div />').append(settings.youtubeVideoTemplate);
                      
                      for(key in response.data.items[0]) {
              
                         if(typeof(response.data.items[i][key]) != 'string' )
                         {
                              htmlTemplate = navigateTree(response.data.items[i][key], htmlTemplate);
                         
                         }else
                         {
                         
                         htmlTemplate.find('*[data-youtube-data='+key+']').append(response.data.items[i][key]);
                         }
                      }
                      var id = settings.arrCache.push(response.data.items[i]);
                      htmlTemplate.find('*[data-youtube-load-player=true]').attr('data-youtube-video-id',id);
                    

                      
                      
                       
                       console.log(htmlTemplate.html());
                       
                      $(settings.fileTemplateElement).append(htmlTemplate.html());
                      }
                      
                      if(settings.displayPagination)
                      {paginate(pageNumber);
                      }
                      
                      
                      
                      $('body').find('#'+$(settings.fileTemplateElement).attr('id')).find('*[data-youtube-load-player=true]').click(function(){
                              console.log('Load youtube player');
                              var modal = $('body').find('*[data-youtube-modal=true]');
                              modal.remove();
                              $('body').find('*[data-youtube-background=true]').remove();
                            if($('body').find('*[data-youtube-modal=true]').length < 1)
                             {
                              $('body').append(settings.playTemplate.html());
                              }
                      
                      
                              var modal = $('body').find('*[data-youtube-modal=true]');
                              var id = parseInt($(this).attr('data-youtube-video-id'));
                              arrData = settings.arrCache[id-1];
                              console.log('Modal'+arrData);
                      
                      for(key in arrData) {
              
                         if(typeof(arrData[key]) != 'string' )
                         {
                              modal = navigateTree(arrData[key], modal);
                         
                         }else
                         {
                         
                         modal.find('*[data-youtube-data='+key+']').append(arrData[key]);
                         //htmlTemplate.find('*[data-youtube-load-player=true]').attr('data-youtube-data'+key,urlencode(response.data.items[i][key]));
                         
                         }
                      }
                      modal.find('*[data-youtube-data=embed]').html('<iframe width="100%" height="400" src="//www.youtube.com/embed/'+arrData['id']+'" frameborder="0" allowfullscreen></iframe>'); 
                      modal.show();
                      $('*[data-youtube-background=true]').show();
                      
                      
                      $('body').find('*[data-youtube-modal-close=true]').click(function()
                      {
                        var modal = $('body').find('*[data-youtube-modal=true]');
                        modal.remove();
                        $('*[data-youtube-background=true]').hide();

                      }); 

                      
                      }); 
                      
                   }

                      
                      
              });
            
            }
            
            function navigateTree(obj, htmlTemplate)
            {
                for(key in obj)
                {
                   if(typeof(obj[key]) != 'string')
                   {
                      navigateTree(obj[key], htmlTemplate);
                   }else
                   {
                   
                   htmlTemplate.find('*[data-youtube-data='+key+']').append(obj[key]);
                   }
                }
                
                return htmlTemplate;
            }
            
            function paginate(pageNumber)
            {
                  
                  console.log(queryResults.totalItemCount + ' - ' );
                  var maxresults = 1000;
                  if(queryResults.totalItemCount > 1000)
                  {
                    queryResults.totalItemCount = 1000;
                   }
                   console.log(queryResults.totalItemCount + ' - ' );
                   totalPages = Math.ceil(queryResults.totalItemCount/settings.numberPerPage) - 1;
                   console.log(totalPages + ' - t');
                
                $.get(settings.fileTemplatesLocations + settings.videoPagiTemplate,{},function(data)
               {
                     var youtubePagi = $('<div />').append(data);
                     console.log(data);
                     var output = '';
                                               
                          var min = pageNumber - settings.paginateNumberOfPagesInMenu;
                          var max = Math.floor(pageNumber + settings.paginateNumberOfPagesInMenu);
                          console.log(pageNumber + ' - t ' + max);
                          if(min < 0)
                          {
                          min = 0;
                          }
                          
                          if(max > totalPages )
                          {
                            max = totalPages;
                          }
                     for(var i = min; i <=  max; i++)
                     {
                          
                          youtubePagi = $('<div />').append(data);
                          
                          if(pageNumber == i)
                          {
                              youtubePagi.find('*[data-youtube-paginate-page=yes]').attr('class','paginate-selected');
                          }
                          youtubePagi.find('*[data-youtube-paginate-page=yes]').attr('data-youtube-page-number',i).append(i);
                           output += youtubePagi.html();
                     
                     }
                     
                     $(settings.fileTemplateElement).append('<nav id = "youtube-navigation">'+output+'</nav>');
                     
                     
                     $(settings.fileTemplateElement).find('*[data-youtube-paginate-page=yes]').click(function(){
                        console.log('Clicked');
                        var pageNum = parseInt($(this).attr('data-youtube-page-number'));
                        console.log(pageNum);
                        loadYoutubeVideos(pageNum);
                        return false;
                     
                     });
                     
                      
               } , 'HTML');
                  
            
            }
            
            $(document).ready(function()
            {
                                    $.ajaxSetup({
    // Disable caching of AJAX responses
    cache: false
});
                  
                  loadYoutubeVideoTemplate(0);

            
            });
            
            var outputAvailableData = function()
            {
               var url = "http://gdata.youtube.com/feeds/api/videos?q=test&max-results=25&v=2&alt=jsonc";

              $.getJSON(url,
                  function(response){
              
              for(key in response.data.items[0]) {
              
                      console.log(key + ' - Available youtube data');
                  
              }
              });
            
            
            }
            
          
             return {'refreshList': refreshList,'availableData': outputAvailableData};
            
        } 
    
        })(jQuery);