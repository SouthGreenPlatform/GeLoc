#!/usr/local/bin/perl
use strict;

#############################################################
# convert à proteic position to a genomic position          #
#############################################################

#perl prot2genCoord.pl ../data/annotations/Nip_stop_pos.txt ../data/gff/LRR_Nipponbare.gff ./Nip_stop_genomic_pos.txt

my $inFile = shift;
my $gff = shift;
my $outfile = shift;
my $first = 1;
my $line;
my $gffline;
my $length;
my $id;
my $start;
my $stop;
my $protPos;
my $genPos;
my $reste;
my $found = 0;

#crée le fichier de sortie
open OUT, ">$outfile" or die "cannot create $outfile !\n";

#ouvre le fichier d'entrée
open INFILE, "$inFile" or die "cannot open $inFile !\n";
while (<INFILE>) {
	$line =$_;
    chomp $line;
    if ($line=~/(.*)\s+(.*)/) {
        $id = $1;
        $protPos = $2;

        #multiplie par 3 pour les codons
        $protPos = 3 * $protPos;
        print "$protPos\n";


        #parse le GFF pour récupérer les coordonées
        #parse que les positifs
        open GFF, "$gff" or die "cannot open $gff !\n";
        while (<GFF>) {
            $gffline =$_;
            chomp $gffline;

            if ($gffline=~/.*CDS\s+(\d+)\s+(\d+)\s+.\s+(\+).*($id).*/) {
                print "start : $1 stop : $2 orientation : $3 id : $4\n";
                $start = $1;
                $stop = $2;
                $length = $stop - $start;
                
                #positif
                #if($3 eq "+"){
                    if($protPos > $length){
                        print "$protPos ça dépasse $length\n";
                        $protPos = $protPos - $length;
                        print "Il reste $protPos\n";
                        
                        next;
                    }else{
                        $genPos = $protPos + $start;
                        print "$protPos ca rentre dans $length\nnouvelle coordonnée : $genPos\n";
                        print OUT "$id\t$genPos\n";
                        last;
                    }
                #}
            }
        }
        close GFF;

        #parse les negatifs
        #lit le fichier à l'envers
        open REVERSE, "$gff" or die "cannot open $gff !\n";
        foreach my $reverseline (reverse(<REVERSE> )) {
            if ($reverseline=~/.*CDS\s+(\d+)\s+(\d+)\s+.\s+(\-).*($id).*/) {
                print "start : $1 stop : $2 orientation : $3 id : $4\n";
                $start = $1;
                $stop = $2;
                $length = $stop - $start;

                #if($3 eq "-"){

                    if($protPos > $length){
                        print "$protPos ça dépasse $length\n";
                        $protPos = $protPos - $length;
                        print "Il reste $protPos\n";
                                    
                        next;
                    }else{
                        $genPos = $stop - $protPos;
                        print "$protPos ca rentre dans $length\nnouvelle coordonnée : $genPos\n";
                        print OUT "$id\t$genPos\n";
                        last;
                    }
                #}
            }
        }
        close(REVERSE);
    }
}

close INFILE;

close OUT;
