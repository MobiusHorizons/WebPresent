<!DOCTYPE html>
<html lang="en-US">

	<head>
		<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
		<style> 
		include(`./style.css')
		</style>
		<link rel="stylesheet" type="text/css" href="http://code.jquery.com/ui/1.10.0/themes/base/jquery-ui.css" />
		<script src="http://code.jquery.com/jquery-1.9.0.min.js"></script>	
		<script src="http://code.jquery.com/ui/1.10.0/jquery-ui.js"></script>
		<script >
		include(`./json.js')
		</script>	
		<script id="user_data">
		dnl  include(`./user_data.js')
		</script>
	</head>
	<body>
		<div id="toolbar">
			<button onclick="Add_elem('text_area');">textarea</button><input type="file" id="file" name="file"/>
</button><button>image</button>
		<button onclick="save_elem();">Save</button><button onclick="load_from_store();">Load</button>
		</div>
		<div id="slide_screen" class="background">

			<div id="slide_main" class="slide">
			</div>	
		</div>
	<script>
	include(`./Edit_Background.js')
	initialize();</script>
	</body>
</html>
			
