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
var genesElements = [];
//cds sur la frise des synteny
var syntElements = [];
//table des positions stop
var stopTab = [];
//table des positions frameshift
var fsTab = [];
//json des positions des domaines
var domains = {};
//table des identifiants de séquences + synonymes
var idsTab = [];

//
console.log(release);

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


//layer synteny
var canvasSynt = document.getElementById('synteny');
var ctxSynt = canvasSynt.getContext('2d');

//Config de la vue globale
function initConfig(){
	//console.log("init config");
	let conf = { 
		organism: "oryza-sativa",
		//repertoire vers les données de chromosome bands
		//dataDir: './data_'+release+'/bands/native/',
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
	canvas.height = 160;

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
	canvas.height = 160;

	var ctx = canvas.getContext('2d');
	ctx.fillStyle="black";
	ctx.font='bolder 12px Arial';

	ctx.fillText('Gene view: ', 10, 25);

	ctx.font='12px Arial';
	
	ctx.fillText('LRR:', 10, 45);
	drawDomain(ctx, "LRR", 85, 35, 10);
	ctx.fillText('LRR BLAST:', 10, 65);
	drawDomain(ctx, "BLAST", 85, 55, 10);
	ctx.fillText('TM:', 10, 85);
	drawDomain(ctx, "TM", 85, 75, 10);
	ctx.fillText('NBARC:', 10, 105);
	drawDomain(ctx, "NBARC", 85, 95, 10);
	ctx.fillText('Kinase:', 10, 125);
	drawDomain(ctx, "Kinase", 85, 115, 10);
	ctx.fillText('Malectin:', 100, 45);
	drawDomain(ctx, "Malectin", 175, 35, 10);
	ctx.fillText('Malectin like:', 100, 65);
	drawDomain(ctx, "Malectin_like", 175, 55, 10);
	ctx.fillText('Cys-Pair:', 100, 85);
	drawDomain(ctx, "Cys-Pair", 175, 75, 10);
	ctx.fillText('PS:', 100, 105);
	drawDomain(ctx, "PS", 175, 95, 10);
	ctx.fillText('other:', 100, 125);
	drawDomain(ctx, "", 175, 115, 10);

	ctx.fillText('Stop:', 10, 145);
	drawStop(ctx, 90, 132 )	
	drawStar(ctx, 90, 139, 2, 5, 2);	

	ctx.fillText('Frameshift:', 100, 145);
	drawFrameshift(ctx, 180, 132 )	


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
			//console.log("draw chr "+ clickedChrom);

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
        
		//from = r.from.toLocaleString(), // Adds thousands-separator
		//to = r.to.toLocaleString(),
		from = r.from.toString(), // Adds thousands-separator
		to = r.to.toString(),
		gffReport = "",
		extent = r.extent.toString();
		chrnum = ideogramChr.config.chromosome;
	
	//affiche les positions
	document.getElementById('acc').innerHTML = acc;
    document.getElementById('from').innerHTML = from;
    document.getElementById('to').innerHTML = to;
	document.getElementById('extent').innerHTML = extent;
	
	//supprime les espaces dans les positions
	from = from.replace(/\s/g, "");
	to = to.replace(/\s/g, "");
	//console.log("region from "+from+" to "+to+ " extent "+extent);

	let gffPath = config_accessions[acc]['gff'];

	//Appel au serveur
    socket.emit('run', gffPath, chrnum, from, to, function(err, report){
        if(err){
            console.log(err);
        }else{
			//console.log(report);
			const gffResult = document.getElementById('gffResult');
			
			//update to draw in reading sense
			gffResult.innerHTML = report;
			gffHash = parseGff(report);
			//console.log(gffHash);
			drawZoom(from, to, gffHash);
			//non parceque c'est pas les bonnes positions
			//drawSynteny(from, to, gffHash);
			//cache la partie synteny pour l'instant
			ctxSynt.clearRect(0, 0, canvasSynt.width, canvasSynt.height);
		}
	});

	//remonte le scroll
	$('#cds_div').scrollTop(0);
}


////////////////////////////////////////////////////////
// Menu select accession
////////////////////////////////////////////////////////
var config_accessions = {};
fetch('./data_'+release+'/config_accessions.json')
.then(function(response) {
	if(response.ok){
		return response.json();
	}
})
.then((data) => {
    // Work with JSON data here
    //domains = data;
	config_accessions = $.extend(config_accessions, data);

	//populate accessions selector
    $.each(config_accessions, function (index, value) {
		//index = accesions name
		//value = json content
        //Fill the dropdown with accessions names
        $('#selectAccession').append('<option value="' + index + '">' + index + '</option>');
    });
});

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
	$('#selected_synt_region').hide();
	$('.ideo_container_chr').hide();
	$('#gene_card').hide();
	$('.zoom_global').hide();
	$('.cds').hide();
	
	//affiche la div si elle est cachée
	$(".ideo_container_global").collapse('show');
	$('#floating_legend').show();

	config = initConfig();
	//config le fichier annot de l'accession choisie
	config.annotationsPath=config_accessions[acc]['annot_file'];
	
	//charge le fichier densité de l'accession choisie
	let response = await fetch(config_accessions[acc]['density']);
	annotData = await response.text();
	//Parse les données de densité
	config.rangeSet = annotationParser(annotData, config);
    
	//charge les données de chromosomes de l'accession choisie
	//fichier tsv
	response = await fetch(config_accessions[acc]['chrom_tsv']);
	chr_tsv = await response.text();
	//parse les données et config les chrBands
	chromosomeTsvParser(chr_tsv, config); 
	//config.dataDir = "./data_'+release+'/bands/native/"+acc+"/";

	//recupère les coordonnées des codons stop
	stopTab = [];
	fetch(config_accessions[acc]['stop'])
	.then(function(response) {
		return response.text();
		
	})
	.then(function(text) {
		let lines = text.split('\n');
		lines.forEach(line => {			
			stopTab.push(line);
		});
	});

	//recupère les coordonnées des frameshift
	fetch(config_accessions[acc]['frameshift'])
	.then(function(response) {
		if(response.ok){
			return response.text();
		}
	})
	.then(function(text) {
		fsTab = [];
		let lines = text.split('\n');
		lines.forEach(line => {
			fsTab.push(line);
		});
	});

	//recupère les coordonnées des domaines
	domains = {};
	fetch(config_accessions[acc]['domains'])
	.then(function(response) {
		if(response.ok){
			return response.json();
		}
	})
	.then((data) => {
		// Work with JSON data here
		//domains = data;
		domains = $.extend(domains, data);
	});

	//récupère le fichier des ids s'il existe
	console.log(config_accessions[acc]['ids']);
	if(config_accessions[acc]['ids']){
		fetch(config_accessions[acc]['ids'])
		.then(function(response) {
			if(response.ok){
				return response.text();
			}
		})
		.then(function(text) {
			idsTab = [];
			let lines = text.split('\n');
			lines.forEach(line => {
				idsTab.push(line);
			});
		});
	}
		
	


	
	//supprimer la div de l'image "choose accession"
	document.getElementById("home").style.display = "none";

	//Charge ideogram
	ideogram = new Ideogram(config);

	//apparition du bouton download
	$('#download').fadeIn()

	

	//affiche la selection de chromosome
	//createSelectChrom();

	//LEGEND

	//affiche la div
	$('#legend_button').show();
	$("#DataViz").show();
	$("#show-hide").show();

	/////// à virer si je remet les tooltips
	loadingoff();

	//cache le lettres
	setTimeout(removeLetters, 100);
	setTimeout(removeLetters, 100);

	//ajoute listener click chromosome
	setTimeout(onClickChr, 100);
});


$('#readingSense').change(function() {
	//console.log($('#readingSense').is(':checked')+" redraw");
	writeSelectedRange();
}); 

// Draw zoom view and CDS view
function drawZoom(from, to, gffHash){

	//display div
	$('.zoom_global').show();
	$('.cds').show();

	//canvas CDS
	var canvas = document.getElementById('cds');
	var ctx = canvas.getContext('2d');
	//ctx.scale(1.75, 1.75);

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
	genesElements = [];
	
	//nb de bases dans le canvas
	const seqLength = to - from;

	//pour chaque gènes
	for (var key in gffHash) {
		var currentGene = gffHash[key];
		var tab = currentGene;
		
		countGene++;
		firstCDS = true;
		gap = 0;
		totalGap =0;

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

		//draw background = element clickable sur le canvas cds
		ctx.fillStyle="white";
		ctx.fillRect(xFirstCDS + x -5, countGene * y + yInit -2, 1200, 22);

		var regexpClass = /Class=([^\s]*)/;
		var geneClass = tab[8].match(regexpClass)[1];
		var regexpId = /ID=(\w*)/;
		var id = tab[8].match(regexpId)[1];

		var regexpFamily = /Fam=(.*);/;
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
		genesElements.push(element);

		//draw gene infos
		ctx.fillStyle="black";
		ctx.font = '12px sans-serif';
		ctx.fillText(element.id+" - "+element.family+" - "+element.geneClass, x, countGene * y + yInit -5);

		//position genomic premier cds
		startFirstCDS = tab[3];			

		//Traitement des CDS
		//console.log(element.orientation);
		if($('#readingSense').is(':checked') && element.orientation == "-"){
			//drawPlusMinus(tab['cds'], countGene, element);
			//console.log("draw reading sense");
			drawReadingSense(tab['cds'], countGene, element);
		}else{
			//console.log("draw plus minus");
			drawPlusMinus(tab['cds'], countGene, element);	
		}
	}
}

//draw cds in original sense
function drawReadingSense(tab, countGene, element){
	let firstCDS=true;
	let x = 40;
	let y = 50;
	let yInit = 10;
	let xFirstCDS = x;
	let xCDS;
	let yCDS;
	let widthCDS;
	let widthLine;
	let stopCDS =0;
	let currentPosition = 0;
	//canvas CDS
	var canvas = document.getElementById('cds');
	var ctx = canvas.getContext('2d');

	//retourne l'ordre des cds
	tab.reverse();

	tab.forEach((cds) => {
		
		//convert bp to pixel
		startCDS = cds[3]; //bp
		stopCDS = cds[4];  //bp
		widthCDS = (cds[4] - cds[3]) / 10; //px
		//console.log(widthCDS);
		yCDS = countGene * y + yInit; //px

		//position du début du CDS dessiné en sens inverse
		xCDS = Math.abs(stopCDS - element.stop) / 10 + x - totalGap; //px
		//console.log(totalGap);

		//identifiant cds
		var regexpCDSID = /.*(cds_\d+);.*/;
		if (cds[8].match(regexpCDSID)) {
			cdsid = cds[8].match(regexpCDSID)[1];
		}else{
			cdsid = "";
		}

		//variable pour les plus ou minus
		if(cds[6] == "+"){
			plusMinus = "plus";
		}else{
			plusMinus = "minus";
		}
		
		//draw first CDS
		if (firstCDS){
			//Draw plus or minus CDS
			xCDS = x;
			//drawArrow(ctx, xFirstCDS-20 , yCDS, 3, plusMinus, element.family);
			drawSign(ctx, xFirstCDS-20 , yCDS, 3, plusMinus, element.family);
			//console.log("first xCDS "+ xCDS+" widthCDS "+widthCDS);
			drawCDS(ctx, xCDS, yCDS, widthCDS);
			startLine = xCDS + widthCDS;
			firstCDS = false;
			currentPosition = startLine;
		
		//Draw other CDS
		}else{

			//line to bloc
			stopLine = xCDS;
			//stopLine = startLine + cds[4] / 10 - totalGap - element.geneWidth;
			
			//dessine la ligne et update le gap
			drawLine(ctx, startLine, stopLine, yCDS );
			currentPosition = stopLine - gap; //pas totalgap
			
			//fleche + ou -
			//enlève l'éventuel gap supplémentaire calculé en dessinant la ligne
			drawCDS(ctx, currentPosition, yCDS, widthCDS);
			//console.log("other xCDS "+ xCDS+" widthCDS "+widthCDS);
			startLine = currentPosition + widthCDS;
			currentPosition = startLine;
		}
 
		//draw domain if it is inside the current CDS
		if(cdsid != ""){
			let currentGene = element.id;
			
			if(domains[currentGene] !== undefined){
				cdsDom = domains[currentGene][cdsid];
			}

			if(cdsDom !== undefined){
				//pour chaque type de domain
				for(key in cdsDom){
					let currentDom = cdsDom[key];
					currentDom.forEach(dom => {
						var domStart = dom.match(/(.*);(.*)/)[1];
						var domStop = dom.match(/(.*);(.*)/)[2];
						var domLength = (domStop - domStart) /10;
						//domain position in px
						//var xDomStart = ((domStart - element.start) / 10) + x- totalGap ;
						var xDomStart = (Math.abs(domStop - element.stop) / 10) + x- totalGap ;
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
				var XstopPos = (Math.abs(stopPos - element.stop) / 10) + x ;
				drawStop(ctx, XstopPos-totalGap, countGene * y + yInit )	
				drawStar(ctx, XstopPos-totalGap, countGene * y + yInit +7, 2, 5, 2);		
			}
		});

		//draw frameshift if it is inside the current CDS
		fsTab.forEach(line => {
			if(line.length >0){
				//var regexpFS = /(.*);frameshift;(.*)/;
				var regexpFS = /(.*)\t(.*)/; //nouveau format
				var idFS = line.match(regexpFS)[1];
				var posFS = line.match(regexpFS)[2];
				
				//ajoute une marge de 10 aux positions CDS
				if(idFS == element.id && posFS <= stopCDS+10 && posFS >= startCDS-10){
					
					//stop position
					var xFsPos = (Math.abs(posFS - element.stop) / 10) + x ;
					drawFrameshift(ctx, xFsPos - totalGap, countGene * y + yInit )	
				}
			}
		});
	});
}

//draw cds in original sense
function drawPlusMinus(tab, countGene, element){
	let firstCDS=true;
	let x = 40;
	let y = 50;
	let yInit = 10;
	let xFirstCDS = 0;
	let xCDS;
	let yCDS;
	let widthCDS;
	//canvas CDS
	var canvas = document.getElementById('cds');
	var ctx = canvas.getContext('2d');

	tab.forEach((cds) => {
		//console.log("cds"+cds);
		

		//convert bp to pixel
		startCDS = cds[3];
		stopCDS = cds[4];
		widthCDS = (cds[4] - cds[3]) / 10;
		yCDS = countGene * y + yInit;
		//position du début du CDS
		// largeur / 10 + x de départ - le gap si on a coupé dans l'intron
		xCDS = (cds[3] - element.start) / 10 + x - totalGap;

		//identifiant cds
		var regexpCDSID = /.*(cds_\d+);.*/;
		if (cds[8].match(regexpCDSID)) {
			cdsid = cds[8].match(regexpCDSID)[1];
		}else{
			cdsid = "";
		}

		//variable pour les plus ou minus
		if(cds[6] == "+"){
			plusMinus = "plus";
		}else{
			plusMinus = "minus";
		}
		
		//draw first CDS
		if (firstCDS){
			//Draw plus or minus CDS
			//drawArrow(ctx, xCDS-20 , yCDS, 3, plusMinus, element.family);
			drawSign(ctx, xCDS-20 , yCDS, 3, plusMinus, element.family);
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
				//pour chaque type de domain
				for(key in cdsDom){
					let currentDom = cdsDom[key];
					currentDom.forEach(dom => {
						var domStart = dom.match(/(.*);(.*)/)[1];
						var domStop = dom.match(/(.*);(.*)/)[2];
						var domLength = (domStop - domStart) /10;
						//domain position in px
						var xDomStart = ((domStart - element.start) / 10) + x- totalGap ;
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
				var XstopPos = ((stopPos - element.start) / 10) + x ;
				drawStop(ctx, XstopPos-totalGap, countGene * y + yInit )	
				drawStar(ctx, XstopPos-totalGap, countGene * y + yInit +7, 2, 5, 2);		
			}
		});

		//draw frameshift if it is inside the current CDS
		fsTab.forEach(line => {
			if(line.length >0){
				//var regexpFS = /(.*);frameshift;(.*)/;
				var regexpFS = /(.*)\t(.*)/; //nouveau format
				var idFS = line.match(regexpFS)[1];
				var posFS = line.match(regexpFS)[2];
				
				//ajoute une marge de 10 aux positions CDS
				if(idFS == element.id && posFS <= stopCDS+10 && posFS >= startCDS-10){
						
					console.log("match frameshift");
					//stop position
					var xFsPos = ((posFS - element.start) / 10) + x ;
					drawFrameshift(ctx, xFsPos - totalGap, countGene * y + yInit )	
				} 
			}
		});	
	});
}

//parsing GFF to hash
function parseGff(report){
	//console.log(report);
	let gffLines = report.split('\n');
	var gffHash = {};
	geneNumber =0;

	//parsing GFF file
	gffLines.forEach(line => {
		var tab = line.split(/\t/);

		//Ligne gene
		if(tab[2] == "gene"){
			geneNumber++;
			gffHash[geneNumber]=tab;
			gffHash[geneNumber]['cds']=[];
		}
		//Ligne gene
		if(tab[2] == "CDS"){
			gffHash[geneNumber]['cds'].push(tab);
		}
	});
	//console.log(gffHash);
	return gffHash;
}

//canvas frise globale 


//fonction clique sur un gene de la frise
//appelle le serveur pour récupérer les données de la portion de gff
canvasSynt.addEventListener('click', function (event) {

	//augmente la taille de la div
	$('.zoom_global').animate({height:'260px'}, 500);

	var versus="";
	var orthologous="";

	//position du clic sur le canvas, tient compte du scroll
	var canoffset = $(canvasSynt).offset();
	var x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
	var y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
	console.log("click", x, y);
	

	// Collision detection between clicked offset and element.
	//marge de 5px de chaque coté
	genesElements.forEach(async function (element) {
		//cherche l'orthologue du gènes
		[versus, orthologous] = await findOrtho(acc, element.id);
		//save orthologous in genes info
		element.versus = versus;
		element.ortho = orthologous;
		console.log(versus, orthologous);
		console.log(element.genePosX + element.geneWidth +5, element.genePosY-5);

		if (y > element.genePosY-5 && y < element.genePosY + element.geneHeigth +5
			&& x > element.genePosX-5 && x < element.genePosX + element.geneWidth +5) {
			console.log("Collision");

			//recupère les infos gff de l'orthologue via le serveur node
			//info ideogram
			var r = ideogramChr.selectedRegion,
			from = r.from.toString(), // Adds thousands-separator
			to = r.to.toString(),
			gffReport = "",
			extent = r.extent.toString();
			chrnum = ideogramChr.config.chromosome;

			//affiche les positions
			document.getElementById('synt_acc').innerHTML = versus;
			document.getElementById('synt_from').innerHTML = from;
			document.getElementById('synt_to').innerHTML = to;
			document.getElementById('synt_extent').innerHTML = extent;

			//supprime les espaces dans les positions
			from = from.replace(/\s/g, "");
			to = to.replace(/\s/g, "");
			
			//Appel au serveur
			let gffPath = config_accessions[versus]['gff'];
			socket.emit('run', gffPath, chrnum, from, to, function(err, report){
				if(err){
					console.log(err);
				}else{
					//console.log(report);
					let gffHash = parseGff(report);
					//console.log(gffHash);
					drawSynteny(from, to, gffHash);
				}
			});
		}
	});
});

// Draw zoom view and CDS view
function drawSynteny(from, to, gffHash){

	console.log("draw synteny");

	var canvasSynt = document.getElementById('synteny');
	var ctxSynt = canvasSynt.getContext('2d');

	//affiche selected region
	document.getElementById("selected_synt_region").style.display = "block";


	//efface avant de redessiner
	//Le dessin commence va de x=0 à x=1000
	//						   y=70 à y=100
	//clear before redraw
	ctxSynt.clearRect(0, 0, canvasSynt.width, canvasSynt.height);

	//
	let ySyntLine = 200;
	let firstCDS = true;
	let countGene = 0;
	let x = 40;
	let y = 50;
	let yInit = 10;
	let xFirstCDS = 0;

	//draw line
	ctxSynt.beginPath();
	ctxSynt.moveTo(40, ySyntLine);
	ctxSynt.lineTo(800+40, ySyntLine);
	ctxSynt.stroke();

	//reset CDS elements tab
	syntElements = [];
	
	//nb de bases dans le canvas
	const seqLength = to - from;

	//pour chaque gènes
	for (var key in gffHash) {
		var currentGene = gffHash[key];
		var tab = currentGene;
		
		countGene++;
		firstCDS = true;
		gap = 0;
		totalGap =0;

		//position on canvas
		startGene = ((tab[3]-from) * 800) / seqLength;
		widthGene = ((tab[4]-tab[3]) * 800) / seqLength;
			
		//draw gene rect
		ctxSynt.fillStyle="black";    // color of fill
		// x y width height	
		ctxSynt.fillRect(startGene+x, ySyntLine-10, widthGene, 20); // create rectangle  

		var regexpClass = /Class=([^\s]*)/;
		var geneClass = tab[8].match(regexpClass)[1];
		var regexpId = /ID=(\w*)/;
		var id = tab[8].match(regexpId)[1];

		var regexpFamily = /Fam=(.*);/;
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
		syntElements.push(element);
	}
	
	console.log("genesElements "+genesElements);
	console.log("syntElements "+syntElements);
	//draw link between orthologous genes
	//pour chaque gene de l'accession du haut
	genesElements.forEach(function (element) {
		//cherche un match avec les gènes du bas = orthologues
		syntElements.forEach(function (syntElement){
			
			if(element.ortho === syntElement.id){
				console.log('Match '+element.ortho+' '+syntElement.id);
				//draw link
				ctxSynt.save();
				ctxSynt.strokeStyle="green";
				ctxSynt.lineWidth = 1;

				ctxSynt.beginPath();
				//bas gauche du gene du haut
				ctxSynt.moveTo(element.genePosX, element.genePosY+20);
				//bas droite du gene du haut
				ctxSynt.lineTo(element.genePosX+element.geneWidth, element.genePosY+20);
				//haut droit du gene du bas
				ctxSynt.lineTo(syntElement.genePosX+syntElement.geneWidth, syntElement.genePosY+150);
				//haut gauche du gene du bas
				ctxSynt.lineTo(syntElement.genePosX, syntElement.genePosY+150);
				ctxSynt.stroke();
				// Fermer le chemin
				ctxSynt.closePath();
				// Remplir la forme en vert
				ctxSynt.fillStyle = "green";
				ctxSynt.fill();
				ctxSynt.restore();

			}
		});
	});
}


//canvas CDS
var canvas = document.getElementById('cds');
var ctx = canvas.getContext('2d');

//fonction passe sur un gene / CDS avec la souris
canvas.addEventListener('mousemove', function (event) {

	

	//position du canvas, tient compte du scroll
	var canoffset = $(canvas).offset();
	var x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
	var y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

	var canvasSelected = document.getElementById('zoom_selected');
	var ctxSelected = canvasSelected.getContext('2d');

	ctxSelected.clearRect(0, 0, canvasSelected.width, canvasSelected.height);

	// Collision detection between clicked offset and element.
	genesElements.forEach(function (element) {
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

//cherche l'orthologue du gène "id" de l'accession "acc"
function findOrtho(acc, id ){
	return new Promise((resolve,reject)=>{
		
		//pour tout les fichiers orthologues
		var orthos = config_accessions[acc]['ortho'];
		console.log(orthos);
		if(orthos){
			console.log("ok orthologous");
			for (var i = 0; i < orthos.length; i++) {
			
				let versus = orthos[i]['versus'];
				//fichier des orthologues
				fetch(config_accessions[acc]['ortho'][i]['ortho_file'])
				.then(function(response) {
					if(response.ok){
						return response.text();
					}
				})
				.then(function(text) {
					let orthoLines = text.split('\n');
					orthoLines.forEach(line => {
						var tab = line.split(/\t/);
						if(id == tab[0].trim()){ //trim pour enlever les eventuels espaces ou retour chariot
							orthologous = tab[1].trim();
							//htmlOrthoString += "<br/>"+versus+" orthologous: <a class='resLink3' href='#'>"+orthologous+"</a>"
							//console.log(htmlOrthoString);
							resolve([versus, orthologous]);
						}else if(id == tab[1].trim()){
							orthologous = tab[0].trim();
							//htmlOrthoString += "<br/>"+versus+" orthologous: <a class='resLink3' href='#'>"+orthologous+"</a>"
							//console.log(htmlOrthoString);
							resolve([versus, orthologous]);
						}
					});
				});
			}
		}else{
			console.log("no orthologous");
			resolve([versus, orthologous]);
		}
			
	});
}


//fonction click sur un gene / CDS
canvas.addEventListener('click', function (event) {

	//position du canvas, tient compte du scroll
	var canoffset = $(canvas).offset();
	var x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
	var y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

	// Collision detection between clicked offset and element.
	genesElements.forEach(async function (element) {
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
			var versus="";
			var orthologous="";

			var htmlIDstring = "";
			var htmlOrthoString = "";
			//récupère les intitulés des champs en-tete
			if(idsTab.length){
				let entete = idsTab[0].split(/\t/);
				console.log(entete);

				//cherche dans la table des ids
				idsTab.forEach(line => {
					var tab = line.split(/\t/);
					if(element.id == tab[0]){

						for (var i = 1; i < entete.length; i++) {
							htmlIDstring += "<br/>"+entete[i]+" : "+ tab[i]
						}
								
						console.log(htmlIDstring);
	/* 
						//console.log(tab[0] +tab[1] +tab[2] +tab[3] +tab[4]);
						ID_MSU7 = tab[1];
						ID_IRGSP = tab[2];
						ID_NCBI = tab[3];
						//Aliases = tab[4]; */
					}
				});
			}
			
			[versus, orthologous] = await findOrtho(acc, element.id);
			htmlOrthoString = "<br/>"+versus+" orthologous: <a class='resLink3' href='#'>"+orthologous+"</a>"
			//console.log(htmlOrthoString);

			console.log("affiche la gene card");
			//affiche la gene card
			document.getElementById("gene_card").style.display = "block";
			var htmlstring = "<p class='font-weight-bold'>Gene card "+element.id
			+"</p><a target='_blank' href=\"https://rice-genome-hub.southgreen.fr/oryza_sativa_japonica_nipponbare?loc="+element.chr+":"+element.start+".."+element.stop+"\"><button type=\"button\" class=\"btn btn-sm btn-outline-dark\">View on JBrowse </button></a>"
			+"</p>Position: "+element.chr+":"+element.start+"-"+element.stop
			+"<br/>Family: "+element.family 
			+"<br/>Class: "+element.geneClass
/* 			+"<br/>Kitaake orthologous: <a class='resLink3' href='#'>"+orthologous+"</a>"
 */			+htmlOrthoString
			+htmlIDstring;/* +"<br/>ID MSU: <a target='_blank' href=\"http://rice.plantbiology.msu.edu/cgi-bin/ORF_infopage.cgi?orf="+ID_MSU7+"\">"+ID_MSU7+"</a>"
			+"<br/>ID IRGSP: <a target='_blank' href=\"https://rapdb.dna.affrc.go.jp/viewer/gbrowse_details/irgsp1?name="+ID_IRGSP+"\">"+ID_IRGSP+"</a>"
			+"<br/>ID NCBI:";
			if(ID_NCBI.match("None")){
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
			htmlstring+= "<br/>Aliases: "+Aliases; */
			$('#gene_card').html(htmlstring);

			//Lien vers la séquence orthologue.
			var resLinks = document.getElementsByClassName('resLink3');
			for(var i = 0, len = resLinks.length; i < len; i++) {
				let orthoAcc = document.getElementsByClassName('resLink3')[0].previousSibling.textContent.split(' ')[0];
				//console.log("*"+orthoAcc+"*");
				resLinks[i].onclick = function () {
					
					//affiche la vue globale
					let selectAccession = document.getElementById("selectAccession");
					selectAccession.value= orthoAcc;
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
		}
	});
});


//Draw oriented CDS
function drawSign(ctx, x, y, width, orientation, family){
	//console.log("draw sign "+x+" "+y+" "+width+" "+orientation+" "+family);
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

	if($('#readingSense').is(':checked') ){
		if(orientation == "plus"){
			//console.log("plus");
			let l = 5;
			let w = 3;
			x = x+l;
			ctx.beginPath();
			ctx.moveTo(x, y );
			ctx.lineTo(x+w, y);      	//    -->
			ctx.lineTo(x+w, y+l);	 	//       |
			ctx.lineTo(x+w+l, y+l);    	//       -->
			ctx.lineTo(x+w+l, y+l +w);  //			|
			ctx.lineTo(x+w, y+l +w); 	// 		 <--
			ctx.lineTo(x+w, y+l +w +l); // 		|
			ctx.lineTo(x, y+l +w +l);   // 	  <--
			ctx.lineTo(x, y+l +w);      // 	 |
			ctx.lineTo(x -l, y+l +w);   // <--
			ctx.lineTo(x -l, y+l);      // |
			ctx.lineTo(x, y+l);			// -->
			ctx.lineTo(x, y);			// 	 |
			ctx.stroke();
			ctx.fill();
	
		}else{
			//console.log("moins");
			ctx.beginPath();
			ctx.moveTo(x, y+5 );
			ctx.lineTo(x+13, y+5);      //--------->
			ctx.lineTo(x+13, y+5+width);   //        /
			ctx.lineTo(x, y+5+width);         //<---------
			ctx.lineTo(x, y+5);		     // /  (retour point de départ)  
			ctx.fill();	
			ctx.stroke();
		}	
	}else{
		if(orientation == "plus"){
			//console.log(">>>");
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
			//console.log("<<<");
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
	ctx.lineTo(x , y + 15 +2);
	ctx.stroke();
	ctx.strokeStyle="black";
	ctx.lineWidth = 1;						
}

//Draw frameshift
function drawFrameshift(ctx, x, y){
	console.log("Frameshift");

	ctx.strokeStyle="orange";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(x , y );
	ctx.lineTo(x , y + 15 +2);
	ctx.stroke();
	//fleche
	ctx.beginPath();
	ctx.moveTo(x-2 , y +22 );
	ctx.lineTo(x , y + 17);
	ctx.lineTo(x+2 , y + 22);
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
    ctx.translate(x, y+12);
    ctx.moveTo(0,0-r);
    for (var i = 0; i < n; i++) {
        //ctx.rotate(Math.PI / n); mettre le rotate après le lineTo pour inverser l'étoile
        ctx.lineTo(0, 0 - (r*inset));
        ctx.rotate(Math.PI / n);
		ctx.lineTo(0, 0 - r);
		ctx.rotate(Math.PI / n);
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
	$('#welcome').show();
	$('#download_section').hide();
	$('#feedback').hide();
	$('#DataViz').hide();
	$('#floating_legend').hide();
	$('#releases').hide();

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
	$('#welcome').hide();
	$('#download_section').show();
	$('#feedback').hide();
	$('#floating_legend').hide();
	$('#releases').hide();

	//remet le selcteur d'acc vide
	$('#selectAccession')[0].value="";

});

///////////////////////////
///// BOUTON RELEASES /////
///////////////////////////
document.getElementById("releasebutton").addEventListener("click", function(e) {
	
	$('#DataViz').hide();
	$('#home').show();
	$('#welcome').hide();
	$('#download_section').hide();
	$('#floating_legend').hide();
	$('#feedback').hide();
	$('#releases').show();

	//remet le selcteur d'acc vide
	$('#selectAccession')[0].value="";

});


///////////////////////////
///// BOUTON FEEDBACK /////
///////////////////////////
document.getElementById("feedbackbutton").addEventListener("click", function(e) {
	
	$('#DataViz').hide();
	$('#home').show();
	$('#welcome').hide();
	$('#download_section').hide();
	$('#floating_legend').hide();
	$('#feedback').show();
	$('#releases').hide();

	//remet le selcteur d'acc vide
	$('#selectAccession')[0].value="";

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
	fetch('./data_'+release+'/ids/Kitaake_IDs.txt')
	.then(function(response) {
		return response.text();
	})
	.then(function(ids) {
		let idsLines = ids.split('\n');
		idsLines.forEach(line => {
			var tab = line.split(/\t/);
			console.log(tab);
			if(keyword == tab[0] || tab[1].match(keyword)){
				//console.log(line);
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

//search Nipponbare
function searchNip(keyword){

	var foundNip = false;
	var resultIdNip = "<p>Results in Nipponbare:</p><br/>";
	//charge les fichiers ids Nipponbare
	fetch('./data_'+release+'/ids/Nipponbare_IDs.txt')
	.then(function(response) {
		return response.text();
	})
	.then(function(ids) {
		let idsLines = ids.split('\n');
		idsLines.forEach(line => {
			var tab = line.split(/\t/);
			if(keyword == tab[0] || keyword == tab[1] || keyword == tab[2] || keyword == tab[3] ){ //|| tab[4].match(keyword)){
				//console.log(line);
				ID_MSU7 = tab[1];
				ID_IRGSP = tab[2];
				ID_NCBI = tab[3];
				//Aliases = tab[4];
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