<!DOCTYPE html> 
<html>
<head> 
  <title>GeLoc</title>
  <meta charset="utf-8">

  <!--Bootstrap 4.4-->
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>
  
<link href="https://stackpath.bootstrapcdn.com/bootswatch/4.4.1/sandstone/bootstrap.min.css" rel="stylesheet" integrity="sha384-ABdnjefqVzESm+f9z9hcqx2cvwvDNjfrwfW5Le9138qHCMGlNmWawyn/tt4jR4ba" crossorigin="anonymous">  
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/d3/4.1.1/d3.min.js"></script>
 <!-- <script src="https://cdn.jsdelivr.net/npm/ideogram@1.16.0/dist/js/ideogram.min.js"></script> -->
    
<!--Ideogram-->
<!-- <script src="https://cdn.jsdelivr.net/npm/ideogram@1.16.0/dist/js/ideogram.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/ideogram@1.19.0/dist/js/ideogram.min.js"></script> -->
<script src="https://cdn.jsdelivr.net/npm/ideogram@1.21.0/dist/js/ideogram.min.js"></script>
  
   <!--Tooltipster-->
   <link rel="stylesheet" type="text/css" href="src/tooltipster/dist/css/tooltipster.bundle.min.css" />
<script type="text/javascript" src="src/tooltipster/dist/js/tooltipster.bundle.min.js"></script>

<!--D3JS-->
<script src="https://d3js.org/d3.v5.min.js"></script>
 
 <!--GELOC-->
 <script src="src/main.js" defer ></script>
 <script type="text/javascript" src="src/html2canvas.js"></script>
 <script type="text/javascript" src="src/canvas2image.js"></script>

 <script src="https://d3js.org/d3-axis.v1.min.js"></script>

<!--SocketIO-->
 <script src="node_modules/socket.io-client/dist/socket.io.js"></script>
<script>
  var socket = io('http://195.221.173.169:4242');
</script>

 
 <link rel="stylesheet" type="text/css" href="src/css/gemo.css">
 
<link rel="shortcut icon" href="/gemo/public/img/favicon.ico">


</head>
<body>



<!--JUMBOTRON-->
<div class="jumbotron jumbo-bg">
  <p class="lead">
  <img src="./public/img/GeLoc_full.png"></img>
  </p>
</div>

  <!-- END OF JUMBOTRON-->

<div id="loader" class="triple-spinner" style="display:none;"></div>

  <?php
//echo json_encode(file_get_contents($_POST["data"]));
//echo $_POST["select"];

  if(isset($_FILES["data"])){
	$data = json_encode(file_get_contents($_FILES["data"]["tmp_name"]));
	$ploidyPost = $_POST["select"];
	echo "<script>
	config.ploidy = $ploidyPost;
	$(\"#selectorploidy\").val('$ploidyPost');
	var datajs = {$data};
	datajs = datajs.substring(0, datajs.length-1);
	console.log(datajs);
	load_post_file(datajs); 
  </script>";
  if(!empty($_FILES["annot"])){
	$annot = json_encode(file_get_contents($_FILES["annot"]["tmp_name"]));
	echo "<script> 
	var annotjs = {$annot};
	annotjs = annotjs.substring(0, annotjs.length-1);
	console.log(annotjs);
	annotationParser(annotjs); 
//</script>";
  }
  echo "<script> load_ideogram()</script>";
}
elseif(isset($_POST["data"])){
  $data = json_encode(file_get_contents($_POST["data"]));
  $ploidyPost = $_POST["select"];
  echo "<script>
  config.ploidy = $ploidyPost;
  $(\"#selectorploidy\").val('$ploidyPost');
  var datajs = {$data};
  datajs = datajs.substring(0, datajs.length-1);
  $(\"#editorChr\").text(datajs);
</script>";
if(!empty($_POST["annot"])){
  $annot = json_encode(file_get_contents($_POST["annot"]));
  echo "<script>
  var annotjs = {$annot};
  annotjs = annotjs.substring(0, annotjs.length-1);
  console.log(annotjs);
  $(\"#editorAnnot\").text(annotjs);
//</script>";
}
echo "<script> load_ideogram()</script>";
}
?>




<!--SIDEBAR-->
<div id="wrapper">
		<div id="sidebar-wrapper">
			<aside id="sidebar">
				<ul id="sidemenu" class="sidebar-nav">
					
		  <!--HOME-->
		  	<li>
			<a class="accordion-toggle collapsed toggle-switch" data-toggle="collapse" href="#submenu-1">
				<span class="sidebar-icon"><i class="fa fa-dashboard"></i></span>
				<span class="sidebar-title">Data</span>
			  <b class="caret"></b>
			</a>
			
			<ul id="submenu-1" class="panel-collapse collapse show panel-switch" role="menu">
			  
			  <!-- select accessions-->
			<li>
				<div class="form-group">
				  <label for="selectAccession">Accession</label>
				  <!-- <select onchange="load_accession(this.value);" class="form-control-sm" id="selectAccession"> -->
				  <select class="form-control-sm" id="selectAccession">
					<option value=""></option>
					<option value="Nipponbare">Nipponbare</option>
					<option value="Kitaake">Kitaake</option>
					
				  </select>
				  
				  <!--Accessions data-->
				  
				  <textarea style="display: none" id="editorAnnot" rows="5" class="form-control" placeholder="Insert values here" ></textarea>
				  
				  <!--Load accession file-->
				  
				  <!--<label for="fileInputD" class="control-label">Load custom data</label>-->
				  <input style="display: none" class="btn" onchange="load_file2(this.value)" type="file" id="fileInputD">
				  
				  <!--Chromosomes data-->
				  <label style="display: none" for="editorChr" class="col-lg-2 control-label">Chromosomes</label>
				  <textarea style="display: none" id="editorChr" rows="5" class="form-control" placeholder="Insert values here"></textarea>
				  
				  <!--Load chromosome file-->
				  <!--<label for="fileInputC" class="control-label">Load custom data</label>-->
				  <input style="display: none" class="btn" onchange="load_file(this.value)" type="file" id="fileInputC">
          
				  <label style="display: none" for="selectAccession">Ploïdie</label>
				  <select style="display: none" name="select" id="selectorploidy" class="form-control-sm" onchange="loadingon()">
				    <option value="1" selected>1</option> 
				    <option value="2">2</option> 
					<option value="3">3</option>
					<option value="4">4</option>
				  </select>
				  <br />
				  
				  <!--Clear-->
				  <button class="btn btn-warning btn-small" onclick="location.reload(true);" id="clear">Clear</button>
				  
				  <!-- Update -->
				  <button class="btn btn-primary" onclick="update();" id="reload">Update image</button>

				  <!--Download image-->
				  <a id="download" style="display: none;" class="btn btn-warning">Download as PNG</a>
				  <script>
				  $('#download').click(function(){ 
					html2canvas(document.getElementById("page-content-wrapper")).then(function(canvas) {
					  Canvas2Image.saveAsPNG(canvas, canvas.width, canvas.height);
					});
				  });
				  </script>


				<!-- where the select chrom will take place -->
				<br /><br />
				<div id="selectChromosome"></div>

				<!-- where the lengend will take place -->
				<br /><br />
				Legend :
				<br /><br />
				<canvas id="legend">
					Désolé, votre navigateur ne prend pas en charge &lt;canvas&gt;.
				</canvas>
				
				  
				</div>
			  </li>
						</ul>
			
			
					</li>
		  
				</ul>
			</aside>            
		</div>
	<!-- fin de la sidebar -->
	
		
	<!-- Message navigateur -->
	<div class="alert alert-secondary alert-dismissible fade show" role="alert">
Hello! 
This Web site is optimized for viewing in Chrome.
To make the best use of GeLoc, we recommend you download the latest Chrome versions.
<button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
</button>
</div>

	<!-- Choose message -->
	<div id="arrow_choose" class="container">
	<img src="./public/img/arrow_choose.svg"
	alt="<== Choose an accession to view"
	width="500px"
	></img>
    </div>	

	<div id="page-content-wrapper" class="ideo_container_global">
      <!-- The ideogram goes here. -->
    </div>
		
	<div class="ideo_container_chr">
      <!-- The ideogram chromosome goes here. -->
    </div>

	<div id="chr_region" heigth="300px" style="display: none;">
    Selected region:
		<div><span id="from"></span>  -  <span id="to"></span>
		(extent: <span id="extent"></span> base pairs)
		</div>
		<div class='container'>
		<pre id="gffResult">
		</pre>
		</div>
		
  	</div>

	</div> 
	<div class="tooltip_templates" id="tooltip_content">
		<span>
			<a href="https://banana-genome-hub.southgreen.fr/jbrowse_ma2/?loc=chr01:24139214..24142797">
				view in banana jbrowse
			</a>
		</span>
	</div>
	








</body>
</html>

