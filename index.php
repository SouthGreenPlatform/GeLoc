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
 <!-- <script src="src/hidpi-canvas.min.js"></script> -->
 <script src="src/main.js" defer ></script>
 <script type="text/javascript" src="src/html2canvas.js"></script>
 <script type="text/javascript" src="src/canvas2image.js"></script>

 <script src="https://d3js.org/d3-axis.v1.min.js"></script>

<!--SocketIO-->
 <script src="node_modules/socket.io-client/dist/socket.io.js"></script>
<script>
  var socket = io('http://195.221.173.169:4242');
  var release = "current";
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

		<!--HOME-->
		<li id="homebutton">
			<a class="accordion-toggle collapsed toggle-switch" data-toggle="collapse" href="#submenu-1">
				<span class="sidebar-icon"><i class="fa fa-dashboard"></i></span>
				<span class="sidebar-title">Home</span>
			  	<b class="caret"></b>
			</a>
			<!-- <ul id="submenu-1" class="panel-collapse collapse panel-switch" role="menu">
			</ul> -->
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
					<div id="switch" class="custom-control custom-switch">
						<input type="checkbox" class="custom-control-input" id="readingSense" checked>
						<label class="custom-control-label" for="readingSense">Show genes in reading sense</label>
					</div>
					
					<!-- search-->  
					<br/>
					<div>
						<input style="width:60%; display:inline-block;" id="keyword" class="form-control mr-sm-2" type="search" placeholder="Search by ID" aria-label="Search">
						<button style="display:inline-block;" id="search" class="btn btn-outline-dark my-2 my-sm-0" type="submit">Search</button>
					<div>
					<div id="search_result_1" style="display: none; max-height: 200px; overflow: scroll;">
					</div>
					<div id="search_result_2" style="display: none; max-height: 200px; overflow: scroll;">
					</div>

					

					<!-- gene card -->
					<div id="gene_card" style="display: none">
					Gene card
					</div>
				</li>
			</ul>
		</li>

		<!-- Release -->
		<li id="releasebutton">
			<a class="accordion-toggle collapsed toggle-switch" data-toggle="collapse" href="#submenu-3">
				<span class="sidebar-icon"><i class="fa fa-dashboard"></i></span>
				<span class="sidebar-title">Releases</span>
			  	<b class="caret"></b>
			</a>
		</li>  

		<!-- download -->
		<li id="downloadbutton">
			<a class="accordion-toggle collapsed toggle-switch" data-toggle="collapse" href="#submenu-4">
				<span class="sidebar-icon"><i class="fa fa-dashboard"></i></span>
				<span class="sidebar-title">Download</span>
			  	<b class="caret"></b>
			</a>
		</li>  
		<!-- feedback -->
		<li id="feedbackbutton">
			<a class="accordion-toggle collapsed toggle-switch" data-toggle="collapse" href="#submenu-5">
				<span class="sidebar-icon"><i class="fa fa-dashboard"></i></span>
				<span class="sidebar-title">Send feedback</span>
			  	<b class="caret"></b>
			</a>
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

<!-- Home -->
<div id="home" class="container">

	<div id="welcome">

		<!--JUMBOTRON-->
		<div class="jumbotron jb_welcome">
		<h1 class="display-2">Welcome to GeLoc</h1><br/>
		
		
		<div class="row justify-content-md-center">
			<div class="col-sm-3">
				<div class="card border-dark">
				<img class="card-img-top" src="./public/img/select.gif" alt="Card image cap">
				<div class="card-footer bg-transparent border-dark">Select an accession to display</div>
				</div>
			</div>
			<div class="col-sm-1"></div>
			<div class="col-sm-3">
				<div class="card border-dark">
				<img class="card-img-top" src="./public/img/click_chr.gif" alt="Card image cap">
				<div class="card-footer bg-transparent border-dark">Click on a chromosome to browse through</div>
				</div>
			</div>
			<div class="col-sm-1"></div>
			<div class="col-sm-3">
				<div class="card border-dark">
				<img class="card-img-top" src="./public/img/move_range.gif" alt="Card image cap">
				<div class="card-footer bg-transparent border-dark">Navigate and view genes</div>
				</div>
			</div>
		</div>
	</div>

	</div> <!--fin du jumbotron-->

	<!-- releases -->
	<div id="releases" class="home_content" style="display: none">
		<h3>Releases</h3><br/>
		
		<p><strong>2021-05-03 - Latest</strong></p> 
		<p><strong>2021-01-22</strong>  <a href="previous.php">Browse this release here</a></p> 
		
	</div>

	<!-- download -->
	<div id="download_section" class="home_content" style="display: none">
		<h3>Download</h3><br/>

		<p><strong>Files "Peptides" and "CDS":</strong></p> 
		<p>These files contain amino acid and nuclotide sequences for LRR-CR genes.
For genes experiencing frameshift, the one or two bases that cause the frameshift are avoided in order
to have nucleotide sequence that can be translated.
</p>

<p><strong>Files "cDNA":</strong></p>
<p>These files contain nucleotide sequences for the complete LRR-CR genes without intron.
In the case of genes experiencing frameshift, the sequences cannot be translated in comprehensive protein
sequences. For all other genes, the files "CDS" and "cDNA" retrieve the same nucleotide seqences.
</p>

<p><strong>Files "cDNA_wFrameshift": </strong></p>
<p>These files contain nucleotide sequences of non-canonical genes. In the case
of genes experiencing frameshift, the sequence is completed with one or two "!" characters at the position
of the frameshift in order to conserve the right reading frame (also used by V. Ranwez et al. for the
MACSE programs). The translation of these sequences will create amino acid sequences with frameshift
caracterised by an "X" character.
</p>

		<p><strong>Nipponbare</strong></p>
		<a href="./data_current/dl/Nipponbare_IDs.txt.zip" download="Nipponbare_IDs.txt.zip">Nipponbare_IDs.txt.zip</a><br/>
		<a href="./data_current/dl/Oryza_Kitaake_LRR-CR_cDNA__20210503.fasta.zip" download="Oryza_Kitaake_LRR-CR_cDNA__20210503.fasta.zip">Oryza_Kitaake_LRR-CR_cDNA__20210503.fasta.zip</a><br/>
		<a href="./data_current/dl/Oryza_Nipponbare_IRGSP-1.0_LRR-CR_cDNA__20210503.fasta.zip" download="Oryza_Nipponbare_IRGSP-1.0_LRR-CR_cDNA__20210503.fasta.zip">Oryza_Nipponbare_IRGSP-1.0_LRR-CR_cDNA__20210503.fasta.zip</a><br/>
		<a href="./data_current/dl/Oryza_Nipponbare_IRGSP-1.0_LRR-CR_CDS__20210503.fasta.zip" download="Oryza_Nipponbare_IRGSP-1.0_LRR-CR_CDS__20210503.fasta.zip">Oryza_Nipponbare_IRGSP-1.0_LRR-CR_CDS__20210503.fasta.zip</a><br/>
		<a href="./data_current/dl/Oryza_Nipponbare_IRGSP-1.0_LRR-CR_PEP__20210503.fasta.zip" download="Oryza_Nipponbare_IRGSP-1.0_LRR-CR_PEP__20210503.fasta.zip">Oryza_Nipponbare_IRGSP-1.0_LRR-CR_PEP__20210503.fasta.zip</a><br/>
		<a href="./data_current/dl/Oryza_Nipponbare_IRGSP-1.0_LRR-CR_cDNA_wFrameshift___20210503.fasta.zip" download="Oryza_Nipponbare_IRGSP-1.0_LRR-CR_cDNA_wFrameshift___20210503.fasta.zip">Oryza_Nipponbare_IRGSP-1.0_LRR-CR_cDNA_wFrameshift___20210503.fasta.zip</a><br/>
		<br/>
		<p><strong>Kitaake</strong></p>
		<a href="./data_current/dl/Kitaake_IDs.txt.zip" download="Kitaake_IDs.txt.zip">Kitaake_IDs.txt.zip</a><br/>
		<a href="./data_current/dl/ORYSJ_kitaake_LRR-CR__20210503.gff.zip" download="ORYSJ_kitaake_LRR-CR__20210503.gff.zip">ORYSJ_kitaake_LRR-CR__20210503.gff.zip</a><br/>
		<a href="./data_current/dl/Oryza_Kitaake_LRR-CR_cDNA__20210503.fasta.zip" download="Oryza_Kitaake_LRR-CR_cDNA__20210503.fasta.zip">Oryza_Kitaake_LRR-CR_cDNA__20210503.fasta.zip</a><br/>
		<a href="./data_current/dl/Oryza_Kitaake_LRR-CR_CDS__20210503.fasta.zip" download="Oryza_Kitaake_LRR-CR_CDS__20210503.fasta.zip">Oryza_Kitaake_LRR-CR_CDS__20210503.fasta.zip</a><br/>
		<a href="./data_current/dl/Oryza_Kitaake_LRR-CR_cDNA_wFrameshift__20210503.fasta.zip" download="Oryza_Kitaake_LRR-CR_cDNA_wFrameshift__20210503.fasta.zip">Oryza_Kitaake_LRR-CR_cDNA_wFrameshift__20210503.fasta.zip</a><br/>
		<br/>
		<p><strong>Orthologous</strong></p>
		<a href="./data_current/dl/Nip_Kit_ortho.txt.zip" download="Nip_Kit_ortho.txt.zip">Nip_Kit_ortho.txt.zip</a><br/>

	</div>

	<!-- feedback -->
	<div id="feedback" style="display: none">
		<h3>Feedback</h3><br/>

		<form>
		<div class="form-group">
			<label for="exampleFormControlInput1">Email address</label>
			<input type="email" class="form-control" id="email" placeholder="name@example.com">
		</div>
		<div class="form-group">
			<label for="exampleFormControlSelect1">How was your experience on our website ?</label>
			<select class="form-control" id="xp">
			<option>Great</option>
			<option>Good</option>
			<option>Ok</option>
			<option>Bad</option>
			</select>
		</div>
		<div class="form-group">
			<label for="exampleFormControlTextarea1">Tell us what you think</label>
			<textarea class="form-control" id="feedbackmessage" rows="3"></textarea>
		</div>
		<button id="submitfeedback" type="submit" class="btn btn-outline-dark">Submit</button>
		<button id="submitfeedbackok" style="display: none" class="btn btn-outline-success" disabled>Thank you :)</button>
	</form>
</div>




</div>

<!-- Div DataViz globale -->
<div id="DataViz" style="display: none">
	<!-- button show / hide global view -->
	<div style="display: none" id="show-hide">
		<button type="button" class="btn btn-outline-dark" data-toggle="collapse" data-target="#page-content-wrapper" aria-expanded="false" aria-controls="collapseExample"> Show / hide all chromosomes</button>
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
		<canvas id="zoom_global" height="300" width="1000">
			Désolé, votre navigateur ne prend pas en charge &lt;canvas&gt;.
		</canvas>
		<canvas id="zoom_selected" height="80" width="1000">

		</canvas>

	</div>

	<div id="cds_div" class="cds" style="display: none; width:100%; max-height:500px;max-width:1200px;overflow: scroll;">
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

</div>





</body>
</html>

