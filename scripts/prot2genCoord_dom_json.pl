#!/usr/local/bin/perl
use strict;
use JSON;

#############################################################
# convert à proteic position csv file                       #
# to a genomic position json file                           #
#############################################################

#perl prot2genCoord_dom.pl ../data/annotations/LRR_domains_NIP.csv ../data/gff/LRR_Nipponbare.gff ./Nip_domains_genomic_pos.json

my $inFile = shift;
my $gff = shift;
my $outfile = shift;
my %outhash;
my $first = 1;
my $line;
my $gffline;
my $length;
my $orientation;
my $id;
my $cdsid;
my $start;
my $stop;
my $domain;
my $domStart;
my $domStop;
my $genPosStart;
my $genPosStop;
my $reste;
my $foundPos = "false";
my $foundNeg = "false";

#crée le fichier de sortie
open OUT, ">$outfile" or die "cannot create $outfile !\n";

#ouvre le fichier d'entrée
open INFILE, "$inFile" or die "cannot open $inFile !\n";
while (<INFILE>) {
	$line =$_;
    chomp $line;
    if ($line=~/(.*);(.*);(.*);(.*)/) {
        $id = $1;
        $domain = $2;
        $domStart = $3;
        $domStop = $4;

        #multiplie par 3 pour les codons
        $domStart = 3 * $domStart;
        $domStop = 3 * $domStop;
        #print "$domStop\n";

        $foundPos = "false";
        $foundNeg = "false";

        #parse le GFF pour récupérer les coordonées
        #parse que les positifs
       
        open GFF, "$gff" or die "cannot open $gff !\n";
        while (<GFF>) {
            $gffline =$_;
            chomp $gffline;

            #positif
            if ($gffline=~/.*CDS\s+(\d+)\s+(\d+)\s+.\s+(\+).*($id):(cds_\d+);.*/ && $foundPos eq "false") {
                #print "start : $1 stop : $2 orientation : $3 id : $4\n";
                $start = $1;
                $stop = $2;
                $orientation = $3;
                $cdsid =$5;
                $length = $stop - $start;
                                
                if($domStop > $length){
                    #print "$domStop ça dépasse $length ";
                    $domStop = $domStop - $length;
                    #print "Il reste $domStop\n";
                }else{
                    $genPosStop = $domStop + $start;
                    $domStop =0;
                    #print "$domStop ca rentre dans $length nouvelle coordonnée : $genPosStop\n";
                }
                if($domStart > $length){
                    #print "$domStart ça dépasse $length ";
                    $domStart = $domStart - $length;
                    #print "Il reste $domStart\n";
                }else{
                    $genPosStart = $domStart + $start;
                    $domStart =0;
                    #print "$domStart ca rentre dans $length nouvelle coordonnée : $genPosStart\n";
                }
                if($genPosStart > 0 && $genPosStop > 0){
                    push @{ $outhash{$id}{$cdsid}{$domain} }, "$genPosStart;$genPosStop";
                    #print OUT "$id;$domain;$genPosStart;$genPosStop\n";
                    $foundPos = "true";
                    $genPosStart =0;
                    $genPosStop =0;
                    last;
                }else{
                    $foundPos = "false";
                    next;
                }
            }
        }
        close GFF;  

        #parse les negatifs si on a pas trouvé en positif
        #lit le fichier à l'envers
        if($foundPos eq "false"){
            open REVERSE, "$gff" or die "cannot open $gff !\n";
            foreach my $reverseline (reverse(<REVERSE> )) {
                #negatif
                if ($reverseline=~/.*CDS\s+(\d+)\s+(\d+)\s+.\s+(\-).*($id):(cds_\d+);.*/ && $foundNeg eq "false") {
                    #print "CDS start : $1 stop : $2 orientation : $3 id : $4\n";
                    $start = $1;
                    $stop = $2;
                    $orientation = $3;
                    $cdsid =$5;
                    $length = $stop - $start;

                    if($domStop > $length){
                        #print "$domStop ça dépasse $length ";
                        $domStop = $domStop - $length;
                        #print "Il reste $domStop\n";
                    }else{
                        $genPosStop = $stop - $domStop;
                        $domStop =0;
                        #print "$domStop ca rentre dans $length nouvelle coordonnée : $genPosStop\n";
                    }
                    if($domStart > $length){
                        #print "$domStart ça dépasse $length ";
                        $domStart = $domStart - $length;
                        #print "Il reste $domStart\n";
                    }else{
                        $genPosStart = $stop - $domStart;
                        $domStart = 0;
                        #print "$domStart ca rentre dans $length nouvelle coordonnée : $genPosStart\n";
                    }
                    if($genPosStart > 0 && $genPosStop > 0){
                        #inverse le positions pour les negatifs
                        push @{ $outhash{$id}{$cdsid}{$domain} }, "$genPosStop;$genPosStart";
                        #print OUT "$id;$domain;$genPosStop;$genPosStart\n";
                        $genPosStart =0;
                        $genPosStop =0;
                        $foundNeg = "true";
                        last;
                    }else{
                        $foundNeg = "false";
                        next;
                    }
                }
            }
            close(REVERSE); 
        }
    }

    if($foundNeg eq "false" && $foundPos eq "false"){
        print "$line";
        print " reste start : $domStart reste stop : $domStop orientation = $orientation\n";
    }
}

close INFILE;

my $json = encode_json \%outhash;
print OUT $json;

close OUT;
