#!/usr/local/bin/perl
use strict;

##############################################################
# convert annot tab to Json and heatmap for ideogram         #
##############################################################

#perl annotToJsonAndHeatmap.pl ../data/annotations/annot_Nip.txt ../data/chromosomes/Nipponbare_chr.txt ./nip.json ./ideo_density_Nipponbare.txt 200000

my $inFile = shift;
my $chromLength = shift;
my $json = shift;
my $heatmap = shift;
my $window  = shift;
my $currentChr = "0";
my $first = 1;
my $line;
my $length;

#position de la fenetre
my $start =0;
my $stop = $window;

#compteur d'annot dans la fenetre;
my $count=0; 
my $total =0;
my $currentChr = "0";

my %track = ( 
'RLK'     => 0,
'NLR'     => 1,
'RLP'     => 2,
);

my %chromLength; 


my %color = ( 
0     => "#7AA1D2",
1     => "#7dc7d2",
2     => "#bce2ca",
3     => "#d5e1b5",
4     => "#e8ce92",
5     => "#f4a769",
6     => "#f4a769",
7     => "#f4a769",
8     => "#f4a769",
9     => "#f4a769",
10    => "#f4a769",
11    => "#f4a769",
12    => "#f4a769",
13    => "#f4a769",
14    => "#f4a769",
15    => "#f4a769",
16    => "#f4a769",
17    => "#f4a769",
18    => "#f4a769",
19    => "#f4a769",
20    => "#f4a769");




#crée les fichiers de sortie
open JSON, ">$json" or die "cannot create $json !\n";
open HEATMAP, ">$heatmap" or die "cannot create $heatmap !\n";

#initialise le json
print JSON "{\"keys\": [\"name\", \"start\", \"length\", \"trackIndex\"],\n\t\"annots\": [\n";

#Récupère les tailles des chromosomes
open CHROMLENGTH, "$chromLength" or die "cannot open $chromLength !\n";
while (<CHROMLENGTH>) {
	$line =$_;
    chomp $line;

    #regexp 1 43270923 AB
	#       chr  length haplo
    #       $1="1" $2="43270923"
    if ($line=~/(\d+)\s+(\d+)\s+(.*)/) {
        $chromLength{$1} = $2;
    }else{
        print "mauvais fichier de longueur des chromosomes\n";
    }
}
close CHROMLENGTH;

foreach my $k (keys(%chromLength)) {
   print "Clef=$k Valeur=$chromLength{$k}\n";
}

open INFILE, "$inFile" or die "cannot open $inFile !\n";
while (<INFILE>) {
	$line =$_;
    chomp $line;

    #regexp Chr1 Nip 56809 57972 RLK
	#       chr  acc start stop  track
    #       $1="chr1" $2="1" $3="56809" $4="57972" $5="RLK"
    if ($line=~/(Chr(\d+))\s+.*\s+(\d+)\s+(\d+)\s+(.*)/) {
        $length = $4 - $3;

        #chromosome courant
        if ($currentChr == $2){
            
            #ajoute l'annot dans le JSON
            print JSON ",\n\t\t\t[\"$5\", $3, $length, $track{$5}]";

            #tant que l'annot n'est pas dans la fenetre on ecrit dans le fichier heatmap
            #{---}-----ANNOT---------------------
            while($3>$start && $3>$stop){
                
                print HEATMAP "$2 0 $start $stop $color{$count}\n";
                $count =0;
                #avance la fenetre
                $start = $stop + 1;
                $stop += $window;

                if($stop > $chromLength{$currentChr}){
                    $stop = $chromLength{$currentChr};
                }
            }
            
            #si l'annot est dans cette fenetre on compte et on passe à l'annot suivante
            #--------{ANNOT}---------------------
            if($3>=$start && $3 < $stop){
                
                $count++;
                $total++;

            }


        #sinon on termine ce chromosome et on passe au suivant
        }else{

            #écrit la densité de la dernière fenetre
            #print HEATMAP "$currentChr 0 $start $stop $color{$count}\n";
            print HEATMAP "$currentChr 0 $start $stop $color{$count}\n";
            
            #On comble le trou le la fin du chromosomes si la dernière annot n'est pas dans la dernière fenêtre
            #remplace $stop par la taille max de chr
            $start = $stop + 1;
            if($stop < $chromLength{$currentChr}){
                print HEATMAP "$currentChr 0 $start $chromLength{$currentChr} $color{0}\n";
            }

            #On passe au chromosome suivant
            $currentChr = $2;
            $start =0;
            $stop = $window;

            #initialise chromosome suivant dans le json
            if ($first == 1){
                print JSON "\t\t{\"chr\": \"$2\", \"annots\": [\n";
                $first = 0;
            }else{
                print JSON "]},\n\t\t{\"chr\": \"$2\", \"annots\": [\n";
            }
            #ajoute l'annot dans le JSON
            print JSON "\t\t\t[\"$5\", $3, $length, $track{$5}]";

            #Avance la fenetre jusqu'à trouver la bonne
            #{---}-----ANNOT---------------------
            while($3>$start && $3>$stop){

                print HEATMAP "$2 0 $start $stop $color{$count}\n";
                $count =0;
                $start = $stop + 1;
                $stop += $window;

                if($stop > $chromLength{$currentChr}){
                    $stop = $chromLength{$currentChr};
                }
            }
            
            #si l'annot est dans cette fenetre on compte et on passe à l'annot suivante
            #--------{ANNOT}---------------------
            if($3>=$start && $3 < $stop){
                $count++;
                $total++;
            }
        }
    }else{
        print "no regexp";
    }

}

    #écrit la densité de la dernière fenetre
    #print HEATMAP "$currentChr 0 $start $stop $color{$count}\n";
    print HEATMAP "$currentChr 0 $start $stop $color{$count}\n";
            
    #On comble le trou le la fin du chromosomes si la dernière annot n'est pas dans la dernière fenêtre
    #remplace $stop par la taille max de chr
    $start = $stop + 1;
    if($stop < $chromLength{$currentChr}){
        print HEATMAP "$currentChr 0 $start $chromLength{$currentChr} $color{0}\n";
    }

#termine le JSON
print JSON "]}]}";



print "$total\n";

close INFILE;
close JSON;
close HEATMAP;