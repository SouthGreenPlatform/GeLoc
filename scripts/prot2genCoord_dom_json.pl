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
my $startOk = "false";
my $stopOk = "false";

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
        $startOk = "false";
        $stopOk = "false";

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
                

                if($domStart > $length){
                    #print "$domStart ça dépasse $length ";
                    $domStart = $domStart - $length;
                    #print "Il reste $domStart\n";
                }else{
                    $genPosStart = $domStart + $start;
                    $domStart =0;
                    #print "$domStart ca rentre dans $length nouvelle coordonnée : $genPosStart\n";
                }
                if($domStop > $length){
                    #print "$domStop ça dépasse $length ";
                    $domStop = $domStop - $length;
                    #print "Il reste $domStop\n";
                }else{
                    $genPosStop = $domStop + $start;
                    $domStop =0;
                    #print "$domStop ca rentre dans $length nouvelle coordonnée : $genPosStop\n";
                }

                #si les deux positions sont dans ce CDS 
                #on écrit
                #on a trouvé
                if($genPosStart > 0 && $genPosStop > 0){
                    push @{ $outhash{$id}{$cdsid}{$domain} }, "$genPosStart;$genPosStop";
                    #print OUT "$id;$domain;$genPosStart;$genPosStop\n";
                    $foundPos = "true";
                    $genPosStart =0;
                    $genPosStop =0;
                    last;

                #si on a que la position start
                #alors le domaine s'étend sur un autre CDS
                #on écrit le domaine de genPosStart jusqu'à la fin du CDS
                }elsif($genPosStart > 0){
                    push @{ $outhash{$id}{$cdsid}{$domain} }, "$genPosStart;$stop";
                    $genPosStart =0;
                    $startOk = "true";
                    next;

                #si on a déjà trouvé le start mais toujours pas le stop
                #alors le domaine couvre le CDS entier
                #On ecrit le le domaine sur les start et stop du CDS
                }elsif($startOk eq "true" && $genPosStop == 0){
                    push @{ $outhash{$id}{$cdsid}{$domain} }, "$start;$stop";
                    next;

                #si on a que la position stop
                #alors le domaine se termine sur ce CDS
                #on écrit le domaine du début du CDS jusqu'à la position genPosStop
                #on a trouvé
                }elsif($startOk eq "true" && $genPosStop > 0){
                    push @{ $outhash{$id}{$cdsid}{$domain} }, "$start;$genPosStop";
                    $foundPos = "true";
                    $stopOk = "true";
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

                    if($domStart > $length){
                        #print "$domStart ça dépasse $length ";
                        $domStart = $domStart - $length;
                        #print "Il reste $domStart\n";
                    }else{
                        $genPosStart = $stop - $domStart;
                        $domStart = 0;
                        #print "$domStart ca rentre dans $length nouvelle coordonnée : $genPosStart\n";
                    }

                    if($domStop > $length){
                        #print "$domStop ça dépasse $length ";
                        $domStop = $domStop - $length;
                        #print "Il reste $domStop\n";
                    }else{
                        $genPosStop = $stop - $domStop;
                        $domStop =0;
                        #print "$domStop ca rentre dans $length nouvelle coordonnée : $genPosStop\n";
                    }
                    
                    #si les deux positions sont dans ce CDS 
                    #on écrit
                    #on a trouvé
                    if($genPosStart > 0 && $genPosStop > 0){
                        #inverse le positions pour les negatifs
                        push @{ $outhash{$id}{$cdsid}{$domain} }, "$genPosStop;$genPosStart";
                        #print OUT "$id;$domain;$genPosStop;$genPosStart\n";
                        $genPosStart =0;
                        $genPosStop =0;
                        $foundNeg = "true";
                        last;
                    
                    #si on a que la position start
                    #alors le domaine s'étend sur un autre CDS
                    #on écrit le domaine de genPosStart jusqu'au début du CDS
                    }elsif($genPosStart > 0){
                        push @{ $outhash{$id}{$cdsid}{$domain} }, "$start;$genPosStart";
                        $genPosStart =0;
                        $foundNeg = "false";
                        $startOk = "true";
                        next;
                    
                    #si on a déjà trouvé le start mais toujours pas le stop
                    #alors le domaine couvre le CDS entier
                    #On ecrit le le domaine sur les start et stop du CDS
                    }elsif($startOk eq "true" && $genPosStop == 0){
                        push @{ $outhash{$id}{$cdsid}{$domain} }, "$start;$stop";                        
                        next;

                    #si on a que la position stop
                    #alors le domaine se termine sur ce CDS
                    #on écrit le domaine de la fin du CDS jusqu'à la position genPosStop 
                    #on a trouvé
                    }elsif($genPosStop > 0){
                        push @{ $outhash{$id}{$cdsid}{$domain} }, "$genPosStop;$stop";
                        $foundNeg = "true";
                        $genPosStop =0;
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
