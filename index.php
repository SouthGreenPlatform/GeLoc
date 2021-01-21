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

<!--SIDEBAR-->
<div id="wrapper">
	<div id="sidebar-wrapper">
		<aside id="sidebar">
		<ul id="sidemenu" class="sidebar-nav">

		<!--DATA-->
		<li>
			<a class="accordion-toggle collapsed toggle-switch" data-toggle="collapse" href="#submenu-1">
				<span class="sidebar-icon"><i class="fa fa-dashboard"></i></span>
				<span class="sidebar-title">Home</span>
			  	<b class="caret"></b>
			</a>
			<ul id="submenu-1" class="panel-collapse collapse panel-switch" role="menu">
			</ul>
		</li>

		<!--DATA-->
	  	<li>
			<a class="accordion-toggle collapsed toggle-switch" data-toggle="collapse" href="#submenu-2">
				<span class="sidebar-icon"><i class="fa fa-dashboard"></i></span>
				<span class="sidebar-title">Browse data</span>
			  	<b class="caret"></b>
			</a>
			

			<ul id="submenu-2" class="panel-collapse collapse show panel-switch" role="menu">
			  
				<li>
					<!-- select accessions-->  
					<label for="selectAccession">Accession</label>
					<select class="form-control-sm" id="selectAccession">
						<option value=""></option>
						<option value="Nipponbare">Nipponbare</option>
						<option value="Kitaake">Kitaake</option>
					</select>
					
					<!-- search-->  
					<div>
						<input style="width:60%; display:inline-block;" id="keyword" class="form-control mr-sm-2" type="search" placeholder="Search by ID" aria-label="Search">
						<button style="display:inline-block;" id="search" class="btn btn-outline-dark my-2 my-sm-0" type="submit">Search</button>
					<div>
					<div id="search_result_1" style="display: none; max-height: 200px; overflow: scroll;">
					</div>
					<div id="search_result_2" style="display: none; max-height: 200px; overflow: scroll;">
					</div>

					<!-- button show / hide global view -->
					<div style="display: none" id="show-hide">
						<button type="button" class="btn btn-outline-dark" data-toggle="collapse" data-target="#page-content-wrapper" aria-expanded="false" aria-controls="collapseExample"> Show / hide global view</button>
					</div>

					<!-- gene card -->
					<div id="gene_card" style="display: none">
					Gene card
					</div>
				</li>
			</ul>
		</li>

		<!-- download -->
		<li>
			<a class="accordion-toggle collapsed toggle-switch" data-toggle="collapse" href="#submenu-3">
				<span class="sidebar-icon"><i class="fa fa-dashboard"></i></span>
				<span class="sidebar-title">Download data</span>
			  	<b class="caret"></b>
			</a>
			<ul id="submenu-3" class="panel-collapse collapse show panel-switch" role="menu">
			<div id="download">
				<p>Nipponbare</p>
				<a href="./public/dl/ORYSJ_nipponbare_LRRlocus_flt.gff.zip" download="ORYSJ_nipponbare_LRRlocus_flt.gff.zip">ORYSJ_nipponbare_LRRlocus_flt.gff.zip</a>
				<a href="./public/dl/Nipponbare_IDs.txt.zip" download="Nipponbare_IDs.txt.zip">Nipponbare_IDs.txt.zip</a>
				<a href="./public/dl/ORYSJ_nipponbare_LRRlocus_cDNA_flt.fasta.zip" download="ORYSJ_nipponbare_LRRlocus_cDNA_flt.fasta.zip">ORYSJ_nipponbare_LRRlocus_cDNA_flt.fasta.zip</a>
				<a href="./public/dl/OSJnip_canonic_cDNA.fasta.zip" download="OSJnip_canonic_cDNA.fasta.zip">OSJnip_canonic_cDNA.fasta.zip</a>
				<a href="./public/dl/OSJnip_noncanonic_cDNA_wFrameshift.fasta.zip" download="OSJnip_noncanonic_cDNA_wFrameshift.fasta.zip">OSJnip_noncanonic_cDNA_wFrameshift.fasta.zip</a>
				<a href="./public/dl/ORYSJ_nipponbare_LRRlocus_PEP_flt.fasta.zip" download="ORYSJ_nipponbare_LRRlocus_PEP_flt.fasta.zip">ORYSJ_nipponbare_LRRlocus_PEP_flt.fasta.zip</a>
				<br/>
				<p>Kitaake</p>
				<a href="./public/dl/ORYSJ_kitaake_LRRlocus_flt.gff.zip" download="ORYSJ_kitaake_LRRlocus_flt.gff.zip">ORYSJ_kitaake_LRRlocus_flt.gff.zip</a>
				<a href="./public/dl/Kitaake_IDs.txt.zip" download="Kitaake_IDs.txt.zip">Kitaake_IDs.txt.zip</a>
				<a href="./public/dl/ORYSJ_kitaake_LRRlocus_cDNA_flt.fasta.zip" download="ORYSJ_kitaake_LRRlocus_cDNA_flt.fasta.zip">ORYSJ_kitaake_LRRlocus_cDNA_flt.fasta.zip</a>
				<a href="./public/dl/ORYSJ_kitaake_LRRlocus_PEP_flt.fasta.zip" download="ORYSJ_kitaake_LRRlocus_PEP_flt.fasta.zip">ORYSJ_kitaake_LRRlocus_PEP_flt.fasta.zip</a>
				<br/>
				<p>Orthologous</p>
				<a href="./public/dl/Nip_Kit_ortho.txt.zip" download="Nip_Kit_ortho.txt.zip">Nip_Kit_ortho.txt.zip</a>

			</div>
			</ul>
		</li>  
		</ul>
	</aside>            
</div>
<!-- fin de la sidebar -->

<!-- legende flottante -->
<div id=floating_legend>
	<button type="button" class="btn btn-dark btn-sm" style="display: none" id="legend_button" data-toggle="collapse" data-target="#legend_div" aria-expanded="false" aria-controls="legend_div">	
    Legend
  	</button>
	<div class="collapse" id="legend_div" >
	</div>
</div>
<!-- fin legende flottante -->
		
<!-- Message navigateur -->
<div class="alert alert-secondary alert-dismissible fade show" role="alert">
Hello! 
This Web site is optimized for viewing in Chrome.
To make the best use of GeLoc, we recommend you to download the latest Chrome version.
<button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
</button>
</div>

<!-- Choose message -->
<div id="arrow_choose" class="container">
	<img src="./public/img/arrow_choose.svg" alt="<== Choose an accession to view" width="500px"></img>
</div>	

<div id="page-content-wrapper" class="ideo_container_global collapse show">
	<!-- The ideogram goes here. -->
</div>
		
<div class="ideo_container_chr" max-width="1000px">
    <!-- The ideogram chromosome goes here. -->
</div>

<!-- Selected region -->
<div id="selected_region" style="display: none;">
	Selected region:
	<br/>
	<span id="from"></span>  -  <span id="to"></span>
	(extent: <span id="extent"></span> base pairs)
</div>

<div class="zoom_global" style="display: none; width:100%; overflow: scroll;">
    <!-- The zoomed view goes here. -->
	<canvas id="zoom_global" height="80" width="1000">
		Désolé, votre navigateur ne prend pas en charge &lt;canvas&gt;.
	</canvas>
	<canvas id="zoom_selected" height="80" width="1000">

	</canvas>

</div>

<div class="cds" style="display: none; width:100%; max-height:500px;max-width:1200px;overflow: scroll;">
    <!-- The CDS view goes here. -->
	<canvas id="cds" height="1200" width="1200">
		Désolé, votre navigateur ne prend pas en charge &lt;canvas&gt;.
	</canvas>
</div>

<div id="chr_region" heigth="300px" style="display: none;">
<!-- The GFF info goes here. -->

	<div class='container'>
		<pre id="gffResult" style="width:100%; max-height: 300px;max-width:1200px;overflow: scroll;">
		</pre>
	</div>
</div>




</body>
</html>

