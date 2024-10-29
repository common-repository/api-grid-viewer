jQuery(document).ready(function($){
	        $('#url').focus();
$('#auth-type').on('change', function() {
        let value = $(this).val();
        let fields = '';
        if (value === 'key') {
            fields += '<div class=" mac-style"><input type="text" id="api-key" placeholder="API Key" class="mac-input " maxlength="256" style="width: 500px;" /></div>';
        } else if (value === 'bearer') {
            fields += '<div class=" mac-style"><input type="text" id="bearer-token" placeholder="Bearer Token" class="mac-input" maxlength="256" style="width: 400px;" /></div>';
        } else if (value === 'basic') {
            fields += '<div class=" mac-style"><input type="text" id="username" placeholder="Username" class="mac-input" style="width: 400px;" /><input type="password" id="password" placeholder="Password" class="mac-input" style="width: 400px;" /></div>';
        }
        $('#auth-fields').html(fields);
    });
    $('#add-param').on('click', function() {
        $('#params').append('<div class="param mac-style"><input type="text" class="param-key mac-input" placeholder="Key" /><input type="text" class="param-value mac-input" placeholder="Value" /><button class="remove-param mac-button">Remove</button></div>');
    });
    $('#params').on('click', '.remove-param', function() {
        $(this).parent().remove();
    });
	        $('#url').on('keypress', function(event) {
            if (event.key === 'Enter') {
                $('#send-request').click(); // Simulate button click
            }
        });

    $('#send-request').on('click', function() {
        let url = $('#url').val();
        let params = {};
        $('.param').each(function() {
            let key = $(this).find('.param-key').val();
            let value = $(this).find('.param-value').val();
            if (key && value) params[key] = value;
        });
        let authType = $('#auth-type').val();
        let headers = {};
        switch (authType) {
            case 'key':
                headers['Authorization'] = $('#api-key').val();
                break;
            case 'bearer':
                headers['Authorization'] = 'Bearer ' + $('#bearer-token').val();
                break;
            case 'basic':
                headers['Authorization'] = 'Basic ' + btoa($('#username').val() + ':' + $('#password').val());
                break;
        }
        $.ajax({
            url: ajaxurl, 
            method: 'POST',
            data: {
                action: 'proxy_request',
                url: url,
                security: apiGridViewer.nonce, 
                headers: JSON.stringify(headers),
                params: params
            },
            success: function(response) {
    try {
       
        let jsonData = typeof response === 'string' ? JSON.parse(response) : response;

        if (typeof jsonData === 'object' && jsonData !== null) {
            let tableHtml = generateTable(jsonData);
            $('#response').html(tableHtml);
            $('#search-bar').show();
 			$('#download-buttons').show();
			$('#download-json').on('click', function() {
			downloadJSON(jsonData, 'data.json');
			});

                       
        } else {
            $('#response').html('<pre>' + JSON.stringify(jsonData, null, 2) + '</pre>');
            $('#search-bar').hide();
			 
		}
    } catch (e) {
        // If parsing fails, display the response as text
        $('#response').html('<pre>' + response + '</pre>');
        $('#search-bar').hide();
    }
}
,
            error: function(xhr) {
                $('#response').html('<p>Error: ' + xhr.statusText + '</p>');
            }
        });
    });
        function generateTable(data){
            if(!Array.isArray(data)&&data!==null&&data!==undefined){
                data=[data];
            }
            let table='<table border="1" cellspacing="0" cellpadding="5" class="mac-table full-width" style="table-layout: auto; width: 100%;max-height:500px !important;">';
            table+='<thead><tr>';
            if(data.length>0){
                Object.keys(flattenObject(data[0]||{})).forEach(function(key){
                    table+='<th style="white-space: nowrap; padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">'+key+'</th>';
                });
            }
            table+='</tr></thead><tbody>';
            data.forEach(function(row){
                row=flattenObject(row);
                table+='<tr>';
                Object.values(row).forEach(function(value){
                    if(value===null||value===''||value===undefined){
                        table+='<td style="padding: 10px; border-bottom: 1px solid #ddd;">null</td>';
                    }else if(Array.isArray(value)){
                        table+='<td style="position: relative; padding: 10px; border-bottom: 1px solid #ddd;">';
                        if(value.length>0){
                            table+='<button class="expand-button mac-button" data-expanded="false">+</button><div class="nested-table full-width" style="display:none; margin-top: 10px; background: #fff; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: auto; max-height:500px;">'+generateTable(value)+'</div>';
                        }else{
                            table+='null';
                        }
                        table+='</td>';
                    }else if(typeof value==='object'&&value!==null){
                        table+='<td style="padding: 10px; border-bottom: 1px solid #ddd;">'+JSON.stringify(value)+'</td>';
                    }else{
                        table+='<td style="padding: 10px; border-bottom: 1px solid #ddd;">'+value+'</td>';
                    }
                });
                table+='</tr>';
            });
            table+='</tbody></table>';
            return table;
        }
        function flattenObject(obj,parent='',res={}){
            for(let key in obj){
                if(obj.hasOwnProperty(key)){
                    let propName=parent?parent+'.'+key:key;
                    if(typeof obj[key]==='object'&&!Array.isArray(obj[key])&&obj[key]!==null){
                        flattenObject(obj[key],propName,res);
                    }else{
                        res[propName]=obj[key];
                    }
                }
            }
            return res;
        }
        $('#response').on('click','.expand-button',function(){
            let $nestedTable=$(this).siblings('.nested-table');
            if($(this).attr('data-expanded')==='false'){
                if($nestedTable.find('table tbody tr').length>0){
                    $nestedTable.css('position', 'relative').css('top', '10px').show();
                    $(this).attr('data-expanded','true');
                }
            }else{
                $nestedTable.hide();
                $(this).attr('data-expanded','false');
            }
        });
        $('#search-bar').on('keyup',function(){
            let value=$(this).val().toLowerCase();
            $('#response tbody tr').each(function(){
                let matchFound=$(this).text().toLowerCase().indexOf(value)>-1;
                $(this).toggle(matchFound);
                if(matchFound){
                    $(this).find('.expand-button').each(function(){
                        let $nestedTable=$(this).siblings('.nested-table');
                        if($nestedTable.find('table tbody tr').length>0){
                            $nestedTable.show();
                            $(this).attr('data-expanded','true');
                        }
                    });
                }
            });
        });
    function downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

 

    });