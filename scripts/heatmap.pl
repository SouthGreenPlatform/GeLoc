#!/usr/local/bin/perl
use strict;

##############################################################
# calcul de la densité d'annotations le long des chromosomes #
##############################################################

#perl heatmap.pl ../data/accessions/ideo_Nipponbare.txt ../data/accessions/ideo_density_Nipponbare.txt 200000
my $inFile = shift;
my $outFile = shift;
my $window  = shift;

my %color = ( 
0     => "#7AA1D2",
1     => "#7BC4D3",
2     => "#BEE2C9",
3     => "#DEDFB1",
4     => "#DEDFB1",
5     => "#F29360",
6     => "#F29360",
7     => "#F29360",
8     => "#F29360",
9     => "#F29360",
10    => "#F29360",
11    => "#F29360",
12    => "#F29360",
13    => "#F29360",
14    => "#F29360",
15    => "#F29360",
16    => "#F29360",
17    => "#F29360",
18    => "#F29360",
19    => "#F29360",
20    => "#F29360");

my $start =0;
my $stop = $window;

my $line;
my $first=1;
my $count=0; #compteur d'annot dans la fenetre;
my $total =0;
my $currentChr = "01";


open OUTFILE, ">$outFile" or die "cannot create $inFile !\n";

open INFILE, "$inFile" or die "cannot open $inFile !\n";
while (<INFILE>) {
	$line =$_;
    #regexp num_chr allele start stop color
    #$1=01 $2=0 $3=56809 $4=57972

	if ($line=~/(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+.*/) {

        #chromosome courant
        if ($currentChr == $1){
            
            #tant que l'annot n'est pas dans la fenetre on ecrit

            #{---}-----ANNOT---------------------
            while($3>$start && $3>$stop){
                print OUTFILE "$1 $2 $start $stop $color{$count}\n";
                $count =0;
                $start = $stop + 1;
                $stop += $window;
            }
            
            #si l'annot est dans cette fenetre on compte et on passe à l'annot suivante
            #--------{ANNOT}---------------------
            if($3>=$start && $3 < $stop){
                $count++;
                $total++;
            }

        #on passe au chromosome suivant    
        }else{
            
            $currentChr = $1;
            $start =0;
            $stop = $window;
            #chromosome courant

            #{---}-----ANNOT---------------------
            while($3>$start && $3>$stop){
                print OUTFILE "$1 $2 $start $stop $color{$count}\n";
                $count =0;
                $start = $stop + 1;
                $stop += $window;
            }
            
            #si l'annot est dans cette fenetre on compte et on passe à l'annot suivante
            #--------{ANNOT}---------------------
            if($3>=$start && $3 < $stop){
                $count++;
                $total++;
            }
        }
    }

}

print "$total\n";

close INFILE;
close OUTFILE;