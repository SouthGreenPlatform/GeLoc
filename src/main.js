////////////
let ploidyA ="";
let lgtChro =[]; //longueur des chromosomes
let chrBands = [];
let config;
let configChr;
let annotTable=[]; // annot file splited by line
let acc;
let chr_tsv;
let annotData;
var ideogram;
var ideogramChr;
//taille du triangle
var annotHeight = 3.5;
let gap = 0;
let totalGap = 0;
//cds
var cdsElements = [];
//table des positions stop
var stopTab = [];
//table des positions frameshift
var fsTab = [];
//json des positions des domaines
var domains;

//

//Définition des tracks
var annotationTracks = [
	{id: 'RLK', displayName: 'RLK', color: '#CCCCCC', shape: 'triangle'},
	{id: 'RLP', displayName: 'RLP', color: '#8D8D8D', shape: 'triangle'},
	{id: 'NLR', displayName: 'NLR', color: '#494949', shape: 'triangle'}
]; 

//Legende
/* var legend = [{
	name: 'Annotations',
	rows: [
	  {name: 'RLK', color: '#CCCCCC', shape: 'triangle'},
	  {name: 'NLR', color: '#8D8D8D', shape: 'triangle'},
	  {name: 'RLP', color: '#494949', shape: 'triangle'}
	]
}]; */

drawLegend();
drawLegendDom();




//Config de la vue globale
function initConfig(){
	//console.log("init config");
	let conf = { 
		organism: "oryza-sativa",
		//repertoire vers les données de chromosome bands
		//dataDir: './data/bands/native/',
		container: '.ideo_container_global',
		orientation: "vertical",
		rotatable: false,
		ploidy: 1, 
		ploidysize: 12,
		annotationTracks: annotationTracks, 
		annotationHeight: annotHeight,
		chrHeight: 500,
		chrWidth: 15,
		//couleur de base des chromosomes
 		ancestors: {
			"A": "#7AA1D2",
			"B": "#7AA1D2",
			"C": "#7AA1D2"
		}, 
		ploidyDesc: ["AB", "AB", "AB", "AB", "AB", "AB", "AB", "AB", "AB", "AB", "AB", "AB"],
		rangeSet: [],
		showFullyBanded: false
	};
	return conf;
}


////////////////////////////////////////////////////////////////
//LOAD ACCESSION
////////////////////////////////////////////////////////////////
let selectAccession = document.getElementById("selectAccession");

selectAccession.addEventListener("change", async function(){
	//console.log(this.value);

	acc = this.value;
	clear();
	//affiche le loader
	document.getElementById("loader").style.display = "block";

	//hide div to refresh
	$('#selected_region').hide();
	$('.ideo_container_chr').hide();
	$('#gene_card').hide();
	$('.zoom_global').hide();
	$('.cds').hide();
	
	//affiche la div si elle est cachée
	$(".ideo_container_global").collapse('show');

	config = initConfig();
	config.annotationsPath='./data/annotations/annot_'+acc+'.json';
	
	//charge le fichier densité de l'accession choisie
	let response = await fetch('./data/density/density_'+acc+'.txt');
	annotData = await response.text();
	//Parse les données de densité
	config.rangeSet = annotationParser(annotData, config);
    
	//charge les données de chromosomes de l'accession choisie
	//fichier tsv
 	response = await fetch('./data/chromosomes/'+acc+'.tsv');
	chr_tsv = await response.text();
	//parse les données et config les chrBands
	chromosomeTsvParser(chr_tsv, config); 
	//config.dataDir = "./data/bands/native/"+acc+"/";
	
	//supprimer la div de l'image "choose accession"
	document.getElementById("home").style.display = "none";

	//Charge ideogram
	ideogram = new Ideogram(config);

	//apparition du bouton download
	$('#download').fadeIn()

	//cache le lettres
	setTimeout(removeLetters, 100);

	//affiche la selection de chromosome
	//createSelectChrom();

	//LEGEND

	//affiche la div
	$('#legend_button').show();
	$("#DataViz").show();
	$("#show-hide").show();

	/////// à virer si je remet les tooltips
	loadingoff();

	//ajoute listener click chromosome
	setTimeout(onClickChr, 100);
});

////////////////////////////////////////////////////////////////
//parsing fichier chromosome TSV
//Genère les bands pour chaque chromosome
////////////////////////////////////////////////////////////////
function chromosomeTsvParser(data, conf){
	//console.log("parse chromosome");
    chrBands=[];

	//split le fichier par ligne de chromosome
	const split = data.split("\n");
	let columns  = "";

	//nombre de chromosomes
    conf.ploidysize = split.length-1;
    
    //max length
    let max_chr_length =0;
	for (let i = 1; i < split.length; i++) {
        columns = split[i].split("\t");
        bp_stop = parseInt(columns[3]);
        if(bp_stop > max_chr_length){
            max_chr_length = bp_stop;
        }
    }
	
	//pour chaque chromosome
	for (let i = 1; i < split.length; i++) {
        
        //LocalSplit[0] = chromosome choisi, localsplit[1] = longeur du chromosome
        //#chromosome	arm	bp_start	bp_stop
        //1	p	0	16700000
        //1	q	16700000	43270923
        columns = split[i].split("\t");

        chr = columns[0];
        arm = columns[1];
        band = '1';
        bp_start = parseInt(columns[2]);
        bp_stop = parseInt(columns[3]);
        
		//ajouter condition sur arm = p ou q
		//si p => on ajoute une band gpos50 puis une band acen
		//si q => on ajoute une band acen puis une band gpos50
		if(arm == 'p'){
			//position des bands gpos et acen sur le bras p
			gposStar = bp_start;
			gposStop = (bp_stop - bp_stop/10);
			acenStart = (bp_stop - bp_stop/10);
			acenStop = bp_stop;
			//push les positions dans la config ideogram
			gposBand = chr+" "+arm+" "+band+" "+gposStar+" "+gposStop+" "+gposStar+" "+gposStop+" gpos50";
			acenBand = chr+" "+arm+" "+band+" "+acenStart+" "+acenStop+" "+acenStart+" "+acenStop+" acen";
			chrBands.push(gposBand);
			chrBands.push(acenBand);
		}else{
			//position des bands acen et gpos sur le bras q
			acenStart = bp_start;
			acenStop = (bp_start + bp_start/10);
			gposStar = (bp_start + bp_start/10);
			gposStop = bp_stop;
			//push les positions dans la config ideogram
			acenBand = chr+" "+arm+" "+band+" "+acenStart+" "+acenStop+" "+acenStart+" "+acenStop+" acen";
			gposBand = chr+" "+arm+" "+band+" "+gposStar+" "+gposStop+" "+gposStar+" "+gposStop+" gpos50";
			chrBands.push(acenBand);
			chrBands.push(gposBand);
		}
	}
	//console.log(chrBands);
}


////////////////////////////////////////////////////////////////
//parsing des données de densité pour afficher les couleurs
////////////////////////////////////////////////////////////////
function annotationParser(data, conf){
	//console.log("parse annot");
	annotTable = data.split("\n");
	let colonne  = "";
	//var data = "";
	//let localannot="";
	let ploidy=[];
	let count =0;

	let rangeSet = [];
	
	//pour chaque ligne d'annot
	for (let i = 0; i < annotTable.length; i++) {
		ploidy = [];
		colonne = annotTable[i].split(" ");
		count++;
		
		//Boucle qui sert a définir la position de l'annotation
		for(let n = 0; n< conf.ploidy; n++){
			////console.log(n + " " + parseInt(colonne[1]));
			if(n == parseInt(colonne[1])){
				////console.log("egal");
				ploidy.push(1);
			}else {
				ploidy.push(0);
				////console.log("pas egal");
			}	
		}
		////console.log(ploidy);
		
		chromosome = {
			chr: colonne[0],
			ploidy: ploidy,
			start: colonne[2],
			stop: colonne[3],
			color: colonne[4]
			//color: config.anotcolor[localsplit[4]]
		};
		rangeSet.push(chromosome);
	}
	//console.log(rangeSet);
	return rangeSet;
	////console.log(ligne.length+" "+ count);
}

function updateploidy(value){
	//console.log("update ploïdie");
	config.ploidy = Number(value);
}

function loadingon(){
	document.getElementById("loader").style.display = "block";
}
function loadingoff(){
	document.getElementById("loader").style.display = "none";
}

function clear(){
	//console.log("clear");

	const element = document.getElementById("_ideogramOuterWrap"); //_ideogram
	if(element != null){
		element.parentNode.removeChild(element);
	}
	const div = document.getElementById("ideo_div");
	if(div != null){
		div.parentNode.removeChild(div);
	}
	const sca = document.getElementById("scale");
		if(sca != null){
		sca.parentNode.removeChild(sca);
	}
	
}



//cache les lettres
function removeLetters(){
	const letters = document.getElementsByClassName("chrLabel");
	for (i = 0; i < letters.length; i++) { 
		if(letters[i].parentElement.className.baseVal == "chromosome "){
			letters[i].style.display="none";
		}
	}
}



//////////////////////
//LEGEND chromosomes
//////////////////////

function drawLegend(){

	var canvas = document.createElement('canvas');
	canvas.id = 'legend';
	canvas.width = 130;
	canvas.height = 150;

	var ctx = canvas.getContext('2d');

	ctx.fillStyle="black";
	ctx.font='bolder 12px Arial';

	ctx.fillText('Chromosome view:', 10, 25);

	ctx.font='12px Arial';

	ctx.fillStyle = "#CCCCCC";
	ctx.fillText('RLK', 10, 70);
	ctx.beginPath();
    ctx.moveTo(10, 40); // x y 
    ctx.lineTo(20, 50);
	ctx.lineTo(10, 60);
    ctx.fill();

	ctx.fillStyle = "#8D8D8D";
	ctx.fillText('RLP', 40, 70);
	ctx.beginPath();
    ctx.moveTo(40, 40); // x y 
    ctx.lineTo(50, 50);
	ctx.lineTo(40, 60);
	ctx.fill();
	
	ctx.fillStyle = "#494949";
	ctx.fillText('NLR', 70, 70);
	ctx.beginPath();
    ctx.moveTo(70, 40); // x y 
    ctx.lineTo(80, 50);
	ctx.lineTo(70, 60);	
	ctx.fill();

	ctx.fillStyle = "black";
	ctx.fillText('Annotation count', 10, 93);
	var gradient = ctx.createLinearGradient(0, 0, 100, 0);
	gradient.addColorStop(0.16, '#7AA1D2');
	gradient.addColorStop(0.32, '#7dc7d2');
	gradient.addColorStop(0.48, '#bce2ca');
	gradient.addColorStop(0.64, '#d5e1b5');
	gradient.addColorStop(0.80, '#e8ce92');
	gradient.addColorStop(1, '#f4a769');

	ctx.fillStyle = gradient;
	ctx.fillRect(10, 95, 100, 25);

	ctx.fillStyle = "black";
	ctx.fillText('0', 15, 113);
	ctx.fillText('5+', 90, 113);

	document.getElementById('legend_div').appendChild(canvas); 


}

//////////////////////
//LEGEND domaines
//////////////////////
function drawLegendDom(){

	var canvas = document.createElement('canvas');
	canvas.id = 'legend_dom';
	canvas.width = 200;
	canvas.height = 150;

	var ctx = canvas.getContext('2d');
	ctx.fillStyle="black";
	ctx.font='bolder 12px Arial';

	ctx.fillText('Gene view: ', 10, 25);

	ctx.font='12px Arial';
	
	ctx.fillText('LRR:', 10, 45);
	drawDomain(ctx, "LRR", 60, 35, 10);
	ctx.fillText('BLAST:', 10, 65);
	drawDomain(ctx, "BLAST", 60, 55, 10);
	ctx.fillText('TM:', 10, 85);
	drawDomain(ctx, "TM", 60, 75, 10);
	ctx.fillText('NBARC:', 10, 105);
	drawDomain(ctx, "NBARC", 60, 95, 10);
	ctx.fillText('Kinase:', 10, 125);
	drawDomain(ctx, "Kinase", 60, 115, 10);
	ctx.fillText('Malectin:', 75, 45);
	drawDomain(ctx, "Malectin", 155, 35, 10);
	ctx.fillText('Malectin like:', 75, 65);
	drawDomain(ctx, "Malectin_like", 155, 55, 10);
	ctx.fillText('Cys-Pair:', 75, 85);
	drawDomain(ctx, "Cys-Pair", 155, 75, 10);
	ctx.fillText('PS:', 75, 105);
	drawDomain(ctx, "PS", 155, 95, 10);
	ctx.fillText('other:', 75, 125);
	drawDomain(ctx, "", 155, 115, 10);

	ctx.fillText('Stop:', 10, 145);
	drawStop(ctx, 65, 132 )	
	drawStar(ctx, 65, 139, 2, 4, 2);	

	ctx.fillText('Frameshift:', 75, 145);
	drawFrameshift(ctx, 160, 132 )	


	document.getElementById('legend_div').appendChild(canvas); 


}

//////////////////////////////////////////
// Affichage du chromosome horizontal 
//////////////////////////////////////////
function onClickChr(){
	$(".ideo_container_global").find(".bands").each(function(index ){
		$(this).on("click", function(){

			

			clickedChrom = index + 1 ;
			//clickedChrom = selectChrom.value;
			if(clickedChrom<10){
				clickedChrom = "0"+clickedChrom;
				clickedChrom = parseInt(clickedChrom);
			} 
			console.log("draw chr "+ clickedChrom);

			//dessine le chromosome
			drawChromosome(clickedChrom, 10000000, 12000000);

			//console.log(config);
			//console.log(configChr);

			setTimeout(removeLetters, 100);

		});
	});
}

//dessine le chromosome horizontal
function drawChromosome(clickedChrom, start, stop){

	//efface la div globale
	$(".ideo_container_global").collapse('hide');

	//Affiche le bouton show / hide de la vue globale
	$("#show-hide").show();

	//affiche la div du chr
	$('.ideo_container_chr').show();

	//affiche selected region
	document.getElementById("selected_region").style.display = "block";

	//Pour copier l'objet sans interferences
	//configChr = config;
	configChr = jQuery.extend(true, {}, config);
	configChr.orientation = "horizontal";
	configChr.chromosome = clickedChrom.toString();
	configChr.container = '.ideo_container_chr';
	configChr.rotatable = false;
    configChr.chrHeight = 800;
    configChr.chromosomeScale = 'absolute';
	//var stop = start + 10000000;
	configChr.brush = 'chr'+clickedChrom+':'+start+'-'+stop;
	//configChr.chrMargin: 50,
	//configChr.chrWidth: 15,
	configChr.onBrushMove = writeSelectedRange;
    configChr.onLoad = writeSelectedRange;
			

	//parse les valeurs de range set de densité pour ne recupérer que celles du chromosomes choisi
	//let rangeSetChr = config.rangeSet;
	let newRangeSetChr = [];
	config.rangeSet.forEach(function(range){
		//si chrom courant = on push dans la config
		if(range['chr'] == clickedChrom){
			//copie l'objet range du chromosome choisi
			//change la valeur à 1
			//Ce n'est pas la valeur du chromosome choisi
			//mais le "premier" chromosome à être affiché.
			newRange = jQuery.extend(true, {}, range);
			newRange['chr']="1";
			newRangeSetChr.push(newRange);
		}
	});
	configChr.rangeSet = newRangeSetChr;
	//affiche la div
	//document.getElementById("chr_region").style.display = "block";
	ideogramChr = new Ideogram(configChr);


}

////////////////////////////////////////////////////////
// Affiche des informations de la portion selectionnée
////////////////////////////////////////////////////////
function writeSelectedRange() {

    var r = ideogramChr.selectedRegion,
        from = r.from.toLocaleString(), // Adds thousands-separator
        to = r.to.toLocaleString(),
		extent = r.extent.toLocaleString();
		chrnum = ideogramChr.config.chromosome;
	
	//affiche les positions
    document.getElementById('from').innerHTML = from;
    document.getElementById('to').innerHTML = to;
	document.getElementById('extent').innerHTML = extent;
	
	//supprime les espaces dans les positions
	from = from.replace(/\s/g, "");
	to = to.replace(/\s/g, "");
	//console.log(typeof(from));
	//console.log("region from "+from+" to "+to+ " extent "+extent);

	//Appel au serveur
    socket.emit('run', acc, chrnum, from, to, function(err, report){
        if(err){
            console.log(err);
        }else{
			//console.log(report);
			const gffResult = document.getElementById('gffResult');
			drawZoom(from, to, report);
			gffResult.innerHTML = report;
		}
	});

  }

//recupère les coordonnées des codons stop
fetch('./data/annotations/Nip_stop_genomic_pos.txt')
.then(function(response) {
	return response.text();
})
.then(function(text) {
	let lines = text.split('\n');
	lines.forEach(line => {
		stopTab.push(line);
		//console.log(stopTab);
	});
});
fetch('./data/annotations/Kit_stop_genomic_pos.txt')
.then(function(response) {
	return response.text();
})
.then(function(text) {
	let lines = text.split('\n');
	lines.forEach(line => {
		stopTab.push(line);
		//console.log(stopTab);
	});
});

//recupère les coordonnées des frameshift
fetch('./data/annotations/frameshift_NIP.txt')
.then(function(response) {
	return response.text();
})
.then(function(text) {
	let lines = text.split('\n');
	lines.forEach(line => {
		fsTab.push(line);
		//console.log(fsTab);
	});
});
fetch('./data/annotations/frameshift_KIT.txt')
.then(function(response) {
	return response.text();
})
.then(function(text) {
	let lines = text.split('\n');
	lines.forEach(line => {
		fsTab.push(line);
	});
});

//recupère les coordonnées des domaines
fetch('./data/annotations/domains.json')
.then(function(response) {
	return response.json();
})
.then((data) => {
    // Work with JSON data here
    domains = data;
});

// Draw horizontal line with gene position
function drawZoom(from, to, report){

	//display div
	$('.zoom_global').show();
	$('.cds').show();

	//canvas CDS
	var canvas = document.getElementById('cds');
	var ctx = canvas.getContext('2d');

	//canvas zoom
	var canvasGlobal = document.getElementById('zoom_global');
	var ctxGlobal = canvasGlobal.getContext('2d');

	//clear before redraw
	ctxGlobal.clearRect(0, 0, canvasGlobal.width, canvasGlobal.height);
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	//
	let firstCDS = true;
	let countGene = 0;
	let x = 40;
	let y = 50;
	let yInit = 10;
	let xFirstCDS = 0;
	let startFirstCDS = 0;
	let xCDS;
	let yCDS;
	let widthCDS;
	let startLine = 0;
	let stopLine = 0;
	let currentDom;

	//reset CDS elements tab
	cdsElements = [];
	
	//nb de bases dans le canvas
	const seqLength = to - from;
	//console.log("seq length "+seqLength);
	let gffLines = report.split('\n');

	//parsing GFF file
	gffLines.forEach(line => {
		var tab = line.split(/\t/);
		var geneGenomicCoord = tab[3];

		//Ligne gene
		if(tab[2] == "gene"){

			countGene++;
			firstCDS = true;
			gap = 0;
			totalGap =0;
			//console.log("gap : "+gap+" totalgap : "+totalGap );

			//position on canvas
			startGene = ((tab[3]-from) * 800) / seqLength;
			widthGene = ((tab[4]-tab[3]) * 800) / seqLength;

			//draw line
			ctxGlobal.beginPath();
			ctxGlobal.moveTo(x, y );
			ctxGlobal.lineTo(800+x, y);
			ctxGlobal.stroke();
			
			//draw gene rect
			ctxGlobal.fillStyle="black";    // color of fill
			// x y width height	
			ctxGlobal.fillRect(startGene+x, 40, widthGene, 20); // create rectangle  
			//console.log(startGene + wigthGene );

			//draw background = element clickable
			ctx.fillStyle="white";
			ctx.fillRect(xFirstCDS + x -5, countGene * y + yInit -2, 1200, 22);

			var regexpClass = /Class=(\w*)/;
			var geneClass = tab[8].match(regexpClass)[1];
			var regexpId = /ID=(\w*)/;
			var id = tab[8].match(regexpId)[1];
			var regexpFamily = /Fam=(\w*)/;
			var family = tab[8].match(regexpFamily)[1];

			//Save gene infos
			element = {
				chr: tab[0], 
				start: tab[3],
				stop: tab[4],
				orientation: tab[6],
				infos: tab[8],
				geneClass: geneClass,
				id: id,
				family: family,

				//global gene view infos
				genePosX: startGene+x,
				genePosY: 40,
				geneWidth: widthGene,
				geneHeigth: 20,

				//CDS view infos
				width: 1200,
				height: 22,
				top: countGene * y + yInit -2, //first CDS position top
				left: xFirstCDS + x -5         //first CDS position left
			}
			cdsElements.push(element);

			//draw gene infos
			ctx.fillStyle="black";
			ctx.font = '12px sans-serif';
			ctx.fillText(element.id+" - "+element.family+" - "+element.geneClass, x, countGene * y + yInit -5);

			startFirstCDS = tab[3];			
		}

		//Traitement des CDS
		if(tab[2] == "CDS"){

			//convert bp to pixel
			startCDS = tab[3];
			stopCDS = tab[4];
			widthCDS = (tab[4] - tab[3]) / 10;
			yCDS = countGene * y + yInit;
			//position du début du CDS
			// largeur / 10 + x de départ - le gap si on a coupé dans l'intron
			xCDS = (tab[3] - startFirstCDS) / 10 + x - totalGap;

			//identifiant cds
			var regexpCDSID = /.*(cds_\d+);.*/;
			if (tab[8].match(regexpCDSID)) {
				cdsid = tab[8].match(regexpCDSID)[1];
			}else{
				cdsid = "";
			}

			//console.log(cdsid);

			//variable pour les plus ou minus
			if(tab[6] == "+"){
				ecart = 5;
				plusMinus = "plus";
			}else{
				ecart = -5;
				plusMinus = "minus";
			}
			
			//draw first CDS
			if (firstCDS){
				//Draw plus or minus CDS
				drawArrow(ctx, xCDS-20 , yCDS, 3, plusMinus, element.family);
				drawCDS(ctx, xCDS, yCDS, widthCDS);
				startLine = xCDS + widthCDS;
				firstCDS = false;
			
			//Draw other CDS
			}else{
				//line to bloc
				stopLine = xCDS;
				
				//dessine la ligne et update le gap
				drawLine(ctx, startLine, stopLine, yCDS );
				
				//fleche + ou -
				//enlève l'éventuel gap supplémentaire calculé en dessinant la ligne
				drawCDS(ctx, xCDS-gap, yCDS, widthCDS);
				startLine = xCDS-gap + widthCDS;
			}

			//draw domain if it is inside the current CDS
			if(cdsid != ""){
				let currentGene = element.id;
				
				if(domains[currentGene] !== undefined){
					cdsDom = domains[currentGene][cdsid];
				}

				if(cdsDom !== undefined){
					//console.log("current Gene  : "+currentGene+ " cdsid " +cdsid+ " dom :  "+ JSON.stringify(cdsDom));
					
					//pour chaque type de domain
					for(key in cdsDom){
						//console.log(key);
						let currentDom = cdsDom[key];
						currentDom.forEach(dom => {
							var domStart = dom.match(/(.*);(.*)/)[1];
							var domStop = dom.match(/(.*);(.*)/)[2];
							var domLength = (domStop - domStart) /10;
							//console.log(domStart +" "+domStop);

							//domain position in px
							var xDomStart = ((domStart - startFirstCDS) / 10) + x- totalGap ;
							//var xDomStop = ((domStop - startFirstCDS) / 10) + x- totalGap ;

							drawDomain(ctx, key, xDomStart , countGene * y + yInit +1, domLength);
						});
					}
				} 
			}
			
			
			//draw stop if it is inside the current CDS
			stopTab.forEach(line => {
				var tab = line.split(/\t/);
				if(tab[0] == element.id && tab[1] <= stopCDS && tab[1] >= startCDS){
						
					//stop position
					var stopPos = tab[1];
					var XstopPos = ((stopPos - startFirstCDS) / 10) + x ;
					drawStop(ctx, XstopPos-totalGap, countGene * y + yInit )	
					drawStar(ctx, XstopPos-totalGap, countGene * y + yInit +7, 2, 4, 2);		
				}
			});

			//draw frameshift if it is inside the current CDS
			fsTab.forEach(line => {
				if(line.length >0){
					//console.log(line);
				
					var regexpFS = /(.*);frameshift;(.*)/;
					var idFS = line.match(regexpFS)[1];
					var posFS = line.match(regexpFS)[2];

					if(idFS == element.id && posFS <= stopCDS && posFS >= startCDS){
							
						//stop position
						var xFsPos = ((posFS - startFirstCDS) / 10) + x ;
						drawFrameshift(ctx, xFsPos - totalGap, countGene * y + yInit )	
						//console.log("frameshift "+ posFS + " gap "+ gap+" totalGap "+totalGap);	
					} 
				}
				
			});


			
		}
	});


}

//canvas CDS
var canvas = document.getElementById('cds');
var ctx = canvas.getContext('2d');

//fonction click sur un gene / CDS
canvas.addEventListener('mousemove', function (event) {

	

	//position du canvas, tient compte du scroll
	var canoffset = $(canvas).offset();
	var x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
	var y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

	var canvasSelected = document.getElementById('zoom_selected');
	var ctxSelected = canvasSelected.getContext('2d');

	ctxSelected.clearRect(0, 0, canvasSelected.width, canvasSelected.height);

	// Collision detection between clicked offset and element.
	cdsElements.forEach(function (element) {
		if (y > element.top -20 && y < element.top + element.height
			&& x > element.left && x < element.left + element.width) {

			//dessine un cadre autour du gene dans la vue globale
			ctxSelected.save();

			//clear before redraw
			ctxSelected.clearRect(0, 0, canvasSelected.width, canvasSelected.height);

			//draw gene rect
			ctxSelected.strokeStyle="yellow";
			ctxSelected.lineWidth = 2;
			// x y width height	
			ctxSelected.strokeRect(element.genePosX -1, 39, element.geneWidth +2, 22); // create rectangle  
			ctxSelected.restore();
		}
	});

	
});

//fonction click sur un gene / CDS
canvas.addEventListener('click', function (event) {

	//position du canvas, tient compte du scroll
	var canoffset = $(canvas).offset();
	var x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
	var y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

	// Collision detection between clicked offset and element.
	cdsElements.forEach(function (element) {
		if (y > element.top && y < element.top + element.height
			&& x > element.left && x < element.left + element.width) {

			//search for synonymous ids
			//download id file
			var ID_MSU7 ="";
			var ID_IRGSP ="";
			var ID_NCBI ="";
			var NCBI_num ="";
			var urlListe ="";
			var Aliases ="";
			var ID_OsKitaake="";
			var orthologous="";
			fetch('./data/ids/'+acc+'_IDs.txt')
			.then(function(response) {
				return response.text();
			})
			.then(function(ids) {
				if(acc == "Nipponbare"){
					let idsLines = ids.split('\n');
					idsLines.forEach(line => {
						var tab = line.split(/\t/);
						if(element.id == tab[0]){
							console.log(tab[0] +tab[1] +tab[2] +tab[3] +tab[4]);
							ID_MSU7 = tab[1];
							ID_IRGSP = tab[2];
							ID_NCBI = tab[3];
							Aliases = tab[4];
						}
					});

					//fichier des orthologues
					fetch('./data/ids/Nip_Kit_ortho.txt')
					.then(function(response) {
						return orthoTab = response.text();
					})
					.then(function(ortho) {
						let orthoLines = ortho.split('\n');
						orthoLines.forEach(line => {
							var tab = line.split(/\t/);
							if(element.id == tab[0].trim()){ //trim pour enlever les eventuels espaces ou retour chariot
								orthologous = tab[1];
								
							}
						});

						//affiche la gene card
						document.getElementById("gene_card").style.display = "block";
						var htmlstring = "<p class='font-weight-bold'>Gene card "+element.id
						+"</p><a target='_blank' href=\"https://rice-genome-hub.southgreen.fr/oryza_sativa_japonica_nipponbare?loc="+element.chr+":"+element.start+".."+element.stop+"\"><button type=\"button\" class=\"btn btn-sm btn-outline-dark\">View on JBrowse </button></a>"
						+"</p>Position: "+element.chr+":"+element.start+"-"+element.stop
						+"<br/>Family: "+element.family 
						+"<br/>Class: "+element.geneClass
						+"<br/>Kitaake orthologous: <a class='resLink3' href='#'>"+orthologous+"</a>"
						+"<br/>ID: <a target='_blank' href=\"http://rice.plantbiology.msu.edu/cgi-bin/ORF_infopage.cgi?orf="+ID_MSU7+"\">"+ID_MSU7+"</a>"
						+"<br/>ID IRGSP: <a target='_blank' href=\"https://rapdb.dna.affrc.go.jp/viewer/gbrowse_details/irgsp1?name="+ID_IRGSP+"\">"+ID_IRGSP+"</a>"
						+"<br/>ID NCBI:";
						if(ID_NCBI == "None"){
							htmlstring += "None";
							
						}else{
							//split NCBI
							var tabNCBI=ID_NCBI.split(",");
							//pour chaque split regexp, add url to html string
							tabNCBI.forEach(element => {
								var regexpNCBI = /LOC(\d*)/;
								NCBI_num = element.match(regexpNCBI)[1];
								htmlstring += " <a target='_blank' href=\"https://www.ncbi.nlm.nih.gov/gene/"+NCBI_num+"\">"+element+"</a>"
							});
						}
						htmlstring+= "<br/>Aliases: "+Aliases;
						$('#gene_card').html(htmlstring);
					})
					.then(function() {
						//Clic sur l'identifiant affiche la zone
						var resLinks = document.getElementsByClassName('resLink3');
						for(var i = 0, len = resLinks.length; i < len; i++) {
							resLinks[i].onclick = function () {
				
								//affiche la vue globale
								let selectAccession = document.getElementById("selectAccession");
								selectAccession.value="Kitaake";
								triggerEvent(selectAccession, 'change');
				
								//affiche la vue zoom sur le chromosome de l'id cliqué
								var regexpChrom = /Chr(\d*)_(\d*)/;
								var idChrom = this.innerText.match(regexpChrom)[1];
								var position = this.innerText.match(regexpChrom)[2];
								position = parseInt(position);
								var stop = position + 1000000;
				
								idChrom = parseInt(idChrom);
								setTimeout(function(){ drawChromosome(idChrom, position, stop ); }, 1000);
								
							}
						}
					});
					
					

				}else if(acc == "Kitaake"){
					let idsLines = ids.split('\n');
					idsLines.forEach(line => {
						var tab = line.split(/\t/);
						if(element.id == tab[0]){
							ID_OsKitaake = tab[1];
						}
					});

					//fichier des orthologues
					fetch('./data/ids/Nip_Kit_ortho.txt')
					.then(function(response) {
						return orthoTab = response.text();
					})
					.then(function(ortho) {
						let orthoLines = ortho.split('\n');
						orthoLines.forEach(line => {
							var tab = line.split(/\t/);
							if(element.id == tab[1].trim()){ //trim pour enlever les eventuels espaces ou retour chariot
								orthologous = tab[0];
							}
						});
						console.log(orthologous);

					//affiche la gene card
					document.getElementById("gene_card").style.display = "block";
					$('#gene_card').html("<p class='font-weight-bold'>Gene card "+element.id
					+"</p><a target='_blank' href=\" https://rice-genome-hub.southgreen.fr/oryza_sativa_japonica_kitaake?loc="+element.chr+":"+element.start+".."+element.stop+"\"><button type=\"button\" class=\"btn btn-sm btn-outline-dark\">View on JBrowse </button></a>"
					+" </p>Position: "+element.chr+":"+element.start+"-"+element.stop
					+"<br/>Family: "+element.family 
					+"<br/>Class: "+element.geneClass
					//+"<br/>Nipponbare orthologous: "+orthologous
					+"<br/>Nipponbare orthologous: <a class='resLink4' href='#'>"+orthologous+"</a>"
					+"<br/>ID Kitaake: "+ID_OsKitaake);
					
					})
					.then(function() {
						//Clic sur l'identifiant affiche la zone
						var resLinks = document.getElementsByClassName('resLink4');
						//console.log(resLinks);
						for(var i = 0, len = resLinks.length; i < len; i++) {
							resLinks[i].onclick = function () {
				
								//affiche la vue globale
								let selectAccession = document.getElementById("selectAccession");
								selectAccession.value="Nipponbare";
								triggerEvent(selectAccession, 'change');
				
								//affiche la vue zoom sur le chromosome de l'id cliqué
								var regexpChrom = /Chr(\d*)_(\d*)/;
								var idChrom = this.innerText.match(regexpChrom)[1];
								var position = this.innerText.match(regexpChrom)[2];
								position = parseInt(position);
								var stop = position + 1000000;
				
								idChrom = parseInt(idChrom);
								setTimeout(function(){ drawChromosome(idChrom, position, stop ); }, 1000);
								
							}
						}
					});
				}
			});
		}
	});
}, false);




//Draw oriented CDS
function drawArrow(ctx, x, y, width, orientation, family){
	ctx.save();

	if(family == "RLK"){
		ctx.fillStyle="#CCCCCC";
		ctx.strokeStyle="#CCCCCC";
	}else if(family == "NLR"){
		ctx.fillStyle="#494949";
		ctx.strokeStyle="#494949";
	}else if(family == "RLP"){
		ctx.fillStyle="#8D8D8D";
		ctx.strokeStyle="#8D8D8D";
	}
	
	if(orientation == "plus"){
		ctx.beginPath();
		ctx.moveTo(x, y );
		ctx.lineTo(x+width, y);      //--------->
		ctx.lineTo(x+width+5, y+7);	 //          \
		ctx.lineTo(x+width, y+15);   //          /
		ctx.lineTo(x, y+15);        //<---------
		ctx.lineTo(x+5, y+7); 		 // /
		ctx.lineTo(x, y);		     // \  (retour point de départ)  
		ctx.stroke();
		ctx.fill();

	}else{
		ctx.beginPath();
		ctx.moveTo(x+5, y );
		ctx.lineTo(x+5+width, y);      //--------->
		ctx.lineTo(x+5+width-5, y+7);   //        /
		ctx.lineTo(x+5+width, y+15);   //         \
		ctx.lineTo(x+5, y+15);         //<---------
		ctx.lineTo(x, y+7); 		 // \
		ctx.lineTo(x+5, y);		     // /  (retour point de départ)  
		ctx.fill();	
		ctx.stroke();
	}	
	ctx.restore();
}

//Draw oriented CDS
function drawCDS(ctx, x, y, width){
	
	ctx.beginPath(); 
	ctx.rect(x,y,width,15);
  	ctx.stroke();
}


//Draw line between CDS
function drawLine(ctx, start, stop, heigth){

	let lineWidth = stop - start;

	if(lineWidth > 50){
		stop = start + 50;
		ctx.beginPath();
		ctx.setLineDash([2, 2]);
		ctx.moveTo(start, heigth + 8 );
		ctx.lineTo(stop, heigth + 8);
		ctx.stroke();
		ctx.setLineDash([]);
		gap = lineWidth - 50; 
		totalGap = totalGap + gap;
		

	}else{
		ctx.beginPath();
		ctx.moveTo(start, heigth + 8 );
		ctx.lineTo(stop, heigth + 8);
		ctx.stroke();
		gap = 0;

	}	
}

//Draw stop
function drawStop(ctx, x, y){

	ctx.strokeStyle="red";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(x , y );
	ctx.lineTo(x , y + 15);
	ctx.stroke();
	ctx.strokeStyle="black";
	ctx.lineWidth = 1;						
}

//Draw frameshift
function drawFrameshift(ctx, x, y){

	ctx.strokeStyle="orange";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(x , y );
	ctx.lineTo(x , y + 15);
	ctx.stroke();
	ctx.strokeStyle="black";
	ctx.lineWidth = 1;						
}

// ctx, x, y, radius, nombre de pics, radius interne
function drawStar(ctx, x, y, r, n, inset) {
	//console.log("draw "+ x +" "+ y );
    ctx.save();
	ctx.fillStyle="red";
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.moveTo(0,0-r);
    for (var i = 0; i < n; i++) {
        ctx.rotate(Math.PI / n);
        ctx.lineTo(0, 0 - (r*inset));
        ctx.rotate(Math.PI / n);
        ctx.lineTo(0, 0 - r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawDomain(ctx, key, x, y, width){

	ctx.save();
	ctx.beginPath(); 
	ctx.rect(x,y+2,width,9);

	if(key == "LRR"){
	  	ctx.fillStyle="LightSeaGreen";
  	}else if(key == "BLAST"){
	  	ctx.fillStyle="SkyBlue";
	}else if(key == "TM"){
	  	ctx.fillStyle="grey";
	}else if(key == "NBARC"){
	  	ctx.fillStyle="CornflowerBlue";
	}else if(key == "Kinase"){
	  	ctx.fillStyle="plum";
	}else if(key == "Malectin"){
	  	ctx.fillStyle="orange";
	}else if(key == "Malectin_like"){
	  	ctx.fillStyle="orange";
	}else if(key == "Cys-Pair"){
	  	ctx.fillStyle="yellow";
	}else if(key == "PS"){
	  	ctx.fillStyle="black";  
  	}else{
		ctx.fillStyle="Gainsboro";
  	}
  	ctx.fill();
	ctx.restore();
}

//Création de la div de resultats
function createResultDiv(content) {

    const body = document.querySelector('body');
    var div = document.createElement('div');
    var pre = document.createElement('pre');
    div.setAttribute('class', 'container');
    pre.textContent = content;
    //div.innerHTML = content;
    loadingoff();
    div.appendChild(pre);
    body.appendChild(div); 
}



//Création de la div de resultats
function createSelectChrom() {

    const selectChrom = document.getElementById('selectChromosome');
	var select = document.createElement('select');
	select.id="selectChrom"
	var optionEmpty = document.createElement("option");
	optionEmpty.text = "";
	optionEmpty.value = "";
	select.options.add(optionEmpty);

	var option1 = document.createElement("option");
	option1.text = "1";
	option1.value = "1";
	select.options.add(option1);

	var option2 = document.createElement("option");
	option2.text = "2";
	option2.value = "2";
	select.options.add(option2);

    selectChrom.appendChild(select);
}

function ploidyDescGenerator(haplotype,chrNumber){
    /*
    ploidyDesc: [
        'ABC',
        'ABC',
        'ABC',
        'ABC',
        'ABC',
        'ABC',
        'ABC',
        [...]
    ],
    */
    let ploidyDesc = [];
    let chrStr = [];
    for (let i = 0; i < chrNumber; i++) {
        for (let i = 0; i < haplotype; i++) {
            chrStr.push(String.fromCharCode('a'.charCodeAt(0) + i))
        }
        ploidyDesc.push(chrStr.join(""));
        chrStr = [];
    }
    return ploidyDesc;
}

///////////////////////
///// BOUTON HOME /////
///////////////////////
document.getElementById("homebutton").addEventListener("click", function(e) {
	//affiche la page d'accueil
	//document.getElementById("home").style.display = "block";
	$('#home').show();
	$('#download').show();
	$('#feedback').show();
	$('#DataViz').hide();

	//remet le selcteur d'acc vide
	$('#selectAccession')[0].value="";

});

///////////////////////////
///// BOUTON DOWNLOAD /////
///////////////////////////
document.getElementById("downloadbutton").addEventListener("click", function(e) {
	//affiche la page d'accueil
	//document.getElementById("home").style.display = "block";
	$('#DataViz').hide();
	
	$('#home').show();
	$('#download').show();
	$('#feedback').hide();

	//remet le selcteur d'acc vide
	$('#selectAccession')[0].value="";

});


///////////////////////////
///// BOUTON FEEDBACK /////
///////////////////////////
document.getElementById("feedbackbutton").addEventListener("click", function(e) {
	
	$('#DataViz').hide();
	$('#home').show();
	$('#download').hide();
	$('#feedback').show();

});

document.getElementById("submitfeedback").addEventListener("click", function(e) {
	
	let data = document.getElementById('feedbackmessage').value;
	let email = document.getElementById('email').value;
	let xp = document.getElementById('xp').value;

	//envoie l'email via node
	socket.emit('feedback', email, xp, data, function(err, log){
		if(err){
			console.log(err);
		}else{
			console.log(log);
			$('#submitfeedback').hide();
			$('#submitfeedbackok').show();
		}
	});

});





/////////////////////////////////
///// Recherche par mot clé /////
/////////////////////////////////
document.getElementById("search").addEventListener("click", function(e) {
	var keyword = document.getElementById("keyword").value;
	searchNip(keyword);
	searchKit(keyword);
	


});

//search Kitaake
function searchKit(keyword){

	var foundKit = false;
	var resultIdKit = "<p>Results in Nipponbare:</p><br/>";
	//charge le fichier ids Kitaake
	fetch('./data/ids/Kitaake_IDs.txt')
	.then(function(response) {
		return response.text();
	})
	.then(function(ids) {
		let idsLines = ids.split('\n');
		idsLines.forEach(line => {
			var tab = line.split(/\t/);
			if(keyword == tab[0] || tab[1].match(keyword)){
				console.log(line);
				ID_OsKitaake = tab[1];
				foundKit = true;
				resultIdKit += "<a class='resLink2' href='#'>"+tab[0]+"</a><br/>";
			}
		});
		if(!foundKit){
			//affiche no result
			$('#search_result_2').show();
			$('#search_result_2').html("No result in Kitaake");
		}else{
			//affiche les resultat dans la div
			$('#search_result_2').show();
			$('#search_result_2').html(resultIdKit);
		}
	})
	.then(function() {
		//Clic sur l'identifiant affiche la zone
		var resLinks = document.getElementsByClassName('resLink2');
		//console.log(resLinks);
		for(var i = 0, len = resLinks.length; i < len; i++) {
			resLinks[i].onclick = function () {

				//affiche la vue globale
				let selectAccession = document.getElementById("selectAccession");
				selectAccession.value="Kitaake";
				triggerEvent(selectAccession, 'change');

				//affiche la vue zoom sur le chromosome de l'id cliqué
				var regexpChrom = /kitaake_Chr(\d*)_(\d*)/;
				var idChrom = this.innerText.match(regexpChrom)[1];
				var position = this.innerText.match(regexpChrom)[2];
				position = parseInt(position);
				var stop = position + 1000000;

				idChrom = parseInt(idChrom);
				setTimeout(function(){ drawChromosome(idChrom, position, stop ); }, 1000);
				
			}
		}
	});
}

//search Nipponbare
function searchNip(keyword){

	var foundNip = false;
	var resultIdNip = "<p>Results in Nipponbare:</p><br/>";
	//charge les fichiers ids Nipponbare
	fetch('./data/ids/Nipponbare_IDs.txt')
	.then(function(response) {
		return response.text();
	})
	.then(function(ids) {
		let idsLines = ids.split('\n');
		idsLines.forEach(line => {
			var tab = line.split(/\t/);
			if(keyword == tab[0] || keyword == tab[1] || keyword == tab[2] || keyword == tab[3] || tab[4].match(keyword)){
				console.log(line);
				ID_MSU7 = tab[1];
				ID_IRGSP = tab[2];
				ID_NCBI = tab[3];
				Aliases = tab[4];
				foundNip = true;
				resultIdNip += "<a class='resLink1' href='#'>"+tab[0]+"</a><br/>";
			}
		});
		if(!foundNip){
			//affiche no result
			$('#search_result_1').show();
			$('#search_result_1').html("No result in Nipponbare");
		}else{
			//affiche les resultat dans la div
			$('#search_result_1').show();
			$('#search_result_1').html(resultIdNip);
		}
	})
	.then(function() {
		//Clic sur l'identifiant affiche la zone
		var resLinks = document.getElementsByClassName('resLink1');
		//console.log(resLinks);
		for(var i = 0, len = resLinks.length; i < len; i++) {
			resLinks[i].onclick = function () {

				//affiche la vue globale
				let selectAccession = document.getElementById("selectAccession");
				selectAccession.value="Nipponbare";
				triggerEvent(selectAccession, 'change');

				//affiche la vue zoom sur le chromosome de l'id cliqué
				var regexpChrom = /Chr(\d*)_(\d*)/;
				var idChrom = this.innerText.match(regexpChrom)[1];
				var position = this.innerText.match(regexpChrom)[2];
				position = parseInt(position);
				var stop = position + 1000000;

				idChrom = parseInt(idChrom);
				setTimeout(function(){ drawChromosome(idChrom, position, stop ); }, 1000);
				
			}
		}
	});
}


//fonction pour declancher un event manuelement
function triggerEvent(el, type) {
    // IE9+ and other modern browsers
    if ('createEvent' in document) {
        var e = document.createEvent('HTMLEvents');
        e.initEvent(type, false, true);
        el.dispatchEvent(e);
    } else {
        // IE8
        var e = document.createEventObject();
        e.eventType = type;
        el.fireEvent('on' + e.eventType, e);
    }
}